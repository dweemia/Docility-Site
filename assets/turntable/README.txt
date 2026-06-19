ON MY TURNTABLE — built from a Discogs List
===========================================

This grid is data-driven from a Discogs List. You curate the list on Discogs;
a script caches the covers + metadata + YouTube videos into turntable.json, and
the site reads that. Clicking a cover opens a popup with the Discogs details and
an embedded YouTube player — all without calling Discogs at page-load time (so
nothing exposes an API token and the page stays fast).

Update workflow
1. Curate your list on Discogs:  https://www.discogs.com/lists
   (add/remove/reorder releases — order here = order on the site, up to 25).
2. Put the list URL in  tools/turntable-list.txt  (one line).
3. (Recommended) Add a Discogs token for reliable covers + higher rate limit:
   - Generate one at  https://www.discogs.com/settings/developers
   - Save it to  tools/.discogs_token  (gitignored), or set env DISCOGS_TOKEN.
4. From the repo root, run:  python tools/build-turntable.py
   -> writes 01.webp ... NN.webp here + turntable.json
5. Commit assets/turntable/ (the .webp covers + turntable.json).

Notes
- Per-item Discogs "comment" shows as a personal note in the popup — a nice place
  to say why each record is on your mind.
- A release with no videos on Discogs simply hides the player.
- Until turntable.json exists, the whole "On my turntable" section is hidden, so
  the page never shows an empty grid.
- These files are generated — don't hand-edit turntable.json or the .webp covers;
  re-run the script instead.
