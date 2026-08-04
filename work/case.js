/* Halcyon — case study motion. All motion respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Reveal on scroll ---- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
    if (!reduce) el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
    revealIO.observe(el);
  });

  /* ---- Count-up ---- */
  function fmt(n, decimals, prefix, suffix) {
    var s = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (prefix || '') + parts.join('.') + (suffix || '');
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      countIO.unobserve(el);
      var target = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.decimals || '0', 10);
      var pre = el.dataset.prefix || '';
      var suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = fmt(target, dec, pre, suf); return; }
      var dur = 1250, t0 = null;
      function tick(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased, dec, pre, suf);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target, dec, pre, suf);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { countIO.observe(el); });

  /* ---- Charts ---- */
  var chartIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      chartIO.unobserve(e.target);
      var bars = e.target.querySelectorAll('.cbar .fill');
      bars.forEach(function (b, i) { b.style.transitionDelay = reduce ? '0ms' : (i * 70) + 'ms'; });
      e.target.classList.add('in');
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.chart').forEach(function (c) {
    c.querySelectorAll('.cbar .fill').forEach(function (f) { f.style.height = (f.dataset.h || 50) + '%'; });
    chartIO.observe(c);
  });

  /* ---- Device sequence player ---- */
  function playSequence(root) {
    var frames = Array.prototype.slice.call(root.querySelectorAll('[data-seq]'));
    var steps = Array.prototype.slice.call(document.querySelectorAll('[data-seq-step="' + root.dataset.seqGroup + '"]'));
    frames.forEach(function (f) { f.classList.remove('on', 'done'); });
    steps.forEach(function (s) { s.classList.remove('on'); });
    if (reduce) {
      frames.forEach(function (f) { f.classList.add('on'); });
      steps.forEach(function (s) { s.classList.add('on'); });
      return;
    }
    var order = frames.slice().sort(function (a, b) { return (+a.dataset.seq) - (+b.dataset.seq); });
    var timers = root._timers || [];
    timers.forEach(clearTimeout);
    timers = [];
    order.forEach(function (f, i) {
      timers.push(setTimeout(function () {
        f.classList.add('on');
        if (f.dataset.seqDone) f.classList.add('done');
        var idx = f.dataset.stepIndex;
        if (idx != null) {
          steps.forEach(function (s) { s.classList.toggle('on', s.dataset.stepIndex === idx); });
        }
      }, 520 + i * 780));
    });
    root._timers = timers;
  }
  var seqIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { seqIO.unobserve(e.target); playSequence(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-seq-group]').forEach(function (r) { seqIO.observe(r); });
  document.querySelectorAll('[data-replay]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var root = document.querySelector('[data-seq-group="' + btn.dataset.replay + '"]');
      if (root) playSequence(root);
    });
  });
})();
