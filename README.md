# arpit ramani — personal site

Static site. No framework, no build step. Two pages that are deliberately
nothing like each other.

```
index.html      the door. One paragraph, one link, four icons.
min.css         its stylesheet
greet.js        the greeting, cycling through languages with a scramble

portfolio.html  everything else: the particle name, the project cards, the
                experience and awards rows. This is the site that used to be
                at /, and it is what the landing page sends people to.
styles.css      its stylesheet
site.js         progressive enhancement: details -> dialog
particles.js    the <h1> as a particle simulation
logos/ shots/   institution marks and project screenshots

art/ and logos/team-*.png are now UNREFERENCED — they belonged to the books,
films and clubs that the "me" tab carried. Nothing loads them. Delete them
whenever; they are kept only because the deletion is easy to regret and
trivial to redo.

resume.pdf      linked from both pages
portfolio-text.html  an unlinked text-only draft of the portfolio, kept only
                so it is easy to go back to. Uses min.css. noindex + robots
                Disallow.
```

The split is the whole idea: the landing page is quiet so that opening the
portfolio lands. Do not let the two converge — if the door grows a project
list, it stops being a door.

## Run it

```bash
python3 -m http.server 8000
```

## Notes: the landing page (`index.html`, `min.css`, `greet.js`)

- **`greet.js` has no dependency and needs none.** The whole effect is one
  `requestAnimationFrame` loop over a string; any library that does this is
  larger than the loop. Each character gets its own start and end frame so the
  word resolves left to right with a ragged edge instead of all at once, and the
  noise alphabet is punctuation on purpose — scrambling with lowercase latin
  just reads as a typo.
- **The `<h1>` holds two copies of the greeting.** A static `hi` in `.sr-only`
  for assistive tech and search, and the animated one, which is `aria-hidden`
  so a screen reader is not handed a new word every two seconds. The animated
  span also keeps a real `hi` in the markup, so with scripting off, or before
  the module arrives, the page is correct and nothing shifts when it starts.
- **`.glitch` needs `min-height`, not `height`.** Devanagari and Japanese are
  taller than latin; without it the paragraph steps up and down as the greeting
  cycles. The width changes freely — the block is left-aligned, so that costs
  nothing.
- **`dir` is set per word.** Without it the Arabic-script greeting drags the
  surrounding punctuation around with it.
- **The chromatic split is two text-shadows at ~0.25 alpha, only while a word is
  resolving.** One pixel of offset on two channels is what makes it read as
  interference rather than as a blur. Between transitions the page is
  monochrome, and `prefers-reduced-motion` turns off both the shadow and the
  cycle entirely.
- **The loop stops on `visibilitychange`.** A background tab should not burn
  frames, and returning to a half-scrambled word looks broken, so it resets to
  `hi` on the way back.

- **The Georgia Tech monogram is set in the sentence at type size,** replacing
  the word "gt" outright: it is legible enough alone that spelling it out too
  would be redundant. It is the `logos/gatech.svg` already in the repo, sized
  in `em` so it tracks the paragraph and nudged with `vertical-align` by eye,
  because the optical centre of a logo is never where the font's baseline puts
  it.
- **Finaldose is the wordmark lockup, never the bare mark.** The mark on its
  own is a halftone — dots at roughly an 11.6px pitch in a 256px image — so at
  17px tall the pitch is 0.77px, finer than a device pixel, and it aliases into
  an orange smudge. That is a property of the mark, not of the file: no asset
  fixes it. The lockup (`logos/finaldose-wordmark.webp`) works because the
  circle sits beside legible type and reads as part of a logo rather than as an
  unexplained dot. The bare mark is fine in the 32px slot on the portfolio
  page, which is about its floor; `logos/finaldose.png` is still there for it.
- **The lockup is 500x95 lossless WebP, ~18 KB.** It renders at 119 CSS px, so
  500 covers a 4x display with room over. Lossless on purpose: lossy WebP puts
  ringing into a flat halftone. Source is Finaldose's own dark-background PNG
  at 1672x317; it has real transparency, so nothing had to be trimmed.
- **The GT file is two stacked paths, navy behind gold.** On this background
  the navy disappears and the gold face is left, which is Georgia Tech's own
  treatment of the mark on dark. Nothing to fix — but it is why the logo looks
  different here than on a white page.
- **A logo does not get an underline.** `.blurb a.marklink` turns it off, since
  a rule drawn under a glyph like the monogram reads as a mistake; hover lifts
  the brightness instead. The Finaldose *text* keeps its underline, which is
  why that mark sits outside the anchor.
- **Monochrome otherwise.** Everything highlighted — row titles, links, the
  name in the blurb — is `--head` off-white; everything else is grey. An earlier
  version tinted every proper noun with its own brand colour (Georgia Tech gold,
  Emory blue, Google's four colours on "cloud run", club colours on the teams).
  It worked, and it was too busy for the page. It is one commit back in the
  history if it is ever wanted; `--accent` is the single variable to change to
  bring a colour back.
- **Colour cannot say "this is a link" any more, so underlines do.** Links in
  running text (`.blurb`, `.facts`) carry a hairline underline at `#3b3b3e`
  that goes white on hover. Row titles get theirs on hover only: twenty
  underlined names in a list is a mess, and there the pointer already asks. The
  `.cta` underline is a notch brighter (`#46464a`) than the one in running text,
  since it is carrying the one thing the page is asking anyone to do.
- **The portfolio link is labelled; everything else is an icon.** An icon can
  only hint, and "portfolio" has no glyph people read the same way — a four-pane
  grid was tried and read as "dashboard". So `.cta` is a text link: the largest
  interactive thing on the page, off-white against grey, on its own line above
  the icon row, with an arrow that leans right on hover. GitHub, LinkedIn,
  resume and email stay as marks, because those four are recognisable without a
  label. Each `<a>` is a 2.4rem box around a 21px glyph, a comfortable tap
  target that keeps the row from wrapping. The names live in `aria-label` and
  `title` — the row still reads to a screen reader and on hover. The negative margin that optically
  aligns the first glyph with the text sits on `.foot a:first-child`, not on
  `.foot`, so the rule above the footer stays flush with every other section
  rule.
- **Stroke icons vs solid icons.** The envelope, document and grid are stroked
  (`fill: none; stroke: currentColor`); the GitHub and LinkedIn marks are solid
  and carry `class="solid"` to flip that. Same convention as the old site.
The next few apply to `min.css`, so they cover `portfolio-text.html` too.

- **Rows are `flex` with `flex-wrap`.** The year (`.when`) or the tech list
  (`.tech`) is pushed right with `margin-left: auto` and drops onto its own line
  below 34rem. They are two classes because `.when` wants `nowrap` and tabular
  figures and `.tech` must be allowed to wrap.
- **Detail panels are native `<details>`.** The default triangle is removed and
  replaced with a `+` / `−` in `summary::before`, because the triangle was the
  only thing on the page with a platform look.
- **`min-height` on the landing page is `100svh` after `100vh`.** Mobile browser
  chrome sliding in and out otherwise shifts the centred block.
- **`classic.html` is frozen.** It is not linked from anywhere and is excluded in
  `robots.txt` and by a `noindex` meta. Its own notes are in the git history of
  this file (`git log -p README.md`).

## Notes: the portfolio page (`portfolio.html`, `styles.css`)

- **`site.js` is an enhancement, never a requirement.** The project panels ship
  as `<details>` and work as accordions with scripting off. On load the script
  lifts each one into a `<dialog>`, which is what gives Escape-to-close, a focus
  trap and an inert background. Motion One comes from a CDN inside a `try`; if
  it fails the modal still opens, just on the Web Animations API. Closing never
  waits on an animation promise alone, because a throttled tab can leave one
  pending and strand the dialog open.
- **`particles.js` reads its type off the `<h1>`.** Font, weight, size and
  letter-spacing all come from the real heading, so the canvas cannot move the
  header. The heading keeps its text for selection, search and screen readers
  and only goes `color: transparent` once particles are actually on screen.
  Watch out: `getComputedStyle` is live, so the ink has to be read *before*
  that class lands or the particles paint in `transparent`.
- **Project panels are native `<details>`.** Same reason as the tabs: no script.
  An open card takes the whole grid row and turns two-column (preview left,
  title and blurb right), with the panel itself spanning both columns. That
  layout rides on `:has()`; without it the card stays in its column and the
  panel just opens narrow.
- **The demo iframe must keep `loading="lazy"`.** Inside a closed `<details>`
  the element has no box, so nothing is fetched from YouTube until someone
  opens the card. Drop the attribute and every visitor pays for the embed on
  first paint. Host is `youtube-nocookie.com` for the same reason.
- **`.demonote` is scoped `.card .demonote`** so it outranks `.card p`, which
  otherwise sets its size, color and a zero bottom margin.
- **Color is monochrome on purpose.** Earlier drafts tried amber, aqua and orange
  accents; all of them fought the film posters and institution logos, which bring
  their own color. The one exception is the gold "my current favorite!" callout.
- **There are no tabs, and the header has to close itself.** The page used to
  be two radio-driven panels, `corporate` and `fun`. "fun" stopped fitting once
  this became the portfolio rather than the whole site, and one tab is not a
  tab, so both went — along with the radios, `.tabs`, `.panels`, `.panel`, and
  the books/films/clubs markup and CSS. The tab bar was quietly doing two jobs
  besides switching: it held the gap above the content and drew the 1px rule
  under the header. `header` now carries both as its own `padding-bottom`,
  `margin-bottom` and `border-bottom`. Take the border off and the name block
  runs straight into "Experience".
- **The header is otherwise deliberately tight.** `main`'s top padding, the
  stacked `.intro` gap and `.backhome`'s bottom margin were all pulled in when
  the icon row left the header. They are tuned against each other; change one
  and the block goes lopsided.
- **The icon row is in the footer, not the header.** It used to sit under the
  name, competing with the header art for the first thing you look at; you now
  meet it once you have read the page and are deciding what to do about it.
  `.sitefoot` sits *outside* `.panels` on purpose, so it shows under both the
  corporate and the fun tab rather than only the one it was nested in. It
  carries email, resume, GitHub and LinkedIn — Instagram came out, as the one
  link there that is not about the work.
- **The avatar is a CSS `background-image`, not an `<img>`,** so browsers do not
  offer "open image in new tab" on it. That is deterrence, not protection: the
  file is still at `avatar.jpg`.
- Logos are trimmed, squared and exported at 256px for a 32px slot. Georgia Tech
  is an SVG, so it scales on its own; `object-fit: contain` centres it.
- **The back link (`.backhome`) is the only thing added to this page** when
  it stopped being the site root. It matches `min.css`'s `.back` by eye,
  because the two pages share no stylesheet.
- **Its `<title>`, `og:url` and canonical point at `/portfolio.html`,** not
  at `/`. The `WebSite` JSON-LD node moved off it for the same reason; the
  `Person` node stays, with the same `@id` as the one on the landing page.

## Third-party images

`portfolio.html` only. Institution and company marks belong to their owners. Book
covers come from Open Library, film posters and club crests from Wikipedia.

## Deploy

Any static host. GitHub Pages: enable Pages on the root of `main`.
