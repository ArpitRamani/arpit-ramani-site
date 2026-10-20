/* ---------------------------------------------------------------------------
   The portfolio's one piece of motion: the heading resolving out of noise
   on load, the same scramble as the greeting on the landing page. Only the
   heading: scrambling every row on every tab switch was too much.

   An enhancement, never a requirement. The markup is three sections of
   native <details>; with scripting off they stack under their own headings
   and open as plain accordions. This file adds the tab bar, hides the
   headings, and plays the decode. No dependency.
   --------------------------------------------------------------------------- */

/* Same alphabet as greet.js, for the same reason: lowercase latin
   mid-transition reads as a typo, punctuation reads as noise. */
const NOISE = '!<>-_\\/[]{}—=+*^?#$%&01';

const JITTER = 9;    /* frames of noise before a character settles */
const SPREAD = 20;   /* frames from the first character settling to the last */

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const running = new WeakMap();

/* Resolve every text node under `el` from noise to its own text, left to
   right with a ragged edge. Unlike the greeting, the spread is fixed rather
   than per character: a 300-character paragraph has to land as fast as a
   two-word row, or opening one feels like waiting. */
function decode(el, delay = 0) {
  if (reduced.matches) return;
  cancel(el);

  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  }
  const total = nodes.reduce((n, t) => n + t.nodeValue.length, 0);
  if (!total) return;

  /* Noise glyphs are not the width of the letters they stand in for, so a
     wrapping block would change height mid-decode and shove everything below
     it. Pin it at its final height for the duration. */
  el.style.minHeight = el.offsetHeight + 'px';

  let i = 0;
  const plan = nodes.map((node) => {
    const text = node.nodeValue;
    const chars = [...text].map((ch) => {
      const start = (i++ / total) * SPREAD + Math.random() * 4;
      return { ch, start, end: start + JITTER };
    });
    return { node, text, chars };
  });

  const job = { frame: -Math.round(delay / 16.7), raf: 0 };
  running.set(el, job);
  el.classList.add('decoding');

  (function tick() {
    let pending = false;
    for (const p of plan) {
      let out = '';
      for (const c of p.chars) {
        if (job.frame >= c.end || c.ch === ' ' || c.ch === ' ') out += c.ch;
        else { out += NOISE[(Math.random() * NOISE.length) | 0]; pending = true; }
      }
      p.node.nodeValue = out;
    }
    if (!pending) { finish(el, plan); return; }
    job.frame++;
    job.raf = requestAnimationFrame(tick);
  })();

  job.plan = plan;
}

function finish(el, plan) {
  for (const p of plan) p.node.nodeValue = p.text;
  el.classList.remove('decoding');
  el.style.minHeight = '';
  running.delete(el);
}

/* A second decode on the same element, or a tab switch mid-decode, must put
   the real text back first, or the half-scrambled string becomes the "final"
   text the next run resolves to. */
function cancel(el) {
  const job = running.get(el);
  if (!job) return;
  cancelAnimationFrame(job.raf);
  finish(el, job.plan);
}


/* --------------------------------- tabs ------------------------------------ */

const sections = [...document.querySelectorAll('.sheet section')];
const nav = document.querySelector('.tabs');
nav.setAttribute('role', 'tablist');

const buttons = sections.map((s) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = s.querySelector('h2').textContent;
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-controls', s.id);
  b.addEventListener('click', () => show(s.id, true));
  s.setAttribute('role', 'tabpanel');
  nav.append(b);
  return b;
});
nav.hidden = false;

/* Left and right move between the three words, as a tablist should. */
nav.addEventListener('keydown', (e) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  const at = buttons.indexOf(document.activeElement);
  const next = buttons[(at + step + buttons.length) % buttons.length];
  next.focus();
  next.click();
});

function show(id, animate) {
  const target = sections.find((s) => s.id === id) || sections[0];
  sections.forEach((s, k) => {
    const on = s === target;
    s.classList.toggle('on', on);
    buttons[k].setAttribute('aria-selected', on);
    buttons[k].tabIndex = on ? 0 : -1;
  });
  /* The hash makes a tab linkable (/portfolio.html#projects) without adding a
     history entry per click. */
  if (!animate) return;
  history.replaceState(null, '', '#' + target.id);
}

show(location.hash.slice(1), false);

document.querySelectorAll('[data-decode-on-load]').forEach((el) => decode(el));
