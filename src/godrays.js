// src/godrays.js — volumetric god-rays plane with intensity + sweep animation.
import * as THREE from 'three';
import { godraysVertex, godraysFragment } from './shaders/godrays.glsl.js';

export function createGodrays(scene) {
  const u = {
    uTime:      { value: 0 },
    uIntensity: { value: 1.0 },
    uSweep:     { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: godraysVertex,
      fragmentShader: godraysFragment,
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  mesh.position.z = -3;
  scene.add(mesh);

  let intensityTarget = 1.0;
  let intensityRate = 0.05;

  return {
    mesh, uniforms: u,
    update(t) {
      u.uTime.value = t;
      u.uSweep.value = Math.sin((t / 60.0) * Math.PI * 2);
      u.uIntensity.value += (intensityTarget - u.uIntensity.value) * intensityRate;
    },
    flare(target, holdSec) {
      intensityTarget = target;
      intensityRate = 0.3;
      setTimeout(() => {
        intensityTarget = 1.0;
        intensityRate = 0.04;
      }, holdSec * 1000);
    },
  };
}
