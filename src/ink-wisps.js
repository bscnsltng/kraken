// src/ink-wisps.js — continuous ink trails curling from emitter positions.
import * as THREE from 'three';

const VERT = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  precision highp float;
  varying float vAlpha;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(0.05, 0.0, 0.10, a);
  }
`;

export function createInkWisps(scene, count = 150) {
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const alphas    = new Float32Array(count);
  const ages      = new Float32Array(count);
  const lives     = new Float32Array(count);
  const vels      = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    alphas[i] = 0.0;
    ages[i] = lives[i] = 0;
    sizes[i] = 4.0 + Math.random() * 4.0;
    positions[i * 3 + 2] = 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.position.z = 0.5;
  scene.add(points);

  const emitters = new Map();
  let emitterAuto = 0;

  function spawnAt(i, x, y) {
    positions[i * 3 + 0] = x + (Math.random() - 0.5) * 0.02;
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.02;
    vels[i * 2 + 0] = (Math.random() - 0.5) * 0.001;
    vels[i * 2 + 1] = -0.0006 - Math.random() * 0.0006;
    sizes[i] = 4.0 + Math.random() * 5.0;
    ages[i] = 0;
    lives[i] = 2.5 + Math.random() * 2.0;
    alphas[i] = 0.5;
  }

  return {
    points, count,
    update(dt) {
      const emitterList = [...emitters.values()];
      for (let i = 0; i < count; i++) {
        if (lives[i] > 0) {
          ages[i] += dt;
          if (ages[i] >= lives[i]) {
            lives[i] = 0;
            alphas[i] = 0;
          } else {
            const k = ages[i] / lives[i];
            alphas[i] = 0.5 * (1 - k);
            positions[i * 3 + 0] += vels[i * 2 + 0];
            positions[i * 3 + 1] += vels[i * 2 + 1];
            vels[i * 2 + 0] += Math.sin(ages[i] * 4.0 + i) * 0.00003;
          }
        } else if (emitterList.length > 0 && Math.random() < 0.06) {
          const e = emitterList[Math.floor(Math.random() * emitterList.length)];
          const pos = e();
          if (pos) spawnAt(i, pos.x, pos.y);
        }
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
    addEmitter(getPosition) {
      const id = ++emitterAuto;
      emitters.set(id, getPosition);
      return id;
    },
    removeEmitter(id) {
      emitters.delete(id);
    },
  };
}
