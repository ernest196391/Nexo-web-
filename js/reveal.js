(function () {
  'use strict';

  document.querySelectorAll('.reveal-words').forEach(function (el) {
    if (el.dataset.split === 'true') return;
    var text = el.textContent;
    el.textContent = '';
    text.split(' ').forEach(function (word, i) {
      if (i > 0) el.appendChild(document.createTextNode(' '));
      var span = document.createElement('span');
      span.className = 'word-inner';
      span.style.transitionDelay = (i * 70) + 'ms';
      span.textContent = word;
      el.appendChild(span);
    });
    el.dataset.split = 'true';
  });

  var reveals = document.querySelectorAll('.reveal, .hairline, .reveal-words');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
