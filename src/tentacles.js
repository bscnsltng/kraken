// src/tentacles.js — six tentacles around the kraken with independent sway
import * as THREE from './vendor/three.module.min.js';
import { tentacleVertex, tentacleFragment } from './shaders/tentacles.glsl.js';

const ROYAL = new THREE.Color(0x6B0AC9);
const TEAL  = new THREE.Color(0x00E5CC);

const SPECS = [
  { pivot: [-0.13,  0.13], target: [-0.95,  0.92], width: 0.05, period: 4.2, phase: 0.00, amp: 0.04 },
  { pivot: [ 0.13,  0.13], target: [ 0.95,  0.92], width: 0.05, period: 3.8, phase: 0.15, amp: 0.04 },
  { pivot: [-0.13, -0.13], target: [-0.95, -0.62], width: 0.04, period: 5.1, phase: 0.27, amp: 0.05 },
  { pivot: [ 0.13, -0.13], target: [ 0.95, -0.62], width: 0.04, period: 4.7, phase: 0.07, amp: 0.05 },
  { pivot: [-0.20,  0.00], target: [-0.95,  0.00], width: 0.03, period: 6.0, phase: 0.21, amp: 0.03 },
  { pivot: [ 0.20,  0.00], target: [ 0.95,  0.05], width: 0.03, period: 5.5, phase: 0.36, amp: 0.03 },
];

export function createTentacles(scene) {
  const meshes = [];
  for (const s of SPECS) {
    const dx = s.target[0] - s.pivot[0];
    const dy = s.target[1] - s.pivot[1];
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const geo = new THREE.PlaneGeometry(len, s.width, 32, 1);
    geo.translate(len / 2, 0, 0);
    const mat = new THREE.ShaderMaterial({
      vertexShader: tentacleVertex, fragmentShader: tentacleFragment,
      uniforms: {
        uTime:   { value: 0 },
        uPhase:  { value: s.phase },
        uPeriod: { value: s.period },
        uAmp:    { value: s.amp },
        uPivot:  { value: new THREE.Vector2(0, 0) },
        uColor:  { value: ROYAL.clone() },
        uEdge:   { value: TEAL.clone() },
      },
      transparent: true, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(s.pivot[0], s.pivot[1], -2);
    mesh.rotation.z = angle;
    scene.add(mesh);
    meshes.push({ mesh, mat, spec: s });
  }
  return {
    meshes,
    update(t) { for (const m of meshes) m.mat.uniforms.uTime.value = t; },
  };
}
