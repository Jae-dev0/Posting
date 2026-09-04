document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.getElementById('main-menu');

  function closeMobileMenu() {
    if (menu) menu.classList.remove('active');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.bookna-nav-item--open').forEach(function (item) {
      item.classList.remove('bookna-nav-item--open');
    });
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.bookna-nav-item--dropdown > .bookna-nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 768px)').matches) {
        e.preventDefault();
        link.parentElement.classList.toggle('bookna-nav-item--open');
      }
    });
  });

  document.querySelectorAll('.bookna-header__links a, .bookna-dropdown a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!link.closest('.bookna-nav-item--dropdown') || link.closest('.bookna-dropdown')) {
        closeMobileMenu();
      }
    });
  });

  const serviceSections = ['services', 'joybus', 'p2p', 'bus-rental', 'cargo'];
  const topNavLinks = document.querySelectorAll('.bookna-header__links .bookna-nav-link[data-section]');
  const dropdownParent = document.querySelector('.bookna-nav-item--dropdown');
  const sectionOrder = ['hero', 'about', 'services', 'joybus', 'p2p', 'bus-rental', 'cargo', 'terminals', 'contact'];

  function isServiceSection(sectionId) {
    return serviceSections.indexOf(sectionId) !== -1;
  }

  function normalizeSection(sectionId) {
    if (sectionId === 'booking') return 'hero';
    return sectionId;
  }

  function setActiveNav(sectionId) {
    sectionId = normalizeSection(sectionId);
    topNavLinks.forEach(function (link) {
      var linkSection = link.getAttribute('data-section');
      var isActive = linkSection === sectionId;

      if (linkSection === 'services') {
        isActive = isServiceSection(sectionId);
      }

      link.classList.toggle('bookna-nav-link--active', isActive);
    });

    if (dropdownParent) {
      dropdownParent.classList.toggle('bookna-nav-item--active', isServiceSection(sectionId));
    }
  }

  function getCurrentSection() {
    var headerHeight = document.querySelector('.bookna-header')?.offsetHeight || 96;
    var marker = window.scrollY + headerHeight + 48;
    var current = 'hero';

    // Near the top of the page always counts as Home, even if the URL hash is stale.
    if (window.scrollY < 40) {
      return 'hero';
    }

    sectionOrder.forEach(function (sectionId) {
      var section = document.getElementById(sectionId);
      if (section && section.offsetTop <= marker) {
        current = sectionId;
      }
    });

    return current;
  }

  function syncNavFromScroll() {
    setActiveNav(getCurrentSection());
  }

  var scrollTicking = false;
  function onScrollSpy() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      syncNavFromScroll();
      scrollTicking = false;
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href === '#') return;

    link.addEventListener('click', function (e) {
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '#' + id);
      } else {
        window.location.hash = id;
      }
      setActiveNav(normalizeSection(id));
      closeMobileMenu();
    });
  });

  function scrollToHashWhenReady() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) {
      syncNavFromScroll();
      return;
    }

    var target = document.getElementById(hash);
    if (!target) {
      syncNavFromScroll();
      return;
    }

    // Wait until page-loading overflow lock is gone so scrollIntoView actually works.
    var attempts = 0;
    var maxAttempts = 40;
    var tryScroll = function () {
      attempts += 1;
      var locked = document.documentElement.classList.contains('page-loading');
      if (locked && attempts < maxAttempts) {
        window.setTimeout(tryScroll, 50);
        return;
      }

      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      window.requestAnimationFrame(function () {
        syncNavFromScroll();
      });
    };

    window.setTimeout(tryScroll, 80);
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  scrollToHashWhenReady();
  syncNavFromScroll();
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  window.addEventListener('resize', onScrollSpy, { passive: true });
  window.addEventListener('hashchange', function () {
    scrollToHashWhenReady();
  });

  // Section gold underlines: draw left → right across the full heading text.
  var headings = document.querySelectorAll('.bookna-heading');
  if (headings.length) {
    if ('IntersectionObserver' in window) {
      var headingObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            headingObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.35,
        rootMargin: '0px 0px -8% 0px',
      });

      headings.forEach(function (heading) {
        headingObserver.observe(heading);
      });
    } else {
      headings.forEach(function (heading) {
        heading.classList.add('is-inview');
      });
    }
  }

  const video = document.querySelector('.hero-video');
  if (video) {
    video.play().catch(function () {});
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(function () {});
      }
    });
  }

  var routeSearch = document.getElementById('route_search');
  var routesGrid = document.getElementById('routes_grid');
  var routeEmpty = document.getElementById('route_empty');
  if (routeSearch && routesGrid) {
    routeSearch.addEventListener('input', function () {
      var q = routeSearch.value.trim().toLowerCase();
      var visibleCards = 0;

      routesGrid.querySelectorAll('.bookna-route-card').forEach(function (card) {
        var hub = card.getAttribute('data-route-hub') || '';
        var anyMatch = !q || hub.indexOf(q) !== -1;
        var visibleItems = 0;

        card.querySelectorAll('li').forEach(function (item) {
          var text = item.getAttribute('data-route-text') || item.textContent.toLowerCase();
          var match = !q || text.indexOf(q) !== -1 || hub.indexOf(q) !== -1;
          item.classList.toggle('is-hidden', q && !match);
          if (match) {
            visibleItems += 1;
            anyMatch = true;
          }
        });

        var show = !q || anyMatch || visibleItems > 0;
        card.hidden = !show;
        card.classList.toggle('is-dimmed', false);
        if (show) visibleCards += 1;
      });

      if (routeEmpty) routeEmpty.hidden = visibleCards > 0;
    });
  }

  const servicesTrack = document.querySelector('.bookna-services__track');
  const prevBtn = document.querySelector('.bookna-services__prev');
  const nextBtn = document.querySelector('.bookna-services__next');

  if (servicesTrack && prevBtn && nextBtn) {
    const scrollAmount = 420;
    prevBtn.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  const contactForm = document.getElementById('contact_form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('contact_name').value.trim();
      const email = document.getElementById('contact_email').value.trim();
      const message = document.getElementById('contact_message').value.trim();
      const terms = document.getElementById('contact_terms').checked;

      if (!name || !email || !message || !terms) {
        alert('Please complete all fields and accept the Terms.');
        return;
      }

      alert('Thank you for contacting Genesis. We will get back to you soon.');
      contactForm.reset();
    });
  }

  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyVisited = sessionStorage.getItem('gtsi_visited') === '1';
    sessionStorage.setItem('gtsi_visited', '1');

    // Short enough for fast nav, long enough to read the bus draw.
    const minVisibleMs = reduceMotion ? 80 : (alreadyVisited ? 480 : 680);
    const startedAt = performance.now();
    let dismissed = false;
    let ready = document.readyState !== 'loading';

    const dismissLoader = function () {
      if (dismissed) return;
      const wait = Math.max(0, minVisibleMs - (performance.now() - startedAt));
      window.setTimeout(function () {
        if (dismissed) return;
        dismissed = true;
        requestAnimationFrame(function () {
          pageLoader.classList.add('page-loader--done');
          document.documentElement.classList.remove('page-loading');
          // Re-sync nav after overflow unlock; stale hash no longer forces Contact active.
          if (typeof syncNavFromScroll === 'function') {
            syncNavFromScroll();
          }
          window.setTimeout(function () {
            if (pageLoader.parentNode) pageLoader.parentNode.removeChild(pageLoader);
            if (typeof syncNavFromScroll === 'function') {
              syncNavFromScroll();
            }
          }, 420);
        });
      }, wait);
    };

    const onReady = function () {
      if (ready && (document.readyState === 'interactive' || document.readyState === 'complete')) {
        dismissLoader();
      }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      ready = true;
      dismissLoader();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        ready = true;
        dismissLoader();
      }, { once: true });
      window.addEventListener('load', dismissLoader, { once: true });
      window.setTimeout(dismissLoader, 2500);
    }

    // If scripts run after interactive, dismiss immediately.
    onReady();
  }
});
