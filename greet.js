/* ---------------------------------------------------------------------------
   The greeting cycles through languages with a scramble between each one.

   No dependency: the whole effect is one requestAnimationFrame loop over a
   string, which is smaller than any library that would do it and means the
   landing page still loads two files. The <h1> keeps a real, static "hi" in
   the markup, so with scripting off — or before this file arrives — the page
   reads correctly and nothing shifts when it starts.
   --------------------------------------------------------------------------- */

const GREETINGS = [
  'hi', 'hola', 'bonjour', 'hallo', 'ciao', 'olá', 'नमस्ते', 'привет',
  '你好', 'こんにちは', '안녕', 'γεια', 'merhaba', 'cześć', 'hej', 'salam',
];

/* Deliberately not letters: the scramble has to read as noise, and lowercase
   latin mid-transition just looks like a typo. */
const NOISE = '!<>-_\\/[]{}—=+*^?#$%&01';

const el = document.querySelector('[data-greet]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

const HOLD = 1100;    /* ms a greeting stays legible before the next scramble */
const JITTER = 13;    /* frames of noise before a character settles */
const STAGGER = 0.9;  /* frames each character waits behind the one before it */

let timer = null;

function scramble(from, to) {
  /* Each character gets its own start and end frame, so the word resolves left
     to right with a ragged edge instead of all at once. */
  const len = Math.max(from.length, to.length);
  const plan = [];
  for (let i = 0; i < len; i++) {
    const start = Math.floor(Math.random() * 5) + i * STAGGER;
    plan.push({ from: from[i] || '', to: to[i] || '', start, end: start + JITTER });
  }

  let frame = 0;
  return new Promise((resolve) => {
    (function tick() {
      let out = '';
      let done = 0;
      for (const c of plan) {
        if (frame >= c.end) { out += c.to; done++; }
        else if (frame >= c.start) { out += NOISE[(Math.random() * NOISE.length) | 0]; }
        else { out += c.from; }
      }
      el.textContent = out;
      if (done === plan.length) { el.classList.remove('is-glitching'); resolve(); return; }
      frame++;
      timer = requestAnimationFrame(tick);
    })();
  });
}

async function cycle(i) {
  const next = GREETINGS[i % GREETINGS.length];
  el.classList.add('is-glitching');
  await scramble(el.textContent, next);
  /* dir has to follow the word: without it the Arabic greeting drags the
     surrounding punctuation around with it. */
  el.setAttribute('dir', /[֐-ࣿ]/.test(next) ? 'rtl' : 'ltr');
  timer = setTimeout(() => cycle(i + 1), HOLD);
}

function stop() {
  cancelAnimationFrame(timer);
  clearTimeout(timer);
}

function start() {
  if (!el || reduced.matches) return;
  stop();
  timer = setTimeout(() => cycle(1), HOLD);
}

/* A background tab should not be burning frames on an animation nobody is
   looking at, and coming back to a half-scrambled word looks broken. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stop(); } else { el.textContent = 'hi'; start(); }
});
reduced.addEventListener('change', () => { stop(); el.textContent = 'hi'; start(); });

start();
