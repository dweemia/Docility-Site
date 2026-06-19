#!/usr/bin/env python3
"""
optimize-photos.py — batch-convert gallery photos to web-ready WebP.

Drop your raw photos (JPG/PNG/HEIC/TIFF/…) into a staging folder, run this,
and it writes optimized WebP into assets/gallery/ following the conventions in
assets/gallery/README.txt (<=1600px long edge, WebP, aiming for <300 KB).

Usage (from the repo root):
    python tools/optimize-photos.py                 # _raw/ -> assets/gallery/
    python tools/optimize-photos.py path/to/photos  # custom input folder
    python tools/optimize-photos.py --number        # rename output 01.webp, 02.webp, ...
    python tools/optimize-photos.py --max 2000 --target-kb 350

Notes
- EXIF orientation is honoured (phone photos won't come out sideways).
- HEIC/HEIF is supported if `pillow-heif` is installed.
- Originals are never modified; only WebP files are written to the output folder.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps

# Enable HEIC/HEIF (iPhone) if the optional plugin is present.
try:
    import pillow_heif  # type: ignore
    pillow_heif.register_heif_opener()
except ImportError:
    pass

SRC_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".tif", ".tiff", ".bmp", ".webp"}


def encode_under_budget(img: Image.Image, target_kb: int) -> tuple[bytes, int]:
    """Encode to WebP, stepping quality down until under the size budget."""
    import io
    for quality in range(85, 39, -5):  # 85 down to 40
        buf = io.BytesIO()
        img.save(buf, "webp", quality=quality, method=6)
        if buf.tell() <= target_kb * 1024 or quality == 40:
            return buf.getvalue(), quality
    raise RuntimeError("unreachable")


def main() -> int:
    repo = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser(description="Batch-optimize gallery photos to WebP.")
    ap.add_argument("input", nargs="?", default=str(repo / "assets/gallery/_raw"),
                    help="folder of raw photos (default: assets/gallery/_raw)")
    ap.add_argument("--out", default=str(repo / "assets/gallery"),
                    help="output folder (default: assets/gallery)")
    ap.add_argument("--max", type=int, default=1600, help="max long-edge pixels (default: 1600)")
    ap.add_argument("--target-kb", type=int, default=300, help="size budget per image (default: 300)")
    ap.add_argument("--number", action="store_true",
                    help="rename output sequentially: 01.webp, 02.webp, ...")
    args = ap.parse_args()

    in_dir, out_dir = Path(args.input), Path(args.out)
    if not in_dir.is_dir():
        print(f"! Input folder not found: {in_dir}\n  Create it and add photos, or pass a path.")
        return 1
    out_dir.mkdir(parents=True, exist_ok=True)

    photos = sorted(p for p in in_dir.iterdir()
                    if p.is_file() and p.suffix.lower() in SRC_EXTS)
    if not photos:
        print(f"! No photos found in {in_dir}")
        return 1

    print(f"Optimizing {len(photos)} photo(s) -> {out_dir}  (<={args.max}px, <={args.target_kb}KB)\n")
    for i, src in enumerate(photos, start=1):
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((args.max, args.max), Image.LANCZOS)
            data, q = encode_under_budget(im, args.target_kb)
            w, h = im.size

        stem = f"{i:02d}" if args.number else src.stem
        dest = out_dir / f"{stem}.webp"
        dest.write_bytes(data)
        flag = "  (hit min quality)" if q == 40 and len(data) > args.target_kb * 1024 else ""
        print(f"  {src.name:32} -> {dest.name:14} {w}x{h}  {len(data)/1024:6.0f} KB  q{q}{flag}")

    print("\nDone. Review the .webp files, then update the GALLERY array in main.js if needed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
