(function () {
  'use strict';

  // Sin proveedor de analítica instalado todavía. Este emisor solo
  // empuja a window.dataLayer (convención GTM) para que, cuando se
  // decida un proveedor, no haga falta recablear nada aquí.
  window.dataLayer = window.dataLayer || [];

  function track(name, data) {
    window.dataLayer.push(Object.assign({ event: name }, data || {}));
  }

  // Clics en elementos interactivos marcados con data-event.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-event]');
    if (!el) return;
    var data = {};
    Array.prototype.forEach.call(el.attributes, function (attr) {
      var match = attr.name.match(/^data-event-(.+)$/);
      if (match) data[match[1]] = attr.value;
    });
    track(el.getAttribute('data-event'), data);
  });

  // Vista de cada área de servicio y de cada producto de NEXO Lab.
  var watched = document.querySelectorAll('.area[id], .lab-item[data-event]');
  if (watched.length && 'IntersectionObserver' in window) {
    var seen = new WeakSet();
    var viewObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          var el = entry.target;
          if (el.classList.contains('area')) {
            track('service_view', { area: el.id });
          } else {
            track(el.getAttribute('data-event'), { product: el.getAttribute('data-event-product') });
          }
        });
      },
      { threshold: 0.5 }
    );
    watched.forEach(function (el) { viewObserver.observe(el); });
  }

  window.nexoTrack = track;
})();
