(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var contacto = document.querySelector('.contacto');
  if (!contacto) return;

  var raf = null;
  var pending = null;

  function applyGlow() {
    var rect = contacto.getBoundingClientRect();
    var x = ((pending.clientX - rect.left) / rect.width) * 100;
    var y = ((pending.clientY - rect.top) / rect.height) * 100;
    contacto.style.setProperty('--mx', x + '%');
    contacto.style.setProperty('--my', y + '%');
    raf = null;
  }

  contacto.addEventListener('mousemove', function (e) {
    pending = e;
    if (raf) return;
    raf = requestAnimationFrame(applyGlow);
  });
  contacto.addEventListener('mouseenter', function () { contacto.classList.add('cursor-active'); });
  contacto.addEventListener('mouseleave', function () { contacto.classList.remove('cursor-active'); });
})();
