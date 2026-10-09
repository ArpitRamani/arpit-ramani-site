# arpit ramani's personal site

```
index.html      the door. One paragraph, one link, four icons.
min.css         its stylesheet
greet.js        the greeting, cycling through languages with a scramble

portfolio.html  everything else: experience, projects, awards, education and
                stack, one list at a time behind a row of words. Each row
                opens to its detail. It is what the landing page links to.
work.css        its stylesheet, loaded after min.css (shares its tokens/type)
decode.js       the tabs, and the scramble that resolves text out of noise
logos/          institution marks, set at type size beside each row

me.html         linked as "me" from the landing page's icon row: the writing
                list, then the photo dump, a strip of photos drifting left
                to right on a loop
belt.js         clones the strip once and paces the loop
life/           its photos, WebP, 720px tall, metadata stripped (no GPS)

writing/        one HTML file per post, listed on me.html above the photos;
                _template.html is the blank to copy
                (noindex, robots Disallow, never linked)

styles.css site.js particles.js omics.webp shots/ are now UNREFERENCED —
they belonged to the previous portfolio (cards, dialog, particle name). The
old page is in the git history.
art/ and logos/team-*.png are now UNREFERENCED — they belonged to the books,
films and clubs that the "me" tab carried. Nothing loads them. Delete them
whenever; they are kept only because the deletion is easy to regret and
trivial to redo.

me.jpg          the source photograph. Nothing loads it: it is the master
                that og.jpg and the three icons are generated from, kept so
                they can be regenerated without hunting for the original.
og.jpg          1200x630 link-preview card, referenced by both pages
favicon-32.png favicon-48.png apple-touch-icon.png

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

## Notes: the portfolio page (`portfolio.html`, `work.css`, `decode.js`)

- **It is the landing card, one step further.** Same column, type and
  monochrome; one list on screen at a time, so it reads like the door rather
  than like a CV. The résumé is where the exhaustive version lives.
- **`decode.js` is an enhancement, never a requirement.** The markup is plain
  `<section>`s of native `<details>`. With scripting off they stack under
  their own `<h2>`s and open as accordions. The script builds the tab bar from
  those headings, hides them, and plays the decode.
- **The `js` class lands from an inline script in `<head>`,** not from the
  module, so the stacked no-JS layout never flashes before the tabs appear.
  `experience` carries `class="on"` in the markup for the same reason.
- **The decode is the greeting's scramble, generalised.** It walks every text
  node under an element, so links and spans inside a detail survive. The spread
  is fixed in frames rather than per character: a long detail has to land as
  fast as a two-word row. The element is pinned at its final height while it
  runs, because noise glyphs are not the width of the letters they replace.
- **Marks are greyed at rest and get their colour back on hover or open.** A
  column of mixed brand colours otherwise shouts. Projects without a logo get
  a line glyph (`#g-*` symbols at the top of the body) on the same stroke as
  the landing icons. The marks do **not** glitch — that was tried and cut; the
  scramble stays on text only.
- **`min.css` still styles bare `summary`/`details`** for
  `portfolio-text.html`, so `work.css` scopes its rules under `.sheet` to
  outrank them (marker, `max-content` width, margins).
- **Hover-dim is `@media (hover: hover)` only.** On touch a tap leaves `:hover`
  stuck and the list would stay dimmed.
- **Tabs write `#section` with `replaceState`,** so a tab is linkable without a
  history entry per click, and the URL is left alone on first load.
- **Its `<title>`, `og:url` and canonical point at `/portfolio.html`.** The
  `Person` node keeps the same `@id` as the one on the landing page.

## Notes: the photo dump (`me.html`, `belt.js`, `life/`)

- **It is a separate page on purpose.** The landing page stays a door; the
  only trace there is the word "me" in the icon row (a word, because no glyph
  reads as "photos of my life"). Photos on the landing itself, and a big
  one-at-a-time slideshow, were both tried and cut as too big.
- **The loop is seamless because the track is two identical copies.**
  `belt.js` clones the row (clones are `aria-hidden`, empty alt) and the CSS
  slides the track from `translateX(-50%)` to `0`. Spacing is a `margin-right`
  on every item, not flex `gap`: with gap the track is one gap short of two
  whole copies and the loop hitches by half a gap each lap.
- **Speed is constant, not duration.** `belt.js` sets `--drift` from one
  copy's width at 40px/s, so adding photos lengthens the lap rather than
  speeding the belt up.
- **`.belt` needs `contain: inline-size`.** Otherwise the track's full width
  counts toward the card's intrinsic size, the landing grid widens the card,
  and a phone scrolls sideways.
- **Adding a photo:** convert, check it the right way up *in a browser* (HEIC
  carries orientation as a flag that `sips` keeps and `cwebp` drops, so a file
  can look right in Finder and land sideways), resize to 720px tall, encode
  with `cwebp -metadata none`, and add an `<li>` with its `width`/`height`.
  The caption lives in `title`.
- **The photos are always in full colour,** unlike the greyed logos on the
  portfolio: the colour is the point of them. Hover pauses the belt; reduced
  motion turns it into a strip scrolled by hand.

## Notes: writing (`me.html`, `writing/`)

- **A post is one HTML file, no build step.** Copy `writing/_template.html`
  to `writing/<slug>.html`; the comment at its top lists what to change
  (title, description, og/twitter, canonical, robots back to index), plus the
  row in the writing list on `me.html` and the `<url>` in `sitemap.xml`.
- **Posts use root-absolute paths** (`/min.css`, `/me.html`) because
  they live one folder down.
- **The post column is `.entry`, not `.prose`.** `min.css` already has a
  `.prose` for `portfolio-text.html` that zeroes its margin, which would pin
  the post to the left edge.
- **Writing lives on `me.html`, above the photo dump,** not on its own page
  or in the landing icon row. It shows "nothing here yet." until the first
  row goes in;
  delete that line then. `.posts:empty` hides the list while it is empty.

## Notes: the photograph, the card and the icons

- **`me.jpg` has had its bottom 90px cut off.** The original carried a Gemini
  sparkle watermark at (944,962)-(994,1010) in a 1024x1040 frame. It is cropped
  away rather than painted over, so there is nothing to resurface under a
  different resize; the crop costs sweater, not subject.
- **`og.jpg` is rendered on a canvas in the browser, not composed offline.**
  That is the only way it gets the site's actual Plus Jakarta Sans — the font
  is not installed on the machine, only served to the page. To regenerate it,
  serve the directory with a handler that accepts a POST and writes the body to
  disk, then draw the card in the page and `fetch` it to that endpoint. Rebuild
  it whenever the name, the tagline or the photo changes.
- **The icons are the AR monogram, and the photograph is deliberately not in
  them.** A face crop was tried and reverted. The reason it fails is size, not
  craft: a favicon is drawn at 16-20px, where a face resolves to "a person"
  at best, while two letterforms stay sharp all the way down. The photograph
  earns its place on the 1200x630 card, where there is room for it.
- **`favicon-48.png` exists because Google asks for 48px or a multiple,** and
  is generated by downscaling the 180px monogram. The 32px is kept alongside
  it for browser tabs.
- **Nothing guarantees which image a search engine shows.** `og:image`,
  `twitter:image`, the `Person.image` and a `primaryImageOfPage` node all name
  the card, which is as strong a signal as markup can give. But an actual
  prominent `<img>` in the page outranks all of it, which is why the portfolio
  page's search thumbnail may stay `omics.webp` — that page has a large image
  in it and the landing page does not.

## Third-party images

Institution and company marks in `logos/` belong to their owners.

## Deploy

Vercel, via its GitHub integration: a push to `main` deploys production to
arpitramani.com. Any static host would work; there is no build step.
