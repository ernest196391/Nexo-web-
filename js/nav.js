(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  function closeNav() {
    nav.dataset.state = 'closed';
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    nav.dataset.state = 'open';
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (nav.dataset.state === 'open') closeNav();
    else openNav();
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  var mq = window.matchMedia('(min-width: 960px)');
  mq.addEventListener('change', function () { closeNav(); });
})();
