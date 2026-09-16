/* The name as molecules in a pseudo-MD simulation.
 *
 * Each particle is harmonically restrained to its home position, so the
 * rendered text is the native state. Thermal noise makes it shimmer; the
 * cursor is a probe that perturbs it locally and the letters re-anneal once
 * it leaves.
 *
 * Ported from the abandoned React component at ../web/components/ParticleName.
 * The physics is unchanged; what differs is that the canvas is sized and
 * lettered from the real <h1> rather than picking its own type, so enabling
 * this cannot move the header by a pixel.
 *
 * Progressive enhancement: the <h1> stays in the DOM and keeps its text for
 * selection, search and screen readers. It only goes visually transparent
 * once the simulation is actually running.
 */

const h1 = document.querySelector('header h1');
if (h1) init(h1);

function init(el) {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  // getComputedStyle is LIVE. Read the ink before anything makes the heading
  // transparent, or the particles get painted in rgba(0,0,0,0).
  const cs = getComputedStyle(el);
  const ink = cs.color;

  const cv = document.createElement('canvas');
  cv.className = 'namecanvas';
  cv.setAttribute('aria-hidden', 'true');
  el.style.position = 'relative';   // the canvas positions against the heading
  el.append(cv);

  const ctx = cv.getContext('2d');
  if (!ctx) { cv.remove(); el.style.position = ''; return; }

  let px, py, vx, vy, hx, hy, sz, al;
  let n = 0, w = 0, h = 0, raf = 0;
  let mx = -1e5, my = -1e5;

  const PAD = 0.18;                       // vertical slack so descenders survive

  function build() {
    const r = el.getBoundingClientRect();
    w = Math.round(r.width);
    h = Math.round(r.height * (1 + PAD * 2));
    if (w < 10 || h < 10) return;

    cv.width = Math.round(w * DPR);
    cv.height = Math.round(h * DPR);
    cv.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Stamp the text once offscreen, then sample its alpha channel.
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const oc = off.getContext('2d');
    oc.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in oc) oc.letterSpacing = cs.letterSpacing;
    oc.textBaseline = 'middle';
    oc.textAlign = 'center';
    oc.fillStyle = '#fff';
    oc.fillText(el.textContent.trim(), w / 2, h / 2);

    const img = oc.getImageData(0, 0, w, h).data;
    const fs = parseFloat(cs.fontSize);
    const step = Math.max(2, Math.round(fs / 30));
    const xs = [], ys = [];
    for (let y = 0; y < h; y += step)
      for (let x = 0; x < w; x += step)
        if (img[(y * w + x) * 4 + 3] > 128) { xs.push(x); ys.push(y); }

    n = xs.length;
    px = new Float32Array(n); py = new Float32Array(n);
    vx = new Float32Array(n); vy = new Float32Array(n);
    hx = new Float32Array(n); hy = new Float32Array(n);
    sz = new Float32Array(n); al = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      hx[i] = xs[i]; hy[i] = ys[i];
      px[i] = xs[i] + (Math.random() - 0.5) * 4;
      py[i] = ys[i] + (Math.random() - 0.5) * 4;
      sz[i] = 0.9 + Math.random() * 0.9;
      al[i] = 0.55 + Math.random() * 0.45;
    }
  }

  const K = 0.045, DAMP = 0.86, NOISE = 0.32, PR = 62, PF = 2.6;

  function step() {
    for (let i = 0; i < n; i++) {
      let fx = (hx[i] - px[i]) * K + (Math.random() - 0.5) * NOISE;
      let fy = (hy[i] - py[i]) * K + (Math.random() - 0.5) * NOISE;
      const dx = px[i] - mx, dy = py[i] - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < PR * PR) {
        const d = Math.sqrt(d2) || 1e-4;
        const f = PF * (1 - d / PR);
        fx += (dx / d) * f; fy += (dy / d) * f;
      }
      vx[i] = (vx[i] + fx) * DAMP;
      vy[i] = (vy[i] + fy) * DAMP;
      px[i] += vx[i]; py[i] += vy[i];
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = al[i];
      ctx.beginPath();
      ctx.arc(px[i], py[i], sz[i], 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame() { step(); draw(); raf = requestAnimationFrame(frame); }

  function settle() { for (let k = 0; k < 60; k++) step(); draw(); }

  addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
  }, { passive: true });
  addEventListener('pointerleave', () => { mx = my = -1e5; }, { passive: true });

  // Pause offscreen and in background tabs: this runs at 60fps otherwise.
  const io = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting && !REDUCED && n) raf = requestAnimationFrame(frame);
  });

  let t;
  new ResizeObserver(() => {
    clearTimeout(t);
    t = setTimeout(() => { build(); if (REDUCED) settle(); }, 120);
  }).observe(el);

  document.fonts.ready.then(() => {
    build();
    // Only hide the real text once there is something drawn to replace it.
    if (!n) { cv.remove(); el.style.position = ''; return; }
    settle();
    el.classList.add('hasparticles');
    if (!REDUCED) io.observe(el);
  });
}
