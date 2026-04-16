// src/ocean-surface.js — full bottom-25% animated ocean surface.
// Replaces src/waves.js. Same public surface: createOceanSurface(scene)
// returns { mesh, uniforms, update(t), setRipple(v) }.
import * as THREE from 'three';
import { oceanVertex, oceanFragment } from './shaders/ocean-surface.glsl.js';

export function createOceanSurface(scene) {
  const u = {
    uTime:   { value: 0 },
    uRipple: { value: 0 },
  };
  // Taller than the original 0.5 (25% of canvas) — now 0.76 (38%) so the
  // kraken has a real pool of water to rise from instead of standing over a
  // thin horizontal strip. More Y segments so the vertex displacement reads
  // smoothly across the bigger surface.
  const geo = new THREE.PlaneGeometry(2, 0.76, 96, 12);
  const mat = new THREE.ShaderMaterial({
    vertexShader: oceanVertex,
    fragmentShader: oceanFragment,
    uniforms: u,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, -0.62, 0.9);
  scene.add(mesh);

  let rippleTarget = 0;
  return {
    mesh, uniforms: u,
    update(t) {
      u.uTime.value = t;
      u.uRipple.value += (rippleTarget - u.uRipple.value) * 0.08;
    },
    setRipple(v) { rippleTarget = v; },
  };
}
