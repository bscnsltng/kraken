// src/marine-accents.js — slow-drifting sea creatures in the deep layer.
// Loads the 3 transparent-PNG accents from src/art/ and gives each its
// own gentle motion pattern so the abyssal scene feels populated.
import * as THREE from 'three';

// Each accent drifts across the canvas on a slow cycle, bobs vertically,
// and fades at the far edges. Different creatures get different motion
// signatures so they don't read as identical.
const ACCENTS = [
  {
    name: 'jellyfish',
    path: 'src/art/accent-jellyfish.png',
    size: 0.28,
    cycleSec: 72,      // full left-to-right crossing in ~72s
    yBase: 0.45,       // hangs upper-middle
    yAmplitude: 0.05,
    yPeriod: 6,        // slow vertical bob
    z: -1.6,
    scalePulsePeriod: 4,  // jellyfish "breathes" slightly
    scalePulseAmp: 0.08,
    direction: 1,
  },
  {
    name: 'anglerfish',
    path: 'src/art/accent-anglerfish.png',
    size: 0.22,
    cycleSec: 95,
    yBase: -0.05,      // middle-lower
    yAmplitude: 0.03,
    yPeriod: 11,
    z: -1.5,
    scalePulsePeriod: 0,
    scalePulseAmp: 0,
    direction: -1,     // right-to-left
  },
  {
    name: 'squid',
    path: 'src/art/accent-squid.png',
    size: 0.20,
    cycleSec: 58,
    yBase: 0.15,
    yAmplitude: 0.07,
    yPeriod: 8,
    z: -1.7,
    scalePulsePeriod: 0,
    scalePulseAmp: 0,
    direction: 1,
    rotateAmp: 0.15,   // gentle sway rotation
    rotatePeriod: 7,
  },
];

function loadTexture(path) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => {
        console.warn('[marine-accents] failed to load', path);
        resolve(null);
      }
    );
  });
}

export async function createMarineAccents(scene) {
  const accents = [];
  for (const spec of ACCENTS) {
    const tex = await loadTexture(spec.path);
    if (!tex) continue;

    // Preserve aspect ratio from the PNG.
    const aspect = tex.image ? tex.image.width / tex.image.height : 1.0;
    const w = spec.size;
    const h = spec.size / aspect;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.z = spec.z;
    scene.add(mesh);

    accents.push({
      mesh, mat, spec,
      phase: Math.random() * spec.cycleSec,
    });
  }

  return {
    accents,
    update(t) {
      for (const a of accents) {
        const s = a.spec;
        // Horizontal cycle: linear pass from off-screen left to off-screen right
        // (or reverse), wrapping.
        const cycleT = ((t + a.phase) % s.cycleSec) / s.cycleSec;  // 0..1
        const xStart = -1.25;
        const xEnd = 1.25;
        const x = s.direction > 0
          ? xStart + (xEnd - xStart) * cycleT
          : xEnd - (xEnd - xStart) * cycleT;
        a.mesh.position.x = x;

        // Vertical bob
        a.mesh.position.y = s.yBase + s.yAmplitude * Math.sin((t / s.yPeriod) * Math.PI * 2);

        // Opacity fade at canvas edges (past ±0.95).
        const edgeFade = Math.max(0, 1 - Math.max(0, Math.abs(x) - 0.85) / 0.40);
        a.mat.opacity = 0.65 * edgeFade;

        // Optional gentle scale pulse (jellyfish only)
        if (s.scalePulsePeriod > 0 && s.scalePulseAmp > 0) {
          const pulse = 1 + s.scalePulseAmp * Math.sin((t / s.scalePulsePeriod) * Math.PI * 2);
          a.mesh.scale.set(pulse, pulse, 1);
        }

        // Optional gentle rotation (squid only)
        if (s.rotateAmp && s.rotatePeriod) {
          a.mesh.rotation.z = s.rotateAmp * Math.sin((t / s.rotatePeriod) * Math.PI * 2);
        }
      }
    },
  };
}
