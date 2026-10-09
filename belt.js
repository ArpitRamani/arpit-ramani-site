/* ---------------------------------------------------------------------------
   The photo dump's conveyor belt.

   Clones the row of photos once, so the track is two identical copies end to
   end; the CSS slides it from -50% to 0 and loops, and because -50% is
   exactly one copy, the jump back is invisible. The clones are aria-hidden
   so a screen reader hears each photo once. The duration is derived from the
   width of one copy, so the belt moves at the same speed however many photos
   it carries.

   An enhancement: without this file the strip is still there and scrolls
   sideways by hand. No dependency.
   --------------------------------------------------------------------------- */

const SPEED = 40;   /* px per second: slow enough to look at, fast enough to read as moving */

const track = document.querySelector('.track');

if (track) {
  for (const li of [...track.children]) {
    const copy = li.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelector('img').alt = '';
    track.append(copy);
  }

  /* Width is only known once the images have their boxes. The width and
     height attributes give every img its box before it loads, so this is
     right on the first frame, not after the photos arrive. */
  const pace = () => {
    const oneCopy = track.scrollWidth / 2;
    track.style.setProperty('--drift', `${oneCopy / SPEED}s`);
    track.classList.add('moving');
  };
  pace();
  addEventListener('resize', pace);
}
