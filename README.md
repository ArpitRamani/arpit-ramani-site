# arpit ramani — personal site

Static site. No framework, no build step, no JavaScript.

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

- **Tabs use no JavaScript.** `corporate` / `fun` are two radio inputs at the top
  of `<body>`, switched by `:checked` in CSS. They must stay as siblings *before*
  `<main>` or every panel selector breaks.
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
