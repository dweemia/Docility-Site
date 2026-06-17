# Docility

A single-page site for the ambient project **Docility**, with each album embedded
from SoundCloud and a colourful, motion-led design.

Built with plain **HTML, CSS and JavaScript** — no build step, no dependencies,
no framework. It runs in any modern browser on desktop, tablet and mobile, and
animations automatically calm down when a visitor has “reduce motion” enabled.

## Run it locally

Open `index.html` directly, or (recommended, so the SoundCloud players and font
load cleanly) serve the folder over HTTP:

```bash
python -m http.server 8000   # then open http://localhost:8000
```

## Edit the albums

All album content lives in the `ALBUMS` array at the top of **`main.js`**:

```js
{
  title:  "Open Sky",
  year:   "2015–2020",                  // shown under the title in the popup
  accent: "sky",                         // aqua | sky | violet | coral | gold | green (or any CSS colour)
  blurb:  "My first album: a collection of ambient tracks…",
  cover:  "assets/covers/open-sky.webp", // square image
  url:    "https://soundcloud.com/docility-m/sets/open-sky",
}
```

- **`url`** — open the album on SoundCloud and copy the page address
  (`https://soundcloud.com/docility-m/sets/<name>`).
- **`cover`** — drop a square image in `assets/covers/` and point `cover` at it.
  Covers ship as optimised **WebP** (export a square PNG/JPG, then save as WebP
  ≤ ~1000 px). If the file is missing, the tile falls back to a coloured gradient
  with the album title, so nothing ever looks broken.

Add or remove entries freely — the grid and players are generated from the array.

## Customise

| What | Where |
|------|-------|
| Colour palette | `:root` at the top of `styles.css` (`--aqua`, `--sky`, …) |
| Typography | `--font` in `:root`; font files in `assets/fonts/` |
| Bio / copy | the “About” and hero sections of `index.html` |
| Artist photo | `assets/docility.webp` (transparent cutout, shown in About) |

The site is set in **VIC** (Brand Victoria), self-hosted from `assets/fonts/`.
That typeface is licensed for authorised Victorian Government use; swap `--font`
and the `@font-face` block if you need a different licence.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Markup and content |
| `styles.css` | Design tokens, layout, animations |
| `main.js` | Album data, SoundCloud embeds, scroll/nav/rain effects |
| `assets/covers/` | Album cover images |
| `assets/fonts/` | Self-hosted VIC webfont |
| `assets/docility.webp` | Artist portrait |
| `assets/og-cover.jpg` | Social-share preview image (1200×630) |
| `assets/favicon.svg` | Site icon |
