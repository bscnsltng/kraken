// src/main.js
import * as THREE from './vendor/three.module.min.js';
import { createScene } from './scene.js';

const wrap = document.getElementById('canvas-wrap');
const { scene, camera, renderer } = createScene(wrap);

function loop() {
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
console.log('[kraken] scene running');
