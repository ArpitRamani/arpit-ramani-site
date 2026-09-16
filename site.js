/* Project detail modals.
 *
 * The page ships the panels as <details> so it still works with scripting off.
 * On load each project panel is lifted into a <dialog>, which buys Escape to
 * close, a focus trap and an inert background without writing any of it.
 *
 * Motion One is an enhancement, not a dependency: if the CDN is unreachable the
 * modal still opens and closes, it just uses the Web Animations API instead of
 * springs. Nothing here may throw in a way that leaves a card unclickable.
 */

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

let M = null;
try {
  M = await import('https://cdn.jsdelivr.net/npm/motion@11.18.2/+esm');
} catch { /* WAAPI fallback below */ }

const X_SVG =
  '<svg viewBox="0 0 14 14" aria-hidden="true" width="14" height="14">' +
  '<path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" ' +
  'stroke-width="1.6" stroke-linecap="round"/></svg>';

/* ------------------------------------------------------------------ animate */

function show(dlg) {
  const panel = dlg.querySelector('.dlgpanel');
  const rows = dlg.querySelectorAll('.facts dt, .facts dd, .demo, .demonote');
  if (REDUCED) return;

  if (M) {
    M.animate(panel, { opacity: [0, 1], transform: ['scale(.94) translateY(14px)', 'scale(1) translateY(0)'] },
      { type: 'spring', stiffness: 320, damping: 30, mass: .9 });
    M.animate(rows, { opacity: [0, 1], transform: ['translateY(9px)', 'translateY(0)'] },
      { delay: M.stagger(0.022, { startDelay: 0.07 }), duration: .42, easing: [.16, 1, .3, 1] });
  } else {
    panel.animate(
      [{ opacity: 0, transform: 'scale(.94) translateY(14px)' }, { opacity: 1, transform: 'none' }],
      { duration: 340, easing: 'cubic-bezier(.16,1,.3,1)' });
    rows.forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: 70 + i * 22, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  }
}

function hide(dlg, done) {
  const panel = dlg.querySelector('.dlgpanel');
  if (REDUCED) return done();

  // Never let closing depend on the animation resolving. A throttled or
  // backgrounded tab can leave finished() pending forever, and the dialog
  // would be stuck open with the page behind it still scroll-locked.
  let fired = false;
  const finish = () => { if (!fired) { fired = true; done(); } };

  panel.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97) translateY(8px)' }],
    { duration: 160, easing: 'cubic-bezier(.4,0,1,1)' }
  ).finished.then(finish, finish);
  setTimeout(finish, 260);
}

/* -------------------------------------------------------------------- build */

function lift(details) {
  const card = details.closest('.card');
  const heading = card.querySelector('.cardhead h3');
  const summary = details.querySelector('summary');
  const body = details.querySelector('.morebody');
  if (!card || !heading || !summary || !body) return;

  const dlg = document.createElement('dialog');
  dlg.className = 'projdlg';
  dlg.innerHTML =
    '<div class="dlgpanel">' +
      '<header class="dlghead">' +
        '<h3></h3>' +
        '<button class="dlgx" type="button" aria-label="Close">' + X_SVG + '</button>' +
      '</header>' +
      '<div class="dlgbody"></div>' +
    '</div>';
  dlg.querySelector('.dlghead h3').textContent = heading.textContent;
  dlg.querySelector('.dlgbody').append(body);   // moved, not copied
  document.body.append(dlg);

  // <details> becomes a plain button: it opens a dialog now, not a disclosure.
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'morebtn';
  btn.innerHTML = summary.innerHTML;
  details.replaceWith(btn);

  let closing = false;
  const open = () => {
    dlg.showModal();
    document.body.classList.add('dlgopen');
    show(dlg);
  };
  const close = () => {
    if (closing) return;
    closing = true;
    hide(dlg, () => {
      dlg.close();
      document.body.classList.remove('dlgopen');
      closing = false;
      btn.focus({ preventScroll: true });
    });
  };

  btn.addEventListener('click', open);
  dlg.querySelector('.dlgx').addEventListener('click', close);
  // Backdrop click: the panel fills the dialog, so a hit on the dialog is outside it.
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  // Escape: intercept so the close animation runs instead of a hard dismiss.
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
}

document.querySelectorAll('.card > details.more').forEach(lift);


/* ------------------------------------------------------- portrait sizing --- */

/* Keep the portrait square and exactly as tall as the name block. See the
   .pixelwrap note in styles.css for why this cannot be pure CSS. */
const wrap = document.querySelector('.pixelwrap');
const introtext = document.querySelector('.introtext');
if (wrap && introtext) {
  const stacked = matchMedia('(max-width: 760px)');
  const sync = () => {
    if (stacked.matches) { wrap.style.width = wrap.style.height = ''; return; }
    const h = introtext.getBoundingClientRect().height;
    if (h > 10) { wrap.style.width = h + 'px'; wrap.style.height = h + 'px'; }
  };
  new ResizeObserver(sync).observe(introtext);
  stacked.addEventListener('change', sync);
  sync();
}
