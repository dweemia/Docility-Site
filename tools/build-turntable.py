#!/usr/bin/env python3
"""
build-turntable.py — turn a Discogs List into the "On my turntable" grid data.

You curate a Discogs List (https://www.discogs.com/lists). This script reads it,
pulls each release's metadata + cover + YouTube videos from the Discogs API,
caches a square thumbnail per album, and writes assets/turntable/turntable.json.
The site's grid and popup run entirely off that cached file — no Discogs calls at
page-load time, so nothing exposes your token and visitors get a fast static page.

Streaming links are resolved via Spotify Search → Odesli/song.link, giving reliable
Spotify, Apple Music, YouTube Music, and Tidal URLs per album.

Run it whenever you change your Discogs List:
    python tools/build-turntable.py
    python tools/build-turntable.py --list https://www.discogs.com/lists/123456
    python tools/build-turntable.py --limit 25

Setup (one-time)
- Your list URL is read from tools/turntable-list.txt (or pass --list).
- API credentials go in tools/.discogs_token (gitignored). See that file for details.
  You can also set DISCOGS_TOKEN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET as env vars.
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "assets" / "turntable"
LIST_FILE = REPO / "tools" / "turntable-list.txt"
CREDS_FILE = REPO / "tools" / ".discogs_token"
USER_AGENT = "DocilitySite/1.0 +https://docility.work"
API = "https://api.discogs.com"
THUMB_PX = 600  # square thumbnail size (grid shows ~300px; 600 covers retina)


def load_credentials() -> dict:
    """Return a dict of API credentials from the creds file and/or environment."""
    creds: dict[str, str] = {}
    # Environment variables take priority
    for key in ("DISCOGS_TOKEN", "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"):
        val = os.environ.get(key, "").strip()
        if val:
            creds[key] = val
    if CREDS_FILE.exists():
        for line in CREDS_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip()
                if k and v and k not in creds:  # env vars already set above take priority
                    creds[k] = v
            elif "DISCOGS_TOKEN" not in creds:
                # Legacy: single bare token line
                creds["DISCOGS_TOKEN"] = line
    return creds


def fetch_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except Exception:
        return {}


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
                    remaining = r.headers.get("X-Discogs-Ratelimit-Remaining")
                    if remaining is not None and int(remaining) <= 1:
                        time.sleep(2)
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    time.sleep(3 * (attempt + 1))
                    continue
                raise
        raise RuntimeError(f"giving up after retries: {url}")

    def json(self, url: str) -> dict:
        data = json.loads(self._get(url))
        time.sleep(1.0 if not self.token else 0.4)
        return data

    def image(self, url: str) -> bytes | None:
        try:
            return self._get(url)
        except Exception as e:
            print(f"    (cover fetch failed: {e})")
            return None


class SpotifyAuth:
    """Client Credentials flow — no user login required, covers search."""
    TOKEN_URL = "https://accounts.spotify.com/api/token"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self._token: str | None = None
        self._expires: float = 0

    def _access_token(self) -> str:
        if self._token and time.time() < self._expires - 60:
            return self._token
        creds_b64 = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        req = urllib.request.Request(
            self.TOKEN_URL,
            data=b"grant_type=client_credentials",
            headers={
                "Authorization": f"Basic {creds_b64}",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        self._token = data["access_token"]
        self._expires = time.time() + data.get("expires_in", 3600)
        return self._token

    def album_url(self, artist: str, title: str) -> str | None:
        """Return the Spotify album URL for the best match, or None."""
        q = urllib.parse.quote(f'album:"{title}" artist:"{artist}"')
        url = f"https://api.spotify.com/v1/search?q={q}&type=album&limit=5&market=US"
        data = fetch_json(url, headers={"Authorization": f"Bearer {self._access_token()}"})
        items = (data.get("albums") or {}).get("items") or []
        if items:
            return (items[0].get("external_urls") or {}).get("spotify")
        return None


def streaming_links_for(artist: str, title: str, spotify: SpotifyAuth | None) -> dict:
    """Resolve Spotify/Apple Music/YouTube Music/Tidal URLs via Spotify → Odesli."""
    links: dict = {}
    source_url: str | None = None

    if spotify:
        try:
            source_url = spotify.album_url(artist, title)
        except Exception as e:
            print(f"    (Spotify lookup failed: {e})")

    if not source_url:
        return links

    encoded = urllib.parse.quote(source_url, safe="")
    odesli = fetch_json(f"https://api.song.link/v1-alpha.1/links?url={encoded}")
    by_platform = odesli.get("linksByPlatform") or {}
    for key in ("spotify", "appleMusic", "youtubeMusic", "tidal"):
        entry = by_platform.get(key)
        if entry and entry.get("url"):
            links[key] = entry["url"]
    time.sleep(1.0)  # be polite to Odesli
    return links


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
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    ap = argparse.ArgumentParser(description="Build the turntable grid from a Discogs List.")
    ap.add_argument("--list", help="Discogs list URL or id (default: tools/turntable-list.txt)")
    ap.add_argument("--limit", type=int, default=None, help="max items to include (default: all)")
    args = ap.parse_args()

    raw_list = args.list
    if not raw_list and LIST_FILE.exists():
        for line in LIST_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                raw_list = line
                break
    if not raw_list:
        sys.exit(f"! No list given. Put your Discogs list URL in {LIST_FILE} or pass --list.")
    lid = list_id_from(raw_list)

    creds = load_credentials()
    dg_token = creds.get("DISCOGS_TOKEN")
    sp_id = creds.get("SPOTIFY_CLIENT_ID")
    sp_secret = creds.get("SPOTIFY_CLIENT_SECRET")

    spotify: SpotifyAuth | None = None
    if sp_id and sp_secret:
        spotify = SpotifyAuth(sp_id, sp_secret)
        print(f"Discogs list {lid}  |  Discogs token: {'yes' if dg_token else 'NO'}  |  Spotify: yes")
    else:
        print(f"Discogs list {lid}  |  Discogs token: {'yes' if dg_token else 'NO'}  |  Spotify: NO (streaming links skipped)")

    dg = Discogs(dg_token)
    lst = dg.json(f"{API}/lists/{lid}")
    items = [it for it in lst.get("items", []) if it.get("type") in ("release", "master")]
    items = items[: args.limit]
    if not items:
        sys.exit("! List has no release/master items.")
    print(f'List "{lst.get("name")}" — {len(items)} item(s)\n')

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    entries = []
    for i, it in enumerate(items, 1):
        rel = dg.json(it["resource_url"])
        artist = ", ".join(a.get("name", "").strip() for a in rel.get("artists", [])) or "Unknown"
        artist = re.sub(r"\s*\(\d+\)$", "", artist)
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

        links = streaming_links_for(artist, title, spotify)
        platforms_found = ", ".join(links.keys()) if links else ("none" if spotify else "skipped")
        print(f"  {i:02d}. {artist} — {title}  ({len(videos)} video(s){'' if art_rel else ', no cover'})")
        print(f"    Streaming → {platforms_found}")

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
            "streamingLinks": links,
        })

    out = OUT_DIR / "turntable.json"
    out.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {out.relative_to(REPO)} with {len(entries)} albums.")
    print("Review, then commit assets/turntable/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
