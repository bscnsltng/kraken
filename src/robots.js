// src/robots.js — two stylized robot sprites at the bottom corners
import * as THREE from './vendor/three.module.min.js';

function makeRobotTexture() {
  const c = document.createElement('canvas');
  c.width = 96; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a005a'; ctx.strokeStyle = '#6B0AC9'; ctx.lineWidth = 2;
  ctx.fillRect(20, 30, 56, 50); ctx.strokeRect(20, 30, 56, 50);
  ctx.fillRect(28, 8, 40, 24);  ctx.strokeRect(28, 8, 40, 24);
  ctx.fillStyle = '#00E5CC';
  ctx.beginPath(); ctx.arc(38, 20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(58, 20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0033';
  ctx.fillRect(8, 36, 12, 36);  ctx.strokeRect(8, 36, 12, 36);
  ctx.fillRect(76, 36, 12, 36); ctx.strokeRect(76, 36, 12, 36);
  ctx.fillRect(28, 84, 14, 36); ctx.strokeRect(28, 84, 14, 36);
  ctx.fillRect(54, 84, 14, 36); ctx.strokeRect(54, 84, 14, 36);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function createRobots(scene) {
  const tex = makeRobotTexture();
  const baseMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const w = 0.18, h = 0.24;
  const robots = [];
  for (const sign of [-1, 1]) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), baseMat.clone());
    mesh.position.set(sign * 0.65, -0.78, 0.4);
    mesh.rotation.z = sign * -0.35;
    scene.add(mesh);
    robots.push({
      mesh,
      baseRot: mesh.rotation.z,
      jitterPeriod: 7.0 + Math.random() * 2.0,
      jitterPhase: Math.random() * Math.PI * 2,
      spinExtra: 0,
    });
  }
  return {
    robots,
    update(t) {
      for (const r of robots) {
        const j = Math.sin((t / r.jitterPeriod) * Math.PI * 2 + r.jitterPhase) * 0.035;
        r.mesh.rotation.z = r.baseRot + j + r.spinExtra;
      }
    },
    spinOne() {
      const r = robots[Math.floor(Math.random() * robots.length)];
      const start = performance.now();
      const dur = 1500;
      const tick = () => {
        const e = performance.now() - start;
        if (e >= dur) { r.spinExtra = 0; return; }
        r.spinExtra = (e / dur) * Math.PI * 2;
        requestAnimationFrame(tick);
      };
      tick();
    },
  };
}
