(function () {
  var mapEl = document.getElementById('terminals-map');
  var dataEl = document.getElementById('terminals-map-data');
  if (!mapEl || !dataEl || typeof L === 'undefined') return;

  var terminals = [];
  try {
    terminals = JSON.parse(dataEl.textContent || '[]');
  } catch (err) {
    return;
  }

  if (!terminals.length) return;

  var map = L.map(mapEl, {
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  }).addTo(map);

  var markers = {};
  var directionsLink = document.getElementById('terminals-directions');
  var cubaoCenter = [14.6191, 121.0567];
  var metroTerminalIds = ['cubao', 'avenida', 'pasay'];
  var terminalZoom = 14;

  function getMetroBounds() {
    var metroBounds = L.latLngBounds([]);
    metroTerminalIds.forEach(function (id) {
      if (markers[id]) {
        metroBounds.extend(markers[id].marker.getLatLng());
      }
    });
    return metroBounds;
  }

  function focusOnMetro() {
    var metroBounds = getMetroBounds();
    if (metroBounds.isValid()) {
      map.fitBounds(metroBounds, { padding: [52, 52], maxZoom: 13 });
      return;
    }
    map.setView(cubaoCenter, 13, { animate: false });
  }

  function focusOnTerminal(terminal, animate) {
    if (!terminal) {
      focusOnMetro();
      return;
    }
    if (metroTerminalIds.indexOf(terminal.id) !== -1) {
      focusOnMetro();
      return;
    }
    map.setView([terminal.lat, terminal.lng], terminalZoom, { animate: animate !== false });
  }

  function pinIcon(isActive) {
    return L.divIcon({
      className: 'bookna-map-pin' + (isActive ? ' bookna-map-pin--active' : ''),
      html: '<span aria-hidden="true"></span>',
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34],
    });
  }

  function directionsUrl(terminal) {
    var destination = terminal.map_query || (terminal.address + ', Philippines');
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination);
  }

  function popupContent(terminal) {
    return (
      '<div class="bookna-map-popup">' +
        '<strong>' + terminal.name + '</strong>' +
        '<a href="' + directionsUrl(terminal) + '" target="_blank" rel="noopener noreferrer">Directions</a>' +
      '</div>'
    );
  }

  function setDirections(terminal) {
    if (directionsLink && terminal) {
      directionsLink.href = directionsUrl(terminal);
    }
  }

  window.selectTerminalOnMap = function (id, focus) {
    if (focus === undefined) focus = true;

    document.querySelectorAll('.bookna-terminal-tab').forEach(function (tab) {
      var active = tab.getAttribute('data-terminal-id') === id;
      tab.classList.toggle('bookna-terminal-tab--active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    Object.keys(markers).forEach(function (key) {
      var entry = markers[key];
      var active = key === id;
      entry.marker.setIcon(pinIcon(active));
      if (active) {
        entry.marker.setZIndexOffset(1000);
        if (focus) {
          entry.marker.openPopup();
          focusOnTerminal(entry.terminal, true);
        }
        setDirections(entry.terminal);
      } else {
        entry.marker.setZIndexOffset(0);
      }
    });
  };

  terminals.forEach(function (terminal, index) {
    var latLng = [terminal.lat, terminal.lng];

    var marker = L.marker(latLng, {
      icon: pinIcon(index === 0),
      title: terminal.name,
    }).addTo(map);

    marker.bindPopup(popupContent(terminal));
    marker.on('click', function () {
      window.selectTerminalOnMap(terminal.id, false);
    });

    markers[terminal.id] = { marker: marker, terminal: terminal };
  });

  focusOnMetro();

  document.querySelectorAll('.bookna-terminal-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      window.selectTerminalOnMap(tab.getAttribute('data-terminal-id'));
    });
  });

  mapEl.addEventListener('mouseenter', function () {
    map.scrollWheelZoom.enable();
  });
  mapEl.addEventListener('mouseleave', function () {
    map.scrollWheelZoom.disable();
  });

  window.setTimeout(function () {
    map.invalidateSize();
    focusOnMetro();
    if (terminals[0]) {
      markers[terminals[0].id].marker.openPopup();
      setDirections(terminals[0].terminal);
    }
  }, 450);
})();
