(function () {
  'use strict';

  var track = document.querySelector('.hiw-track');
  if (!track) return;

  var steps = Array.prototype.slice.call(track.querySelectorAll('.hiw-step'));
  var dots = Array.prototype.slice.call(track.querySelectorAll('.hiw-rail-dot'));
  var fill = track.querySelector('.hiw-rail-fill');
  if (!steps.length) return;

  // Dimmed/hidden start states only apply once JS can undim them again.
  track.classList.add('is-ready');

  function activate(index) {
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-on', i <= index);
    });
    if (fill) fill.style.setProperty('--hiw-progress', ((index + 1) / steps.length) * 100 + '%');
  }

  if (!('IntersectionObserver' in window)) {
    steps.forEach(function (step) { step.classList.add('is-active', 'is-seen'); });
    activate(steps.length - 1);
    return;
  }

  // A step owns the middle band of the viewport (roughly 30%–65%).
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        activate(steps.indexOf(entry.target));
      });
    },
    { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
  );

  steps.forEach(function (step) { observer.observe(step); });
})();
