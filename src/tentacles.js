// src/tentacles.js — six tentacles around the kraken with independent sway
import * as THREE from './vendor/three.module.min.js';
import { tentacleVertex, tentacleFragment } from './shaders/multi-segment-tentacle.glsl.js';

const ROYAL = new THREE.Color(0x6B0AC9);
const TEAL  = new THREE.Color(0x00E5CC);

// Foreground corner tentacles (z=+0.3, in front of hero body)
const CORNER_SPECS = [
  { pivot: [-0.13,  0.13], target: [-0.95,  0.92], width: 0.05, period: 4.2, phase: 0.00, amp: 0.04, lower: false },
  { pivot: [ 0.13,  0.13], target: [ 0.95,  0.92], width: 0.05, period: 3.8, phase: 0.15, amp: 0.04, lower: false },
  { pivot: [-0.13, -0.13], target: [-0.95, -0.62], width: 0.04, period: 5.1, phase: 0.27, amp: 0.05, lower: true  },
  { pivot: [ 0.13, -0.13], target: [ 0.95, -0.62], width: 0.04, period: 4.7, phase: 0.07, amp: 0.05, lower: true  },
];

// Distant side tentacles (z=-2, behind the kraken)
const SIDE_SPECS = [
  { pivot: [-0.20,  0.00], target: [-0.95,  0.00], width: 0.03, period: 6.0, phase: 0.21, amp: 0.03, lower: false },
  { pivot: [ 0.20,  0.00], target: [ 0.95,  0.05], width: 0.03, period: 5.5, phase: 0.36, amp: 0.03, lower: false },
];

function buildMesh(s, z, scene) {
  const dx = s.target[0] - s.pivot[0];
  const dy = s.target[1] - s.pivot[1];
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const geo = new THREE.PlaneGeometry(len, s.width, 32, 1);
  geo.translate(len / 2, 0, 0);
  const mat = new THREE.ShaderMaterial({
    vertexShader: tentacleVertex, fragmentShader: tentacleFragment,
    uniforms: {
      uTime:     { value: 0 },
      uPhase:    { value: s.phase },
      uPeriod:   { value: s.period },
      uAmp:      { value: s.amp },
      uPivot:    { value: new THREE.Vector2(0, 0) },
      uColor:    { value: ROYAL.clone() },
      uEdge:     { value: TEAL.clone() },
      uExtraRot: { value: 0.0 },
    },
    transparent: true, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(s.pivot[0], s.pivot[1], z);
  mesh.rotation.z = angle;
  scene.add(mesh);
  return { mesh, mat, spec: s };
}

export function createTentacles(scene) {
  const cornerMeshes = CORNER_SPECS.map(s => buildMesh(s, 0.3, scene));
  const sideMeshes   = SIDE_SPECS.map(s => buildMesh(s, -2.0, scene));
  const allMeshes    = [...cornerMeshes, ...sideMeshes];
  const lowerMeshes  = cornerMeshes.filter(m => m.spec.lower);

  function animateExtraRot(targets, targetRot, durationSec) {
    const start = performance.now();
    const origRots = targets.map(m => m.mat.uniforms.uExtraRot.value);
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= durationSec) {
        for (const m of targets) m.mat.uniforms.uExtraRot.value = 0.0;
        return;
      }
      // ease in over 15% then ease out over rest
      const k = e / durationSec;
      const env = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      for (let i = 0; i < targets.length; i++) {
        targets[i].mat.uniforms.uExtraRot.value = origRots[i] + targetRot * env;
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  function animateAmpBoost(targets, boostMul, durationSec) {
    const baseAmps = targets.map(m => m.spec.amp);
    const start = performance.now();
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= durationSec) {
        for (let i = 0; i < targets.length; i++) {
          targets[i].mat.uniforms.uAmp.value = baseAmps[i];
        }
        return;
      }
      const k = e / durationSec;
      const env = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
      for (let i = 0; i < targets.length; i++) {
        targets[i].mat.uniforms.uAmp.value = baseAmps[i] * (1 + (boostMul - 1) * env);
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  return {
    meshes: allMeshes,
    update(t) { for (const m of allMeshes) m.mat.uniforms.uTime.value = t; },

    // Distant tentacles increase amp temporarily (behind the kraken, atmospheric curl)
    curlForward(durationSec) {
      animateAmpBoost(sideMeshes, 2.0, durationSec);
    },

    // Foreground tentacles spike extraRot toward camera corners over ~150ms then relax
    snapForward(durationSec) {
      animateExtraRot(cornerMeshes, 0.35, durationSec);
    },

    // Two lower foreground tentacles rotate downward briefly then ease back
    slamLower(durationSec) {
      animateExtraRot(lowerMeshes, -0.3, durationSec);
    },
  };
}
