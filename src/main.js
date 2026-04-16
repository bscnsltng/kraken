// src/main.js
import * as THREE from './vendor/three.module.min.js';
import { createScene } from './scene.js';
import { loadAssets } from './assets.js';
import { el, clear } from './dom.js';

const wrap = document.getElementById('canvas-wrap');
const { scene, camera, renderer } = createScene(wrap);

(async () => {
  let assets;
  try {
    assets = await loadAssets();
  } catch (err) {
    showAssetError(err);
    return;
  }

  const heroAspect = assets.kraken.image.width / assets.kraken.image.height;
  const heroW = 1.2;
  const heroH = heroW / heroAspect;
  const hero = new THREE.Mesh(
    new THREE.PlaneGeometry(heroW, heroH),
    new THREE.MeshBasicMaterial({ map: assets.kraken, transparent: true })
  );
  scene.add(hero);

  function loop() {
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  console.log('[kraken] assets loaded, hero on stage');
})();

function showAssetError(err) {
  clear(document.body);
  const box = el('pre', {
    style: { color: '#FFD700', font: '14px monospace', padding: '40px', whiteSpace: 'pre-wrap' },
  }, 'ASSET LOAD FAILED:\n' + err.message);
  document.body.appendChild(box);
}
