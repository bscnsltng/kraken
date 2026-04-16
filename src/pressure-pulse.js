// src/pressure-pulse.js — single radial-ring shader plane that fires pulses on demand.
import * as THREE from 'three';
import { pressureVertex, pressureFragment } from './shaders/pressure.glsl.js';

export function createPressurePulse(scene) {
  const u = {
    uOrigin:    { value: new THREE.Vector2(0.5, 0.55) },
    uPhase:     { value: 1.0 },
    uAmplitude: { value: 0.0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: pressureVertex,
      fragmentShader: pressureFragment,
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  mesh.position.z = 0.6;
  scene.add(mesh);

  let pulseStart = -1;
  let pulseDuration = 1.4;
  let pulseAmp = 0.0;

  return {
    mesh, uniforms: u,
    update(t) {
      if (pulseStart < 0) return;
      const elapsed = t - pulseStart;
      if (elapsed >= pulseDuration) {
        u.uAmplitude.value = 0;
        pulseStart = -1;
        return;
      }
      u.uPhase.value = elapsed / pulseDuration;
      u.uAmplitude.value = pulseAmp;
    },
    pulse(originX, originY, amplitude = 0.6, durationSec = 1.4, t0 = performance.now() / 1000) {
      u.uOrigin.value.set(originX, originY);
      pulseStart = t0;
      pulseDuration = durationSec;
      pulseAmp = amplitude;
    },
  };
}
