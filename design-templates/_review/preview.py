#!/usr/bin/env python3
"""Make agent-safe previews of large photos.

Reads originals (never modifies them), writes small numbered contact sheets
capped at MAX_W px wide and about MAX_KB each, plus meta.tsv with EXIF.

usage: python3 preview.py [--cols 4] [--per 12] [--cell 240]
"""
import argparse, io, os, sys
from PIL import Image, ImageDraw, ImageOps, ExifTags

SRC = "/Users/rghvgpt/Desktop/portfolio_/src/Assets/Photography"
OUT = os.path.dirname(os.path.abspath(__file__))
MAX_W, MAX_KB = 1000, 200
Image.MAX_IMAGE_PIXELS = None  # stitched panoramas are huge but trusted
EXT = (".jpg", ".jpeg", ".png")
TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def exif(im):
    try:
        e = im.getexif(); ifd = e.get_ifd(0x8769)
    except Exception:
        return {}
    g = lambda k: ifd.get(TAGS[k]) or e.get(TAGS[k])
    f, s, iso, mm = g("FNumber"), g("ExposureTime"), g("ISOSpeedRatings"), g("FocalLength")
    return {
        "cam": g("Model"), "lens": g("LensModel"), "date": g("DateTimeOriginal"),
        "f": float(f) if f else None, "s": float(s) if s else None,
        "iso": iso, "mm": float(mm) if mm else None,
    }


def thumb(path, cell):
    im = Image.open(path)
    im.draft("RGB", (cell * 2, cell * 2))  # fast JPEG downscale while decoding
    meta = exif(im)
    w, h = im.size
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((cell, cell), Image.LANCZOS)
    return im, meta, (w, h)


def save_capped(img, path):
    for q in (72, 62, 52, 42):
        buf = io.BytesIO(); img.save(buf, "JPEG", quality=q, optimize=True)
        if buf.tell() <= MAX_KB * 1024: break
    open(path, "wb").write(buf.getvalue())
    return buf.tell() // 1024


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--per", type=int, default=12)
    ap.add_argument("--cell", type=int, default=240)
    a = ap.parse_args()
    cell = min(a.cell, MAX_W // a.cols)
    files = sorted(os.path.join(r, f) for r, _, fs in os.walk(SRC) for f in fs if f.lower().endswith(EXT))
    rows = []
    items = []
    for i, p in enumerate(files, 1):
        try:
            t, m, (w, h) = thumb(p, cell - 8)
        except Exception as ex:
            print(f"skip {p}: {ex}", file=sys.stderr); continue
        items.append((i, t))
        rows.append("\t".join(map(str, [f"{i:02d}", os.path.relpath(p, SRC), f"{w}x{h}", os.path.getsize(p) // 1024,
                                        m.get("cam"), m.get("lens"), m.get("f"), m.get("s"), m.get("iso"), m.get("mm"), m.get("date")])))
    open(os.path.join(OUT, "meta.tsv"), "w").write("id\tfile\tpx\tkb\tcam\tlens\tf\ts\tiso\tmm\tdate\n" + "\n".join(rows) + "\n")
    for n in range(0, len(items), a.per):
        chunk = items[n:n + a.per]
        r = (len(chunk) + a.cols - 1) // a.cols
        sheet = Image.new("RGB", (a.cols * cell, r * (cell + 18)), (17, 17, 17))
        d = ImageDraw.Draw(sheet)
        for k, (i, t) in enumerate(chunk):
            x, y = (k % a.cols) * cell, (k // a.cols) * (cell + 18)
            sheet.paste(t, (x + (cell - t.width) // 2, y + (cell - t.height) // 2))
            d.text((x + 6, y + cell + 2), f"{i:02d}", fill=(235, 89, 57))
        name = os.path.join(OUT, f"sheet{n // a.per + 1}.jpg")
        kb = save_capped(sheet, name)
        print(f"{name} {sheet.width}x{sheet.height} {kb}KB")


if __name__ == "__main__":
    main()
