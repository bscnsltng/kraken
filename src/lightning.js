// src/lightning.js — branching lightning fork generator
import * as THREE from './vendor/three.module.min.js';

function buildFork(startX, startY, endX, endY, jitter) {
  const points = [[startX, startY]];
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * jitter * (1 - t);
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * jitter * (1 - t);
    points.push([x, y]);
  }
  points.push([endX, endY]);
  return points;
}

export function createLightning(scene, count = 8) {
  const slots = [];
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(8 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0 });
    const line = new THREE.Line(geo, mat);
    line.position.z = 0.3;
    scene.add(line);
    slots.push({ line, geo, mat, life: 0, maxLife: 0 });
  }
  return {
    strike() {
      let used = 0;
      for (const startX of [-0.4, 0.4]) {
        if (used >= slots.length) break;
        const slot = slots[used++];
        const path = buildFork(startX, 0.95, startX * 0.3, 0.1, 0.12);
        const arr = slot.geo.attributes.position.array;
        for (let i = 0; i < path.length; i++) {
          arr[i * 3 + 0] = path[i][0];
          arr[i * 3 + 1] = path[i][1];
          arr[i * 3 + 2] = 0.0;
        }
        slot.geo.setDrawRange(0, path.length);
        slot.geo.attributes.position.needsUpdate = true;
        slot.mat.opacity = 1.0;
        slot.life = 0;
        slot.maxLife = 0.25;
      }
    },
    update(dt) {
      for (const s of slots) {
        if (s.life < s.maxLife) {
          s.life += dt;
          s.mat.opacity = Math.max(0, 1 - s.life / s.maxLife);
        }
      }
    },
  };
}
