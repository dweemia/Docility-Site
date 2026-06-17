TOOLS / GEAR IMAGES
===================

Drop the images for the Tools section (in index.html) in this folder, using these
exact filenames. Until a file is present, that card shows a labelled placeholder,
so the page never looks broken.

Cut-outs (transparent subject, background removed):

    rode.png         → RØDE NTG2 shotgun mic        (gear--diag)
    zoom.png         → Zoom H5studio recorder        (gear--tall)
    launchkey.webp   → Novation Launchkey Mk4 61      (gear--wide)
    minifreak.png    → Arturia MiniFreak              (gear--wide)
    clippys.png      → Clip-on lavalier mics          (gear--diag)

Screenshot (rectangular, no transparency needed):

    ableton.jpeg     → Ableton Live 12 session

The class in brackets shapes each item's halo to its silhouette (see
.gear--wide / --tall / --diag in styles.css). If you swap an image for a
differently-shaped one, change that class on the matching <figure> in index.html.
To replace an image, keep the same filename (or update the src in index.html).

Where to get the cut-outs
- Manufacturer press / media-kit images often come as transparent PNGs.
- Or take your own photo and remove the background (Photoshop, or remove.bg).
- Your own photos are the safest licensing-wise.

Notes
- Keep them reasonably sized (cut-outs ~1000px on the long edge is plenty). If you
  optimise to WebP, just change the matching src in ../../index.html (.png -> .webp).
- The cut-outs float over a colour halo; transparent backgrounds look best.
- To change the names/notes/order, edit the <figure class="gear"> blocks in index.html.
