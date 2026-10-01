#!/usr/bin/env python3
"""Export the curated, de-duplicated selection as web-sized images + photos.js.

Order in PICKS is the display order (best first). Near-duplicates and the
AI-upscaled "magnific" copies were dropped after reviewing the contact sheets.
"""
import csv, io, json, os
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
SRC = "/Users/rghvgpt/Desktop/portfolio_/src/Assets/Photography"
OUT = "/Users/rghvgpt/Desktop/portfolio_/public/photography"
HERE = os.path.dirname(os.path.abspath(__file__))

T, Y, B = "Tetons & Yellowstone", "Yosemite", "Big Sur & the Bay"
# (sheet id, title, place, series)
PICKS = [
    (27, "Moulton Barn", "Mormon Row, Grand Teton", T),
    (17, "Walking through steam", "Grand Prismatic, Yellowstone", T),
    (38, "Last light on the ranch", "Jackson Hole, Wyoming", T),
    (36, "One second at the falls", "Idaho Falls, Idaho", T),
    (13, "Artist Point", "Grand Canyon of the Yellowstone", T),
    (8,  "Tunnel View", "Yosemite Valley", Y),
    (50, "Mount Moran", "Oxbow Bend, Grand Teton", T),
    (4,  "Where the road meets the sea", "Big Sur, California", B),
    (28, "Golden hour, lone pine", "Jackson Hole, Wyoming", T),
    (12, "Merced, slowed down", "Yosemite Valley", Y),
    (15, "Bison at rest", "Yellowstone", T),
    (34, "Jackson Lake", "Grand Teton", T),
    (2,  "Fog rolling in", "Big Sur, California", B),
    (22, "Hidden Falls", "Grand Teton", T),
    (51, "Prismatic boardwalk", "Midway Geyser Basin, Yellowstone", T),
    (41, "Dandelion field", "Jackson Hole, Wyoming", T),
    (7,  "Under Yosemite Falls", "Yosemite Valley", Y),
    (35, "Everyone stopped for this", "Grand Teton", T),
    (5,  "The window", "Big Sur, California", B),
    (37, "Morning through the pines", "Grand Teton", T),
    (25, "Cabin on the flats", "Mormon Row, Grand Teton", T),
    (11, "Scale", "Yosemite Valley", Y),
    (16, "Raven's lookout", "Grand Teton", T),
    (33, "Colter Bay", "Grand Teton", T),
    (6,  "Palace of Fine Arts", "San Francisco", B),
    (9,  "Tunnel View, together", "Yosemite Valley", Y),
    (32, "The whole range", "Grand Teton", T),
    (14, "Snow line", "Grand Teton", T),
    (42, "First photographer", "Grand Teton", T),
    (23, "Sunburst over the valley", "Jackson Hole, Wyoming", T),
    (1,  "Carmel afternoon", "Carmel-by-the-Sea, California", B),
]


def fnum(v):
    try: return float(v)
    except (TypeError, ValueError): return None


def save(im, path, long_edge, q, icc=None):
    im = im.copy(); im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    # keep the colour profile and full chroma so Lightroom edits look the same on the web
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True, subsampling=0, icc_profile=icc)
    return im.size, os.path.getsize(path) // 1024


def main():
    meta = {int(r["id"]): r for r in csv.DictReader(open(os.path.join(HERE, "meta.tsv")), delimiter="\t")}
    ids = [p[0] for p in PICKS]
    assert len(ids) == len(set(ids)), "duplicate id in PICKS"
    os.makedirs(os.path.join(OUT, "img"), exist_ok=True)
    data, total = [], 0
    for n, (sid, title, place, series) in enumerate(PICKS, 1):
        r = meta[sid]
        raw = Image.open(os.path.join(SRC, r["file"])); icc = raw.info.get("icc_profile")
        im = ImageOps.exif_transpose(raw).convert("RGB")
        slug = f"{n:02d}"
        (w, h), kb1 = save(im, os.path.join(OUT, "img", f"{slug}.jpg"), 3600, 92, icc)
        _, kb2 = save(im, os.path.join(OUT, "img", f"{slug}-s.jpg"), 1400, 84, icc)
        total += kb1 + kb2
        date = (r["date"] or "").split(" ")[0].replace(":", "-") if r["date"] not in ("", "None") else None
        lens = r["lens"] if r["lens"] not in ("", "None") else None
        data.append({
            "src": f"img/{slug}.jpg", "small": f"img/{slug}-s.jpg", "w": w, "h": h,
            "title": title, "place": place, "series": series,
            "cam": "Sony α7C II" if r["cam"] == "ILCE-7CM2" else None,
            "lens": lens.replace(" | Art 024", " Art").replace("24-70mm", "Sigma 24-70mm") if lens else None,
            "f": fnum(r["f"]), "s": fnum(r["s"]), "iso": fnum(r["iso"]), "mm": fnum(r["mm"]), "date": date,
        })
        print(f"{slug} {w}x{h} {kb1}KB + {kb2}KB  {title}")
    old = os.path.join(OUT, "photos.js")
    if os.path.exists(old):
        txt = open(old).read(); prev = json.loads(txt[txt.index("["):txt.rindex("]") + 1])
        caps = {p["title"]: p.get("caption") for p in prev}
        for d in data: d["caption"] = caps.get(d["title"])
    open(os.path.join(OUT, "photos.js"), "w").write("export default " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print(f"{len(data)} photos, {total // 1024} MB total")

    # small verification sheet of the final order (agent-safe)
    cell, cols = 160, 6
    rows = (len(data) + cols - 1) // cols
    sheet = Image.new("RGB", (cell * cols, cell * rows), (17, 17, 17))
    for k, d in enumerate(data):
        t = Image.open(os.path.join(OUT, d["small"])); t.thumbnail((cell - 8, cell - 8))
        x, y = (k % cols) * cell, (k // cols) * cell
        sheet.paste(t, (x + (cell - t.width) // 2, y + (cell - t.height) // 2))
    sheet.save(os.path.join(HERE, "final.jpg"), "JPEG", quality=60, optimize=True)
    print("final.jpg", os.path.getsize(os.path.join(HERE, "final.jpg")) // 1024, "KB")


if __name__ == "__main__":
    main()
