# arpit ramani — personal site

Static site. No framework, no build step. One progressive-enhancement
script, `site.js`.

```
index.html   all content
styles.css   one stylesheet
logos/       institution and club marks
art/         book covers and film posters
avatar.jpg   profile photo
resume.pdf   linked from the header
```

## Run it

```bash
python3 -m http.server 8000
```

Or open `index.html` directly.

## Notes for future edits

- **`site.js` is an enhancement, never a requirement.** The project panels ship
  as `<details>` and work as accordions with scripting off. On load the script
  lifts each one into a `<dialog>`, which is what gives Escape-to-close, a focus
  trap and an inert background. Motion One comes from a CDN inside a `try`; if
  it fails the modal still opens, just on the Web Animations API. Closing never
  waits on an animation promise alone, because a throttled tab can leave one
  pending and strand the dialog open.
- **Tabs use no JavaScript.** `corporate` / `fun` are two radio inputs at the top
  of `<body>`, switched by `:checked` in CSS. They must stay as siblings *before*
  `<main>` or every panel selector breaks.
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
- **The favorite callout** is a `.fave` block sitting in space the grid reserves
  above its first row (`.grid { padding-top }`). Its arrow needs an explicit
  `height` — as a flex item an SVG with `height: auto` collapses to zero.
- **The avatar is a CSS `background-image`, not an `<img>`,** so browsers do not
  offer "open image in new tab" on it. That is deterrence, not protection: the
  file is still at `avatar.jpg`.
- Logos are trimmed, squared and exported at 256px for a 32px slot. Georgia Tech
  is an SVG, so it scales on its own; `object-fit: contain` centres it.

## Third-party images

Institution and company marks belong to their owners and appear here to show
where I have studied and worked. Book covers come from Open Library, film posters
and club crests from Wikipedia, and remain the property of their rights holders.

## Deploy

Any static host. GitHub Pages: enable Pages on the root of `main`.
