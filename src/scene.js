// src/scene.js — scene, camera, renderer, resize handling
import * as THREE from './vendor/three.module.min.js';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080010);
  // Orthographic camera covering [-1, 1] in both axes
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  function resize() {
    const size = Math.min(container.clientWidth, container.clientHeight);
    renderer.setSize(size, size, false);
    renderer.domElement.style.width = size + 'px';
    renderer.domElement.style.height = size + 'px';
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  resize();

  return { scene, camera, renderer, resize };
}
