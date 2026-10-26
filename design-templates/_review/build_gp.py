#!/usr/bin/env python3
"""Add the Google Photos album picks (downloaded originals in /tmp/gp/full) to photos.js.

Same export settings as build_photos.py: 3600px q92 + 1400px q84, 4:4:4, ICC kept.
Re-running replaces any earlier entries from this script instead of duplicating them.
"""
import json, os
from datetime import datetime
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
SRC = "/tmp/gp/full"
OUT = "/Users/rghvgpt/Desktop/portfolio_/public/photography"
MP, NC, PNW = "Maple Pass", "North Cascades", "Closer to home"

# (album id, title, place, series, caption)
PICKS = [
    ("43", "Glacier milk", "North Cascades Highway", NC, "A month earlier, same mountains. Rock flour from the glaciers turns the water this colour."),
    ("44", "From the overlook", "North Cascades Highway", NC, "Peaks stacked behind peaks. This is the drive that put Maple Pass on the list."),
    ("45", "Into the woods", "Maple Pass Loop", MP, "A late start. The trail climbs through old forest for a long time before anything opens up."),
    ("47", "First gold", "Maple Pass Loop", MP, "The first larches. They are the only conifers here that turn gold and drop their needles."),
    ("48", "Out of the trees", "Maple Pass Loop", MP, "Sun breaking over the ridge just as the forest gave way to rock."),
    ("50", "Huckleberry red", "Maple Pass Loop", MP, "Up top the ground had turned red before the trees turned gold."),
    ("52", "Larches, backlit", "Maple Pass Loop", MP, "Golden hour on the ridge. Every needle lit from behind."),
    ("53", "The sun goes behind the ridge", "Maple Pass Loop", MP, "The frame I hiked up for. Light pouring around the ridge through the larches."),
    ("55", "Last direct light", "Maple Pass Loop", MP, "Four minutes later the sun was gone from the trail."),
    ("56", "Gold below, blue above", "Maple Pass Loop", MP, "The valley went blue while the larches held on to the light."),
    ("57", "Alpenglow", "Maple Pass Loop", MP, "About two minutes of pink on the summit, then nothing."),
    ("60", "The red slope", "Maple Pass Loop", MP, "Huckleberry all the way down, one more peak catching the last of it."),
    ("61", "Every ridge at once", "Maple Pass Loop", MP, "Layer after layer of the North Cascades, fading toward night."),
    ("63", "One last look", "Maple Pass Loop", MP, "Framed by the firs on the way down. Headlamps came out right after this."),
    ("64", "Twenty seconds of sky", "Maple Pass Loop", MP, "Headlamps off, camera on a rock, twenty seconds at ISO 8000. Worth the cold hands."),
    ("06", "Morning elk", "Washington", PNW, "He took his time crossing. So did we."),
    ("08", "Night glow", "Washington", PNW, "Balloons lighting up one at a time after dark."),
    ("09", "Sea stacks", "Washington coast", PNW, "Hazy sun, low tide, and the stacks lined up like teeth."),
    ("13", "Ferry deck", "Puget Sound", PNW, "Everyone ends up at the rail eventually."),
    ("15", "Haystack Rock", "Cannon Beach, Oregon", PNW, "Fourth of July morning, low tide turning the beach into a mirror."),
    ("19", "Headland at dusk", "Oregon coast", PNW, "Same day, a few hours down the coast, evening light on the cliffs."),
    ("23", "Japanese garden", "Portland, Oregon", PNW, "Moss, maples and a footbridge. Quiet even with a crowd."),
    ("26", "Seattle after dark", "Seattle", PNW, "The Space Needle and the city lights from up the hill."),
    ("29", "Sail at sunset", "Puget Sound", PNW, "One boat, the Olympics, and the sound turning gold."),
    ("32", "Blue Angels", "Seattle", PNW, "Seafair weekend. 200mm and a lot of missed frames for this one."),
    ("37", "Rainier in January", "Seattle", PNW, "A clear winter afternoon is rare here. The mountain showed up for it."),
    ("38", "Skyline at last light", "Seattle", PNW, "The whole skyline in one long frame as the sun went down."),
    ("40", "Rainier from the water", "Puget Sound", PNW, "The mountain over the sound, a boat cutting across the bottom of the frame."),
]
LENS = {"24-70mm F2.8 DG DN II | Art 024": "Sigma 24-70mm F2.8 Art", "FE 24-70mm F4 ZA OSS": "Sony 24-70mm F4 ZA",
        "FE 70-200mm F4 Macro G OSS II": "Sony 70-200mm F4 Macro G", "FE 70-200mm F2.8 GM OSS II": "Sony 70-200mm F2.8 GM"}


def save(im, path, edge, q, icc):
    im = im.copy(); im.thumbnail((edge, edge), Image.LANCZOS)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True, subsampling=0, icc_profile=icc)
    return im.size, os.path.getsize(path) // 1024


def exif(im):
    e = im.getexif(); i = e.get_ifd(0x8769)
    num = lambda v: float(v) if v else None
    dt = i.get(36867) or e.get(306)
    cam = {"ILCE-7CM2": "Sony α7C II"}.get(e.get(272), e.get(272))
    lens = (i.get(42036) or "").strip()
    return {"cam": cam, "lens": LENS.get(lens, lens or None), "f": num(i.get(33437)), "s": num(i.get(33434)),
            "iso": num(i.get(34855)), "mm": num(i.get(37386)),
            "dt": datetime.strptime(dt, "%Y:%m:%d %H:%M:%S") if dt else None}


def main():
    path = os.path.join(OUT, "photos.js"); t = open(path).read()
    data = [d for d in json.loads(t[t.index("["):t.rindex("]") + 1]) if not d.get("album")]
    titles = {d["title"] for d in data}
    n = len(data)
    for k, (aid, title, place, series, cap) in enumerate(PICKS, 1):
        assert title not in titles, f"duplicate title {title}"
        raw = Image.open(os.path.join(SRC, f"{aid}.jpg")); icc = raw.info.get("icc_profile"); x = exif(raw)
        im = ImageOps.exif_transpose(raw).convert("RGB")
        slug = f"{n + k:02d}"
        (w, h), a = save(im, os.path.join(OUT, "img", f"{slug}.jpg"), 3600, 92, icc)
        _, b = save(im, os.path.join(OUT, "img", f"{slug}-s.jpg"), 1400, 84, icc)
        dt = x.pop("dt")
        data.append({"src": f"img/{slug}.jpg", "small": f"img/{slug}-s.jpg", "w": w, "h": h, "title": title, "place": place,
                     "series": series, "caption": cap, "album": True, **x,
                     "date": dt.strftime("%Y-%m-%d") if dt else None,
                     "time": dt.strftime("%-I:%M %p").lower() if dt else None})
        print(slug, aid, f"{w}x{h}", f"{a}+{b}KB", title)
    open(path, "w").write("export default " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print(len(data), "photos total")


if __name__ == "__main__":
    main()
