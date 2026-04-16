// src/marine-snow.js — continuously drifting marine snow particles.
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
  uniform vec3 uColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function createMarineSnow(scene, count = 100) {
  const positions  = new Float32Array(count * 3);
  const sizes      = new Float32Array(count);
  const alphas     = new Float32Array(count);
  const velocities = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() * 2 - 1) * 0.95;
    positions[i * 3 + 1] = Math.random() * 2 - 1;
    positions[i * 3 + 2] = -0.5 + Math.random() * 0.4;
    sizes[i] = 1.0 + Math.random() * 2.5;
    alphas[i] = 0.06 + Math.random() * 0.16;
    velocities[i * 2 + 0] = (Math.random() - 0.5) * 0.0005;
    velocities[i * 2 + 1] = -0.0008 - Math.random() * 0.0010;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uColor: { value: new THREE.Color(0xCCDDFF) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.position.z = -1.8;
  scene.add(points);

  const bubbleEnd = new Float32Array(count);
  const baseVy    = velocities.slice();

  return {
    points, count,
    update() {
      const now = performance.now() / 1000;
      for (let i = 0; i < count; i++) {
        const x = positions[i * 3 + 0], y = positions[i * 3 + 1];
        if (bubbleEnd[i] > 0 && now > bubbleEnd[i]) {
          velocities[i * 2 + 0] = baseVy[i * 2 + 0];
          velocities[i * 2 + 1] = baseVy[i * 2 + 1];
          sizes[i] = 1.0 + Math.random() * 2.5;
          bubbleEnd[i] = 0;
        }
        positions[i * 3 + 0] = x + velocities[i * 2 + 0];
        positions[i * 3 + 1] = y + velocities[i * 2 + 1];
        if (positions[i * 3 + 1] < -1.05) {
          positions[i * 3 + 1] =  1.0;
          positions[i * 3 + 0] = (Math.random() * 2 - 1) * 0.95;
        }
        if (positions[i * 3 + 0] >  1.05) positions[i * 3 + 0] = -1.0;
        if (positions[i * 3 + 0] < -1.05) positions[i * 3 + 0] =  1.0;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
    setCount(n) {
      for (let i = 0; i < count; i++) {
        alphas[i] = i < n ? (0.06 + Math.random() * 0.16) : 0.0;
      }
      geo.attributes.aAlpha.needsUpdate = true;
    },
    redirectUpward(durationSec, count2 = 120, originY = -0.2) {
      const end = performance.now() / 1000 + durationSec;
      let used = 0;
      for (let i = 0; i < count && used < count2; i++) {
        if (bubbleEnd[i] === 0) {
          positions[i * 3 + 1] = originY + (Math.random() - 0.5) * 0.06;
          velocities[i * 2 + 0] = (Math.random() - 0.5) * 0.0010;
          velocities[i * 2 + 1] = 0.0035 + Math.random() * 0.0035;
          sizes[i] = 3.0 + Math.random() * 3.0;
          bubbleEnd[i] = end;
          used++;
        }
      }
    },
  };
}
