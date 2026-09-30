// A rounded, character-style Kiro ghost: dome head, flared skirt with a
// rippling scalloped hem, glossy eyes that look around and blink, tiny arms.
import * as THREE from 'three';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function bodyGeometry() {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const p = g.attributes.position, n = p.count;
  const hem = new Float32Array(n), theta = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const th = Math.atan2(z, x), rho = Math.hypot(x, z);
    let r, ny, w = 0;
    if (y >= 0) { r = rho; ny = y * 1.05; }
    else {
      const t = Math.asin(Math.min(1, -y)) / (Math.PI / 2); // 0 at equator, 1 at bottom pole
      if (t < 0.8) { const k = t / 0.8; r = 1 + 0.13 * k * k; ny = -k * 1.35; }
      else { const k = (t - 0.8) / 0.2; r = 1.13 * (1 - k); ny = -1.35 + 0.32 * Math.sin(k * Math.PI / 2); }
      w = smooth(0.5, 0.8, t);
      ny += w * 0.13 * Math.cos(5 * th); // scalloped hem
    }
    p.setXYZ(i, r * Math.cos(th), ny, r * Math.sin(th));
    hem[i] = w; theta[i] = th;
  }
  g.setAttribute('aHem', new THREE.BufferAttribute(hem, 1));
  g.setAttribute('aTheta', new THREE.BufferAttribute(theta, 1));
  g.computeVertexNormals();
  return g;
}

export function makeGhost3D({ height = 2.4, color = '#f5f0ff', sheen = '#c2a0fd' } = {}) {
  const root = new THREE.Group(), rig = new THREE.Group(); root.add(rig);
  const uniforms = { uTime: { value: 0 } };
  const skin = () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(sheen) });

  const bodyMat = skin();
  bodyMat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.vertexShader = 'attribute float aHem; attribute float aTheta; uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
       float wv = sin(aTheta * 5.0 - uTime * 2.4);
       transformed.y += aHem * 0.07 * wv;
       transformed.xz *= 1.0 + aHem * 0.035 * cos(aTheta * 5.0 - uTime * 2.4 + 1.2);`);
  };
  const body = new THREE.Mesh(bodyGeometry(), bodyMat); rig.add(body);

  // arms
  const armMat = skin(), arms = [];
  [-1, 1].forEach((s) => {
    // short rounded nub rooted inside the body wall, so it reads as part of the sheet
    const pivot = new THREE.Group(); pivot.position.set(s * 0.9, -0.2, 0.1);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.2, 8, 24), armMat);
    arm.position.set(0, -0.2, 0); arm.scale.set(1, 1, 0.8); pivot.add(arm);
    pivot.rotation.set(0, s * -0.35, s * 0.95); rig.add(pivot); arms.push([pivot, s]);
  });

  // face
  const face = new THREE.Group(); rig.add(face);
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: '#17121d', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const shine = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const blushMat = new THREE.MeshBasicMaterial({ color: '#ffafd1', transparent: true, opacity: 0.32, depthWrite: false });
  const eyes = [];
  const onHead = (x, y, lift) => { const z = Math.sqrt(Math.max(0, 1 - x * x - (y / 1.05) ** 2)); return new THREE.Vector3(x, y, z).multiplyScalar(1 + lift); };
  [-1, 1].forEach((s) => {
    const eye = new THREE.Group(); const at = onHead(s * 0.27, 0.2, 0.0);
    eye.position.copy(at); eye.lookAt(at.clone().multiplyScalar(3));
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), eyeMat); ball.scale.set(0.105, 0.165, 0.06); eye.add(ball);
    const hi = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), shine); hi.position.set(0.035, 0.06, 0.05); eye.add(hi);
    const hi2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), shine); hi2.position.set(-0.03, -0.05, 0.052); eye.add(hi2);
    face.add(eye); eyes.push(eye);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.085, 32), blushMat); const bp = onHead(s * 0.5, -0.02, 0.01);
    blush.position.copy(bp); blush.lookAt(bp.clone().multiplyScalar(3)); blush.scale.set(1.3, 0.8, 1); face.add(blush);
  });

  const TOP = 1.05, BOTTOM = -1.48, s = height / (TOP - BOTTOM);
  rig.position.y = -(TOP + BOTTOM) / 2; root.scale.setScalar(s);

  let lookX = 0, lookY = 0;
  root.userData.update = (t, lx = 0, ly = 0) => {
    uniforms.uTime.value = t;
    lookX += (lx - lookX) * 0.1; lookY += (ly - lookY) * 0.1;
    // eyes slide over the head and the face turns a little
    face.rotation.y = lookX * 0.14; face.rotation.x = -lookY * 0.16;
    const ph = t % 4.4, k = ph < 0.14 ? Math.max(0.1, 1 - Math.sin((ph / 0.14) * Math.PI)) : 1;
    eyes.forEach((e) => { e.scale.y = k; });
    arms.forEach(([pv, sg], i) => { pv.rotation.z = sg * (0.95 + Math.sin(t * 2.2 + i * 1.3) * 0.12); });
    rig.rotation.z = Math.sin(t * 1.1) * 0.04;
  };
  return root;
}
