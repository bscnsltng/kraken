// src/robots-svg.js — robot silhouettes loaded from PNGs (DALL-E-generated).
// Replaces src/robots.js. Same public API: createRobots(scene) returns
// { robots, update(t), spinOne() } and ALSO adds dragOne(targetXY, durationSec).
//
// PNGs at src/art/robot-1.png and src/art/robot-2.png. If absent, falls back to
// a placeholder gray-purple square so dev preview doesn't crash.
import * as THREE from 'three';

function loadOrPlaceholder(url) {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#2a005a';
        ctx.fillRect(8, 8, 48, 48);
        ctx.strokeStyle = '#6B0AC9';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 48, 48);
        const placeholder = new THREE.CanvasTexture(c);
        placeholder.minFilter = THREE.LinearFilter;
        placeholder.magFilter = THREE.LinearFilter;
        resolve(placeholder);
      }
    );
  });
}

export async function createRobots(scene) {
  const [tex1, tex2] = await Promise.all([
    loadOrPlaceholder('src/art/robot-1.png'),
    loadOrPlaceholder('src/art/robot-2.png'),
  ]);
  const w = 0.18, h = 0.24;

  const robots = [];
  for (const [sign, tex] of [[-1, tex1], [1, tex2]]) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(sign * 0.65, -0.78, 1.0);
    mesh.rotation.z = sign * -0.35;
    scene.add(mesh);

    const ghosts = [];
    for (let g = 1; g <= 3; g++) {
      const ghostMat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.0,
      });
      const ghost = new THREE.Mesh(new THREE.PlaneGeometry(w, h), ghostMat);
      ghost.position.copy(mesh.position);
      ghost.rotation.copy(mesh.rotation);
      scene.add(ghost);
      ghosts.push({ mesh: ghost, mat: ghostMat });
    }

    robots.push({
      mesh,
      ghosts,
      sign,
      baseRot: mesh.rotation.z,
      basePos: mesh.position.clone(),
      jitterPeriod: 7.0 + Math.random() * 2.0,
      jitterPhase: Math.random() * Math.PI * 2,
      spinExtra: 0,
      dragOffset: { x: 0, y: 0 },
    });
  }

  return {
    robots,
    update(t) {
      for (const r of robots) {
        const j = Math.sin((t / r.jitterPeriod) * Math.PI * 2 + r.jitterPhase) * 0.035;
        r.mesh.rotation.z = r.baseRot + j + r.spinExtra;
        r.mesh.position.x = r.basePos.x + r.dragOffset.x;
        r.mesh.position.y = r.basePos.y + r.dragOffset.y;
        for (let g = 0; g < r.ghosts.length; g++) {
          const lag = (g + 1) * 0.06;
          r.ghosts[g].mesh.position.x = r.basePos.x + r.dragOffset.x * (1 - lag);
          r.ghosts[g].mesh.position.y = r.basePos.y + r.dragOffset.y * (1 - lag) + lag * 0.06;
          r.ghosts[g].mesh.rotation.z = r.mesh.rotation.z;
          const motion = Math.hypot(r.dragOffset.x, r.dragOffset.y);
          r.ghosts[g].mat.opacity = motion > 0.02 ? 0.35 * (1 - g * 0.3) : 0;
        }
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
    dragOne(targetXY, durationSec) {
      const r = robots[Math.floor(Math.random() * robots.length)];
      const dx = targetXY.x - r.basePos.x;
      const dy = targetXY.y - r.basePos.y;
      const start = performance.now();
      const totalMs = durationSec * 2 * 1000;
      const tick = () => {
        const e = performance.now() - start;
        if (e >= totalMs) {
          r.dragOffset.x = 0; r.dragOffset.y = 0;
          return;
        }
        const halfMs = totalMs / 2;
        const k = e < halfMs ? (e / halfMs) : (1 - (e - halfMs) / halfMs);
        const ease = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k);
        r.dragOffset.x = dx * ease;
        r.dragOffset.y = dy * ease;
        requestAnimationFrame(tick);
      };
      tick();
    },
  };
}
