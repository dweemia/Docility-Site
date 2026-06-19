THE SCENERY — masonry photo gallery
===================================

The "The scenery" section is an aspect-aware masonry of your photos — the places
behind the music and the source of the album art. Any orientation works
(landscape, portrait, panorama); nothing is cropped. Clicking a photo opens a
full-screen lightbox with prev/next. The list lives in the GALLERY array near the
top of ../../main.js (src / alt / caption).

Adding / updating photos
- Drop full-res originals into _raw/ (gitignored — they never get committed).
- From the repo root, run:  python tools/optimize-photos.py
  -> writes web-ready WebP here (<=1600px long edge, aiming for <300 KB each),
     honouring EXIF rotation, and reading HEIC/JPG/PNG/etc.
  Add  --number  to rename the output 01.webp, 02.webp, ... in order.
- Add/remove matching entries in the GALLERY array to change which photos show.
- A photo that fails to load simply hides its tile (the grid reflows).

Captions & accessibility
- `caption` overlays the photo on hover and shows under it in the lightbox — a
  good place for the location and which track/album it inspired.
- `alt` is the screen-reader description; fill it in for each photo.
- See _raw/_map.txt for which number maps to which original source photo.
