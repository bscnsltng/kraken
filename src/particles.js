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

function makeBurstPool(scene, count, color, baseSize, lifetime) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 2);
  const ages      = new Float32Array(count);
  const alphas    = new Float32Array(count);
  const sizes     = new Float32Array(count);
  // start all dormant
  for (let i = 0; i < count; i++) { alphas[i] = 0; ages[i] = lifetime; }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas, 1));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uColor: { value: new THREE.Color(color) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.position.z = 0.8;
  scene.add(points);

  return {
    points, geo, positions, velocities, ages, alphas, sizes,
    lifetime,
    baseSize,
    count,
  };
}

// --- Spray: white/teal motes burst from wave line, ~1.2s lifetime ---
export function createSpray(scene, count = 200) {
  const pool = makeBurstPool(scene, count, 0xAAFFFF, 2.5, 1.2);
  const { positions, velocities, ages, alphas, sizes, geo, lifetime, baseSize } = pool;

  return {
    burst({ x = 0, y = -0.55 } = {}) {
      for (let i = 0; i < count; i++) {
        ages[i] = 0;
        alphas[i] = 0.9;
        sizes[i] = baseSize + Math.random() * 2.5;
        const spread = 0.8;
        positions[i * 3 + 0] = x + (Math.random() * 2 - 1) * spread;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = 0;
        const speed = 0.18 + Math.random() * 0.22;
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.9;
        velocities[i * 2 + 0] = Math.cos(angle) * speed;
        velocities[i * 2 + 1] = Math.sin(angle) * speed;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < count; i++) {
        if (alphas[i] === 0) continue;
        ages[i] += dt;
        if (ages[i] >= lifetime) {
          alphas[i] = 0;
          velocities[i * 2 + 0] = 0;
          velocities[i * 2 + 1] = 0;
          continue;
        }
        const k = ages[i] / lifetime;
        alphas[i] = 0.9 * (1 - k);
        positions[i * 3 + 0] += velocities[i * 2 + 0] * dt;
        positions[i * 3 + 1] += velocities[i * 2 + 1] * dt;
        // gentle drag
        velocities[i * 2 + 0] *= 0.98;
        velocities[i * 2 + 1] *= 0.98;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}

// --- Embers: gold motes float up from lightning impact points, ~2s lifetime ---
export function createEmbers(scene, count = 150) {
  const pool = makeBurstPool(scene, count, 0xFFD700, 2.0, 2.0);
  const { positions, velocities, ages, alphas, sizes, geo, lifetime, baseSize } = pool;

  return {
    burst({ x = 0, y = 0 } = {}) {
      // pick up to count/2 idle particles per burst call so two bursts share the pool
      const half = Math.ceil(count / 2);
      let activated = 0;
      for (let i = 0; i < count && activated < half; i++) {
        if (alphas[i] > 0) continue; // already live
        ages[i] = 0;
        alphas[i] = 1.0;
        sizes[i] = baseSize + Math.random() * 3.0;
        const spread = 0.06;
        positions[i * 3 + 0] = x + (Math.random() * 2 - 1) * spread;
        positions[i * 3 + 1] = y + Math.random() * 0.04;
        positions[i * 3 + 2] = 0;
        const speed = 0.04 + Math.random() * 0.10;
        const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5;
        velocities[i * 2 + 0] = Math.cos(angle) * speed;
        velocities[i * 2 + 1] = Math.sin(angle) * speed;
        activated++;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < count; i++) {
        if (alphas[i] === 0) continue;
        ages[i] += dt;
        if (ages[i] >= lifetime) {
          alphas[i] = 0;
          velocities[i * 2 + 0] = 0;
          velocities[i * 2 + 1] = 0;
          continue;
        }
        const k = ages[i] / lifetime;
        alphas[i] = 1.0 * (1 - k * k);
        // gentle upward float + horizontal drift
        velocities[i * 2 + 1] += 0.003 * dt; // mild gravity-reverse
        positions[i * 3 + 0] += velocities[i * 2 + 0] * dt;
        positions[i * 3 + 1] += velocities[i * 2 + 1] * dt;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}

// --- Bioluminescent residue: 300 teal motes drift from kraken center, ~4s lifetime ---
export function createResidue(scene, count = 300) {
  const pool = makeBurstPool(scene, count, 0x00E5CC, 1.8, 4.0);
  const { positions, velocities, ages, alphas, sizes, geo, lifetime, baseSize } = pool;

  return {
    release({ x = 0, y = 0.05 } = {}) {
      for (let i = 0; i < count; i++) {
        ages[i] = 0;
        alphas[i] = 0.75;
        sizes[i] = baseSize + Math.random() * 2.0;
        const spread = 0.35;
        positions[i * 3 + 0] = x + (Math.random() * 2 - 1) * spread;
        positions[i * 3 + 1] = y + (Math.random() * 2 - 1) * spread * 0.6;
        positions[i * 3 + 2] = 0;
        const speed = 0.01 + Math.random() * 0.03;
        const angle = Math.random() * Math.PI * 2;
        velocities[i * 2 + 0] = Math.cos(angle) * speed;
        velocities[i * 2 + 1] = Math.sin(angle) * speed;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < count; i++) {
        if (alphas[i] === 0) continue;
        ages[i] += dt;
        if (ages[i] >= lifetime) {
          alphas[i] = 0;
          velocities[i * 2 + 0] = 0;
          velocities[i * 2 + 1] = 0;
          continue;
        }
        const k = ages[i] / lifetime;
        // slow fade, gentle drift
        alphas[i] = 0.75 * (1 - k * k);
        positions[i * 3 + 0] += velocities[i * 2 + 0] * dt;
        positions[i * 3 + 1] += velocities[i * 2 + 1] * dt;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}

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
