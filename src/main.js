// src/main.js
import * as THREE from './vendor/three.module.min.js';
import { createScene } from './scene.js';
import { loadAssets } from './assets.js';
import { el, clear } from './dom.js';
import { voidVertex, voidFragment } from './shaders/void.glsl.js';
import { cloudsVertex, cloudsFragment } from './shaders/clouds.glsl.js';
import { createTentacles } from './tentacles.js';
import { createKrakenOverlays } from './kraken.js';
import { createPlankton } from './particles.js';
import { createWaves } from './waves.js';
import { createRobots } from './robots.js';
import { mountOverlay } from './overlay.js';
import { startBeadGlints } from './beads.js';
import { createScheduler } from './scheduler.js';
import { createLightning } from './lightning.js';
import { lightningStrike } from './moments/lightning.js';

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

  const voidUniforms = { uTime: { value: 0 } };
  const voidMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: voidVertex, fragmentShader: voidFragment,
      uniforms: voidUniforms, depthWrite: false,
    })
  );
  voidMesh.position.z = -5;
  scene.add(voidMesh);

  const cloudsUniforms = { uTime: { value: 0 } };
  const cloudsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: cloudsVertex, fragmentShader: cloudsFragment,
      uniforms: cloudsUniforms, transparent: true, depthWrite: false,
    })
  );
  cloudsMesh.position.z = -4;
  scene.add(cloudsMesh);

  const heroAspect = assets.kraken.image.width / assets.kraken.image.height;
  const heroW = 1.2;
  const heroH = heroW / heroAspect;
  const hero = new THREE.Mesh(
    new THREE.PlaneGeometry(heroW, heroH),
    new THREE.MeshBasicMaterial({ map: assets.kraken, transparent: true })
  );
  scene.add(hero);

  const tentacles = createTentacles(scene);

  const heroBox = { x: 0, y: 0, w: heroW, h: heroH };
  const krakenOverlays = createKrakenOverlays(scene, heroBox);

  const plankton = createPlankton(scene);
  const waves = createWaves(scene);
  const robots = createRobots(scene);
  const overlay = mountOverlay(document.getElementById('overlay'));
  const beadGlints = startBeadGlints(document.getElementById('overlay'));

  const lightning = createLightning(scene);

  function krakenLurch(scale, dur) {
    const start = performance.now();
    function frame() {
      const e = (performance.now() - start) / 1000;
      if (e >= dur * 2) { hero.scale.set(1, 1, 1); return; }
      const k = e < dur ? e / dur : 2 - e / dur;
      const s = 1 + (scale - 1) * k;
      hero.scale.set(s, s, 1);
      requestAnimationFrame(frame);
    }
    frame();
  }

  function screenShake(amplitudePx, duration) {
    const start = performance.now();
    function frame() {
      const e = (performance.now() - start) / 1000;
      if (e >= duration) { wrap.style.transform = ''; return; }
      const k = 1 - e / duration;
      const dx = (Math.random() - 0.5) * amplitudePx * k * 2;
      const dy = (Math.random() - 0.5) * amplitudePx * k * 2;
      wrap.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(frame);
    }
    frame();
  }

  // Stubs (filled in by Task 21 for postFx, Task 23 for audio)
  const postFx = {
    flash(_a) {}, bloomBoost(_b, _d) {}, desaturate(_a, _d) {}, chromaticBurst(_s) {},
    bloomPass: { enabled: true }, update() {}, composer: { render() { renderer.render(scene, camera); } },
  };
  let audio = null;

  const variants = { lightning: lightningStrike };

  let activeSteps = null;
  let momentStart = 0;
  function runMoment(variantKey) {
    if (!variants[variantKey]) { console.warn('[moment] unknown variant', variantKey); return; }
    const ctx = { plankton, krakenOverlays, lightning, waves, overlay, audio, postFx, krakenLurch, screenShake };
    const { steps } = variants[variantKey](ctx);
    activeSteps = steps.map(s => ({ ...s, fired: false }));
    momentStart = clock.getElapsedTime();
    console.log('[moment]', variantKey, 'started');
  }

  const scheduler = createScheduler({
    weights: { lightning: 30, roar: 20, watching: 15, surge: 15, ink: 15, beat: 5 },
    rng: Math.random,
    intervalMin: 65, intervalMax: 85,
    onMoment: runMoment,
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); scheduler.trigger(); }
  });

  const clock = new THREE.Clock();
  let lastT = 0;
  function loop() {
    const t = clock.getElapsedTime();
    const dt = t - lastT; lastT = t;
    voidUniforms.uTime.value = t;
    cloudsUniforms.uTime.value = t;
    tentacles.update(t);
    krakenOverlays.update(t);
    plankton.update();
    waves.update(t);
    robots.update(t);
    beadGlints.update(dt);
    if (activeSteps) {
      const elapsedM = t - momentStart;
      for (const s of activeSteps) {
        if (!s.fired && elapsedM >= s.t) { s.fired = true; s.fn(); }
      }
    }
    scheduler.tick(dt);
    lightning.update(dt);
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
