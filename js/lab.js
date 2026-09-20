(function () {
  'use strict';

  var grid = document.querySelector('.lab-grid');
  if (!grid) return;

  var items = Array.prototype.slice.call(grid.querySelectorAll('.lab-item'));
  if (!items.length) return;

  // Los estados iniciales (imagen y texto ocultos) solo se aplican si el JS puede deshacerlos.
  grid.classList.add('is-ready');

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (it) { it.classList.add('is-in', 'is-live'); it.dataset.animated = 'true'; });
    return;
  }

  // Entrada: una sola vez por tarjeta, cuando está de verdad en pantalla.
  var entrada = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.dataset.animated = 'true';
        entrada.unobserve(e.target);
      });
    },
    { threshold: 0.3 }
  );

  // Secuencia: solo corre mientras la tarjeta está visible. Al salir se detiene,
  // así no hay seis bucles gastando batería a la vez ni se reinicia a cada scroll.
  var vivo = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-live', e.isIntersecting);
      });
    },
    { threshold: 0.25 }
  );

  items.forEach(function (it) { entrada.observe(it); vivo.observe(it); });
})();
