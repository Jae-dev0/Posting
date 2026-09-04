$(document).ready(function () {
  if (!$('#from_dropdown').length || !$('#search_btn').length) return;

  const today = new Date().toISOString().split('T')[0];
  $('#departure_date').attr('min', today);
  $('#return_date').attr('min', today);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const booknaLocationToUrlParam = (location) => {
    const value = String(location || '').trim();
    if (!value) return '';
    const parenMatch = value.match(/^(.+?)\s+\((.+?)\)$/);
    if (parenMatch) {
      return (parenMatch[1].trim() + '*' + parenMatch[2].trim()).toUpperCase();
    }
    return value.toUpperCase();
  };

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  $('#departure_date').val(formatDate(tomorrow));
  $('#departure_date').attr('min', formatDate(tomorrow));
  $('#return_date').val(formatDate(nextWeek));
  $('#return_date').attr('min', formatDate(tomorrow));

  const PASSENGER_MIN = 1;
  const PASSENGER_MAX = 10;

  function getPassengerCount() {
    return parseInt($('#adult_count').val(), 10) || PASSENGER_MIN;
  }

  function setPassengerCount(count) {
    const value = Math.min(PASSENGER_MAX, Math.max(PASSENGER_MIN, count));
    $('#adult_count').val(String(value));
    $('#passenger_count_display').text(String(value));
    $('#passenger_minus').prop('disabled', value <= PASSENGER_MIN);
    $('#passenger_plus').prop('disabled', value >= PASSENGER_MAX);
  }

  function toggleReturnDate() {
    const isRound = $('input[name="trip_type"]:checked').val() === 'roundtrip';
    const $dateRow = $('#date_row');

    if (isRound) {
      $dateRow.removeClass('is-oneway');
      $('#return_date_group').show();
      $('#return_date').prop('required', true);
      if (!$('#return_date').val()) {
        $('#return_date').val(formatDate(nextWeek));
      }
      $('#return_date').attr('min', $('#departure_date').val() || formatDate(tomorrow));
    } else {
      $dateRow.addClass('is-oneway');
      $('#return_date_group').hide();
      $('#return_date').val('').prop('required', false);
    }
  }

  setPassengerCount(getPassengerCount());
  $('#passenger_minus').on('click', function () {
    setPassengerCount(getPassengerCount() - 1);
  });
  $('#passenger_plus').on('click', function () {
    setPassengerCount(getPassengerCount() + 1);
  });

  toggleReturnDate();
  $('input[name="trip_type"]').on('change', toggleReturnDate);

  $('#departure_date').on('change', function () {
    const depVal = $(this).val();
    if (!depVal) return;
    $('#return_date').attr('min', depVal);
    if ($('#return_date').val() && $('#return_date').val() < depVal) {
      const depDate = new Date(depVal + 'T00:00:00');
      depDate.setDate(depDate.getDate() + 7);
      $('#return_date').val(formatDate(depDate));
    }
  });

  $.ajax({
    url: 'api.php',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      const fromDropdown = $('#from_dropdown');
      fromDropdown.empty();

      if (!data.locations || !Array.isArray(data.locations)) {
        fromDropdown.append('<option disabled>No locations found</option>');
        fromDropdown.prop('disabled', true);
        return;
      }

      fromDropdown.append('<option value="" disabled selected>Select Origin</option>');
      data.locations.forEach(function (location) {
        fromDropdown.append($('<option>', { value: location, text: location }));
      });
      fromDropdown.prop('disabled', false);
    },
    error: function () {
      $('#from_dropdown').empty().append('<option disabled>Failed to load options</option>').prop('disabled', true);
    }
  });

  $('#from_dropdown').on('change', function () {
    const selectedOrigin = $(this).val();
    const toDropdown = $('#to_dropdown');

    if (!selectedOrigin) {
      toDropdown.empty().append('<option value="" disabled selected>Select Destination</option>').prop('disabled', true);
      return;
    }

    toDropdown.empty().append('<option disabled>Loading destinations...</option>').prop('disabled', true);

    $.ajax({
      url: 'api.php',
      method: 'GET',
      dataType: 'json',
      data: { destination: selectedOrigin },
      success: function (data) {
        toDropdown.empty();

        if (!data.locations || !Array.isArray(data.locations) || data.locations.length === 0) {
          toDropdown.append('<option disabled>No destinations found</option>');
          toDropdown.prop('disabled', true);
          return;
        }

        toDropdown.append('<option value="" disabled selected>Select Destination</option>');
        data.locations.forEach(function (location) {
          toDropdown.append($('<option>', { value: location, text: location }));
        });
        toDropdown.prop('disabled', false);
      },
      error: function () {
        toDropdown.empty().append('<option disabled>Failed to load destinations</option>').prop('disabled', true);
      }
    });
  });

  $('#switch_btn').on('click', function () {
    const fromDropdown = $('#from_dropdown');
    const toDropdown = $('#to_dropdown');
    const temp = fromDropdown.val();
    fromDropdown.val(toDropdown.val());
    toDropdown.val(temp);
    fromDropdown.trigger('change');
  });

  $('#search_btn').on('click', function () {
    const $btn = $(this);
    $btn.prop('disabled', true);

    const type = $('input[name="trip_type"]:checked').val();
    const origin = $('#from_dropdown').val();
    const dest = $('#to_dropdown').val();
    const dep = $('#departure_date').val();
    const ret = $('#return_date').val();
    const pas = $('#adult_count').val() || '1';

    if (!origin || !dest || !dep || (type === 'roundtrip' && !ret)) {
      alert('Please fill all required fields.');
      $btn.prop('disabled', false);
      return;
    }

    const ori = booknaLocationToUrlParam(origin);
    const des = booknaLocationToUrlParam(dest);
    const url = type === 'roundtrip'
      ? `https://staging.bookna.com/genesis/#/trips?way=false&ori=${encodeURIComponent(ori)}&des=${encodeURIComponent(des)}&dep=${encodeURIComponent(dep)}&ret=${encodeURIComponent(ret)}&pas=${encodeURIComponent(pas)}`
      : `https://staging.bookna.com/genesis/#/trips?way=true&ori=${encodeURIComponent(ori)}&des=${encodeURIComponent(des)}&dep=${encodeURIComponent(dep)}&pas=${encodeURIComponent(pas)}`;

    setTimeout(function () {
      window.location.href = url;
    }, 300);
  });
});
