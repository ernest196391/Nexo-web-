(function () {
  'use strict';

  var NEXO_WHATSAPP = '5354056173';
  var form = document.getElementById('intakeForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nombre = form.nombre.value.trim();
    var negocio = form.negocio.value.trim();
    var whatsapp = form.whatsapp.value.trim();
    var mensaje = form.mensaje.value.trim();
    var areas = Array.prototype.slice
      .call(form.querySelectorAll('input[name="area"]:checked'))
      .map(function (input) { return input.value; });

    var lineas = [
      'Hola, quiero una auditoría para mi negocio.',
      'Nombre: ' + nombre,
      'Negocio: ' + negocio,
      'WhatsApp: ' + whatsapp,
      'Áreas a mejorar: ' + (areas.length ? areas.join(', ') : 'sin especificar'),
      'Qué me gustaría mejorar: ' + mensaje
    ];

    if (window.nexoTrack) window.nexoTrack('audit_submitted', { areas: areas.join('|') });

    var url = 'https://wa.me/' + NEXO_WHATSAPP + '?text=' + encodeURIComponent(lineas.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();
