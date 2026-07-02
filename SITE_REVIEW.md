# Site Review — Issues, Improvements & Proposed Features

A full review of the codebase (index.html, main.js, styles.css, tools/) as of July 2026.
Organised as: bugs found → smaller improvements → proposed features & API integrations.

---

## Overall assessment

The site is in genuinely good shape. The architecture is sound: a no-build-step static
page, data-driven sections (albums/mixes as arrays, turntable from cached Discogs JSON),
a shared "now playing" bar that unifies four different players (SoundCloud, Mixcloud,
YouTube, HTML5 audio), and a build script that keeps API tokens out of the client.
Accessibility fundamentals are mostly present (focus trapping, `focus-visible` styles,
`prefers-reduced-motion` guards, aria-labels, keyboard nav on the carousel and lightbox).
The issues below are mostly edge cases and polish, not structural problems.

---

## 1 · Bugs

### 1.1 `fieldVolume` ReferenceError from the now-playing volume slider — `main.js:931`

```js
else if (npSource === "field" && npFieldAudio)  { npFieldAudio.volume = frac; fieldVolume = frac; }
```

`fieldVolume` is declared with `let` **inside** `renderFieldMap()` (`main.js:1177`), so it
is not in scope in `setupNowPlaying()`. The file runs under `"use strict"`, so this
assignment throws a `ReferenceError` on every drag of the bar's volume slider while a
field recording is playing. The audio volume still changes (that statement runs first),
but the map's own volume slider silently falls out of sync and the console fills with
errors.

**Fix:** hoist `fieldVolume` to the IIFE top level next to `npFieldAudio`, or route all
field-volume changes through one setter.

### 1.2 A mix popup can never be fully closed — `main.js:565-585`

The album popup checks `isPaused()` on close and only docks if audio is actually playing.
The mix popup docks **unconditionally**: close button, backdrop click, and Escape all call
`dockMix()`. Opening a mix and closing it without ever pressing play still summons the
now-playing bar (in "playing" visual state, since `showNpBar` removes `is-paused`), and
the only way to make it go away is the bar's stop button.

**Fix:** mirror the album logic — ask `mxWidget.getIsPaused()` (or track a played flag)
and fully close when nothing is playing.

### 1.3 "Mixes" section is missing from the nav — `index.html:63-70`

The nav links About / Albums / Turntable / Gallery / Map / Tools, but the `#mixes`
section (which exists and renders three cards) has no nav entry. `FUTURE_FEATURES.md`
lists this as part of the mixes work; it was never added.

### 1.4 Duplicate SoundCloud widget bindings on repeated docking — `main.js:854-866`

Every time the album popup is closed-while-playing, `closePopup()` calls
`currentWidget.bind(...)` for `PLAY_PROGRESS`, `PAUSE`, `PLAY` and `FINISH`. The SC
Widget API accumulates listeners, so dock → expand → dock again stacks a second set of
handlers, a third, etc. Harmless functionally (the handlers are idempotent) but it's a
slow leak and extra per-frame work on `PLAY_PROGRESS`.

**Fix:** bind once when the widget is created in `openPopup()`, or `unbind` before
re-binding.

### 1.5 Volume desync between popup slider and bar slider

The album popup slider (`popupVol`) defaults to 80; the bar slider (`npVol`) defaults
to 70. Docking hands the same widget to the bar without syncing either slider, so the
displayed volume no longer matches the actual widget volume (and vice versa on expand).
The field-recording path already solves this (`main.js:1238-1239` copies `fieldVolume`
into `npVol`) — the SC path should do the same.

### 1.6 Now-playing progressbar never updates its ARIA value — `index.html:417`

`role="progressbar"` is declared with `aria-valuenow="0"`, but every code path only
transforms `#npFill` visually. Screen-reader users get a permanently-0 progress bar.
Either update `aria-valuenow` alongside the transform or drop the role.

### 1.7 Empty-string image `src` — `main.js:453, 973`

`cover.src = item.art || ""` and `artEl.src = art || ""` — setting `src=""` makes some
browsers issue a request for the current page URL. Prefer `removeAttribute("src")` when
there is no art.

### 1.8 Typos in gallery data — `main.js:121, 141`

"Iceland, 2014" is missing its full stop (entry 04) while every other caption has one,
and entry 24 has a doubled full stop ("2026.."). Also "Dambula" (`main.js:157`) is
usually romanised "Dambulla".

---

## 2 · Smaller improvements

### Accessibility
- **Lightbox / popups on touch:** the lightbox has arrow keys and buttons but no swipe
  gestures — a small `pointerdown/pointerup` delta check would cover it.
- **Carousel announcement:** `#ttGrid` is `aria-live="polite"` but cards toggle
  `aria-hidden` only; consider announcing "X of Y — Title by Artist" via a visually
  hidden status element instead (live-region + aria-hidden churn is noisy in some SRs).
- **`trapFocus`** queries all focusable elements including invisible ones (e.g. hidden
  stream links); filter on `offsetParent`/`checkVisibility()` to avoid focus getting
  trapped on hidden nodes.

### Performance
- **Lazy-init Leaflet:** `leaflet.js` + CSS load from unpkg on every visit even though
  the map is several screens below the fold. An `IntersectionObserver` that injects the
  script when `#fmap` approaches the viewport removes ~150 KB from initial load. Same
  idea applies to the SoundCloud widget API (`index.html:429`) — it's only needed once
  a popup opens.
- **CDN resilience:** unpkg has had outages; consider self-hosting Leaflet (it's just
  two files, and the site already self-hosts fonts) or at least switching to jsdelivr.
- **CLS in the gallery:** injected `<img>`s have no `width`/`height` (or
  `aspect-ratio`), so the masonry reflows as photos arrive. The optimize script could
  emit dimensions into a small manifest the same way turntable.json works.
- **`decoding="async"`** on gallery/turntable images is a free win.

### SEO / meta / hosting
- **No structured data.** JSON-LD `MusicGroup` + `MusicAlbum` (with `byArtist`, `image`,
  `url` to SoundCloud) would let search engines show rich release results. Low effort,
  static markup.
- **No `<link rel="canonical">`**, no `sitemap.xml`, no `robots.txt`.
- **No `404.html`** — GitHub Pages shows its default page for bad URLs; a tiny branded
  404 that links home would match the site's polish.
- **No web app manifest / icons** for install-to-home-screen (see PWA proposal below).

### Code organisation
- `main.js` is ~1,340 lines and growing with each feature. It's still manageable, but
  splitting into ES modules (`data.js`, `players.js`, `map.js`, `ui.js`) with
  `<script type="module">` keeps the no-build-step property while restoring
  navigability. Modules are also strict-mode by default and would have caught bug 1.1.
- The four "dock/expand/stop" code paths (sc/mix/field/yt) repeat the same shape with
  different globals. A small player-adapter interface (`{play, pause, setVolume, stop,
  expand}` per source) would collapse `setupNowPlaying`/`stopNowPlaying` switch chains
  and make the next embed type (e.g. Bandcamp) a 20-line addition.

---

## 3 · Proposed features & API integrations

Ordered roughly by value-for-effort, and biased toward things that preserve the site's
"static page, no runtime keys" ethos — following the pattern `build-turntable.py`
established: call APIs at build time, cache JSON, keep page-load fast.

### 3.1 Streaming links + tracklists for your own releases (build-time SoundCloud + Odesli)
`build-turntable.py` already resolves Spotify/Apple Music/YouTube Music/Tidal links via
Spotify Search → Odesli for other people's records. A sibling `build-releases.py` could
do the same for **your** albums, plus pull tracklists and durations from the SoundCloud
API/oEmbed, writing `assets/releases.json`. That unlocks three FUTURE_FEATURES items at
once: platform pill-buttons in the album flip-card, collapsible tracklists, and full
release dates — and feeds the JSON-LD structured data from §2.

### 3.2 Mixcloud API for the mixes section
`https://api.mixcloud.com/dweejay/cloudcasts/` is public, no key. Either fetch at build
time into `assets/mixes.json` (consistent with turntable) or lazily at runtime. Gets you
artwork, duration, tags, and play counts, and new mixes appear without editing
`main.js`.

### 3.3 Auto-refresh turntable via GitHub Actions
A weekly cron workflow that runs `tools/build-turntable.py` with `DISCOGS_TOKEN` /
Spotify creds as repo secrets and commits changed JSON/covers. The turntable then tracks
your Discogs list with zero manual steps. (Also the natural home for a future
`build-releases.py` and sitemap generation.)

### 3.4 Ambient layer mixer (Web Audio API, no external service)
The most on-brand feature available: let visitors **layer** field recordings — rain in
Kamikochi under Shinjuku street noise with independent volume sliders — using one
`AudioContext` with a `GainNode` per layer. The recordings are already on the site and
same-origin, so no CORS issues. This turns the map from a showcase into an instrument,
which is exactly the project's pitch.

### 3.5 Real audio visualisation
The hero equaliser bars and rain canvas are decorative. For field recordings (same-origin
`<audio>`), a Web Audio `AnalyserNode` can drive the bars/rain intensity from the
actual signal. (SoundCloud/YouTube iframes can't be analysed cross-origin, so this is a
field-recordings-only enhancement — which is fine; they're the signature content.)

### 3.6 Cross-link gallery ↔ map ↔ music
The gallery captions and map pins share locations (Iceland, Kamikochi, Tokyo, Yakushima,
Daydream Island…). Add a `location` key to `GALLERY` entries and: pin popups gain a
"see photos" strip; the lightbox gains a "hear this place" button that starts the
recording. The content already exists — this is pure connective tissue, and it's the
kind of depth that makes people stay on a site.

### 3.7 Contact / links section (still open from FUTURE_FEATURES.md)
The nav's outbound story is thin: one SoundCloud button in the hero. A small `#contact`
footer block with obfuscated email + SoundCloud/Mixcloud/Discogs/Instagram links doubles
as a linktree replacement.

### 3.8 Newsletter (Buttondown)
Buttondown's free tier supports a plain HTML `<form action="https://buttondown.com/api/emails/embed-subscribe/...">`
— no JS, no key exposure, fits the static site. Best release-announcement channel that
doesn't depend on platform algorithms.

### 3.9 "Recently listening" via ListenBrainz or Last.fm
If you scrobble, the ListenBrainz API (open, no key for reads) or Last.fm API can power
a small live "recently spinning" strip complementing the hand-curated turntable. Fetch
client-side (both allow CORS) or cache via the Actions cron. Only worth it if you
actually scrobble consistently — otherwise skip.

### 3.10 Weather-reactive backdrop (Open-Meteo, no key)
Open-Meteo's free API needs no key and allows CORS: fetch current weather for one
featured location (or the visitor's approximate location) and modulate the rain canvas
density / aurora palette to match. Map pins could note "it's raining in Kamikochi right
now". Small, poetic, very Docility.

### 3.11 PWA / offline shell
A manifest + minimal service worker (cache-first for CSS/JS/fonts/covers, network for
JSON) makes the site installable and instant on repeat visits. Field recordings could be
cached on demand ("save this place offline"). Pairs well with §3.4.

### 3.12 RSS / JSON Feed for releases and mixes
Generate `feed.xml` at build time from the releases data. Feed readers still matter in
the ambient-music niche, and it's ~40 lines of the Actions workflow from §3.3.

### Privacy-friendly analytics (if curiosity strikes)
GoatCounter (free, no cookies, one `<script>`) or Plausible answer "does anyone use the
map?" without a consent banner. Optional — but it would tell you which of the above to
build next.

---

## Suggested sequencing

1. **Fix the bugs** (§1) — an afternoon, mostly one-liners; 1.1 and 1.2 are user-visible.
2. **§3.1 + §3.7 + SEO items** — completes most of FUTURE_FEATURES.md's open list and
   the structured-data win rides along.
3. **§3.3 Actions cron** — infrastructure that makes everything after it cheaper.
4. **§3.6 cross-linking, then §3.4 ambient mixer** — the two features most likely to
   make the site memorable.
