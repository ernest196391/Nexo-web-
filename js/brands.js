(function () {
  'use strict';

  var grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.brand-card'));
  if (!cards.length) return;

  grid.classList.add('is-ready');

  if (!('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.classList.add('is-in', 'is-focus'); });
    return;
  }

  // Entrada: se dispara cuando la tarjeta está de verdad en pantalla, no al asomar.
  var enter = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        enter.unobserve(e.target);
      });
    },
    { threshold: 0.45 }
  );

  // Foco: en móvil la tarjeta que cruza el centro de la pantalla toma el protagonismo.
  // En desktop manda el hover (ver CSS), así que aquí no estorba.
  // En los límites entre tarjetas la banda central puede tocar dos a la vez, así que
  // entre las candidatas gana solo la que tenga el centro más cerca del centro de pantalla.
  var candidatas = [];

  function resolver() {
    var centro = window.innerHeight / 2;
    var elegida = null;
    var mejor = Infinity;
    candidatas.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - centro);
      if (d < mejor) { mejor = d; elegida = c; }
    });
    cards.forEach(function (c) { c.classList.toggle('is-focus', c === elegida); });
    // Sin tarjeta enfocada no se atenúa nada: la sección no queda apagada al pasar de largo.
    grid.classList.toggle('has-focus', !!elegida);
  }

  var focus = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        var i = candidatas.indexOf(e.target);
        if (e.isIntersecting && i === -1) candidatas.push(e.target);
        else if (!e.isIntersecting && i !== -1) candidatas.splice(i, 1);
      });
      resolver();
    },
    { rootMargin: '-42% 0px -42% 0px', threshold: 0 }
  );

  cards.forEach(function (c) { enter.observe(c); focus.observe(c); });
})();
