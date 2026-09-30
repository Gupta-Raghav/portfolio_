// Shared 3D Kiro ghost built from the public kiro.dev icon paths.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const BODY = 'M398.554 818.914C316.315 1001.03 491.477 1046.74 620.672 940.156C658.687 1059.66 801.052 970.473 852.234 877.795C964.787 673.567 919.318 465.357 907.64 422.374C827.637 129.443 427.623 128.946 358.8 423.865C342.651 475.544 342.402 534.18 333.458 595.051C328.986 625.86 325.507 645.488 313.83 677.785C306.873 696.424 297.68 712.819 282.773 740.645C259.915 783.881 269.604 867.113 387.87 823.883Z';
const EYES = [
  'M636 549C603 549 598 510 598 487C598 466 602 449 609 438C615 429 625 424 636 424C648 424 657 429 664 439C672 449 677 466 677 487C677 526 661 549 636 549Z',
  'M771 549C738 549 733 510 733 487C733 466 737 449 744 438C751 429 760 424 771 424C783 424 793 429 800 439C808 449 812 466 812 487C812 526 797 549 771 549Z',
];

const loader = new SVGLoader();
// Flip Y at the shape level so extrusion winding stays correct.
const shapes = (d) => SVGLoader.createShapes(loader.parse(`<svg><path transform="scale(1,-1)" d="${d}"/></svg>`).paths[0]);

/** Returns a group roughly `height` world units tall, centered on the origin, facing +Z. */
export function makeGhost({ height = 2, color = '#f4efff', sheen = '#c2a0fd', bodyMaterial = null, eyeMaterial = null } = {}) {
  const body = new THREE.ExtrudeGeometry(shapes(BODY), { depth: 140, bevelEnabled: true, bevelThickness: 40, bevelSize: 30, bevelSegments: 12, curveSegments: 48 });
  body.computeBoundingBox();
  const c = new THREE.Vector3(); body.boundingBox.getCenter(c);
  body.translate(-c.x, -c.y, -c.z); // also recomputes the bounding box
  const front = body.boundingBox.max.z;
  const group = new THREE.Group();
  const bodyMat = bodyMaterial || new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 1, sheenColor: new THREE.Color(sheen) });
  group.add(new THREE.Mesh(body, bodyMat));
  const eyeMat = eyeMaterial || new THREE.MeshStandardMaterial({ color: '#141018', roughness: 0.3, side: THREE.DoubleSide });
  const eyes = new THREE.Group();
  let eyeY = null;
  EYES.forEach((d) => {
    const g = new THREE.ExtrudeGeometry(shapes(d), { depth: 12, bevelEnabled: false, curveSegments: 24 });
    g.translate(-c.x, -c.y, front - 4);
    g.computeBoundingBox();
    if (eyeY === null) eyeY = (g.boundingBox.min.y + g.boundingBox.max.y) / 2;
    g.translate(0, -eyeY, 0); // pivot at eye center so blinking squashes in place
    eyes.add(new THREE.Mesh(g, eyeMat));
  });
  eyes.position.y = eyeY;
  group.add(eyes);
  const s = height / (body.boundingBox.max.y - body.boundingBox.min.y);
  group.scale.setScalar(s);
  group.userData = { eyes, bodyMat, eyeY };
  return group;
}

/** Soft blink: call every frame with elapsed seconds. */
export function blink(ghost, t) {
  const phase = t % 4.2;
  const k = phase < 0.12 ? 1 - Math.sin((phase / 0.12) * Math.PI) * 0.9 : 1;
  ghost.userData.eyes.scale.y = k;
}
