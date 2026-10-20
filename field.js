/* ---------------------------------------------------------------------------
   The background: a band of dots along the bottom of the page.

   It is the SpCas9 coevolution map behind my insertion-tolerance model:
   mean-field DCA couplings between residues, pooled into blocks and turned
   45 degrees so the diagonal lies flat, the way Hi-C contact maps are drawn.
   Only the band near the diagonal is kept. A dot's size is how strongly
   those two stretches of the protein coevolve. contact.json is built by
   data/contact.py.

   A slow wave of size runs along the band, nothing else moves. Reduced
   motion gets the still band. No dependency.
   --------------------------------------------------------------------------- */

const WAVE_S = 14;        /* seconds for the wave to cross one wavelength */
const WAVELEN = 0.35;     /* as a fraction of the band's width */
const DEPTH = 0.22;       /* how far the wave swells and shrinks a dot */

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.createElement('canvas');
canvas.className = 'field';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

const css = getComputedStyle(document.documentElement);
const DOT = css.getPropertyValue('--dots').trim() || '#c4c1bb';

let W = 0, H = 0, map = null;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  const side = Math.min(48, W * 0.04);      /* page gutter either side */
  const width = W - 2 * side;
  const step = width / map.B;               /* dot spacing along the diagonal */
  const base = H - Math.min(40, H * 0.045); /* the band's bottom edge */
  const unit = Math.max(step / 18, 0.5);    /* dot radius scales with spacing, with a floor for phones */
  ctx.fillStyle = DOT;
  ctx.beginPath();
  map.v.forEach((row, k) => {
    const d = k + 1;
    const y = base - d * step / 2;
    row.forEach((v, i) => {
      const x = side + (i + d / 2) * step + step / 2;
      const swell = t === null ? 1 : 1 + DEPTH * Math.sin(((x - side) / width / WAVELEN - t / WAVE_S) * Math.PI * 2);
      const r = (0.55 + 2.0 * v ** 0.8) * unit * swell;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    });
  });
  ctx.fill();
}

let raf = 0, last = 0;
const t0 = performance.now();
function tick(now) {
  raf = requestAnimationFrame(tick);
  if (now - last < 33) return;   /* ~30fps is plenty for something this slow */
  last = now;
  draw((now - t0) / 1000);
}

function start() {
  cancelAnimationFrame(raf);
  if (reduced.matches) draw(null);
  else raf = requestAnimationFrame(tick);
}

fetch(new URL('contact.json', import.meta.url))
  .then((r) => r.json())
  .then((m) => {
    map = m;
    resize();
    addEventListener('resize', () => { resize(); if (reduced.matches) start(); });
    reduced.addEventListener('change', start);
    start();
  })
  .catch(() => canvas.remove());
