/* ---------------------------------------------------------------------------
   The background: a field of dots over the whole page.

   It is the SpCas9 coevolution map behind my insertion-tolerance model:
   mean-field DCA couplings between residues, pooled into blocks. The map is
   stretched to the window, so the protein runs corner to corner along the
   diagonal and the dots off it are stretches far apart in sequence that
   still coevolve. A dot's size is how strongly. contact.json is built by
   data/contact.py.

   Dots shrink away as they near the text and none sit behind it, so
   nothing competes with reading.
   A slow wave of size runs along the diagonal, nothing else moves. Reduced
   motion gets the still field. No dependency.
   --------------------------------------------------------------------------- */

const WAVE_S = 14;        /* seconds for the wave to cross one wavelength */
const WAVELEN = 0.35;     /* as a fraction of the diagonal */
const DEPTH = 0.22;       /* how far the wave swells and shrinks a dot */
const CLEAR = 28;         /* px of empty space kept around the text */
const EDGE = 140;         /* px over which dots grow back to full size */

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.createElement('canvas');
canvas.className = 'field';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

const css = getComputedStyle(document.documentElement);
const DOT = css.getPropertyValue('--dots').trim() || '#c4c1bb';

let W = 0, H = 0, map = null, dots = [];

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* the box holding the text; if it is taller than the window it scrolls,
     so keep the whole column clear top to bottom. On a phone the column is
     the whole width, so there dots only thin out instead of vanishing. */
  const box = document.querySelector('main, .wrap, article');
  const b = box ? box.getBoundingClientRect() : { left: W / 2 - 352, right: W / 2 + 352, top: 0, bottom: H };
  const tall = b.bottom - b.top > H * 0.9;
  const top = tall ? -Infinity : b.top - CLEAR, bottom = tall ? Infinity : b.bottom + CLEAR;
  const left = b.left - CLEAR, right = b.right + CLEAR;
  const floor = b.right - b.left > W * 0.85 && tall ? 0.35 : 0;
  const near = (x, y) => {
    const dx = Math.max(left - x, 0, x - right), dy = Math.max(top - y, 0, y - bottom);
    return Math.max(floor, Math.min(1, Math.hypot(dx, dy) / EDGE));
  };

  /* lay a square lattice over the window and read each point off the map */
  const step = Math.min(20, Math.max(14, W / 90));
  const cols = Math.ceil(W / step), rows = Math.ceil(H / step);
  const ox = (W - (cols - 1) * step) / 2, oy = (H - (rows - 1) * step) / 2;
  const unit = step / 16;
  dots = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const v = map.v[Math.floor(j / rows * map.N) * map.N + Math.floor(i / cols * map.N)];
      if (!v) continue;
      const x = ox + i * step, y = oy + j * step, k = near(x, y);
      if (k < 0.15) continue;
      dots.push({ x, y, r: (0.45 + 2.4 * v ** 0.8) * unit * k, p: (x / W + y / H) / 2 });
    }
  }
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = DOT;
  ctx.beginPath();
  for (const d of dots) {
    const swell = t === null ? 1 : 1 + DEPTH * Math.sin((d.p / WAVELEN - t / WAVE_S) * Math.PI * 2);
    const r = d.r * swell;
    ctx.moveTo(d.x + r, d.y);
    ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  }
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
    map = { N: m.N, v: Array.from(m.v, (c) => parseInt(c, 36) / 35) };
    resize();
    const again = () => { resize(); if (reduced.matches) start(); };
    addEventListener('resize', again);
    /* expanding an entry or a late font changes the text box */
    const box = document.querySelector('main, .wrap, article');
    if (box) new ResizeObserver(again).observe(box);
    reduced.addEventListener('change', start);
    start();
  })
  .catch(() => canvas.remove());
