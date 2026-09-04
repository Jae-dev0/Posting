(function () {
  'use strict';

  const widget = document.querySelector('[data-elia-widget]');
  if (!widget) return;

  const panel = widget.querySelector('.elia__panel');
  const launcher = widget.querySelector('.elia__launcher');
  const conversation = widget.querySelector('#elia-conversation');
  const form = widget.querySelector('#elia-form');
  const input = widget.querySelector('#elia-input');
  const sendButton = form.querySelector('button[type="submit"]');
  const invite = widget.querySelector('[data-elia-invite]');
  const jumpLatest = widget.querySelector('[data-elia-jump]');
  const charCount = widget.querySelector('[data-elia-count]');
  const initialConversation = conversation.innerHTML;
  const INVITE_KEY = 'elia-invite-dismissed';
  const MAX_CHARS = 500;
  const PHONE_MAX_DIGITS = 11;
  const NEAR_BOTTOM_PX = 72;

  let userMessageCount = 0;
  let feedbackShown = false;
  let isReplying = false;
  let chatSession = '';
  let lastFailedMessage = '';
  let stickToBottom = true;
  let modalSchedules = [];
  const scheduleModal = widget.querySelector('[data-elia-schedule-modal]');
  const scheduleModalMeta = widget.querySelector('[data-elia-schedule-modal-meta]');
  const scheduleModalList = widget.querySelector('[data-elia-schedule-modal-list]');
  const detailsModal = widget.querySelector('[data-elia-details-modal]');
  const detailsModalMeta = widget.querySelector('[data-elia-details-modal-meta]');
  const detailsForm = widget.querySelector('#elia-details-form');
  const detailsPassengersWrap = widget.querySelector('[data-elia-details-passengers]');
  const detailsError = widget.querySelector('[data-elia-details-error]');
  const seatsModal = widget.querySelector('[data-elia-seats-modal]');
  const seatsModalMeta = widget.querySelector('[data-elia-seats-modal-meta]');
  const seatsGrid = widget.querySelector('[data-elia-seats-grid]');
  const seatsSelectedLabel = widget.querySelector('[data-elia-seats-selected]');
  const seatsError = widget.querySelector('[data-elia-seats-error]');
  const seatsSubmit = widget.querySelector('[data-elia-seats-submit]');
  const DETAILS_SUBMIT_MESSAGE = '__submit_booking_details__';
  const SEATS_SUBMIT_MESSAGE = '__submit_seats__';

  const SCHEDULE_LIST_REPLY = 'May available trips po, ka-G! I-click ang [mga schedule](schedule:list) para pumili ng trip.';
  const CHAT_API = 'chat-api.php';
  const BOOKNA_API = 'bookna-api.php';
  const bookingContext = {
    origin: '',
    destination: '',
    departure_date: '',
    passengers: 1,
    return_date: '',
    departure_schedule_id: '',
    departure_schedule_label: '',
    return_schedule_id: '',
    return_schedule_label: '',
    departure_seats: [],
    return_seats: [],
    trip_type: '',
    email: '',
    contact_number: '',
    passenger_list: [],
    booking_step: 'idle',
    schedule_mode: 'departure',
    seat_mode: 'departure'
  };
  let modalSeatMap = null;
  let selectedSeatNumbers = [];

  const LOCATION_ALIASES = {
    cubao: 'CUBAO',
    baguio: 'BAGUIO',
    pitx: 'MANILA (PITX)',
    manila: 'MANILA (PITX)',
    pasay: 'PASAY',
    avenida: 'AVENIDA',
    clark: 'CLARK'
  };

  const formatIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrowIsoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatIsoDate(date);
  };

  const normalizeLocation = (value) => {
    const clean = String(value || '').trim();
    if (!clean) return '';
    const key = clean.toLowerCase();
    if (LOCATION_ALIASES[key]) return LOCATION_ALIASES[key];
    if (/\*/.test(clean) && !/\(/.test(clean)) {
      const parts = clean.split('*');
      if (parts.length === 2 && parts[1]) {
        return (parts[0].trim() + ' (' + parts[1].trim() + ')').toUpperCase();
      }
    }
    return clean.toUpperCase();
  };

  const booknaLocationToUrlParam = (value) => {
    const clean = normalizeLocation(value);
    if (!clean) return '';
    const parenMatch = clean.match(/^(.+?)\s+\((.+?)\)$/);
    if (parenMatch) {
      return (parenMatch[1].trim() + '*' + parenMatch[2].trim()).toUpperCase();
    }
    return clean.replace(/\s+/g, '*').toUpperCase();
  };

  const updateBookingContext = (text) => {
    const source = String(text || '');
    const lower = source.toLowerCase();

    const routeMatch = source.match(/\b([A-Za-z\s()]+?)\s*(?:to|→|->|\u2192)\s*([A-Za-z\s()]+?)\b/i);
    if (routeMatch) {
      bookingContext.origin = normalizeLocation(routeMatch[1]);
      bookingContext.destination = normalizeLocation(routeMatch[2]);
    }

    if (/\bcubao\b/i.test(source)) bookingContext.origin = 'CUBAO';
    if (/\bbaguio\b/i.test(source)) bookingContext.destination = 'BAGUIO';

    if (/\bbukas\b|\btomorrow\b/i.test(lower)) {
      bookingContext.departure_date = tomorrowIsoDate();
    }

    const bukasCountMatch = lower.match(/\b(?:bukas|tomorrow)\s+(\d{1,2})\b/);
    if (bukasCountMatch) {
      bookingContext.departure_date = tomorrowIsoDate();
      bookingContext.passengers = Math.max(1, parseInt(bukasCountMatch[1], 10) || 1);
    }

    const isoMatch = source.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (isoMatch) bookingContext.departure_date = isoMatch[1];

    const longDateMatch = source.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}\b/i);
    if (longDateMatch) {
      const parsed = new Date(longDateMatch[0].replace(/,/, ''));
      if (!Number.isNaN(parsed.getTime())) bookingContext.departure_date = formatIsoDate(parsed);
    }

    const shortDateMatch = source.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i);
    if (shortDateMatch && !isoMatch) {
      const parsed = new Date(shortDateMatch[0] + ', ' + new Date().getFullYear());
      if (!Number.isNaN(parsed.getTime())) bookingContext.departure_date = formatIsoDate(parsed);
    }

    if (/\bako lang\b|\bisa lang\b|\b1 passenger\b|\bone passenger\b/i.test(lower)) {
      bookingContext.passengers = 1;
    }

    const passengerMatch = source.match(/\b(\d{1,2})\s*(?:passengers?|pax|tao|pasahero|pax)\b/i)
      || source.match(/\bpara sa\s+(\d{1,2})\b/i)
      || source.match(/\b(\d{1,2})\s+(?:tao|pasahero)\b/i);
    if (passengerMatch) {
      bookingContext.passengers = Math.max(1, parseInt(passengerMatch[1], 10) || 1);
    }

    const tagalogCounts = [
      ['isa', 1], ['dalawa', 2], ['tatlo', 3], ['apat', 4], ['lima', 5],
      ['anim', 6], ['pito', 7], ['walo', 8], ['siyam', 9], ['sampu', 10]
    ];
    tagalogCounts.forEach(([word, count]) => {
      if (new RegExp('\\b' + word + '\\b', 'i').test(lower)) {
        bookingContext.passengers = count;
      }
    });

    const trimmed = source.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
      const count = parseInt(trimmed, 10);
      if (count >= 1 && count <= 10) bookingContext.passengers = count;
    }
  };

  const aiAsksForDepartureTime = (text) => {
    const lower = String(text || '').toLowerCase();
    return /anong oras|what time|gustong umalis|gustong alis|departure time|preferred.*time|preferred na|maibigay ko ang mga options|specific.*oras|target ninyong alis/.test(lower);
  };

  const userAsksAboutDepartureTime = (message) => {
    const text = String(message || '').toLowerCase();
    return /magandang oras|mabuting oras|anong oras|what time|wala akong maisip|sa tingin mo|recommend|suggest|ipakita.*(trip|schedule|oras)|show.*(trip|schedule|time)|hanap.*(trip|schedule|oras)|di ko alam.*oras|hindi ko alam.*oras|ano ang magand/.test(text);
  };

  const aiGivesGenericTimeAdvice = (text) => {
    const lower = String(text || '').toLowerCase();
    return /early morning \(e\.g\.|for a more relaxed trip|recommended for arriving early|avoiding traffic|\d{1,2}:\d{2}\s*(am|pm)\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/.test(lower);
  };

  const isPassengerCountMessage = (message) => /^\d{1,2}$/.test(String(message || '').trim());

  const shouldAutoShowSchedules = (message, reply) => {
    if (!hasCompleteBookingContext()) return false;
    if (['round_trip', 'return_date', 'departure_seats', 'return_seats', 'contact', 'passengers', 'confirm'].includes(bookingContext.booking_step)) {
      return false;
    }

    const wantsSchedules = userWantsScheduleList(message)
      || userAsksAboutDepartureTime(message)
      || aiAsksForDepartureTime(reply)
      || aiGivesGenericTimeAdvice(reply);

    if (wantsSchedules) return true;
    if (!bookingContext.trip_type) return false;
    if (userWantsScheduleList(message)) return true;
    if (isPassengerCountMessage(message)) return true;
    if (/\b(?:bukas|tomorrow)\s+\d{1,2}\b/i.test(String(message || ''))) return true;
    if (aiAsksForDepartureTime(reply)) return true;
    return shouldFetchSchedules(message, reply);
  };

  const syncBookingContextFromConversation = () => {
    conversation.querySelectorAll('.elia__message').forEach((message) => {
      const bubble = message.querySelector('.elia__bubble');
      if (!bubble) return;
      updateBookingContext(bubble.textContent || '');
    });
  };

  const mergeBookingContext = (next) => {
    if (!next || typeof next !== 'object') return;
    ['booking_step', 'schedule_mode', 'seat_mode', 'trip_type', 'passenger_list', 'departure_seats', 'return_seats'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(next, key)) {
        bookingContext[key] = next[key];
      }
    });
    Object.keys(bookingContext).forEach((key) => {
      if (['booking_step', 'schedule_mode', 'seat_mode', 'trip_type', 'passenger_list', 'departure_seats', 'return_seats'].includes(key)) return;
      if (Object.prototype.hasOwnProperty.call(next, key) && next[key] !== undefined && next[key] !== null && next[key] !== '') {
        bookingContext[key] = next[key];
      }
    });
    bookingContext.passengers = Math.max(1, parseInt(bookingContext.passengers, 10) || 1);
  };

  const hasCompleteBookingContext = () => (
    bookingContext.origin !== ''
    && bookingContext.destination !== ''
    && bookingContext.departure_date !== ''
  );

  const shouldFetchSchedules = (message, reply) => {
    if (!hasCompleteBookingContext()) return false;
    const text = String(message + ' ' + (reply || '')).toLowerCase();
    if (/list|lista|bigyan ng list|mga trip|mga schedule|available trips|show (me )?all|lahat ng trip|__search_schedules__/.test(text)) {
      return true;
    }
    if (/available slots|may available|mga options|check.*schedule|hanapin.*trip/.test(text)) {
      return true;
    }
    return /sandali|hahanapin|checking|loading|hanapin ang/.test(text);
  };

  const userWantsScheduleList = (message) => {
    const text = String(message || '').toLowerCase();
    return /list|lista|bigyan ng list|mga trip|mga schedule|available trips|show (me )?all|lahat ng trip|anong mga oras|what times|ipakita ang (mga )?(trip|schedule)/.test(text);
  };

  const currentTime = () => new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date());

  const isNearBottom = () => {
    const remaining = conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight;
    return remaining <= NEAR_BOTTOM_PX;
  };

  const updateJumpButton = () => {
    if (!jumpLatest) return;
    const show = !stickToBottom && conversation.scrollHeight > conversation.clientHeight + 40;
    jumpLatest.hidden = !show;
  };

  const scrollToLatest = (force) => {
    if (!force && !stickToBottom) {
      updateJumpButton();
      return;
    }
    requestAnimationFrame(() => {
      conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
      stickToBottom = true;
      updateJumpButton();
    });
  };

  const stampExistingMessages = () => {
    conversation.querySelectorAll('time:empty').forEach((time) => {
      time.textContent = currentTime();
      time.dateTime = new Date().toISOString();
    });
  };

  const getFocusable = () => panel.querySelectorAll(
    'button:not([disabled]):not([hidden]), [href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  function openChat() {
    widget.classList.add('elia--open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    invite.classList.add('elia__invite--hidden');
    stickToBottom = true;
    updateJumpButton();
    window.setTimeout(() => input.focus(), 340);
  }

  function closeChat(force) {
    if (!force && userMessageCount > 0 && !feedbackShown) {
      showFeedback();
      return;
    }

    widget.classList.remove('elia--open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    launcher.focus();
  }

  function dismissInvite() {
    invite.classList.add('elia__invite--hidden');
    widget.classList.add('elia--invite-dismissed');
    try { sessionStorage.setItem(INVITE_KEY, '1'); } catch (error) { /* ignore */ }
  }

  function restoreInviteState() {
    try {
      if (sessionStorage.getItem(INVITE_KEY) === '1') {
        invite.classList.add('elia__invite--hidden');
        widget.classList.add('elia--invite-dismissed');
      }
    } catch (error) { /* ignore */ }
  }

  function updateCharCount() {
    if (!charCount) return;
    const length = input.value.length;
    const show = length >= 350;
    charCount.hidden = !show;
    charCount.textContent = length + '/' + MAX_CHARS;
    charCount.classList.toggle('elia__char-count--warn', length >= 350 && length < 480);
    charCount.classList.toggle('elia__char-count--limit', length >= 480);
  }

  function syncSendState() {
    sendButton.disabled = !input.value.trim() || isReplying;
    updateCharCount();
  }

  function addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'elia__message elia__message--user';

    const body = document.createElement('div');
    body.className = 'elia__message-body';

    const bubble = document.createElement('div');
    bubble.className = 'elia__bubble';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.appendChild(paragraph);

    const time = document.createElement('time');
    time.textContent = currentTime();
    time.dateTime = new Date().toISOString();

    body.append(bubble, time);
    row.appendChild(body);
    conversation.appendChild(row);
    userMessageCount += 1;
    scrollToLatest(true);
  }

  function addAssistantMessage(html, actions) {
    const messages = conversation.querySelectorAll('.elia__message');
    const previous = messages[messages.length - 1];
    const stacked = previous
      && previous.classList.contains('elia__message--assistant')
      && !previous.classList.contains('elia__typing');

    const row = document.createElement('div');
    row.className = 'elia__message elia__message--assistant' + (stacked ? ' elia__message--stacked' : '');
    row.innerHTML = [
      '<span class="elia__avatar"><img src="images/elia.png" alt="Elia"></span>',
      '<div class="elia__message-body">',
      '<div class="elia__bubble">' + html + '</div>',
      '<time datetime="' + new Date().toISOString() + '">' + currentTime() + '</time>',
      '</div>'
    ].join('');
    conversation.appendChild(row);

    if (actions && actions.length) {
      const actionGroup = document.createElement('div');
      actionGroup.className = 'elia__quick-actions';
      actionGroup.setAttribute('aria-label', 'Suggested replies');
      actions.forEach((action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.eliaPrompt = action.value || action.label;
        if (action.retry) button.dataset.eliaRetry = '1';
        if (action.html) {
          button.innerHTML = action.html;
        } else {
          button.textContent = action.label;
        }
        actionGroup.appendChild(button);
      });
      conversation.appendChild(actionGroup);
    }

    scrollToLatest(false);
  }

  function showTyping() {
    widget.classList.add('elia--waiting');
    const row = document.createElement('div');
    row.className = 'elia__message elia__message--assistant elia__typing';
    row.dataset.eliaTyping = '';
    row.innerHTML = [
      '<span class="elia__avatar"><img src="images/elia.png" alt="Elia"></span>',
      '<div class="elia__message-body" role="status" aria-label="Elia is arriving please wait">',
      '<div class="elia__bubble elia-wait">',
      '<span class="elia-wait__text">Elia is arriving please wait.</span>',
      '<img class="elia-wait__rocket" src="images/elia-rocket.png" alt="" width="86" height="57" decoding="async">',
      '</div>',
      '</div>'
    ].join('');
    conversation.appendChild(row);
    scrollToLatest(true);
  }

  function clearTyping() {
    const typing = conversation.querySelector('[data-elia-typing]');
    if (typing) typing.remove();
    widget.classList.remove('elia--waiting');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkify(escaped) {
    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      (_, escapedUrl) => {
        const url = escapedUrl.replace(/&amp;/g, '&');
        const href = /bookna\.com/i.test(url) && /payment|traID/i.test(url)
          ? normalizeCheckoutUrl(url)
          : url;
        return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">' + escapedUrl + '</a>';
      }
    );
  }

  function formatInline(escaped) {
    return escaped
      .replace(/\[([^\]]+)\]\(schedule:([^)]+)\)/g, (_, label, scheduleRef) => {
        const safeLabel = escapeHtml(label);
        const ref = decodeURIComponent(scheduleRef);
        if (ref === 'list') {
          return '<button type="button" class="elia__schedule-modal-link" data-elia-schedule-modal="list">' + safeLabel + '</button>';
        }
        const safeId = escapeHtml(ref);
        return '<button type="button" class="elia__schedule-link" data-elia-schedule-id="' + safeId + '" data-elia-schedule-label="' + safeLabel + '">' + safeLabel + '</button>';
      })
      .replace(/\[([^\]]+)\]\(booking:details\)/g, (_, label) => {
        return '<button type="button" class="elia__details-modal-link" data-elia-details-modal="open">' + escapeHtml(label) + '</button>';
      })
      .replace(/\[([^\]]+)\]\(seats:select\)/g, (_, label) => {
        return '<button type="button" class="elia__seats-modal-link" data-elia-seats-modal="open">' + escapeHtml(label) + '</button>';
      })
      .replace(
        /\[([^\]]+)\]\(booking:confirm\)\s*\[([^\]]+)\]\(booking:cancel\)/g,
        (_, confirmLabel, cancelLabel) => {
          return '<span class="elia__confirm-actions">'
            + '<button type="button" class="elia__confirm-btn elia__confirm-btn--yes" data-elia-booking-action="confirm">'
            + escapeHtml(confirmLabel)
            + '</button>'
            + '<button type="button" class="elia__confirm-btn elia__confirm-btn--no" data-elia-booking-action="cancel">'
            + escapeHtml(cancelLabel)
            + '</button>'
            + '</span>';
        }
      )
      .replace(/\[([^\]]+)\]\(booking:confirm\)/g, (_, label) => {
        return '<button type="button" class="elia__confirm-btn elia__confirm-btn--yes" data-elia-booking-action="confirm">'
          + escapeHtml(label)
          + '</button>';
      })
      .replace(/\[([^\]]+)\]\(booking:cancel\)/g, (_, label) => {
        return '<button type="button" class="elia__confirm-btn elia__confirm-btn--no" data-elia-booking-action="cancel">'
          + escapeHtml(label)
          + '</button>';
      })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\s)\*(.+?)\*(?=\s|$)/g, '$1<em>$2</em>');
  }

  function formatScheduleModalMeta() {
    const parts = [];
    const isReturn = bookingContext.schedule_mode === 'return';
    const origin = isReturn ? bookingContext.destination : bookingContext.origin;
    const destination = isReturn ? bookingContext.origin : bookingContext.destination;
    const date = isReturn ? bookingContext.return_date : bookingContext.departure_date;

    if (origin && destination) {
      parts.push(origin + ' → ' + destination + (isReturn ? ' (Return)' : ''));
    }
    if (date) parts.push(date);
    if (bookingContext.passengers > 1) {
      parts.push(bookingContext.passengers + ' passengers');
    }
    return parts.join(' · ');
  }

  function renderScheduleModalList(schedules) {
    if (!scheduleModalList) return;
    scheduleModalList.innerHTML = '';

    schedules.forEach((schedule) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'elia__schedule-modal-item';
      button.dataset.eliaScheduleId = String(schedule.id || '');
      button.dataset.eliaScheduleLabel = schedule.label || '';

      const time = schedule.time || '';
      const route = schedule.origin && schedule.destination
        ? schedule.origin + ' → ' + schedule.destination
        : '';
      const busType = schedule.service_type || '';

      button.innerHTML = [
        time ? '<span class="elia__schedule-modal-time">' + escapeHtml(time) + '</span>' : '',
        '<span class="elia__schedule-modal-details">',
        route ? '<span class="elia__schedule-modal-route">' + escapeHtml(route) + '</span>' : '',
        busType ? '<span class="elia__schedule-modal-bus">' + escapeHtml(busType) + '</span>' : '',
        '</span>',
        schedule.fare != null ? '<span class="elia__schedule-modal-fare">₱' + escapeHtml(String(schedule.fare)) + '</span>' : ''
      ].join('');

      item.appendChild(button);
      scheduleModalList.appendChild(item);
    });
  }

  async function openScheduleModal(schedules) {
    let list = (schedules && schedules.length) ? schedules : modalSchedules;
    if (!list.length && hasCompleteBookingContext()) {
      list = await fetchSchedulesFromApi();
      modalSchedules = list;
    }
    if (!scheduleModal || !list.length) return;

    if (scheduleModalMeta) scheduleModalMeta.textContent = formatScheduleModalMeta();
    renderScheduleModalList(list);
    const title = scheduleModal.querySelector('#elia-schedule-modal-title');
    if (title) {
      title.textContent = bookingContext.schedule_mode === 'return' ? 'Return Trips' : 'Available Trips';
    }
    scheduleModal.hidden = false;
    scheduleModal.setAttribute('aria-hidden', 'false');
    widget.classList.add('elia--schedule-modal-open');
    const closeButton = scheduleModal.querySelector('.elia__schedule-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeScheduleModal() {
    if (!scheduleModal) return;
    scheduleModal.hidden = true;
    scheduleModal.setAttribute('aria-hidden', 'true');
    widget.classList.remove('elia--schedule-modal-open');
  }

  function neededSeatCount() {
    return Math.max(1, parseInt(bookingContext.passengers, 10) || 1);
  }

  function currentSeatScheduleId() {
    return bookingContext.seat_mode === 'return'
      ? bookingContext.return_schedule_id
      : bookingContext.departure_schedule_id;
  }

  function formatSeatsModalMeta() {
    const parts = [];
    const isReturn = bookingContext.seat_mode === 'return';
    const label = isReturn ? bookingContext.return_schedule_label : bookingContext.departure_schedule_label;
    if (label) parts.push(label);
    parts.push('Pick ' + neededSeatCount() + ' seat' + (neededSeatCount() > 1 ? 's' : ''));
    return parts.join(' · ');
  }

  function updateSelectedSeatsLabel() {
    if (!seatsSelectedLabel) return;
    seatsSelectedLabel.textContent = selectedSeatNumbers.length
      ? 'Selected: ' + selectedSeatNumbers.join(', ')
      : 'Selected: none';
  }

  function buildBusSeatLayout(capacity) {
    const total = Math.max(1, Number(capacity) || 45);
    const backCount = total >= 45 ? 5 : (total % 4 === 1 ? 5 : (total % 4 === 0 ? 4 : Math.max(4, total % 4)));
    const regularCount = Math.max(0, total - backCount);
    const rows = [];
    let seat = 1;

    while (seat <= regularCount) {
      const rowSeats = [];
      for (let i = 0; i < 4 && seat <= regularCount; i += 1) {
        rowSeats.push(seat);
        seat += 1;
      }
      while (rowSeats.length < 4) rowSeats.push(null);
      rows.push({ type: 'regular', seats: rowSeats });
    }

    const backSeats = [];
    while (seat <= total) {
      backSeats.push(seat);
      seat += 1;
    }
    if (backSeats.length) {
      rows.push({ type: 'back', seats: backSeats });
    }

    return rows;
  }

  function createSeatButton(seatNumber, seatMap) {
    const available = new Set((seatMap.available_seats || []).map((n) => Number(n)));
    const reserved = new Set((seatMap.reserved_seats || []).map((n) => Number(n)));
    const priority = new Set((seatMap.priority_seats || []).map((n) => Number(n)));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'elia__seat';
    button.setAttribute('aria-label', 'Seat ' + seatNumber);
    button.dataset.eliaSeat = String(seatNumber);

    const icon = document.createElement('span');
    icon.className = 'elia__seat-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg viewBox="0 0 40 44" focusable="false">' +
      '<path class="elia__seat-svg-body" d="M8 3.5h24a5 5 0 0 1 5 5v16.5c0 1.4-.7 2.6-1.8 3.3l-1.2.8V36a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-6.9l-1.2-.8A4 4 0 0 1 3 25V8.5a5 5 0 0 1 5-5z"/>' +
      '<path class="elia__seat-svg-arm" d="M2.5 20.5h4.5a1.5 1.5 0 0 1 1.5 1.5v11a2.5 2.5 0 0 1-2.5 2.5h-.5A3.5 3.5 0 0 1 2 32V22a1.5 1.5 0 0 1 1.5-1.5z"/>' +
      '<path class="elia__seat-svg-arm" d="M33 20.5h4.5A1.5 1.5 0 0 1 39 22v10a3.5 3.5 0 0 1-3.5 3.5h-.5a2.5 2.5 0 0 1-2.5-2.5v-11a1.5 1.5 0 0 1 1.5-1.5z"/>' +
      '<path class="elia__seat-svg-cushion" d="M9 24h22a2 2 0 0 1 2 2v3.2c0 .7-.4 1.3-1 1.6l-10.4 4.4c-.8.3-1.7.3-2.5 0L8 30.8a1.8 1.8 0 0 1-1-1.6V26a2 2 0 0 1 2-2z"/>' +
      '</svg>';
    button.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'elia__seat-number';
    label.textContent = String(seatNumber);
    button.appendChild(label);

    const isAvailable = available.has(seatNumber);
    const isSelected = selectedSeatNumbers.includes(seatNumber);
    const isPriority = priority.has(seatNumber) || seatNumber <= 4;

    if (!isAvailable || reserved.has(seatNumber)) {
      button.classList.add('elia__seat--taken');
      button.disabled = true;
    } else if (isSelected) {
      button.classList.add('elia__seat--selected');
    } else if (isPriority) {
      button.classList.add('elia__seat--priority');
    }

    return button;
  }

  function renderSeatGrid(seatMap) {
    if (!seatsGrid) return;
    seatsGrid.innerHTML = '';

    const capacity = Math.max(
      Number(seatMap.capacity) || 0,
      ...(seatMap.available_seats || []).map((n) => Number(n)),
      ...(seatMap.reserved_seats || []).map((n) => Number(n)),
      0
    );

    const rows = buildBusSeatLayout(capacity || 45);
    rows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'elia__seat-row' + (row.type === 'back' ? ' elia__seat-row--back' : '');

      if (row.type === 'back') {
        row.seats.forEach((seatNumber) => {
          rowEl.appendChild(createSeatButton(seatNumber, seatMap));
        });
      } else {
        row.seats.forEach((seatNumber, index) => {
          if (index === 2) {
            const aisle = document.createElement('span');
            aisle.className = 'elia__seat-aisle';
            aisle.setAttribute('aria-hidden', 'true');
            rowEl.appendChild(aisle);
          }
          if (seatNumber == null) {
            const spacer = document.createElement('span');
            spacer.className = 'elia__seat-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            rowEl.appendChild(spacer);
          } else {
            rowEl.appendChild(createSeatButton(seatNumber, seatMap));
          }
        });
      }

      seatsGrid.appendChild(rowEl);
    });

    updateSelectedSeatsLabel();
  }

  async function fetchSeatMapFromApi(scheduleId) {
    if (!scheduleId) return null;
    const params = new URLSearchParams({
      action: 'get-schedule',
      schedule_id: String(scheduleId)
    });
    const response = await fetch(BOOKNA_API + '?' + params.toString(), {
      headers: { Accept: 'application/json' }
    });
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      return null;
    }
    if (!data || data.success === false) return null;
    return {
      ok: true,
      schedule_id: String(data.schedule_id || scheduleId),
      capacity: Number(data.capacity) || 0,
      available_seats: Array.isArray(data.available_seats) ? data.available_seats : [],
      reserved_seats: Array.isArray(data.reserved_seats) ? data.reserved_seats : [],
      priority_seats: Array.isArray(data.priority_seats) ? data.priority_seats : [],
      bus_type: data.bus_type || '',
      price: data.price ?? null
    };
  }

  async function openSeatsModal(seatMap) {
    let map = seatMap && seatMap.ok ? seatMap : modalSeatMap;
    if ((!map || !map.ok) && currentSeatScheduleId()) {
      map = await fetchSeatMapFromApi(currentSeatScheduleId());
      modalSeatMap = map;
    }
    if (!seatsModal || !map || !map.ok) return;

    selectedSeatNumbers = bookingContext.seat_mode === 'return'
      ? (bookingContext.return_seats || []).slice()
      : (bookingContext.departure_seats || []).slice();

    if (seatsError) {
      seatsError.hidden = true;
      seatsError.textContent = '';
    }
    if (seatsModalMeta) seatsModalMeta.textContent = formatSeatsModalMeta();
    const title = seatsModal.querySelector('#elia-seats-modal-title');
    if (title) {
      title.textContent = bookingContext.seat_mode === 'return' ? 'Select Return Seats' : 'Select Departure Seats';
    }
    renderSeatGrid(map);
    seatsModal.hidden = false;
    seatsModal.setAttribute('aria-hidden', 'false');
    widget.classList.add('elia--seats-modal-open');
    const closeButton = seatsModal.querySelector('.elia__seats-modal-close');
    if (closeButton) closeButton.focus();
  }

  function closeSeatsModal() {
    if (!seatsModal) return;
    seatsModal.hidden = true;
    seatsModal.setAttribute('aria-hidden', 'true');
    widget.classList.remove('elia--seats-modal-open');
  }

  function toggleSeatSelection(seatNumber) {
    const needed = neededSeatCount();
    const index = selectedSeatNumbers.indexOf(seatNumber);
    if (index >= 0) {
      selectedSeatNumbers.splice(index, 1);
    } else if (selectedSeatNumbers.length < needed) {
      selectedSeatNumbers.push(seatNumber);
      selectedSeatNumbers.sort((a, b) => a - b);
    } else if (needed === 1) {
      selectedSeatNumbers = [seatNumber];
    } else if (seatsError) {
      seatsError.hidden = false;
      seatsError.textContent = 'Please select exactly ' + needed + ' seats.';
      return;
    }
    if (seatsError) {
      seatsError.hidden = true;
      seatsError.textContent = '';
    }
    if (modalSeatMap) renderSeatGrid(modalSeatMap);
  }

  function submitSeatSelection() {
    const needed = neededSeatCount();
    if (selectedSeatNumbers.length !== needed) {
      if (seatsError) {
        seatsError.hidden = false;
        seatsError.textContent = 'Please select exactly ' + needed + ' seat' + (needed > 1 ? 's' : '') + '.';
      }
      return;
    }

    if (bookingContext.seat_mode === 'return') {
      bookingContext.return_seats = selectedSeatNumbers.slice();
    } else {
      bookingContext.departure_seats = selectedSeatNumbers.slice();
    }
    closeSeatsModal();
    sendMessage(SEATS_SUBMIT_MESSAGE, {
      displayText: 'Selected seats: ' + selectedSeatNumbers.join(', ')
    });
  }

  function buildScheduleListReply(text) {
    const source = String(text || '');
    if (/\[([^\]]+)\]\(schedule:list\)/.test(source)) return source;
    return SCHEDULE_LIST_REPLY;
  }

  function formatDetailsModalMeta() {
    const parts = [];
    if (bookingContext.departure_schedule_label) {
      parts.push(bookingContext.departure_schedule_label);
    }
    if (bookingContext.passengers > 1) {
      parts.push(bookingContext.passengers + ' passengers');
    }
    return parts.join(' · ');
  }

  function renderDetailsPassengerFields() {
    if (!detailsPassengersWrap) return;
    const count = Math.max(1, parseInt(bookingContext.passengers, 10) || 1);
    detailsPassengersWrap.innerHTML = '';

    for (let i = 0; i < count; i += 1) {
      const existing = Array.isArray(bookingContext.passenger_list) ? (bookingContext.passenger_list[i] || {}) : {};
      const block = document.createElement('div');
      block.className = 'elia__details-passenger';
      block.innerHTML = [
        '<p class="elia__details-passenger-title">Passenger ', (i + 1), '</p>',
        '<div class="elia__details-passenger-grid">',
        '<label class="elia__details-field"><span>First name</span>',
        '<input type="text" name="passenger_fname_', i, '" value="', escapeHtml(existing.fname || ''), '" autocomplete="given-name" required></label>',
        '<label class="elia__details-field"><span>Last name</span>',
        '<input type="text" name="passenger_lname_', i, '" value="', escapeHtml(existing.lname || ''), '" autocomplete="family-name" required></label>',
        '</div>'
      ].join('');
      detailsPassengersWrap.appendChild(block);
    }
  }

  function sanitizePhoneInput(value) {
    return String(value || '').replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
  }

  function bindPhoneNumberInput(inputEl) {
    if (!inputEl || inputEl.dataset.eliaPhoneBound === '1') return;
    inputEl.dataset.eliaPhoneBound = '1';

    inputEl.addEventListener('input', () => {
      const sanitized = sanitizePhoneInput(inputEl.value);
      if (inputEl.value !== sanitized) {
        inputEl.value = sanitized;
      }
    });

    inputEl.addEventListener('paste', (event) => {
      event.preventDefault();
      const pasted = (event.clipboardData || window.clipboardData).getData('text');
      inputEl.value = sanitizePhoneInput(inputEl.value + pasted);
    });

    inputEl.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowedKeys.includes(event.key)) return;
      if (!/^\d$/.test(event.key)) {
        event.preventDefault();
        return;
      }
      const digits = sanitizePhoneInput(inputEl.value);
      if (digits.length >= PHONE_MAX_DIGITS && inputEl.selectionStart === inputEl.selectionEnd) {
        event.preventDefault();
      }
    });
  }

  function openBookingDetailsModal() {
    if (!detailsModal || !detailsForm) return;
    if (detailsError) {
      detailsError.hidden = true;
      detailsError.textContent = '';
    }
    if (detailsModalMeta) detailsModalMeta.textContent = formatDetailsModalMeta();
    detailsForm.email.value = bookingContext.email || '';
    bindPhoneNumberInput(detailsForm.contact_number);
    detailsForm.contact_number.value = sanitizePhoneInput(bookingContext.contact_number || '');
    renderDetailsPassengerFields();
    detailsModal.hidden = false;
    detailsModal.setAttribute('aria-hidden', 'false');
    widget.classList.add('elia--details-modal-open');
    detailsForm.email.focus();
  }

  function closeBookingDetailsModal() {
    if (!detailsModal) return;
    detailsModal.hidden = true;
    detailsModal.setAttribute('aria-hidden', 'true');
    widget.classList.remove('elia--details-modal-open');
  }

  function submitBookingDetailsForm(event) {
    event.preventDefault();
    if (!detailsForm) return;

    const email = String(detailsForm.email.value || '').trim();
    const contactNumber = sanitizePhoneInput(detailsForm.contact_number.value);
    detailsForm.contact_number.value = contactNumber;
    const count = Math.max(1, parseInt(bookingContext.passengers, 10) || 1);
    const passengerList = [];

    for (let i = 0; i < count; i += 1) {
      const fname = String(detailsForm.querySelector('[name="passenger_fname_' + i + '"]')?.value || '').trim();
      const lname = String(detailsForm.querySelector('[name="passenger_lname_' + i + '"]')?.value || '').trim();
      if (!fname || !lname) {
        if (detailsError) {
          detailsError.hidden = false;
          detailsError.textContent = 'Please complete all passenger names.';
        }
        return;
      }
      passengerList.push({
        fname: fname,
        lname: lname,
        email: email,
        contact_number: contactNumber
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (detailsError) {
        detailsError.hidden = false;
        detailsError.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    if (!contactNumber) {
      if (detailsError) {
        detailsError.hidden = false;
        detailsError.textContent = 'Please enter a mobile number.';
      }
      return;
    }

    if (contactNumber.length !== PHONE_MAX_DIGITS) {
      if (detailsError) {
        detailsError.hidden = false;
        detailsError.textContent = 'Mobile number must be exactly 11 digits (e.g. 09171234567).';
      }
      return;
    }

    let normalizedPhone = contactNumber;
    if (normalizedPhone.startsWith('63') && normalizedPhone.length === 12) {
      normalizedPhone = '0' + normalizedPhone.slice(2);
    }
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      if (detailsError) {
        detailsError.hidden = false;
        detailsError.textContent = 'Please enter a valid mobile number (e.g. 09171234567).';
      }
      return;
    }

    bookingContext.email = email;
    bookingContext.contact_number = normalizedPhone;
    bookingContext.passenger_list = passengerList;
    bookingContext.booking_step = 'confirm';
    closeBookingDetailsModal();
    sendMessage(DETAILS_SUBMIT_MESSAGE, { displayText: 'Submitted passenger details' });
  }

  async function fetchSchedulesFromApi() {
    if (!hasCompleteBookingContext()) return [];

    if (!bookingContext.trip_type) {
      bookingContext.trip_type = 'oneway';
    }

    const params = new URLSearchParams({
      action: 'search-schedules',
      ori: booknaLocationToUrlParam(bookingContext.origin),
      des: booknaLocationToUrlParam(bookingContext.destination),
      dep: bookingContext.departure_date,
      pas: String(bookingContext.passengers || 1),
      way: bookingContext.trip_type === 'roundtrip' ? 'false' : 'true'
    });
    if (bookingContext.return_date) {
      params.set('ret', bookingContext.return_date);
    }

    const response = await fetch(BOOKNA_API + '?' + params.toString(), {
      headers: { Accept: 'application/json' }
    });

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      return [];
    }

    return Array.isArray(data && data.schedules) ? data.schedules : [];
  }

  function formatReplyHtml(text) {
    const blocks = String(text).trim().split(/\n{2,}/);
    return blocks.map((block) => {
      const lines = block.split('\n');
      const isList = lines.every((line) => /^\s*([-*•]|\d+\.)\s+/.test(line));
      if (isList) {
        const items = lines.map((line) => {
          const item = line.replace(/^\s*([-*•]|\d+\.)\s+/, '');
          return '<li>' + formatInline(linkify(escapeHtml(item))) + '</li>';
        }).join('');
        const ordered = /^\s*\d+\./.test(lines[0]);
        return ordered ? '<ol>' + items + '</ol>' : '<ul>' + items + '</ul>';
      }
      return '<p>' + formatInline(linkify(escapeHtml(block))).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  const BOOKNA_PAYMENT_BASE = 'https://staging.bookna.com/genesis/#/payment?traID=';

  function normalizeCheckoutUrl(url) {
    const match = String(url || '').match(/traID=([^&\s#")]+)/i);
    if (!match) return url;
    return BOOKNA_PAYMENT_BASE + encodeURIComponent(decodeURIComponent(match[1]));
  }

  function extractCheckoutUrl(text) {
    const match = String(text).match(/https?:\/\/[^\s)*"]*bookna\.com[^\s)*"]*(?:payment|#\/payment)[^\s)*"]*/i);
    return match ? normalizeCheckoutUrl(match[0]) : '';
  }

  function appendCheckoutAction(html, text) {
    const checkoutUrl = extractCheckoutUrl(text);
    if (!checkoutUrl) return html;

    return html + [
      '<p class="elia__checkout-action">',
      '<a class="elia__checkout-btn" href="', escapeHtml(checkoutUrl), '" target="_blank" rel="noopener noreferrer" data-elia-booking-link>',
      '<i class="fa-solid fa-credit-card" aria-hidden="true"></i> Complete payment',
      '</a>',
      '</p>'
    ].join('');
  }

  async function fetchReply(message) {
    const payload = {
      message: message,
      booking_context: Object.assign({}, bookingContext, {
        search_schedules: shouldAutoShowSchedules(message, '')
      })
    };
    if (chatSession) payload.session = chatSession;

    const response = await fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid response from Elia');
    }

    if (!response.ok || data.error || !data.reply) {
      throw new Error((data && data.message) || 'Elia is unavailable right now');
    }

    if (data.session) chatSession = data.session;
    if (data.booking_context) mergeBookingContext(data.booking_context);
    return data;
  }

  function mapQuickActions(actions) {
    if (!Array.isArray(actions) || !actions.length) return null;
    return actions.map((action) => ({
      label: action.label || action.value || 'Option',
      value: action.value || action.label || ''
    }));
  }

  function hideWelcomePrompts() {
    const welcomeActions = conversation.querySelector('.elia__quick-actions--welcome');
    if (welcomeActions) welcomeActions.remove();
  }

  async function sendMessage(text, options) {
    const cleanText = text.trim();
    if (!cleanText || isReplying) return;
    const displayText = (options && options.displayText) || cleanText;

    hideWelcomePrompts();
    lastFailedMessage = '';
    if (!cleanText.startsWith('__')) {
      updateBookingContext(cleanText);
      syncBookingContextFromConversation();
    }
    addUserMessage(displayText);
    input.value = '';
    resizeInput();
    syncSendState();
    isReplying = true;
    syncSendState();
    showTyping();

    try {
      const result = await fetchReply(cleanText);
      clearTyping();
      updateBookingContext(result.reply);
      syncBookingContextFromConversation();

      let schedules = Array.isArray(result.schedules) ? result.schedules : [];
      if (result.seat_map && result.seat_map.ok) {
        modalSeatMap = result.seat_map;
      }
      const showSchedules = schedules.length > 0
        && (/\[([^\]]+)\]\(schedule:list\)/.test(String(result.reply || ''))
          || shouldAutoShowSchedules(cleanText, result.reply));
      if (schedules.length === 0 && shouldAutoShowSchedules(cleanText, result.reply)) {
        schedules = await fetchSchedulesFromApi();
      }

      let replyHtml = result.reply;

      if (schedules.length > 0 && showSchedules) {
        modalSchedules = schedules;
        replyHtml = buildScheduleListReply(replyHtml);
      } else if (schedules.length > 0) {
        modalSchedules = schedules;
      }

      addAssistantMessage(
        appendCheckoutAction(formatReplyHtml(replyHtml), replyHtml),
        mapQuickActions(result.quick_actions)
      );
    } catch (error) {
      clearTyping();
      lastFailedMessage = cleanText;
      addAssistantMessage(
        '<p>Sorry, ka-G — I couldn’t reach the travel assistant right now. Please try again in a moment.</p>',
        [
          { label: 'Try again', value: '__retry__', retry: true, html: '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Try again' },
          { label: '🚌 Book a trip', value: 'open-booking-form' },
          { label: '📍 Find a terminal', value: 'open-terminals' }
        ]
      );
    } finally {
      isReplying = false;
      syncSendState();
    }
  }

  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 112) + 'px';
  }

  function showFeedback() {
    feedbackShown = true;
    stickToBottom = true;
    const card = document.createElement('div');
    card.className = 'elia__message elia__message--assistant';
    card.innerHTML = [
      '<span class="elia__avatar"><img src="images/elia.png" alt="Elia"></span>',
      '<div class="elia__message-body"><div class="elia__bubble elia__rating">',
      '<p>Before you go, helpful ba ang chat natin?</p>',
      '<div class="elia__rating-actions">',
      '<button type="button" data-elia-rate="good" aria-label="Helpful">😊</button>',
      '<button type="button" data-elia-rate="okay" aria-label="It was okay">😐</button>',
      '<button type="button" data-elia-rate="bad" aria-label="Not helpful">😕</button>',
      '</div>',
      '<button type="button" data-elia-skip class="elia__skip">Skip</button>',
      '</div></div>'
    ].join('');
    conversation.appendChild(card);
    scrollToLatest(true);
  }

  function finishFeedback() {
    addAssistantMessage('<p>Salamat sa feedback! Ingat ka lagi ka-G! 😊✨</p>');
    window.setTimeout(() => closeChat(true), 900);
  }

  function resetChat() {
    clearTyping();
    closeScheduleModal();
    closeSeatsModal();
    closeBookingDetailsModal();
    conversation.innerHTML = initialConversation;
    userMessageCount = 0;
    feedbackShown = false;
    isReplying = false;
    chatSession = '';
    lastFailedMessage = '';
    modalSchedules = [];
    modalSeatMap = null;
    selectedSeatNumbers = [];
    bookingContext.origin = '';
    bookingContext.destination = '';
    bookingContext.departure_date = '';
    bookingContext.passengers = 1;
    bookingContext.return_date = '';
    bookingContext.departure_schedule_id = '';
    bookingContext.departure_schedule_label = '';
    bookingContext.return_schedule_id = '';
    bookingContext.return_schedule_label = '';
    bookingContext.departure_seats = [];
    bookingContext.return_seats = [];
    bookingContext.trip_type = '';
    bookingContext.email = '';
    bookingContext.contact_number = '';
    bookingContext.passenger_list = [];
    bookingContext.booking_step = 'idle';
    bookingContext.schedule_mode = 'departure';
    bookingContext.seat_mode = 'departure';
    stickToBottom = true;
    input.value = '';
    resizeInput();
    syncSendState();
    stampExistingMessages();
    scrollToLatest(true);
    input.focus();
  }

  conversation.addEventListener('scroll', () => {
    stickToBottom = isNearBottom();
    updateJumpButton();
  }, { passive: true });

  widget.addEventListener('click', (event) => {
    if (event.target.closest('[data-elia-dismiss-invite]')) {
      event.preventDefault();
      event.stopPropagation();
      dismissInvite();
      return;
    }

    if (event.target.closest('[data-elia-jump]')) {
      stickToBottom = true;
      scrollToLatest(true);
      return;
    }

    if (event.target.closest('[data-elia-open]')) openChat();
    if (event.target.closest('[data-elia-close]')) closeChat(false);
    if (event.target.closest('[data-elia-new]')) resetChat();

    const prompt = event.target.closest('[data-elia-prompt]');
    if (prompt) {
      const value = prompt.dataset.eliaPrompt;
      if (value === '__retry__' || prompt.dataset.eliaRetry === '1') {
        if (lastFailedMessage) sendMessage(lastFailedMessage);
        return;
      }
      if (value === 'open-booking-form') {
        closeChat(true);
        const booking = document.getElementById('booking');
        if (booking) {
          booking.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      if (value === 'open-terminals') {
        closeChat(true);
        const terminals = document.getElementById('terminals');
        if (terminals) {
          terminals.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      sendMessage(value);
    }

    const bookingAction = event.target.closest('[data-elia-booking-action]');
    if (bookingAction) {
      const action = bookingAction.getAttribute('data-elia-booking-action');
      if (action === 'confirm' || action === 'cancel') {
        const group = bookingAction.closest('.elia__confirm-actions') || bookingAction.parentElement;
        if (group) {
          group.querySelectorAll('[data-elia-booking-action]').forEach((btn) => {
            btn.disabled = true;
          });
        } else {
          bookingAction.disabled = true;
        }
        sendMessage(action, {
          displayText: action === 'confirm' ? 'Confirm' : 'Cancel'
        });
      }
      return;
    }

    if (event.target.closest('[data-elia-rate]')) finishFeedback();
    if (event.target.closest('[data-elia-skip]')) closeChat(true);
    if (event.target.closest('[data-elia-booking-link]')) closeChat(true);

    const scheduleModalTrigger = event.target.closest('[data-elia-schedule-modal="list"]');
    if (scheduleModalTrigger) {
      openScheduleModal(modalSchedules);
      return;
    }

    const scheduleModalClose = event.target.closest('[data-elia-schedule-modal-close]');
    if (scheduleModalClose) {
      closeScheduleModal();
      return;
    }

    const seatsModalTrigger = event.target.closest('[data-elia-seats-modal="open"]');
    if (seatsModalTrigger) {
      openSeatsModal(modalSeatMap);
      return;
    }

    const seatsModalClose = event.target.closest('[data-elia-seats-modal-close]');
    if (seatsModalClose) {
      closeSeatsModal();
      return;
    }

    const seatPick = event.target.closest('.elia__seat');
    if (seatPick && seatsModal && !seatsModal.hidden) {
      const seatNumber = parseInt(seatPick.getAttribute('data-elia-seat') || '', 10);
      if (seatNumber > 0 && !seatPick.disabled) {
        toggleSeatSelection(seatNumber);
      }
      return;
    }

    const seatsSubmitBtn = event.target.closest('[data-elia-seats-submit]');
    if (seatsSubmitBtn) {
      submitSeatSelection();
      return;
    }

    const detailsModalTrigger = event.target.closest('[data-elia-details-modal="open"]');
    if (detailsModalTrigger) {
      openBookingDetailsModal();
      return;
    }

    const detailsModalClose = event.target.closest('[data-elia-details-modal-close]');
    if (detailsModalClose) {
      closeBookingDetailsModal();
      return;
    }

    const scheduleModalPick = event.target.closest('.elia__schedule-modal-item');
    if (scheduleModalPick) {
      const scheduleId = scheduleModalPick.getAttribute('data-elia-schedule-id');
      const scheduleLabel = scheduleModalPick.getAttribute('data-elia-schedule-label') || 'selected trip';
      closeScheduleModal();
      if (scheduleId) {
        if (bookingContext.schedule_mode === 'return') {
          bookingContext.return_schedule_id = scheduleId;
          bookingContext.return_schedule_label = scheduleLabel;
        } else {
          bookingContext.departure_schedule_id = scheduleId;
          bookingContext.departure_schedule_label = scheduleLabel;
        }
        sendMessage('Book this trip: ' + scheduleLabel + ' (schedule ' + scheduleId + ')');
      }
      return;
    }

    const schedulePick = event.target.closest('.elia__schedule-link');
    if (schedulePick) {
      const scheduleId = schedulePick.getAttribute('data-elia-schedule-id');
      const scheduleLabel = schedulePick.getAttribute('data-elia-schedule-label') || 'selected trip';
      if (scheduleId) {
        sendMessage('Book this trip: ' + scheduleLabel + ' (schedule ' + scheduleId + ')');
      }
      return;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('input', () => {
    resizeInput();
    syncSendState();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  if (detailsForm) {
    bindPhoneNumberInput(detailsForm.contact_number);
    detailsForm.addEventListener('submit', submitBookingDetailsForm);
  }

  document.addEventListener('keydown', (event) => {
    if (widget.classList.contains('elia--details-modal-open') && event.key === 'Escape') {
      closeBookingDetailsModal();
      return;
    }

    if (widget.classList.contains('elia--seats-modal-open') && event.key === 'Escape') {
      closeSeatsModal();
      return;
    }

    if (widget.classList.contains('elia--schedule-modal-open') && event.key === 'Escape') {
      closeScheduleModal();
      return;
    }

    if (!widget.classList.contains('elia--open')) return;

    if (event.key === 'Escape') {
      closeChat(true);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(getFocusable()).filter((el) => el.offsetParent !== null || el === input);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll('[data-elia-external-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openChat();
    });
  });

  restoreInviteState();
  stampExistingMessages();
  syncSendState();
  updateJumpButton();
}());
