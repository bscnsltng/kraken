// src/zooplankton.js — bioluminescent zooplankton particle pool.
// Replaces src/particles.js. Same public API plus per-particle color/pulse.
import * as THREE from 'three';

const VERT = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPulsePhase;
  attribute vec3  aColor;
  varying float vAlpha;
  varying vec3  vColor;
  uniform float uTime;
  void main() {
    float pulse = 0.5 + 0.5 * sin((uTime + aPulsePhase) * 1.6);
    vAlpha = aAlpha * (0.55 + 0.45 * pulse);
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  precision highp float;
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

const COLOR_PALETTE = [
  [0.0, 0.9, 0.8],
  [1.0, 0.84, 0.0],
  [0.45, 0.05, 0.85]
];

export function createZooplankton(scene, count = 120) {
  const positions   = new Float32Array(count * 3);
  const sizes       = new Float32Array(count);
  const alphas      = new Float32Array(count);
  const phases      = new Float32Array(count);
  const colors      = new Float32Array(count * 3);
  const velocities  = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() * 2 - 1) * 0.95;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 0.95;
    positions[i * 3 + 2] = -0.5 + Math.random() * 0.4;
    sizes[i] = 1.2 + Math.random() * 2.5;
    alphas[i] = 0.08 + Math.random() * 0.22;
    phases[i] = Math.random() * 12.0;
    const c = COLOR_PALETTE[Math.floor(Math.random() * 3)];
    colors[i * 3 + 0] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
    velocities[i * 2 + 0] = (Math.random() - 0.5) * 0.0008;
    velocities[i * 2 + 1] = (Math.random() - 0.3) * 0.0006;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geo.setAttribute('aPulsePhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uTime: { value: 0 } },
    // NormalBlending (not Additive) so overlapping motes don't pile up to
    // white bokeh-balls; each particle reads on its own.
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.position.z = 0.7;
  scene.add(points);

  return {
    points, count,
    pullStrength: 0,
    update(t) {
      mat.uniforms.uTime.value = t;
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
