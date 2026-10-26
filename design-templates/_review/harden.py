#!/usr/bin/env python3
"""Make the Kiro and photography pages work on older browsers and without WebGL.

- three.js is served from /vendor/three (no import map, no CDN)
- content is only hidden for animation once the page script actually runs
- every WebGL scene is wrapped so a failed context shows a static fallback
- svh/dvh and overflow-x: clip get plain fallbacks for older Safari
"""
import re

PUB = "/Users/rghvgpt/Desktop/portfolio_/public"
T = "/vendor/three/three.module.js"
ROOM = "/vendor/three/addons/environments/RoomEnvironment.js"
ROUND = "/vendor/three/addons/geometries/RoundedBoxGeometry.js"
BODY = "M398.554 818.914C316.315 1001.03 491.477 1046.74 620.672 940.156C658.687 1059.66 801.052 970.473 852.234 877.795C964.787 673.567 919.318 465.357 907.64 422.374C827.637 129.443 427.623 128.946 358.8 423.865C342.651 475.544 342.402 534.18 333.458 595.051C328.986 625.86 325.507 645.488 313.83 677.785C306.873 696.424 297.68 712.819 282.773 740.645C259.915 783.881 269.604 867.113 387.87 823.883Z"
EYES = "M636 549C603 549 598 510 598 487C598 466 602 449 609 438C615 429 625 424 636 424C648 424 657 429 664 439C672 449 677 466 677 487C677 526 661 549 636 549Z M771 549C738 549 733 510 733 487C733 466 737 449 744 438C751 429 760 424 771 424C783 424 793 429 800 439C808 449 812 466 812 487C812 526 797 549 771 549Z"

HEAD_JS = ("<script>document.documentElement.classList.add('anim');"
           "setTimeout(function(){if(!window.__pageOk)document.documentElement.classList.remove('anim')},2500);</script>\n")


def edit(path, fn):
    s = open(path).read(); s = fn(s); open(path, "w").write(s)


def R(s, a, b, count=1):
    assert a in s, a[:90]
    return s.replace(a, b) if count == 0 else s.replace(a, b, count)


def common_css(s):
    # unit and overflow fallbacks for Safari < 15.4 / < 16
    s = re.sub(r"([a-z-]+):\s*(\d+)(svh|dvh)(\s*[;}])", r"\1: \2vh; \1: \2\3\4", s)
    s = s.replace("overflow-x: clip;", "overflow-x: hidden; overflow-x: clip;")
    s = R(s, "</title>", "</title>\n" + HEAD_JS)
    s = R(s, "</style>", """  .ghost-fallback svg { width: 100%; height: 100%; display: block; filter: drop-shadow(0 0 40px rgba(144,70,255,.35)); animation: gfloat 3.6s ease-in-out infinite; }
  @keyframes gfloat { 50% { transform: translateY(-10px); } }
  @media (prefers-reduced-motion: reduce) { .ghost-fallback svg { animation: none; } }
</style>""")
    return s


GHOST_JS = f"""
  const GHOST_SVG = '<svg viewBox="250 180 700 840" aria-hidden="true"><path fill="#f4efff" d="{BODY}"/><path fill="#141018" d="{EYES}"/></svg>';
  const noGL = new URLSearchParams(location.search).has('nogl'); // ?nogl previews the fallback
  // Overlay a static ghost exactly where a canvas sits, keeping the canvas for layout.
  const ghostOver = (canvas) => {{
    canvas.style.visibility = 'hidden';
    const d = document.createElement('div'); d.className = 'ghost-fallback'; d.innerHTML = GHOST_SVG; canvas.after(d);
    const place = () => {{ d.style.cssText = `position:absolute;left:${{canvas.offsetLeft}}px;top:${{canvas.offsetTop}}px;width:${{canvas.offsetWidth}}px;height:${{canvas.offsetHeight}}px`; }};
    place(); addEventListener('resize', place);
  }};
"""


def kiro(s):
    s = common_css(s)
    s = R(s, ".split .w > span {", ".anim .split .w > span {")
    s = R(s, ".split.in .w > span {", ".anim .split.in .w > span {")
    s = R(s, ".reveal { opacity: 0;", ".anim .reveal { opacity: 0;")
    s = R(s, ".reveal.in {", ".anim .reveal.in {")
    s = R(s, ".diagram .ln { display: block; opacity: 0;", ".diagram .ln { display: block; }\n  .anim .diagram .ln { opacity: 0;")
    s = R(s, ".case.in .diagram .ln {", ".anim .case.in .diagram .ln {")
    s = R(s, "  .hero::after {", """  .hero .ghost-fallback { position: absolute; right: 12vw; top: 50%; transform: translateY(-50%); width: min(30vw, 400px); aspect-ratio: 700 / 840; }
  @media (max-width: 1000px) { .hero .ghost-fallback { right: auto; left: 50%; top: 92px; transform: translateX(-50%); width: min(52vw, 30vh); } }
  .hero::after {""")
    s = re.sub(r'<script type="importmap">.*?</script>\n', "", s)
    s = R(s, """  import * as THREE from 'three';
  import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
  import { makeGhost3D } from './ghost3d.js';
""", "  window.__pageOk = true;\n")
    s = R(s, "  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));\n",
          "  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));\n" + GHOST_JS)
    s = R(s, "  /* hero: the Kiro ghost drawn in particles, eyes follow the cursor */\n  {\n", f"""  let THREE = null, RoomEnvironment = null, makeGhost3D = null;
  if (!noGL) try {{
    [THREE, {{ RoomEnvironment }}, {{ makeGhost3D }}] = await Promise.all([import('{T}'), import('{ROOM}'), import('./ghost3d.js')]);
  }} catch (err) {{ console.warn('3D disabled:', err); }}

  /* hero: the Kiro ghost drawn in particles, eyes follow the cursor */
  try {{
    if (!THREE) throw new Error('3D unavailable');
""")
    s, n = re.subn(r"\n  \}\n(\s*)  /\* hero bar", "\n  } catch (err) {\n    const f = document.getElementById('field'); f.style.display = 'none';\n    const d = document.createElement('div'); d.className = 'ghost-fallback'; d.innerHTML = GHOST_SVG; f.after(d);\n  }\n\\1  /* hero bar", s, count=1)
    assert n == 1, "hero block end"
    a = "    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));\n    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.setSize(280, 300, false);"
    b = "    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.75; scene.add(shadow);\n"
    i = s.index(a); j = s.index(b, i) + len(b)
    s = s[:i] + "    let gl = null;\n    try {\n      if (!THREE) throw new Error('3D unavailable');\n" + s[i:j] + "      gl = { renderer, scene, camera, ghost, shadow };\n    } catch (err) { ghostOver(canvas); }\n" + s[j:]
    s = R(s, "    const clock = new THREE.Clock();\n    renderer.setAnimationLoop(() => {\n      if (!visible) return;\n      const t = reduce ? 0 : clock.getElapsedTime();\n      // look toward",
          "    if (gl) {\n    const { renderer, scene, camera, ghost, shadow } = gl;\n    const clock = new THREE.Clock();\n    renderer.setAnimationLoop(() => {\n      if (!visible) return;\n      const t = reduce ? 0 : clock.getElapsedTime();\n      // look toward")
    s = R(s, "      renderer.render(scene, camera);\n    });\n    return { setActive, cards };",
          "      renderer.render(scene, camera);\n    });\n    }\n    return { setActive, cards };")
    return s


def photo(s):
    s = common_css(s)
    s = R(s, ".reveal { opacity: 0;", ".anim .reveal { opacity: 0;")
    s = R(s, ".reveal.in {", ".anim .reveal.in {")
    s = R(s, "  .shot .ph { overflow: hidden; border-radius: 4px; clip-path: inset(100% 0 0 0); transition: clip-path 1.2s var(--ease); background: var(--bg2); }",
          "  .shot .ph { overflow: hidden; border-radius: 4px; background: var(--bg2); }\n  .anim .shot .ph { clip-path: inset(100% 0 0 0); transition: clip-path 1.2s var(--ease); }")
    s = R(s, ".shot.in .ph {", ".anim .shot.in .ph {")
    s = R(s, "  .stage { position: relative;", "  .stage .cam-fallback { position: absolute; inset: 8% 10%; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); }\n  .stage .cam-fallback img { width: 100%; height: 100%; object-fit: cover; }\n  .stage { position: relative;")
    s = re.sub(r'<script type="importmap">.*?</script>\n', "", s)
    s = R(s, "  /* ---------- photo data", "  window.__pageOk = true;\n  /* ---------- photo data")
    s = R(s, "rows.at(-1).length === 1 && rows.at(-2).length > 1) rows.at(-2).push(rows.pop()[0]);",
          "rows[rows.length - 1].length === 1 && rows[rows.length - 2].length > 1) rows[rows.length - 2].push(rows.pop()[0]);")
    s = R(s, """  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const { makeCamera } = await import('./camera3d.js');
  const canvas = document.getElementById('cam');
""", f"""  const flash = document.getElementById('flash'), canvas = document.getElementById('cam');
  const pop = (o) => {{ if (!reduce && flash.animate) flash.animate([{{ opacity: 0 }}, {{ opacity: o }}, {{ opacity: 0 }}], {{ duration: 500, easing: 'ease-out' }}); }};
  let shoot = () => {{}};
  document.getElementById('shutter').onclick = () => {{ shoot(); pop(.9); setTimeout(() => document.getElementById('frames').scrollIntoView({{ behavior: reduce ? 'auto' : 'smooth' }}), 420); }};
  try {{
  if (new URLSearchParams(location.search).has('nogl')) throw new Error('3D preview disabled');
  const [THREE, {{ RoomEnvironment }}, {{ makeCamera }}] = await Promise.all([import('{T}'), import('{ROOM}'), import('./camera3d.js')]);
""")
    s = R(s, """  const flash = document.getElementById('flash');
  const fire = () => {
    camera.userData.shoot();
    if (!reduce) flash.animate([{ opacity: 0 }, { opacity: .9, offset: .15 }, { opacity: 0 }], { duration: 520, easing: 'ease-out' });
    setTimeout(() => document.getElementById('frames').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 420);
  };
  document.getElementById('shutter').onclick = fire;
  canvas.addEventListener('dblclick', () => { camera.userData.shoot(); if (!reduce) flash.animate([{ opacity: 0 }, { opacity: .8, offset: .15 }, { opacity: 0 }], { duration: 480 }); });
""", """  shoot = () => camera.userData.shoot();
  canvas.addEventListener('dblclick', () => { shoot(); pop(.8); });
""")
    s = R(s, "    renderer.render(scene, view);\n  });\n</script>",
          "    renderer.render(scene, view);\n  });\n  } catch (err) {\n    console.warn('3D disabled:', err);\n    canvas.style.display = 'none';\n    const d = document.createElement('figure'); d.className = 'cam-fallback';\n    d.innerHTML = `<img src=\"${PHOTOS[0].small}\" alt=\"${alt(PHOTOS[0])}\">`; canvas.after(d);\n  }\n</script>")
    return s


def mod(s, extra=()):
    s = s.replace("from 'three';", f"from '{T}';")
    for a, b in extra: s = R(s, a, b)
    return s


edit(f"{PUB}/kiro/index.html", kiro)
edit(f"{PUB}/photography/index.html", photo)
edit(f"{PUB}/kiro/ghost3d.js", mod)
edit(f"{PUB}/photography/camera3d.js", lambda s: mod(s, [("from 'three/addons/geometries/RoundedBoxGeometry.js';", f"from '{ROUND}';")]))
for f in ("environments/RoomEnvironment.js", "geometries/RoundedBoxGeometry.js"):
    edit(f"{PUB}/vendor/three/addons/{f}", mod)
print("ok")
