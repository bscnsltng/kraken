// src/caustics.js — animated underwater caustics plane.
import * as THREE from 'three';
import { causticsVertex, causticsFragment } from './shaders/caustics.glsl.js';

export function createCaustics(scene) {
  const u = {
    uTime:          { value: 0 },
    uIntensity:     { value: 0.18 },
    uInkInfluence:  { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: causticsVertex,
      fragmentShader: causticsFragment,
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  mesh.position.z = -2.5;
  scene.add(mesh);

  let intensityTarget = 0.18;
  let intensityRate = 0.05;
  let inkTarget = 0;
  let inkRate = 0.05;

  return {
    mesh, uniforms: u,
    update(t) {
      u.uTime.value = t;
      u.uIntensity.value += (intensityTarget - u.uIntensity.value) * intensityRate;
      u.uInkInfluence.value += (inkTarget - u.uInkInfluence.value) * inkRate;
    },
    intensify(target, holdSec) {
      intensityTarget = target;
      intensityRate = 0.3;
      setTimeout(() => {
        intensityTarget = 0.18;
        intensityRate = 0.04;
      }, holdSec * 1000);
    },
    setInkInfluence(v, rate = 0.05) {
      inkTarget = v;
      inkRate = rate;
    },
  };
}
