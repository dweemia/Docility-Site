#!/usr/bin/env python3
"""
build-turntable.py — turn a Discogs List into the "On my turntable" grid data.

You curate a Discogs List (https://www.discogs.com/lists). This script reads it,
pulls each release's metadata + cover + YouTube videos from the Discogs API,
caches a square thumbnail per album, and writes assets/turntable/turntable.json.
The site's grid and popup run entirely off that cached file — no Discogs calls at
page-load time, so nothing exposes your token and visitors get a fast static page.

Run it whenever you change your Discogs List:
    python tools/build-turntable.py
    python tools/build-turntable.py --list https://www.discogs.com/lists/123456
    python tools/build-turntable.py --limit 25

Setup (one-time)
- Your list URL is read from tools/turntable-list.txt (or pass --list).
- A Discogs personal access token is strongly recommended (reliable cover images
  + higher rate limit). Generate one at https://www.discogs.com/settings/developers
  then EITHER set the env var:   DISCOGS_TOKEN=xxxxx
  OR save it to:                 tools/.discogs_token   (gitignored)
  The script still runs without a token, but covers may be unavailable.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "assets" / "turntable"
LIST_FILE = REPO / "tools" / "turntable-list.txt"
TOKEN_FILE = REPO / "tools" / ".discogs_token"
USER_AGENT = "DocilitySite/1.0 +https://docility.work"
API = "https://api.discogs.com"
THUMB_PX = 600  # square thumbnail size (grid shows ~300px; 600 covers retina)


def load_token() -> str | None:
    tok = os.environ.get("DISCOGS_TOKEN")
    if tok:
        return tok.strip()
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text(encoding="utf-8").strip() or None
    return None


def list_id_from(value: str) -> str:
    m = re.search(r"/lists?/(\d+)", value) or re.search(r"\b(\d+)\b", value)
    if not m:
        sys.exit(f"! Couldn't find a list id in: {value}")
    return m.group(1)


class Discogs:
    def __init__(self, token: str | None):
        self.token = token
        self.headers = {"User-Agent": USER_AGENT}
        if token:
            self.headers["Authorization"] = f"Discogs token={token}"

    def _get(self, url: str) -> bytes:
        for attempt in range(5):
            req = urllib.request.Request(url, headers=self.headers)
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    # Be polite: Discogs allows ~60/min (auth) or 25/min (anon).
                    remaining = r.headers.get("X-Discogs-Ratelimit-Remaining")
                    if remaining is not None and int(remaining) <= 1:
                        time.sleep(2)
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code == 429:  # rate limited — back off and retry
                    time.sleep(3 * (attempt + 1))
                    continue
                raise
        raise RuntimeError(f"giving up after retries: {url}")

    def json(self, url: str) -> dict:
        data = json.loads(self._get(url))
        time.sleep(1.0 if not self.token else 0.4)  # gentle pacing
        return data

    def image(self, url: str) -> bytes | None:
        try:
            return self._get(url)
        except Exception as e:  # noqa: BLE001 — covers are best-effort
            print(f"    (cover fetch failed: {e})")
            return None


def yt_id(uri: str) -> str | None:
    m = re.search(r"(?:v=|youtu\.be/|/embed/)([\w-]{11})", uri or "")
    return m.group(1) if m else None


def best_image_url(release: dict) -> str | None:
    imgs = release.get("images") or []
    primary = next((i for i in imgs if i.get("type") == "primary"), None)
    img = primary or (imgs[0] if imgs else None)
    if img:
        return img.get("uri") or img.get("resource_url")
    return release.get("thumb") or None


def square_thumb(data: bytes) -> bytes:
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im = ImageOps.fit(im, (THUMB_PX, THUMB_PX), Image.LANCZOS, centering=(0.5, 0.5))
    buf = io.BytesIO()
    im.save(buf, "webp", quality=82, method=6)
    return buf.getvalue()


def main() -> int:
    # Windows consoles default to cp1252; album/track titles are full Unicode.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass

    ap = argparse.ArgumentParser(description="Build the turntable grid from a Discogs List.")
    ap.add_argument("--list", help="Discogs list URL or id (default: tools/turntable-list.txt)")
    ap.add_argument("--limit", type=int, default=25, help="max items to include (default: 25)")
    args = ap.parse_args()

    raw_list = args.list
    if not raw_list and LIST_FILE.exists():
        # first non-blank, non-comment line of tools/turntable-list.txt
        for line in LIST_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                raw_list = line
                break
    if not raw_list:
        sys.exit(f"! No list given. Put your Discogs list URL in {LIST_FILE} or pass --list.")
    lid = list_id_from(raw_list)

    token = load_token()
    print(f"Discogs list {lid}  |  token: {'yes' if token else 'NO (covers may be missing)'}")
    dg = Discogs(token)

    lst = dg.json(f"{API}/lists/{lid}")
    items = [it for it in lst.get("items", []) if it.get("type") in ("release", "master")]
    items = items[: args.limit]
    if not items:
        sys.exit("! List has no release/master items.")
    print(f'List "{lst.get("name")}" — {len(items)} item(s)\n')

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    entries = []
    for i, it in enumerate(items, 1):
        rel = dg.json(it["resource_url"])  # release or master detail
        artist = ", ".join(a.get("name", "").strip() for a in rel.get("artists", [])) or "Unknown"
        artist = re.sub(r"\s*\(\d+\)$", "", artist)  # drop Discogs "(2)" disambiguation
        title = rel.get("title", it.get("display_title", "Untitled"))
        videos = []
        for v in rel.get("videos", []) or []:
            vid = yt_id(v.get("uri", ""))
            if vid:
                videos.append({"id": vid, "title": v.get("title", ""), "duration": v.get("duration", 0)})
        fmt = ""
        if rel.get("formats"):
            f0 = rel["formats"][0]
            fmt = ", ".join([f0.get("name", "")] + (f0.get("descriptions") or [])).strip(", ")

        art_rel = ""
        url = best_image_url(rel)
        if url:
            data = dg.image(url)
            if data:
                name = f"{i:02d}.webp"
                (OUT_DIR / name).write_bytes(square_thumb(data))
                art_rel = f"assets/turntable/{name}"

        entries.append({
            "title": title,
            "artist": artist,
            "year": rel.get("year") or None,
            "format": fmt,
            "genres": (rel.get("genres") or []) + (rel.get("styles") or []),
            "art": art_rel,
            "discogsUrl": it.get("uri") or rel.get("uri"),
            "comment": (it.get("comment") or "").strip(),
            "tracklist": [
                {"position": t.get("position", ""), "title": t.get("title", ""), "duration": t.get("duration", "")}
                for t in (rel.get("tracklist") or []) if t.get("type_") in (None, "track")
            ],
            "videos": videos,
        })
        print(f"  {i:02d}. {artist} — {title}  ({len(videos)} video(s){'' if art_rel else ', no cover'})")

    out = OUT_DIR / "turntable.json"
    out.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {out.relative_to(REPO)} with {len(entries)} albums.")
    print("Review, then commit assets/turntable/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
