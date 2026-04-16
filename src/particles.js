// src/particles.js — fixed-size plankton particle pool, no allocations in update.
import * as THREE from './vendor/three.module.min.js';

const VERT = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = `
  precision highp float;
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function createPlankton(scene, count = 800) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const velocities = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() * 2 - 1) * 0.95;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 0.95;
    positions[i * 3 + 2] = -0.5 + Math.random() * 0.4;
    sizes[i] = 1.5 + Math.random() * 3.5;
    alphas[i] = 0.15 + Math.random() * 0.45;
    velocities[i * 2 + 0] = (Math.random() - 0.5) * 0.0008;
    velocities[i * 2 + 1] = (Math.random() - 0.3) * 0.0006;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uColor: { value: new THREE.Color(0x00E5CC) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.position.z = 1;
  scene.add(points);

  return {
    points, count,
    pullStrength: 0,
    update() {
      const pull = this.pullStrength;
      for (let i = 0; i < count; i++) {
        const x = positions[i * 3 + 0], y = positions[i * 3 + 1];
        let vx = velocities[i * 2 + 0], vy = velocities[i * 2 + 1];
        if (pull > 0) {
          const d = Math.hypot(x, y) + 0.001;
          vx -= (x / d) * pull * 0.0006;
          vy -= (y / d) * pull * 0.0006;
        }
        positions[i * 3 + 0] = x + vx;
        positions[i * 3 + 1] = y + vy;
        if (positions[i * 3 + 0] >  1.0) positions[i * 3 + 0] = -1.0;
        if (positions[i * 3 + 0] < -1.0) positions[i * 3 + 0] =  1.0;
        if (positions[i * 3 + 1] >  1.0) positions[i * 3 + 1] = -1.0;
        if (positions[i * 3 + 1] < -1.0) positions[i * 3 + 1] =  1.0;
      }
      geo.attributes.position.needsUpdate = true;
    },
    setCount(n) {
      for (let i = 0; i < count; i++) {
        alphas[i] = i < n ? (0.15 + Math.random() * 0.45) : 0.0;
      }
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}
