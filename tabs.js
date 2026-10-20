/* ---------------------------------------------------------------------------
   The portfolio's tabs.

   An enhancement, never a requirement. The markup is sections of native
   <details>; with scripting off they stack under their own headings and open
   as plain accordions. This file adds the tab bar and hides the headings.
   No dependency.
   --------------------------------------------------------------------------- */

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

function show(id, clicked) {
  const target = sections.find((s) => s.id === id) || sections[0];
  sections.forEach((s, k) => {
    const on = s === target;
    s.classList.toggle('on', on);
    buttons[k].setAttribute('aria-selected', on);
    buttons[k].tabIndex = on ? 0 : -1;
  });
  /* The hash makes a tab linkable (/portfolio.html#projects) without adding a
     history entry per click. */
  if (!clicked) return;
  history.replaceState(null, '', '#' + target.id);
}

show(location.hash.slice(1), false);

