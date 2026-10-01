// Procedural compact full-frame camera in the style of a Sony α7C II (silver top plate,
// black leatherette body, rangefinder-style EVF corner) with a small silver prime lens.
// 1 unit = 100 mm. The front of the camera faces +Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function noiseTexture(size = 256, scale = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 110 + Math.random() * 90 * scale;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}

function textTexture(text, { w = 512, h = 128, font = '600 64px Geist, system-ui, sans-serif', color = '#f1efea' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = color; g.font = font; g.textBaseline = 'middle'; g.fillText(text, 8, h / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// Cylinder along Z with optional knurling on the outer wall.
function barrel(r, h, { knurl = 0, ridges = 120, segs = 160 } = {}) {
  const g = new THREE.CylinderGeometry(r, r, h, segs, 1, false);
  if (knurl) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z);
      if (rr > r * 0.98) { const a = Math.atan2(z, x), k = 1 + (Math.sin(a * ridges) > 0 ? knurl : -knurl); p.setX(i, x * k); p.setZ(i, z * k); }
    }
    g.computeVertexNormals();
  }
  g.rotateX(Math.PI / 2);
  return g;
}

export function makeCamera() {
  const root = new THREE.Group(), cam = new THREE.Group(); root.add(cam);

  const silver = new THREE.MeshPhysicalMaterial({ color: '#cfccc6', metalness: 1, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const silverDark = new THREE.MeshPhysicalMaterial({ color: '#a9a6a0', metalness: 1, roughness: 0.42 });
  const leather = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.88, bumpMap: noiseTexture(256, 1), bumpScale: 0.9 });
  const plastic = new THREE.MeshStandardMaterial({ color: '#111113', roughness: 0.45, metalness: 0.2 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#0a0a0b', roughness: 0.95 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#07060b', metalness: 0, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 620], envMapIntensity: 1.6 });
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); cam.add(m); return m; };

  // body
  add(new RoundedBoxGeometry(1.24, 0.5, 0.44, 6, 0.05), leather, 0, -0.105, 0);
  add(new RoundedBoxGeometry(1.24, 0.225, 0.44, 6, 0.05), silver, 0, 0.245, 0);
  add(new RoundedBoxGeometry(1.25, 0.012, 0.445, 2, 0.005), silverDark, 0, 0.138, 0); // seam
  // grip (viewer's left when looking at the front)
  add(new RoundedBoxGeometry(0.29, 0.58, 0.2, 8, 0.09), leather, -0.455, -0.06, 0.26);
  // rear EVF eyecup (top right from the front)
  add(new RoundedBoxGeometry(0.28, 0.17, 0.08, 4, 0.03), rubber, 0.44, 0.25, -0.25);

  // top controls
  const knurledDial = (r, h) => { const g = barrel(r, h, { knurl: 0.03, ridges: 70 }); g.rotateX(-Math.PI / 2); return g; };
  add(knurledDial(0.085, 0.05), plastic, -0.17, 0.38, -0.05);
  add(knurledDial(0.07, 0.045), silverDark, 0.0, 0.378, -0.08);
  const shutterRing = add(knurledDial(0.07, 0.03), plastic, -0.44, 0.37, 0.24);
  const shutter = add(new THREE.CylinderGeometry(0.045, 0.047, 0.035, 48), silver, -0.44, 0.395, 0.24);
  add(new RoundedBoxGeometry(0.22, 0.03, 0.2, 2, 0.01), silverDark, 0.22, 0.37, 0.0); // hot shoe
  add(new THREE.BoxGeometry(0.16, 0.012, 0.14), rubber, 0.22, 0.386, 0.0);

  // front details
  add(new THREE.CircleGeometry(0.022, 32), plastic, -0.22, 0.25, 0.221);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.065), new THREE.MeshBasicMaterial({ map: textTexture('α7C II'), transparent: true, depthWrite: false }));
  label.position.set(0.38, 0.245, 0.2215); cam.add(label);

  // mount + lens (lens axis slightly right of centre, like the real body)
  const lx = 0.07, ly = -0.085;
  add(barrel(0.31, 0.03), silverDark, lx, ly, 0.235);
  const lens = new THREE.Group(); lens.position.set(lx, ly, 0.25); cam.add(lens);
  const L = (geo, mat, z) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; lens.add(m); return m; };
  L(barrel(0.275, 0.07), silver, 0.035);
  L(barrel(0.282, 0.08, { knurl: 0.012, ridges: 140 }), silverDark, 0.11);   // aperture ring
  L(barrel(0.278, 0.012), plastic, 0.156);
  L(barrel(0.288, 0.13, { knurl: 0.016, ridges: 110 }), silver, 0.228);     // focus ring
  L(barrel(0.27, 0.07), silver, 0.33);
  const face = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.27, 96), plastic); face.position.z = 0.366; lens.add(face);
  L(barrel(0.17, 0.05), rubber, 0.345);
  const cap = new THREE.SphereGeometry(0.17, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2.6);
  cap.rotateX(Math.PI / 2); cap.scale(1, 1, 0.45);
  const g1 = new THREE.Mesh(cap, glass); g1.position.z = 0.33; lens.add(g1);
  const ringTxt = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ map: textTexture('2.5 / 40', { font: '500 58px "Geist Mono", ui-monospace, monospace', color: '#cfcac1' }), transparent: true, depthWrite: false }));
  ringTxt.position.set(-0.02, 0.215, 0.3675); ringTxt.scale.setScalar(0.8); lens.add(ringTxt);

  // centre the model roughly on its visual mass
  cam.position.set(-0.03, 0.0, -0.12);

  let kick = 0;
  root.userData = {
    shoot() { kick = 1; },
    update(dt) {
      kick = Math.max(0, kick - dt * 3.2);
      const k = Math.sin(kick * Math.PI);
      shutter.position.y = 0.395 - k * 0.015;
      cam.rotation.x = -k * 0.05; cam.position.z = -0.12 - k * 0.04;
      shutterRing.rotation.y = kick * 0.3;
    },
  };
  return root;
}
