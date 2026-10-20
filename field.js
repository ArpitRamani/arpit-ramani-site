/* ---------------------------------------------------------------------------
   The background: a landscape that never holds still.

   One surface read two ways. To a chemist it is a free-energy landscape, the
   wells a molecule settles into; to someone training a model it is a loss
   landscape. Its basins drift and breathe on slow, incommensurate cycles, so
   the contours flow without ever repeating exactly. A few optimizers (heavy-
   ball momentum, the same update most training runs use) keep descending it,
   chasing minima that move out from under them, which is post-training in
   one picture: the objective shifts, and the policy follows.

   Drawn on a canvas with marching squares at fixed levels, so contours fade
   in and out smoothly as the surface moves through them. Cleared to nothing
   behind the text. Reduced motion gets one still frame. No dependency.
   --------------------------------------------------------------------------- */

const CELL = 11;          /* px per grid cell for the contour pass */
const LEVELS = 24;
const LO = -1.25, HI = 0.18;
const TRAIL = 200;        /* positions kept per optimizer */
const LIFE = 1400;        /* frames before an optimizer fades out and restarts (~45s) */
const N_OPT = 0;

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.createElement('canvas');
canvas.className = 'field';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

const css = getComputedStyle(document.documentElement);
const LINE = css.getPropertyValue('--contour').trim() || '#d3d0ca';
const INK = css.getPropertyValue('--faint').trim() || '#76736e';

let W = 0, H = 0, S = 0, cols = 0, rows = 0, grid = null;

/* Each basin wanders a Lissajous path (positions as fractions of the
   viewport) and its depth breathes. Periods are all different primes'
   worth of seconds, so the whole thing takes hours to come back round. */
const BASINS = [
  { x: 0.84, y: 0.22, ax: 0.07, ay: 0.06, px: 71, py: 53, d: 1.0, s: 0.22, pd: 37 },
  { x: 0.90, y: 0.80, ax: 0.05, ay: 0.08, px: 61, py: 89, d: 0.8, s: 0.19, pd: 43 },
  { x: 0.14, y: 0.82, ax: 0.08, ay: 0.05, px: 83, py: 59, d: 1.1, s: 0.24, pd: 31 },
  { x: 0.10, y: 0.18, ax: 0.06, ay: 0.06, px: 67, py: 79, d: 0.7, s: 0.17, pd: 47 },
  { x: 0.50, y: 1.02, ax: 0.18, ay: 0.03, px: 97, py: 41, d: 0.5, s: 0.20, pd: 53 },
  { x: 0.48, y: -0.04, ax: 0.16, ay: 0.03, px: 89, py: 47, d: 0.45, s: 0.19, pd: 29 },
];
const TAU = Math.PI * 2;
let live = [];

function place(t) {
  live = BASINS.map((b, i) => ({
    x: (b.x + b.ax * Math.sin(TAU * t / b.px + i)) * W,
    y: (b.y + b.ay * Math.sin(TAU * t / b.py + 2 * i)) * H,
    d: b.d * (0.8 + 0.2 * Math.sin(TAU * t / b.pd + i)),
    k: 1 / (b.s * S) ** 2,
  }));
}

function field(x, y, t) {
  let z = 0;
  for (const b of live) {
    const dx = x - b.x, dy = y - b.y;
    z -= b.d * Math.exp(-(dx * dx + dy * dy) * b.k);
  }
  /* A low ripple over everything, so the ground between wells is not flat. */
  return z + 0.06 * Math.sin(x / S * 6.5 + t / 23) * Math.cos(y / S * 5.2 - t / 31)
           + 0.035 * Math.sin((x + y) / S * 9 + t / 17);
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight; S = Math.max(W, H);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = Math.ceil(W / CELL) + 1;
  rows = Math.ceil(H / CELL) + 1;
  grid = new Float32Array(cols * rows);
}

/* ------------------------------- contours --------------------------------- */

function contours(t) {
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) grid[j * cols + i] = field(i * CELL, j * CELL, t);

  ctx.beginPath();
  for (let l = 0; l < LEVELS; l++) {
    const v = LO + (HI - LO) * (l + 0.5) / LEVELS;
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = grid[j * cols + i], b = grid[j * cols + i + 1];
        const c = grid[(j + 1) * cols + i + 1], d = grid[(j + 1) * cols + i];
        const code = (a > v) | ((b > v) << 1) | ((c > v) << 2) | ((d > v) << 3);
        if (code === 0 || code === 15) continue;
        const x = i * CELL, y = j * CELL;
        /* Crossing points on each edge, linearly interpolated. */
        const top = () => [x + CELL * (v - a) / (b - a), y];
        const right = () => [x + CELL, y + CELL * (v - b) / (c - b)];
        const bottom = () => [x + CELL * (v - d) / (c - d), y + CELL];
        const left = () => [x, y + CELL * (v - a) / (d - a)];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (code) {
          case 1: case 14: seg(left(), top()); break;
          case 2: case 13: seg(top(), right()); break;
          case 3: case 12: seg(left(), right()); break;
          case 4: case 11: seg(right(), bottom()); break;
          case 6: case 9: seg(top(), bottom()); break;
          case 7: case 8: seg(left(), bottom()); break;
          case 5: seg(left(), top()); seg(right(), bottom()); break;
          case 10: seg(top(), right()); seg(left(), bottom()); break;
        }
      }
    }
  }
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/* ------------------------------- optimizers ------------------------------- */

const opts = [];

function spawn(o, t) {
  /* Start on a slope somewhere outside the text's ellipse: a point on the
     flat ground would just sit there. */
  for (let tries = 0; tries < 40; tries++) {
    o.x = Math.random() * W;
    o.y = Math.random() * H;
    const ex = (o.x - W / 2) / (W / 2), ey = (o.y - H / 2) / (H / 2);
    if (ex * ex + ey * ey < 0.55) continue;
    const f = field(o.x, o.y, t);
    if (f < -0.15 && f > -0.75) break;
  }
  o.vx = o.vy = 0;
  o.still = 0;
  o.age = 0;
  o.trail = [];
}

function step(o, t) {
  const h = 2;
  const gx = (field(o.x + h, o.y, t) - field(o.x - h, o.y, t)) / (2 * h);
  const gy = (field(o.x, o.y + h, t) - field(o.x, o.y - h, t)) / (2 * h);
  const lr = S * S * 0.003;
  o.vx = 0.9 * o.vx - lr * gx * 0.01;
  o.vy = 0.9 * o.vy - lr * gy * 0.01;
  const sp = Math.hypot(o.vx, o.vy);
  if (sp > 2.2) { o.vx *= 2.2 / sp; o.vy *= 2.2 / sp; }
  o.x += o.vx; o.y += o.vy;
  o.trail.push(o.x, o.y);
  if (o.trail.length > TRAIL * 2) o.trail.splice(0, 2);
  /* Settled for a while, run long enough, or wandered off the page: start a
     new run somewhere else, so they do not all end up in the same well. */
  o.still = sp < 0.06 ? o.still + 1 : 0;
  if (++o.age > LIFE || o.still > 300 || o.x < -40 || o.y < -40 || o.x > W + 40 || o.y > H + 40) spawn(o, t);
}

function drawOpts() {
  ctx.fillStyle = INK;
  for (const o of opts) {
    /* Fade in at the start of a run and out at the end, rather than pop. */
    const a = Math.min(1, o.age / 60, (LIFE - o.age) / 60);
    const n = o.trail.length / 2;
    for (let k = 0; k < n; k += 5) {
      ctx.globalAlpha = a * 0.5 * (k / n) ** 1.3;
      ctx.fillRect(o.trail[2 * k] - 0.75, o.trail[2 * k + 1] - 0.75, 1.5, 1.5);
    }
    ctx.globalAlpha = a * 0.7;
    ctx.beginPath();
    ctx.arc(o.x, o.y, 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* --------------------------------- frame ---------------------------------- */

/* Clear an ellipse behind the content, fading out to the edges, so the
   landscape lives in the margins and never sits under a line of text. */
function vignette() {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.translate(W / 2, H / 2);
  ctx.scale(W / 2, H / 2);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1.25);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(W < 700 ? 0.5 : 0.36, 'rgba(0,0,0,1)');
  g.addColorStop(W < 700 ? 0.9 : 0.78, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1.5, -1.5, 3, 3);
  ctx.restore();
}

function draw(t, moving) {
  ctx.clearRect(0, 0, W, H);
  place(t);
  while (opts.length < N_OPT) { const o = {}; spawn(o, t); opts.push(o); }
  contours(t);
  if (moving) { for (const o of opts) step(o, t); drawOpts(); }
  vignette();
}

resize();

let raf = 0, last = 0;
const t0 = performance.now() - Math.random() * 600000;   /* a different landscape each visit */
function tick(now) {
  raf = requestAnimationFrame(tick);
  if (now - last < 33) return;            /* ~30fps is plenty for something this slow */
  last = now;
  draw((now - t0) / 1000, true);
}

function start() {
  cancelAnimationFrame(raf);
  if (reduced.matches) draw((performance.now() - t0) / 1000, false);
  else raf = requestAnimationFrame(tick);
}

addEventListener('resize', () => { resize(); if (reduced.matches) start(); });
reduced.addEventListener('change', start);
start();
