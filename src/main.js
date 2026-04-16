// src/main.js — Abyssal cinematic orchestration.
import * as THREE from 'three';
import { createScene } from './scene.js';
import { loadAssets } from './assets.js';
import { el, clear } from './dom.js';
import { depthVoidVertex, depthVoidFragment } from './shaders/depth-void.glsl.js';
import { cloudsVertex, cloudsFragment } from './shaders/clouds.glsl.js';
import { createTentacles } from './tentacles.js';
import { createKrakenOverlays } from './kraken.js';
import { createZooplankton } from './zooplankton.js';
import { createMarineSnow } from './marine-snow.js';
import { createOceanSurface } from './ocean-surface.js';
import { createRobots } from './robots-svg.js';
import { mountOverlay } from './overlay.js';
import { startBeadGlints } from './beads.js';
import { createScheduler } from './scheduler.js';
import { createLightning } from './lightning.js';
import { createGodrays } from './godrays.js';
import { createCaustics } from './caustics.js';
import { createInkWisps } from './ink-wisps.js';
import { createPressurePulse } from './pressure-pulse.js';
import { createAmbientEvents } from './ambient-events.js';
import { lightningStrike } from './moments/lightning.js';
import { krakenRoar } from './moments/roar.js';
import { theWatching } from './moments/watching.js';
import { beatDown } from './moments/beat-down.js';
import { borderSurge } from './moments/border-surge.js';
import { inkVertex, inkFragment } from './shaders/ink.glsl.js';
import { inkEruption } from './moments/ink-eruption.js';
import { setupPostProcessing } from './postprocess.js';
import { setupSplash, runBenchmark } from './splash.js';
import { createAudio } from './audio.js';
import { setupDebug } from './debug.js';
import { createWatchdog } from './watchdog.js';
import { setupContextRecovery } from './context-recovery.js';
import { webglOK, showFallback } from './fallback.js';

const wrap = document.getElementById('canvas-wrap');

if (!webglOK()) {
  showFallback();
} else {
  const { scene, camera, renderer, breathingScale } = createScene(wrap);

  (async () => {
    const assetsReady = loadAssets();
    const { audioEnabled } = await setupSplash({ assetsReady });

    let assets;
    try { assets = await assetsReady; } catch (err) { showAssetError(err); return; }

    // Pre-flight: 1s benchmark to seed watchdog level
    const benchFps = await runBenchmark(1000);
    let initialDegradeLevel = 0;
    if (benchFps < 30) initialDegradeLevel = 1;
    console.log('[preflight] benchFps=' + benchFps.toFixed(1) + ', initialDegradeLevel=' + initialDegradeLevel);

    // -10 depth-void
    const voidU = { uTime: { value: 0 } };
    const voidMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: depthVoidVertex, fragmentShader: depthVoidFragment,
        uniforms: voidU, depthWrite: false,
      })
    );
    voidMesh.position.z = -10; scene.add(voidMesh);

    // -8 god-rays
    const godrays = createGodrays(scene);

    // -6 caustics
    const caustics = createCaustics(scene);

    // -4 storm clouds
    const cloudsU = { uTime: { value: 0 } };
    const cloudsMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: cloudsVertex, fragmentShader: cloudsFragment,
        uniforms: cloudsU, transparent: true, depthWrite: false,
      })
    );
    cloudsMesh.position.z = -4; scene.add(cloudsMesh);

    // -3 marine snow
    const marineSnow = createMarineSnow(scene);

    // 0 hero kraken
    const heroAspect = assets.kraken.image.width / assets.kraken.image.height;
    const heroW = 1.2;
    const heroH = heroW / heroAspect;
    const hero = new THREE.Mesh(
      new THREE.PlaneGeometry(heroW, heroH),
      new THREE.MeshBasicMaterial({ map: assets.kraken, transparent: true })
    );
    scene.add(hero);

    // +0.3 eye + hat overlays
    const heroBox = { x: 0, y: 0, w: heroW, h: heroH };
    const krakenOverlays = createKrakenOverlays(scene, heroBox);

    // +0.4 tentacles
    const tentacles = createTentacles(scene);

    // +0.5 ink wisps
    const inkWisps = createInkWisps(scene);
    inkWisps.addEmitter(() => ({ x: -0.15 + (Math.random() - 0.5) * 0.05, y: 0.05 + (Math.random() - 0.5) * 0.05 }));
    inkWisps.addEmitter(() => ({ x:  0.15 + (Math.random() - 0.5) * 0.05, y: 0.05 + (Math.random() - 0.5) * 0.05 }));

    // +0.6 pressure pulse
    const pressurePulse = createPressurePulse(scene);

    // +0.7 zooplankton
    const plankton = createZooplankton(scene);

    // +0.7 ink mesh (Ink Eruption)
    const inkU = { uTime: { value: 0 }, uIntensity: { value: 0 } };
    const inkMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: inkVertex, fragmentShader: inkFragment,
        uniforms: inkU, transparent: true, depthWrite: false,
      })
    );
    inkMesh.position.z = 0.7; scene.add(inkMesh);
    const ink = {
      uniforms: inkU,
      _gen: 0,
      expand(from, to, durationSec) {
        const myGen = ++this._gen;
        const start = performance.now();
        const tick = () => {
          if (myGen !== this._gen) return;
          const e = (performance.now() - start) / 1000;
          if (e >= durationSec) { inkU.uIntensity.value = to; return; }
          inkU.uIntensity.value = from + (to - from) * (e / durationSec);
          requestAnimationFrame(tick);
        };
        tick();
      },
    };

    // +0.9 ocean surface
    const waves = createOceanSurface(scene);

    // +1.0 robots
    const robots = await createRobots(scene);

    // +10 overlay
    const overlay = mountOverlay(document.getElementById('overlay'));

    // +10.5 bead glints
    const beadGlints = startBeadGlints(document.getElementById('overlay'));

    // +0.3 lightning forks
    const lightning = createLightning(scene);

    // Reuse marineSnow for spray/embers stand-ins
    const spray = {
      burst(opts) { marineSnow.redirectUpward(0.8, 60, opts?.y ?? -0.55); },
    };
    const embers = {
      burst(opts) { marineSnow.redirectUpward(1.5, 30, opts?.y ?? 0.95); },
    };
    const residue = {
      release(opts) {
        const id = inkWisps.addEmitter(() => ({
          x: opts?.x ?? 0,
          y: (opts?.y ?? 0) + (Math.random() - 0.5) * 0.2,
        }));
        setTimeout(() => inkWisps.removeEmitter(id), 2000);
      },
    };

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

    const postFx = setupPostProcessing(renderer, scene, camera);

    let audio = null;
    if (audioEnabled) {
      audio = createAudio();
      audio.startStorm();
    }

    const variants = {
      lightning: lightningStrike, roar: krakenRoar, watching: theWatching,
      beat: beatDown, surge: borderSurge, ink: inkEruption,
    };

    let activeSteps = null;
    let activeDuration = 0;
    let momentStart = 0;
    function runMoment(variantKey) {
      if (!variants[variantKey]) { console.warn('[moment] unknown variant', variantKey); return; }
      const ctx = {
        plankton, marineSnow, spray, embers, residue,
        krakenOverlays, lightning, waves, overlay, audio, postFx,
        krakenLurch, screenShake, robots, ink, tentacles,
        godrays, caustics, pressurePulse,
      };
      const { steps, duration } = variants[variantKey](ctx);
      activeSteps = steps.map(s => ({ ...s, fired: false }));
      activeDuration = duration;
      momentStart = clock.getElapsedTime();
      console.log('[moment]', variantKey, 'started');
    }

    const scheduler = createScheduler({
      weights: { lightning: 30, roar: 20, watching: 15, surge: 15, ink: 15, beat: 5 },
      rng: Math.random,
      intervalMin: 80, intervalMax: 100,
      onMoment: runMoment,
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); scheduler.trigger(); }
    });

    const ambient = createAmbientEvents({ pressurePulse, postFx });

    let fpsFrames = 0, fpsLast = performance.now(), fpsCurrent = 60;
    function updateFps() {
      fpsFrames++;
      const now = performance.now();
      if (now - fpsLast >= 1000) {
        fpsCurrent = (fpsFrames * 1000) / (now - fpsLast);
        fpsFrames = 0; fpsLast = now;
      }
    }
    window.__forceMoment = (v) => runMoment(v);

    setupDebug({
      scheduler,
      getFps: () => fpsCurrent,
      getState: () => activeSteps ? 'moment' : 'idle',
    });

    createWatchdog({
      getFps: () => fpsCurrent,
      onDegrade: (lvl, fps) => {
        console.warn('[watchdog] degrade level', lvl, 'avg fps', fps.toFixed(1));
        if (lvl === 1) {
          plankton.setCount(750);
          marineSnow.setCount(300);
          godrays.mesh.visible = false;
          caustics.mesh.visible = false;
        }
        if (lvl === 2) {
          postFx.bloomPass.enabled = false;
          postFx.fxUniforms.uLensDistort.value = 0;
          postFx.fxUniforms.uDepthFog.value = 0;
          postFx.fxUniforms.uCA.value = 0;
        }
        if (lvl === 3) window.__directRender = true;
        if (lvl === 4) window.location.replace('backdrop-mockup.html');
      },
    });

    if (initialDegradeLevel >= 1) {
      plankton.setCount(750);
      marineSnow.setCount(300);
      godrays.mesh.visible = false;
      caustics.mesh.visible = false;
      console.warn('[preflight] applied L1 degrade preemptively');
    }

    setupContextRecovery(renderer.domElement, () => {
      loadAssets().then(reloaded => {
        hero.material.map = reloaded.kraken;
        hero.material.needsUpdate = true;
      }).catch(err => console.error('[ctx] texture reload failed:', err));
    });

    const clock = new THREE.Clock();
    let lastT = 0;
    let paused = false;
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
      if (!paused) lastT = clock.getElapsedTime();
    });

    function loop() {
      if (!paused) {
        updateFps();
        const t = clock.getElapsedTime();
        const dt = t - lastT; lastT = t;

        const sBreath = breathingScale(t);
        scene.scale.set(sBreath, sBreath, 1);

        hero.position.x = Math.sin(t / 7.4) * 0.005 + Math.sin(t / 9.1) * 0.003;
        hero.position.y = Math.cos(t / 8.2) * 0.004;

        voidU.uTime.value = t;
        cloudsU.uTime.value = t;
        inkU.uTime.value = t;
        godrays.update(t);
        caustics.update(t);
        marineSnow.update();
        tentacles.update(t);
        krakenOverlays.update(t);
        plankton.update(t);
        inkWisps.update(dt);
        pressurePulse.update(t);
        waves.update(t);
        robots.update(t);
        beadGlints.update(dt);
        ambient.update(t);
        if (activeSteps) {
          const elapsedM = t - momentStart;
          for (const s of activeSteps) {
            if (!s.fired && elapsedM >= s.t) { s.fired = true; s.fn(); }
          }
          if (elapsedM >= activeDuration) { activeSteps = null; }
        }
        scheduler.tick(dt);
        lightning.update(dt);
        if (window.__directRender) renderer.render(scene, camera);
        else { postFx.update(t); postFx.composer.render(); }
      }
      requestAnimationFrame(loop);
    }
    loop();
    console.log('[kraken] abyssal scene running');
    window.__audioEnabled = audioEnabled;
  })();
}

function showAssetError(err) {
  clear(document.body);
  const box = el('pre', {
    style: { color: '#FFD700', font: '14px monospace', padding: '40px', whiteSpace: 'pre-wrap' },
  }, 'ASSET LOAD FAILED:\n' + err.message);
  document.body.appendChild(box);
}
