ALBUM COVER ARTWORK
===================

These four album covers are already in place, optimised to WebP (≤1000px square)
for fast loading. To update one, just replace the file, keeping the same filename:

    prism.webp         → "Prism"
    reflections.webp   → "Reflections"
    open-sky.webp      → "Open Sky"
    contact.webp       → "Contact EP"

Notes
- They should be square. If you swap in a different format (PNG/JPG), update the
  matching `cover:` line in ../../main.js so the extension agrees.
- Keep them small: a square WebP ≤1000px is plenty for the grid and popup.
- If a file is missing, that tile falls back to a coloured gradient with the album
  title, so the site never looks broken.
