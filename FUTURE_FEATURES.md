# Future Feature Ideas

A running list of features and improvements to explore for [docility.work](https://docility.work).

---

## Album Pop-outs

- **Streaming platform links** — add icon links inside the flip-card back for each album's presence on other platforms (Spotify, Apple Music, Bandcamp, YouTube Music, Tidal). Could be a small row of pill buttons beneath the SoundCloud player.
- **"Buy / support" button** — direct Bandcamp link per album so visitors can purchase or name-their-price.
- **Track listing** — collapsible tracklist inside the pop-out, similar to the turntable popup's `<details>` tracklist.
- **Release date display** — surface the full date (not just year) and label/distributor info.

---

## DJ Mixes Section

- **Mixcloud embed section** — a new `#mixes` section between Albums and Turntable (or after) with a grid of mix cards. Each card opens a popup with the embedded Mixcloud player (Mixcloud's widget API works similarly to SoundCloud's).
- Add `Mixes` to the nav bar alongside Albums and Turntable.
- Support mix metadata: title, duration, tracklist link, date recorded.

---

## Contact Section

- **Contact info / links block** — a minimal section in the footer or as its own `#contact` page section with:
  - Email address (obfuscated to avoid scrapers)
  - Social links (SoundCloud, Mixcloud, Instagram, Bandcamp, etc.)
  - Booking / collab enquiry note if relevant
- Could double as a "Links" hub (linktree-style) for sharing one URL everywhere.

---

## Other Ideas

- **Field recording location map** — an interactive map (Leaflet.js, no API key needed) pinning where field recordings were captured. Clicking a pin surfaces a short clip or description. Ties the music back to real places.
- **Newsletter / mailing list** — a single email input tied to a free tier of Buttondown or Mailchimp. Good for announcing new releases without relying on algorithm-driven platforms.
- **Upcoming releases / events** — a small "Coming soon" strip in the hero or above the footer for teasing WIP albums or live appearances.
- **Waveform visualiser in album pop-out** — replace or augment the SoundCloud player with a WaveSurfer.js waveform so the visual style matches the site's aesthetic more closely.
- **Photo captions in lightbox** — extend gallery photos with short location/mood captions shown in the existing lightbox footer.
- **Dark / light mode toggle** — the site is dark-first, but a subtle toggle in the nav could open it up to light-mode listeners.
- **"Now playing" ambient indicator** — a persistent mini-player bar at the bottom of the viewport that shows the currently playing track title and a pause button, so users can scroll away from the pop-out without losing context.
- **Video / visual section** — a small grid of embedded YouTube/Vimeo videos for live performances, field recording footage, or album visualisers.
