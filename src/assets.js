// src/assets.js — PNG preload + verification
import * as THREE from './vendor/three.module.min.js';

const ASSETS = {
  kraken: 'Kraken 43146K Logo.png',
  vex: 'VEX Worlds Logo copy.png',
};

export async function loadAssets() {
  const loader = new THREE.TextureLoader();
  const out = {};
  for (const [key, path] of Object.entries(ASSETS)) {
    out[key] = await new Promise((resolve, reject) => {
      loader.load(
        path,
        (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        () => reject(new Error('Asset failed to load: ' + path))
      );
    });
  }
  return out;
}
