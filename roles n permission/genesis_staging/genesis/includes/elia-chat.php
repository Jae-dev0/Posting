<div class="elia" id="elia" data-elia-widget>
  <div class="elia__scrim" data-elia-close aria-hidden="true"></div>

  <aside class="elia__panel" id="elia-panel" role="dialog" aria-modal="true" aria-label="Chat with Elia" aria-hidden="true">
    <header class="elia__header">
      <div class="elia__brand">
        <span class="elia__avatar elia__avatar--header">
          <img src="images/elia.png" alt="">
        </span>
        <div>
          <strong>Elia</strong>
          <span class="elia__status"><i aria-hidden="true"></i> Online · Travel buddy</span>
        </div>
      </div>
      <div class="elia__header-actions">
        <button class="elia__new-chat" type="button" data-elia-new title="Start a new chat">
          <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
          <span>New Chat</span>
        </button>
        <button class="elia__icon-button" type="button" data-elia-close aria-label="Close chat" title="Close">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </header>

    <div class="elia__notice">
      <i class="fa-solid fa-sparkles" aria-hidden="true"></i>
      <span>Elia can make mistakes. Please double-check important travel details.</span>
    </div>

    <div class="elia__conversation-shell">
      <main class="elia__conversation" id="elia-conversation" aria-live="polite" aria-relevant="additions">
        <div class="elia__date">Today</div>

        <div class="elia__welcome" data-elia-welcome>
          <span class="elia__avatar elia__avatar--welcome">
            <img src="images/elia.png" alt="Elia">
          </span>
          <div class="elia__welcome-copy">
            <h2>Hi, ka-G! 👋</h2>
            <p>Ako si Elia, your Genesis travel buddy. Ask about schedules, terminals, or booking — and I’ll help you get going.</p>
          </div>
        </div>

        <div class="elia__quick-actions elia__quick-actions--welcome" aria-label="Suggested questions">
          <button type="button" data-elia-prompt="Book a trip">
            <span class="elia__chip-icon" aria-hidden="true">🚌</span>
            <span class="elia__chip-text">
              <strong>Book a trip</strong>
              <em>Start planning your ride</em>
            </span>
          </button>
          <button type="button" data-elia-prompt="Check bus schedules">
            <span class="elia__chip-icon" aria-hidden="true">🕐</span>
            <span class="elia__chip-text">
              <strong>Check schedules</strong>
              <em>See departure times</em>
            </span>
          </button>
          <button type="button" data-elia-prompt="Find a terminal">
            <span class="elia__chip-icon" aria-hidden="true">📍</span>
            <span class="elia__chip-text">
              <strong>Find a terminal</strong>
              <em>Locate boarding points</em>
            </span>
          </button>
        </div>
      </main>

      <button class="elia__jump-latest" type="button" data-elia-jump hidden aria-label="Jump to latest messages">
        <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
        <span>New messages</span>
      </button>
    </div>

    <div class="elia__composer-wrap">
      <form class="elia__composer" id="elia-form">
        <label class="elia__sr-only" for="elia-input">Message Elia</label>
        <textarea id="elia-input" rows="1" maxlength="500" placeholder="Ask about trips, schedules, terminals…" autocomplete="off" enterkeyhint="send"></textarea>
        <div class="elia__composer-meta">
          <span class="elia__char-count" data-elia-count aria-live="polite" hidden>0/500</span>
          <button type="submit" aria-label="Send message" disabled>
            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
        </div>
      </form>
      <p class="elia__composer-note">
        <span>Enter to send · Shift+Enter for new line</span>
        <span>Travel smart, travel safe with Genesis.</span>
      </p>
    </div>

    <div class="elia__schedule-modal" data-elia-schedule-modal hidden aria-hidden="true">
      <div class="elia__schedule-modal-backdrop" data-elia-schedule-modal-close tabindex="-1"></div>
      <div class="elia__schedule-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="elia-schedule-modal-title">
        <header class="elia__schedule-modal-header">
          <div>
            <h3 id="elia-schedule-modal-title">Available Trips</h3>
            <p class="elia__schedule-modal-meta" data-elia-schedule-modal-meta></p>
          </div>
          <button class="elia__schedule-modal-close" type="button" data-elia-schedule-modal-close aria-label="Close schedule list">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>
        <ul class="elia__schedule-modal-list" data-elia-schedule-modal-list></ul>
      </div>
    </div>

    <div class="elia__seats-modal" data-elia-seats-modal hidden aria-hidden="true">
      <div class="elia__seats-modal-backdrop" data-elia-seats-modal-close tabindex="-1"></div>
      <div class="elia__seats-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="elia-seats-modal-title">
        <header class="elia__seats-modal-header">
          <div>
            <h3 id="elia-seats-modal-title">Select Seats</h3>
            <p class="elia__seats-modal-meta" data-elia-seats-modal-meta></p>
          </div>
          <button class="elia__seats-modal-close" type="button" data-elia-seats-modal-close aria-label="Close seat map">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>
        <div class="elia__seats-modal-body">
          <div class="elia__seats-legend" aria-hidden="true">
            <span><i class="elia__seat-swatch elia__seat-swatch--priority"></i> Priority</span>
            <span><i class="elia__seat-swatch elia__seat-swatch--available"></i> Available</span>
            <span><i class="elia__seat-swatch elia__seat-swatch--selected"></i> Selected</span>
            <span><i class="elia__seat-swatch elia__seat-swatch--taken"></i> Taken</span>
          </div>
          <div class="elia__bus-deck">
            <div class="elia__bus-front" aria-hidden="true">
              <span class="elia__bus-driver" title="Driver">D</span>
              <span class="elia__bus-front-label">FRONT</span>
            </div>
            <div class="elia__seats-grid" data-elia-seats-grid></div>
          </div>
          <div class="elia__seats-footer">
            <p class="elia__seats-selected" data-elia-seats-selected>Selected: none</p>
            <p class="elia__seats-error" data-elia-seats-error hidden></p>
            <button class="elia__seats-submit" type="button" data-elia-seats-submit>Confirm seats</button>
          </div>
        </div>
      </div>
    </div>

    <div class="elia__details-modal" data-elia-details-modal hidden aria-hidden="true">
      <div class="elia__details-modal-backdrop" data-elia-details-modal-close tabindex="-1"></div>
      <div class="elia__details-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="elia-details-modal-title">
        <header class="elia__details-modal-header">
          <div>
            <h3 id="elia-details-modal-title">Passenger Details</h3>
            <p class="elia__details-modal-meta" data-elia-details-modal-meta></p>
          </div>
          <button class="elia__details-modal-close" type="button" data-elia-details-modal-close aria-label="Close passenger form">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>
        <form class="elia__details-form" id="elia-details-form" novalidate>
          <div class="elia__details-section">
            <h4>Contact information</h4>
            <label class="elia__details-field">
              <span>Email</span>
              <input type="email" name="email" autocomplete="email" placeholder="booker@example.com" required>
            </label>
            <label class="elia__details-field">
              <span>Mobile number</span>
              <input type="tel" name="contact_number" autocomplete="tel" inputmode="numeric" pattern="[0-9]{11}" maxlength="11" placeholder="09171234567" required>
            </label>
          </div>
          <div class="elia__details-section">
            <h4 data-elia-details-passengers-title>Passengers</h4>
            <div class="elia__details-passengers" data-elia-details-passengers></div>
          </div>
          <p class="elia__details-error" data-elia-details-error hidden></p>
          <button class="elia__details-submit" type="submit">Continue booking</button>
        </form>
      </div>
    </div>
  </aside>

  <div class="elia__invite" data-elia-invite>
    <button type="button" data-elia-open aria-label="Open chat with Elia">
      <span class="elia__invite-avatar" aria-hidden="true">
        <img src="images/elia.png" alt="">
      </span>
      <span class="elia__invite-copy">
        <strong>Hi, ka-G!</strong>
        <span>Need help planning your trip?</span>
      </span>
      <i class="fa-solid fa-xmark" aria-hidden="true" data-elia-dismiss-invite title="Dismiss"></i>
    </button>
  </div>

  <button class="elia__launcher" type="button" data-elia-open aria-controls="elia-panel" aria-expanded="false">
    <img src="images/elia.png" alt="">
    <span class="elia__launcher-status" aria-hidden="true"></span>
    <span class="elia__launcher-ping" aria-hidden="true"></span>
    <span class="elia__sr-only">Chat with Elia</span>
  </button>
</div>
