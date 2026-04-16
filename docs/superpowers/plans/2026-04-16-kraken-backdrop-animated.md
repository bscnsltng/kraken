# Kraken Animated Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file, GPU-accelerated, animated HTML booth backdrop (`backdrop-final.html`) that loops continuously on a projector for 12+ hours, fires six rotating "moment" variants on a 75-second cadence, and falls back gracefully when WebGL or assets are unavailable.

**Architecture:** Multi-file ES-module development (`src/`) with a `backdrop-dev.html` page that loads modules directly in the browser. A final bundle step (Node script) inlines all sources, vendored Three.js, and image assets into a single `backdrop-final.html`. Three.js + EffectComposer drive a depth-sorted scene; an HTML/CSS overlay sits on top of the canvas for crisp text + Mardi Gras border. A pure-logic moment scheduler is unit-tested via a browser-based runner. Audio is generated entirely via WebAudio synthesis (no asset files). All DOM construction uses safe APIs (`createElement` / `textContent` / `createElementNS`); no string-to-HTML coercion is used anywhere.

**Tech Stack:** HTML5 + CSS3, ES2022 modules, Three.js r160+ (vendored, MIT-licensed), Three.js EffectComposer + UnrealBloomPass, WebAudio API, GLSL ES 3.00, Node 20+ (for the bundle script and scheduler test execution only — runtime requires only a modern browser).

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `backdrop-final.html` | Create (via bundle) | The single-file projected deliverable |
| `backdrop-dev.html` | Create | Dev preview — loads ES modules from `src/` |
| `backdrop-mockup.html` | Unchanged | Existing static mockup, kept as fallback |
| `ai-prompt.md` | Modify | Add top-of-file note about new primary deliverable |
| `CLAUDE.md` | Modify | Reflect new deliverable + dev/bundle workflow |
| `src/vendor/three.module.min.js` | Create (download) | Three.js core, vendored |
| `src/vendor/three-postprocessing.js` | Create (download) | EffectComposer + bloom + supporting passes |
| `src/main.js` | Create | Entry point; wires every module together |
| `src/dom.js` | Create | Tiny safe-DOM helpers used everywhere |
| `src/scene.js` | Create | Scene/camera/renderer setup; resize handling |
| `src/shaders/void.glsl.js` | Create | Background void/sky fragment shader |
| `src/shaders/clouds.glsl.js` | Create | Storm cloud noise shader |
| `src/shaders/tentacles.glsl.js` | Create | Tentacle vertex sway shader |
| `src/shaders/ink.glsl.js` | Create | Ink cloud noise mask shader |
| `src/tentacles.js` | Create | Tentacle geometry + idle sway |
| `src/kraken.js` | Create | Hero logo + eye-pulse + hat-specular overlays |
| `src/particles.js` | Create | Plankton particle pool |
| `src/lightning.js` | Create | Lightning fork generator |
| `src/robots.js` | Create | Robot sprites + tilt jitter |
| `src/waves.js` | Create | Wave line / ocean surface scrolling shader |
| `src/postprocess.js` | Create | EffectComposer chain |
| `src/overlay.js` | Create | HTML/CSS overlay (border, text, tagline pop, surge) |
| `src/beads.js` | Create | Bead-glint scheduler |
| `src/scheduler.js` | Create | Moment scheduler — pure logic, unit-tested |
| `src/moments/lightning.js` | Create | Lightning Strike variant |
| `src/moments/roar.js` | Create | Kraken Roar variant |
| `src/moments/watching.js` | Create | The Watching variant |
| `src/moments/beat-down.js` | Create | Beat-down variant |
| `src/moments/border-surge.js` | Create | Border Surge variant |
| `src/moments/ink-eruption.js` | Create | Ink Eruption variant |
| `src/audio.js` | Create | WebAudio-synthesized storm bed + thunder + growl |
| `src/splash.js` | Create | Splash / start screen + fullscreen flow |
| `src/debug.js` | Create | Hidden debug overlay (D key) |
| `src/watchdog.js` | Create | FPS watchdog + auto-degrade |
| `src/context-recovery.js` | Create | WebGL context loss recovery |
| `src/assets.js` | Create | PNG preload + missing-file handling |
| `src/fallback.js` | Create | WebGL-not-supported fallback page |
| `tests/scheduler.test.html` | Create | Browser test runner for scheduler |
| `scripts/bundle.mjs` | Create | Node bundle script: produces `backdrop-final.html` |

---

## Conventions

- **All paths are relative to the repo root** (the kraken project directory).
- **The repo is not a git repo** (per the system context). Treat each task's file output as the working state. Skip the literal "commit" steps that often appear in TDD plans — they don't apply here. If the repo is later initialized, add commits per task.
- **Browser preview during development:** serve the repo root with `python3 -m http.server 8000` and open `http://localhost:8000/backdrop-dev.html`. ES modules require a real HTTP server — `file://` won't work for the dev page.
- **Color palette** (referenced everywhere): `--void #080010`, `--deep #1A0033`, `--royal #6B0AC9`, `--gold #FFD700`, `--green #00A550`, `--teal #00E5CC`, `--red #CC0000`, `--white #E8E8FF`.
- **Canonical strings** (do not paraphrase): `43146K KRAKEN`, `THEY SAID PUSHBACK.`, `THE KRAKEN SAID NO.`, `BARBE HIGH SCHOOL · LAKE CHARLES, LA`.
- **Hero asset:** `Kraken 43146K Logo.png` — never modified or recolored, only overlaid.
- **VEX asset:** `VEX Worlds Logo copy.png` — bottom-right corner, ~8% canvas width.
- **Safe-DOM rule:** DOM construction uses only `createElement`, `createElementNS`, `textContent`, `appendChild`, `setAttribute`, `classList`, and direct style writes. Never use HTML-string setters or sync HTML insertion APIs. Use the helpers in `src/dom.js` (Task 1).
- **Verification style:** TDD where logic is testable (the scheduler in Task 14). Visual verification via `backdrop-dev.html` for everything else.

---

## Task 1: Project scaffold + safe-DOM helpers

**Files:**
- Create: `src/`, `src/vendor/`, `src/shaders/`, `src/moments/`, `tests/`, `scripts/`
- Create: `src/dom.js`
- Create: `src/main.js`
- Create: `backdrop-dev.html`

- [ ] **Step 1: Create directory structure**

```bash
cd "$(git rev-parse --show-toplevel)"
mkdir -p src/vendor src/shaders src/moments tests scripts
```

- [ ] **Step 2: Create safe-DOM helpers — `src/dom.js`**

```js
// src/dom.js — safe DOM construction.
// All DOM throughout this project is built via these helpers.
const SVG_NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, text) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'id') e.id = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  if (text != null) e.textContent = String(text);
  return e;
}

export function svg(tag, attrs = {}, text) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = String(text);
  return e;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
```

- [ ] **Step 3: Create entry point — `src/main.js`**

```js
// src/main.js — entry point
console.log('[kraken] main.js loaded');
```

- [ ] **Step 4: Create `backdrop-dev.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>43146K KRAKEN — Dev Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #stage { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
    #canvas-wrap { position: relative; aspect-ratio: 1 / 1; height: 100vh; max-width: 100vw; }
    #overlay { position: absolute; inset: 0; pointer-events: none; z-index: 10; font-family: 'Georgia', serif; color: #FFD700; }
    .ovl-team { position: absolute; top: 2%; left: 0; width: 100%; text-align: center; font-size: 5.2vmin; letter-spacing: 0.5vmin; font-weight: bold; text-shadow: 0 0 12px rgba(255,215,0,0.55), 0 2px 6px #080010; }
    .ovl-tagline { position: absolute; bottom: 11%; left: 0; width: 100%; text-align: center; line-height: 1.05; }
    .ovl-tag1 { display: block; font-size: 2.4vmin; letter-spacing: 0.6vmin; font-weight: bold; }
    .ovl-tag2 { display: block; font-size: 3.8vmin; letter-spacing: 0.5vmin; font-weight: 900; text-shadow: 0 0 20px rgba(0,229,204,0.65), 0 0 40px rgba(0,229,204,0.3), 0 2px 6px #080010; transition: transform 240ms ease-out; }
    .ovl-tag2.pop { transform: scale(1.06); }
    .ovl-school { position: absolute; bottom: 5.5%; left: 0; width: 100%; text-align: center; font-size: 1.4vmin; letter-spacing: 0.45vmin; opacity: 0.85; }
    .ovl-vex { position: absolute; bottom: 2.2%; right: 2.2%; width: 8%; filter: drop-shadow(0 0 6px rgba(0,0,0,0.8)); }
    .ovl-border { position: absolute; inset: 0; pointer-events: none; }
    .ovl-border svg { width: 100%; height: 100%; }
    #splash { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; background: radial-gradient(ellipse at center, #1A0033 0%, #080010 80%); font-family: 'Georgia', serif; color: #FFD700; text-align: center; transition: opacity 600ms ease; }
    #splash.hidden { opacity: 0; pointer-events: none; }
    #splash-logo { width: 25vmin; filter: drop-shadow(0 0 20px #00E5CC88); }
    #splash-btn { font-family: 'Georgia', serif; font-size: 4vmin; font-weight: bold; letter-spacing: 0.5vmin; padding: 1.6vmin 4vmin; background: linear-gradient(180deg, #FFD700, #c79a00); color: #1A0033; border: 2px solid #6B0AC9; border-radius: 6px; cursor: pointer; box-shadow: 0 0 30px rgba(255,215,0,0.4); }
    #splash-btn:hover { box-shadow: 0 0 48px rgba(255,215,0,0.7); }
    #splash-toggles { display: flex; gap: 24px; font-size: 1.6vmin; opacity: 0.9; }
    #splash-toggles label { cursor: pointer; }
    #splash-help { font-size: 1.2vmin; opacity: 0.6; letter-spacing: 0.2vmin; }
    kbd { background: #2a005a; border: 1px solid #6B0AC9; border-radius: 3px; padding: 1px 5px; }
    #debug { position: fixed; top: 8px; left: 8px; z-index: 2000; background: rgba(0,0,0,0.75); color: #FFD700; font: 11px monospace; padding: 8px 12px; border: 1px solid #6B0AC9; display: none; pointer-events: auto; user-select: none; line-height: 1.5; }
  </style>
</head>
<body>
  <div id="stage">
    <div id="canvas-wrap">
      <div id="overlay"></div>
    </div>
  </div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Start the dev server and verify**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/backdrop-dev.html`. Devtools console should show `[kraken] main.js loaded`. Page is black; no errors.

---

## Task 2: Vendor Three.js

**Files:**
- Create: `src/vendor/three.module.min.js`
- Create: `src/vendor/three-postprocessing.js`

- [ ] **Step 1: Download Three.js core**

```bash
cd "$(git rev-parse --show-toplevel)/src/vendor"
curl -L -o three.module.min.js "https://unpkg.com/three@0.160.0/build/three.module.min.js"
```

Verify: file is >300 KB.

- [ ] **Step 2: Bundle the post-processing addons**

```bash
cd "$(git rev-parse --show-toplevel)/src/vendor"
{
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/OutputPass.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/shaders/CopyShader.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/shaders/LuminosityHighPassShader.js"; echo
  curl -sL "https://unpkg.com/three@0.160.0/examples/jsm/shaders/OutputShader.js"; echo
} > three-postprocessing-raw.js
```

Then rewrite every `from 'three'` to `from './three.module.min.js'`:

```bash
sed "s|from 'three'|from './three.module.min.js'|g" three-postprocessing-raw.js > three-postprocessing.js
rm three-postprocessing-raw.js
```

- [ ] **Step 3: Verify imports in the browser**

Replace `src/main.js`:

```js
// src/main.js — entry point
import * as THREE from './vendor/three.module.min.js';
import { EffectComposer } from './vendor/three-postprocessing.js';
console.log('[kraken] THREE r' + THREE.REVISION);
console.log('[kraken] EffectComposer:', typeof EffectComposer);
```

Reload the dev page. Console must show `THREE r160` (or higher) and `EffectComposer: function`.

---

## Task 3: Square canvas + renderer + resize

**Files:**
- Create: `src/scene.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/scene.js`**

```js
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
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
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
```

- [ ] **Step 3: Visual verify**

Reload. Expected: a square dark-purple (`#080010`) area centered in the page. Resize: stays square, re-centered.

---

## Task 4: Asset preload + missing-asset handling

**Files:**
- Create: `src/assets.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/assets.js`**

```js
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
```

- [ ] **Step 2: Add hero plane + safe error fallback to `src/main.js`**

Replace `src/main.js`:

```js
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
```

- [ ] **Step 3: Visual verify (positive path)**

Reload. Expected: kraken pirate-octopus logo centered in the dark-purple square, ~60% wide. Console: `[kraken] assets loaded, hero on stage`.

- [ ] **Step 4: Visual verify (negative path)**

Temporarily rename `Kraken 43146K Logo.png` to add `.bak`. Reload. Expected: yellow text "ASSET LOAD FAILED: Asset failed to load: Kraken 43146K Logo.png". Rename back.

---

## Task 5: Void / sky shader

**Files:**
- Create: `src/shaders/void.glsl.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the void shader**

```js
// src/shaders/void.glsl.js — animated void/sky background
export const voidVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const voidFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  void main() {
    vec2 p = vUv;
    vec3 top = vec3(0.10, 0.00, 0.20);
    vec3 mid = vec3(0.04, 0.00, 0.10);
    vec3 bot = vec3(0.03, 0.00, 0.06);
    vec3 col = mix(bot, mid, smoothstep(0.0, 0.5, p.y));
    col = mix(col, top, smoothstep(0.5, 1.0, p.y));
    float n = noise(p * 3.0 + vec2(uTime * 0.02, uTime * 0.01));
    n += 0.5 * noise(p * 6.0 - vec2(uTime * 0.015, 0.0));
    col -= 0.04 * n;
    float r = distance(p, vec2(0.5, 0.55));
    col += 0.10 * vec3(0.42, 0.04, 0.79) * (1.0 - smoothstep(0.0, 0.55, r));
    gl_FragColor = vec4(col, 1.0);
  }
`;
```

- [ ] **Step 2: Add the void plane to `src/main.js`**

In the async block, before adding the hero plane:

```js
import { voidVertex, voidFragment } from './shaders/void.glsl.js';

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
```

Replace the loop with a time-aware version:

```js
const clock = new THREE.Clock();
function loop() {
  const t = clock.getElapsedTime();
  voidUniforms.uTime.value = t;
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
```

- [ ] **Step 3: Visual verify**

Reload. Expected: dark void background with subtle drifting noise ribbons in deep purple, slight radial glow centered behind the kraken.

---

## Task 6: Storm clouds shader

**Files:**
- Create: `src/shaders/clouds.glsl.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the clouds shader**

```js
// src/shaders/clouds.glsl.js — top-zone storm clouds
export const cloudsVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const cloudsFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) { float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;} return v; }
  void main() {
    vec2 p = vUv;
    float a = fbm(p * 2.5 + vec2(uTime * 0.020, 0.0));
    float b = fbm(p * 4.0 - vec2(uTime * 0.035, 0.0));
    float clouds = smoothstep(0.45, 0.85, a * 0.65 + b * 0.45);
    float fade = smoothstep(0.55, 1.0, p.y);
    clouds *= fade;
    gl_FragColor = vec4(vec3(0.16, 0.00, 0.35), clouds * 0.7);
  }
`;
```

- [ ] **Step 2: Add the clouds plane in `src/main.js`**

```js
import { cloudsVertex, cloudsFragment } from './shaders/clouds.glsl.js';

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
```

In the loop, add `cloudsUniforms.uTime.value = t;`.

- [ ] **Step 3: Visual verify**

Reload. Expected: drifting deep-purple cloud blobs in the top quarter of the canvas, two layers moving in opposite directions.

---

## Task 7: Tentacles — geometry + sway shader

**Files:**
- Create: `src/shaders/tentacles.glsl.js`
- Create: `src/tentacles.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the tentacle shader**

```js
// src/shaders/tentacles.glsl.js — vertex sway + fragment taper
export const tentacleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uPeriod;
  uniform float uAmp;
  uniform vec2  uPivot;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float a = sin((uTime / uPeriod + uPhase) * 6.28318) * uAmp;
    float ca = cos(a), sa = sin(a);
    vec2 p = position.xy - uPivot;
    p = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    p += uPivot;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, position.z, 1.0);
  }
`;
export const tentacleFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uEdge;
  void main() {
    float taper = 1.0 - vUv.x;
    float edge = smoothstep(0.4, 1.0, abs(vUv.y - 0.5) * 2.0);
    vec3 col = mix(uColor, uEdge, edge * 0.6);
    float a = taper * (1.0 - edge * 0.3);
    gl_FragColor = vec4(col, a * 0.85);
  }
`;
```

- [ ] **Step 2: Create `src/tentacles.js`**

```js
// src/tentacles.js — six tentacles around the kraken with independent sway
import * as THREE from './vendor/three.module.min.js';
import { tentacleVertex, tentacleFragment } from './shaders/tentacles.glsl.js';

const ROYAL = new THREE.Color(0x6B0AC9);
const TEAL  = new THREE.Color(0x00E5CC);

const SPECS = [
  { pivot: [-0.13,  0.13], target: [-0.95,  0.92], width: 0.05, period: 4.2, phase: 0.00, amp: 0.04 },
  { pivot: [ 0.13,  0.13], target: [ 0.95,  0.92], width: 0.05, period: 3.8, phase: 0.15, amp: 0.04 },
  { pivot: [-0.13, -0.13], target: [-0.95, -0.62], width: 0.04, period: 5.1, phase: 0.27, amp: 0.05 },
  { pivot: [ 0.13, -0.13], target: [ 0.95, -0.62], width: 0.04, period: 4.7, phase: 0.07, amp: 0.05 },
  { pivot: [-0.20,  0.00], target: [-0.95,  0.00], width: 0.03, period: 6.0, phase: 0.21, amp: 0.03 },
  { pivot: [ 0.20,  0.00], target: [ 0.95,  0.05], width: 0.03, period: 5.5, phase: 0.36, amp: 0.03 },
];

export function createTentacles(scene) {
  const meshes = [];
  for (const s of SPECS) {
    const dx = s.target[0] - s.pivot[0];
    const dy = s.target[1] - s.pivot[1];
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const geo = new THREE.PlaneGeometry(len, s.width, 32, 1);
    geo.translate(len / 2, 0, 0);
    const mat = new THREE.ShaderMaterial({
      vertexShader: tentacleVertex, fragmentShader: tentacleFragment,
      uniforms: {
        uTime:   { value: 0 },
        uPhase:  { value: s.phase },
        uPeriod: { value: s.period },
        uAmp:    { value: s.amp },
        uPivot:  { value: new THREE.Vector2(0, 0) },
        uColor:  { value: ROYAL.clone() },
        uEdge:   { value: TEAL.clone() },
      },
      transparent: true, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(s.pivot[0], s.pivot[1], -2);
    mesh.rotation.z = angle;
    scene.add(mesh);
    meshes.push({ mesh, mat, spec: s });
  }
  return {
    meshes,
    update(t) { for (const m of meshes) m.mat.uniforms.uTime.value = t; },
  };
}
```

- [ ] **Step 3: Wire into `src/main.js`**

After the hero plane:

```js
import { createTentacles } from './tentacles.js';
const tentacles = createTentacles(scene);
```

In the loop: `tentacles.update(t);`.

- [ ] **Step 4: Visual verify**

Reload. Expected: six purple tapered tentacles extending from behind the kraken into the canvas edges, each swaying independently with a teal-tinted edge glow.

---

## Task 8: Eye-pulse + hat-specular overlays

**Files:**
- Create: `src/kraken.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/kraken.js`**

```js
// src/kraken.js — eye-pulse overlays and hat-specular sweep on top of the hero PNG
import * as THREE from './vendor/three.module.min.js';

const RED = new THREE.Color(0xCC0000);

const EYE_VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const EYE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uIntensity;
  uniform vec3 uColor;
  void main() {
    float r = distance(vUv, vec2(0.5));
    float a = smoothstep(0.5, 0.0, r) * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }
`;

const HAT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float cycle = mod(uTime, 12.0);
    float sweepPos = (cycle / 0.8) * 1.4 - 0.2;
    float onScreen = step(cycle, 0.8);
    float band = abs((vUv.x + vUv.y) - sweepPos * 2.0);
    float a = smoothstep(0.06, 0.0, band) * onScreen * 0.55;
    gl_FragColor = vec4(1.0, 1.0, 0.85, a);
  }
`;

export function createKrakenOverlays(scene, heroBox) {
  const eyeY = heroBox.y + heroBox.h * 0.10;
  const eyeOffsetX = heroBox.w * 0.10;
  const eyeSize = heroBox.w * 0.085;

  const eyes = [];
  for (const sign of [-1, 1]) {
    const u = { uIntensity: { value: 0.55 }, uColor: { value: RED.clone() } };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(eyeSize, eyeSize),
      new THREE.ShaderMaterial({
        vertexShader: EYE_VERT, fragmentShader: EYE_FRAG, uniforms: u,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    mesh.position.set(heroBox.x + sign * eyeOffsetX, eyeY, 0.5);
    scene.add(mesh);
    eyes.push({ mesh, uniforms: u, baseX: mesh.position.x, baseY: mesh.position.y });
  }

  const hatU = { uTime: { value: 0 } };
  const hatMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(heroBox.w * 0.85, heroBox.h * 0.30),
    new THREE.ShaderMaterial({
      vertexShader: EYE_VERT, fragmentShader: HAT_FRAG, uniforms: hatU,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
  );
  hatMesh.position.set(heroBox.x, heroBox.y + heroBox.h * 0.30, 0.6);
  scene.add(hatMesh);

  return {
    eyes, hatMesh, hatUniforms: hatU,
    update(t) {
      const pulse = 0.55 + 0.15 * Math.sin((t / 2.6) * Math.PI * 2);
      for (const e of eyes) e.uniforms.uIntensity.value = pulse;
      hatU.uTime.value = t;
    },
    setEyeIntensity(v) { for (const e of eyes) e.uniforms.uIntensity.value = v; },
    animateEyeDrift(durationSec) {
      const start = performance.now();
      const tick = () => {
        const e2 = (performance.now() - start) / 1000;
        if (e2 >= durationSec) { for (const eye of eyes) eye.mesh.position.x = eye.baseX; return; }
        const k = e2 / durationSec;
        const off = Math.sin(k * Math.PI * 2) * 0.018;
        for (const eye of eyes) eye.mesh.position.x = eye.baseX + off;
        requestAnimationFrame(tick);
      };
      tick();
    },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

After the hero plane:

```js
import { createKrakenOverlays } from './kraken.js';
const heroBox = { x: 0, y: 0, w: heroW, h: heroH };
const krakenOverlays = createKrakenOverlays(scene, heroBox);
```

In the loop: `krakenOverlays.update(t);`.

- [ ] **Step 3: Visual verify + calibrate**

Reload. Expected: two soft red glows pulsing over the kraken's eyes (~2.6s breathing). Every 12s, a thin diagonal light streak crosses the pirate hat. If the eye glows are misaligned with the painted eyes, adjust `eyeY`, `eyeOffsetX`, `eyeSize` in `src/kraken.js` until they sit centered.

---

## Task 9: Plankton particle system

**Files:**
- Create: `src/particles.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the plankton pool**

```js
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
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { createPlankton } from './particles.js';
const plankton = createPlankton(scene);
```

In the loop: `plankton.update();`.

- [ ] **Step 3: Visual verify**

Reload. Expected: ~800 small teal motes drifting slowly across the canvas, wrapping at edges. No obvious looping over 30s of observation.

---

## Task 10: Wave line / ocean surface

**Files:**
- Create: `src/waves.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/waves.js`**

```js
// src/waves.js — scrolling wave strip
import * as THREE from './vendor/three.module.min.js';

const VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uRipple;
  void main() {
    float y = vUv.y, x = vUv.x;
    float w1 = sin((x * 18.0) + uTime * 1.4);
    float w2 = sin((x * 11.0) - uTime * 0.9);
    float surface = 0.5 + 0.04 * w1 + 0.025 * w2 + 0.06 * uRipple * sin(x * 24.0 - uTime * 3.0);
    float foam = smoothstep(surface - 0.02, surface + 0.005, y);
    float deep = smoothstep(surface + 0.01, 1.0, y);
    vec3 col = mix(vec3(0.05, 0.0, 0.12), vec3(0.02, 0.0, 0.05), deep);
    col += vec3(0.0, 0.18, 0.18) * foam * (0.4 + 0.6 * uRipple);
    float a = smoothstep(surface - 0.03, surface, y) * 0.85;
    gl_FragColor = vec4(col, a);
  }
`;

export function createWaves(scene) {
  const u = { uTime: { value: 0 }, uRipple: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.5),
    new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthWrite: false,
    })
  );
  mesh.position.set(0, -0.55, 0.2);
  scene.add(mesh);
  return {
    mesh, uniforms: u,
    update(t) { u.uTime.value = t; },
    setRipple(v) { u.uRipple.value = v; },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { createWaves } from './waves.js';
const waves = createWaves(scene);
```

In the loop: `waves.update(t);`.

- [ ] **Step 3: Visual verify**

Reload. Expected: a churning wave surface across the bottom-third of the canvas in front of the lower kraken, with subtle teal foam highlights.

---

## Task 11: Robots + tilt jitter + spin

**Files:**
- Create: `src/robots.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/robots.js`**

The robot textures are drawn programmatically into a CanvasTexture so no external file is required.

```js
// src/robots.js — two stylized robot sprites at the bottom corners
import * as THREE from './vendor/three.module.min.js';

function makeRobotTexture() {
  const c = document.createElement('canvas');
  c.width = 96; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a005a'; ctx.strokeStyle = '#6B0AC9'; ctx.lineWidth = 2;
  ctx.fillRect(20, 30, 56, 50); ctx.strokeRect(20, 30, 56, 50);
  ctx.fillRect(28, 8, 40, 24);  ctx.strokeRect(28, 8, 40, 24);
  ctx.fillStyle = '#00E5CC';
  ctx.beginPath(); ctx.arc(38, 20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(58, 20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0033';
  ctx.fillRect(8, 36, 12, 36);  ctx.strokeRect(8, 36, 12, 36);
  ctx.fillRect(76, 36, 12, 36); ctx.strokeRect(76, 36, 12, 36);
  ctx.fillRect(28, 84, 14, 36); ctx.strokeRect(28, 84, 14, 36);
  ctx.fillRect(54, 84, 14, 36); ctx.strokeRect(54, 84, 14, 36);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function createRobots(scene) {
  const tex = makeRobotTexture();
  const baseMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const w = 0.18, h = 0.24;
  const robots = [];
  for (const sign of [-1, 1]) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), baseMat.clone());
    mesh.position.set(sign * 0.65, -0.78, 0.4);
    mesh.rotation.z = sign * -0.35;
    scene.add(mesh);
    robots.push({
      mesh,
      baseRot: mesh.rotation.z,
      jitterPeriod: 7.0 + Math.random() * 2.0,
      jitterPhase: Math.random() * Math.PI * 2,
      spinExtra: 0,
    });
  }
  return {
    robots,
    update(t) {
      for (const r of robots) {
        const j = Math.sin((t / r.jitterPeriod) * Math.PI * 2 + r.jitterPhase) * 0.035;
        r.mesh.rotation.z = r.baseRot + j + r.spinExtra;
      }
    },
    spinOne() {
      const r = robots[Math.floor(Math.random() * robots.length)];
      const start = performance.now();
      const dur = 1500;
      const tick = () => {
        const e = performance.now() - start;
        if (e >= dur) { r.spinExtra = 0; return; }
        r.spinExtra = (e / dur) * Math.PI * 2;
        requestAnimationFrame(tick);
      };
      tick();
    },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { createRobots } from './robots.js';
const robots = createRobots(scene);
```

In the loop: `robots.update(t);`.

- [ ] **Step 3: Visual verify**

Reload. Expected: two purple robot sprites at the bottom-left and bottom-right, slightly tilted, with very subtle constant tilt-jitter.

---

## Task 12: HTML/CSS overlay — text + Mardi Gras border (safe DOM)

**Files:**
- Create: `src/overlay.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/overlay.js` using `el` and `svg` helpers**

```js
// src/overlay.js — HTML/CSS overlay (border + text + tagline pop + border surge).
// Built only via createElement / createElementNS / textContent.
import { el, svg, clear } from './dom.js';

function buildBorder(root) {
  const border = el('div', { class: 'ovl-border' });
  const s = svg('svg', {
    viewBox: '0 0 1000 1000',
    xmlns: 'http://www.w3.org/2000/svg',
    preserveAspectRatio: 'none',
  });
  const defs = svg('defs');
  const beadsH = svg('pattern', { id: 'beads-h', x: '0', y: '0', width: '26', height: '26', patternUnits: 'userSpaceOnUse' });
  beadsH.appendChild(svg('circle', { cx: '6',  cy: '13', r: '5', fill: '#FFD700', opacity: '0.95' }));
  beadsH.appendChild(svg('circle', { cx: '20', cy: '13', r: '5', fill: '#00E5CC', opacity: '0.95' }));
  defs.appendChild(beadsH);
  const beadsV = svg('pattern', { id: 'beads-v', x: '0', y: '0', width: '26', height: '26', patternUnits: 'userSpaceOnUse' });
  beadsV.appendChild(svg('circle', { cx: '13', cy: '6',  r: '5', fill: '#00A550', opacity: '0.95' }));
  beadsV.appendChild(svg('circle', { cx: '13', cy: '20', r: '5', fill: '#FFD700', opacity: '0.95' }));
  defs.appendChild(beadsV);
  s.appendChild(defs);

  s.appendChild(svg('rect', { x: '3', y: '3', width: '994', height: '994', rx: '4', fill: 'none', stroke: '#FFD700', 'stroke-width': '3', opacity: '0.85' }));
  s.appendChild(svg('rect', { x: '10', y: '10', width: '980', height: '980', rx: '3', fill: 'none', stroke: '#6B0AC9', 'stroke-width': '2', opacity: '0.65' }));

  const beadAttrs = { fill: 'url(#beads-h)', rx: '6', opacity: '0.9' };
  s.appendChild(svg('rect', { id: 'bead-top',   x: '56', y: '16',  width: '888', height: '13', ...beadAttrs }));
  s.appendChild(svg('rect', { id: 'bead-bot',   x: '56', y: '971', width: '888', height: '13', ...beadAttrs }));
  const beadAttrsV = { fill: 'url(#beads-v)', rx: '6', opacity: '0.9' };
  s.appendChild(svg('rect', { id: 'bead-left',  x: '16',  y: '56', width: '13', height: '888', ...beadAttrsV }));
  s.appendChild(svg('rect', { id: 'bead-right', x: '971', y: '56', width: '13', height: '888', ...beadAttrsV }));

  const masks = [[22, 48], [978, 48], [22, 990], [978, 990]];
  for (const [x, y] of masks) {
    s.appendChild(svg('text', { x: String(x), y: String(y), 'font-size': '30', 'text-anchor': 'middle', fill: '#FFD700' }, '🎭'));
  }
  s.appendChild(svg('path', { d: 'M 430,30 Q 470,8 500,20 Q 530,8 570,30', fill: 'none', stroke: '#FFD700', 'stroke-width': '2', opacity: '0.75' }));
  s.appendChild(svg('path', { d: 'M 430,970 Q 470,992 500,980 Q 530,992 570,970', fill: 'none', stroke: '#FFD700', 'stroke-width': '2', opacity: '0.75' }));
  s.appendChild(svg('rect', { x: '48', y: '48', width: '904', height: '904', rx: '2', fill: 'none', stroke: '#FFD700', 'stroke-width': '1', opacity: '0.45' }));

  border.appendChild(s);
  root.appendChild(border);
}

export function mountOverlay(container) {
  clear(container);
  buildBorder(container);

  container.appendChild(el('div', { class: 'ovl-team' }, '⚜ 43146K KRAKEN ⚜'));

  const tagWrap = el('div', { class: 'ovl-tagline' });
  tagWrap.appendChild(el('span', { class: 'ovl-tag1' }, 'THEY SAID PUSHBACK.'));
  const tag2 = el('span', { class: 'ovl-tag2', id: 'tag2' }, 'THE KRAKEN SAID NO.');
  tagWrap.appendChild(tag2);
  container.appendChild(tagWrap);

  container.appendChild(el('div', { class: 'ovl-school' }, 'BARBE HIGH SCHOOL · LAKE CHARLES, LA'));
  container.appendChild(el('img', { class: 'ovl-vex', src: 'VEX Worlds Logo copy.png', alt: 'VEX Robotics' }));

  return {
    popTagline() {
      tag2.classList.add('pop');
      setTimeout(() => tag2.classList.remove('pop'), 240);
    },
    borderSurge() {
      const strips = ['bead-top', 'bead-right', 'bead-bot', 'bead-left'];
      strips.forEach((id, i) => {
        setTimeout(() => {
          const stripEl = container.querySelector('#' + id);
          if (!stripEl) return;
          stripEl.style.transition = 'opacity 80ms ease-out, filter 80ms ease-out';
          stripEl.style.opacity = '1.0';
          stripEl.style.filter = 'brightness(2.4) saturate(1.4) drop-shadow(0 0 6px #00E5CC)';
          setTimeout(() => {
            stripEl.style.transition = 'opacity 700ms ease-in, filter 700ms ease-in';
            stripEl.style.opacity = '0.9';
            stripEl.style.filter = '';
          }, 250);
        }, i * 220);
      });
      const masks = container.querySelectorAll('.ovl-border svg text');
      masks.forEach((mEl, i) => {
        setTimeout(() => {
          mEl.style.transition = 'all 100ms ease-out';
          mEl.setAttribute('font-size', '40');
          mEl.style.filter = 'drop-shadow(0 0 12px #FFD700)';
          setTimeout(() => {
            mEl.style.transition = 'all 600ms ease-in';
            mEl.setAttribute('font-size', '30');
            mEl.style.filter = '';
          }, 200);
        }, 200 + i * 110);
      });
    },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { mountOverlay } from './overlay.js';
const overlay = mountOverlay(document.getElementById('overlay'));
```

- [ ] **Step 3: Visual verify**

Reload. Expected: gold "⚜ 43146K KRAKEN ⚜" near the top, two-line tagline near the bottom (line 2 with teal glow, larger), school credit below it, VEX logo bottom-right, gold/teal/green bead strands along all four edges, mask emojis at corners, scrollwork flourishes top and bottom centers.

---

## Task 13: Bead glints

**Files:**
- Create: `src/beads.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/beads.js`**

```js
// src/beads.js — random bead-glint scheduler that briefly brightens border bead strips
const STRIPS = ['bead-top', 'bead-bot', 'bead-left', 'bead-right'];

export function startBeadGlints(rootEl) {
  let nextAt = 1.2 + Math.random() * 1.3;
  let elapsed = 0;
  return {
    update(dt) {
      elapsed += dt;
      if (elapsed >= nextAt) {
        elapsed = 0;
        nextAt = 1.2 + Math.random() * 1.3;
        const id = STRIPS[Math.floor(Math.random() * STRIPS.length)];
        const stripEl = rootEl.querySelector('#' + id);
        if (!stripEl) return;
        stripEl.style.transition = 'opacity 100ms ease-out, filter 100ms ease-out';
        stripEl.style.opacity = '1.0';
        stripEl.style.filter = 'brightness(1.8) saturate(1.3)';
        setTimeout(() => {
          stripEl.style.transition = 'opacity 600ms ease-in, filter 600ms ease-in';
          stripEl.style.opacity = '0.9';
          stripEl.style.filter = '';
        }, 100);
      }
    },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js` with delta-time tracking**

```js
import { startBeadGlints } from './beads.js';
const beadGlints = startBeadGlints(document.getElementById('overlay'));
```

Replace the loop with delta-time tracking:

```js
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
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
```

- [ ] **Step 3: Visual verify**

Reload. Expected: every 1.2–2.5s, one of the four bead strands briefly flashes brighter, then fades back. No two flashes simultaneously.

---

## Task 14: Moment scheduler — TDD

**Files:**
- Create: `tests/scheduler.test.html`
- Create: `src/scheduler.js`

- [ ] **Step 1: Write failing tests first — `tests/scheduler.test.html`**

```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Scheduler tests</title>
<style>
  body { font-family: monospace; background: #111; color: #ddd; padding: 24px; }
  .pass { color: #6f6; } .fail { color: #f66; font-weight: bold; }
</style></head>
<body>
<h1>Scheduler tests</h1>
<div id="out"></div>
<script type="module">
  import { el } from '../src/dom.js';
  import { createScheduler } from '../src/scheduler.js';
  const out = document.getElementById('out');
  let pass = 0, fail = 0;
  function record(ok, msg) {
    const line = el('div', { class: ok ? 'pass' : 'fail' }, (ok ? 'PASS  ' : 'FAIL  ') + msg);
    out.appendChild(line);
    if (ok) pass++; else fail++;
  }

  const reg = { lightning: 30, roar: 20, watching: 15, surge: 15, ink: 15, beat: 5 };
  let rng_state = 0.42;
  const rng = () => { rng_state = (rng_state * 9301 + 49297) % 233280 / 233280; return rng_state; };
  const sch = createScheduler({ weights: reg, rng, intervalMin: 65, intervalMax: 85 });

  for (let i = 0; i < 50; i++) {
    const v = sch.pickVariant();
    record(reg.hasOwnProperty(v), `pickVariant returns a registered key (got "${v}")`);
  }

  let prev = null, same = 0;
  for (let i = 0; i < 1000; i++) {
    const v = sch.pickVariant();
    if (v === prev) same++;
    prev = v;
  }
  record(same === 0, `no back-to-back repeats over 1000 picks (saw ${same})`);

  const counts = {};
  for (const k of Object.keys(reg)) counts[k] = 0;
  for (let i = 0; i < 20000; i++) counts[sch.pickVariant()]++;
  for (const k of Object.keys(reg)) {
    const expectedPct = reg[k];
    const actualPct = (counts[k] / 20000) * 100;
    const within = Math.abs(actualPct - expectedPct) < 3;
    record(within, `${k}: expected ~${expectedPct}%, got ${actualPct.toFixed(2)}%`);
  }

  for (let i = 0; i < 200; i++) {
    const n = sch.nextInterval();
    record(n >= 65 && n <= 85, `nextInterval in [65, 85] (got ${n.toFixed(2)})`);
  }

  let fired = 0;
  const sch2 = createScheduler({
    weights: reg, rng: () => 0.5, intervalMin: 10, intervalMax: 10,
    onMoment: () => { fired++; },
  });
  sch2.tick(5); record(fired === 0, 'tick(5): no fire yet');
  sch2.tick(5); record(fired === 1, `tick(5)+tick(5)=10s: fired once (fired=${fired})`);
  sch2.tick(10); record(fired === 2, `another 10s: fired twice (fired=${fired})`);

  let fired3 = 0;
  const sch3 = createScheduler({ weights: reg, rng: () => 0.5, intervalMin: 100, intervalMax: 100, onMoment: () => fired3++ });
  const v3 = sch3.trigger();
  record(reg.hasOwnProperty(v3), `trigger() returns valid variant (got "${v3}")`);
  record(fired3 === 1, 'trigger() fires onMoment immediately');

  const summary = el('div', { style: { marginTop: '12px' } }, `${pass} passed, ${fail} failed.`);
  out.appendChild(summary);
  document.title = fail === 0 ? `✓ ${pass} passed` : `✗ ${fail} failed`;
</script>
</body></html>
```

- [ ] **Step 2: Run tests — confirm they FAIL**

Open `http://localhost:8000/tests/scheduler.test.html`. The page should error or show all assertions failing because `src/scheduler.js` doesn't exist yet.

- [ ] **Step 3: Implement `src/scheduler.js`**

```js
// src/scheduler.js — moment scheduler. Pure logic, deterministic given an rng.
//
// createScheduler({
//   weights:     { lightning: 30, roar: 20, watching: 15, surge: 15, ink: 15, beat: 5 },
//   rng:         Math.random,
//   intervalMin: 65, intervalMax: 85,   // seconds between moments
//   onMoment:    (variantKey) => { ... },
// })
//   .tick(deltaSeconds)        // call from animation loop
//   .trigger()                 // manual fire (returns variant key)
//   .pickVariant()             // weighted pick, no back-to-back repeats
//   .nextInterval()            // sample a fresh interval value
//   .timeUntilNext()           // seconds until next scheduled moment
export function createScheduler(opts) {
  const weights = opts.weights;
  const rng = opts.rng || Math.random;
  const intervalMin = opts.intervalMin ?? 65;
  const intervalMax = opts.intervalMax ?? 85;
  const onMoment = opts.onMoment || (() => {});
  const keys = Object.keys(weights);

  let prevVariant = null;
  let elapsed = 0;
  let nextAt = computeInterval();

  function computeInterval() {
    return intervalMin + rng() * (intervalMax - intervalMin);
  }

  function pickVariant() {
    const eligible = prevVariant === null ? keys : keys.filter(k => k !== prevVariant);
    const subtotal = eligible.reduce((s, k) => s + weights[k], 0);
    let r = rng() * subtotal;
    let chosen = eligible[eligible.length - 1];
    for (const k of eligible) {
      r -= weights[k];
      if (r <= 0) { chosen = k; break; }
    }
    prevVariant = chosen;
    return chosen;
  }

  function tick(dt) {
    elapsed += dt;
    if (elapsed >= nextAt) {
      elapsed = 0;
      nextAt = computeInterval();
      onMoment(pickVariant());
    }
  }

  function trigger() {
    elapsed = 0;
    nextAt = computeInterval();
    const v = pickVariant();
    onMoment(v);
    return v;
  }

  function nextInterval() { return computeInterval(); }
  function timeUntilNext() { return Math.max(0, nextAt - elapsed); }

  return { tick, trigger, pickVariant, nextInterval, timeUntilNext };
}
```

- [ ] **Step 4: Re-run tests**

Reload `tests/scheduler.test.html`. All assertions must show PASS. Page title shows `✓ N passed`. Fix any failures before continuing.

---

## Task 15: Lightning Strike moment

**Files:**
- Create: `src/lightning.js`
- Create: `src/moments/lightning.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the lightning fork generator**

```js
// src/lightning.js — branching lightning fork generator
import * as THREE from './vendor/three.module.min.js';

function buildFork(startX, startY, endX, endY, jitter) {
  const points = [[startX, startY]];
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t + (Math.random() - 0.5) * jitter * (1 - t);
    const y = startY + (endY - startY) * t + (Math.random() - 0.5) * jitter * (1 - t);
    points.push([x, y]);
  }
  points.push([endX, endY]);
  return points;
}

export function createLightning(scene, count = 8) {
  const slots = [];
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(8 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0 });
    const line = new THREE.Line(geo, mat);
    line.position.z = 0.3;
    scene.add(line);
    slots.push({ line, geo, mat, life: 0, maxLife: 0 });
  }
  return {
    strike() {
      let used = 0;
      for (const startX of [-0.4, 0.4]) {
        if (used >= slots.length) break;
        const slot = slots[used++];
        const path = buildFork(startX, 0.95, startX * 0.3, 0.1, 0.12);
        const arr = slot.geo.attributes.position.array;
        for (let i = 0; i < path.length; i++) {
          arr[i * 3 + 0] = path[i][0];
          arr[i * 3 + 1] = path[i][1];
          arr[i * 3 + 2] = 0.0;
        }
        slot.geo.setDrawRange(0, path.length);
        slot.geo.attributes.position.needsUpdate = true;
        slot.mat.opacity = 1.0;
        slot.life = 0;
        slot.maxLife = 0.25;
      }
    },
    update(dt) {
      for (const s of slots) {
        if (s.life < s.maxLife) {
          s.life += dt;
          s.mat.opacity = Math.max(0, 1 - s.life / s.maxLife);
        }
      }
    },
  };
}
```

- [ ] **Step 2: Create `src/moments/lightning.js`**

```js
// src/moments/lightning.js — Lightning Strike (canonical), 7s
export function lightningStrike(ctx) {
  const { plankton, krakenOverlays, lightning, waves, overlay, audio, postFx, krakenLurch, screenShake } = ctx;
  return {
    duration: 7.0,
    steps: [
      { t: 0.00, fn: () => { plankton.pullStrength = 1.0; if (audio) audio.startRumble(); }},
      { t: 1.80, fn: () => { krakenOverlays.setEyeIntensity(1.2); }},
      { t: 2.80, fn: () => { postFx.flash(0.18); postFx.chromaticBurst(1.5); lightning.strike(); krakenLurch(1.04, 0.12); if (audio) audio.thunder(); }},
      { t: 2.85, fn: () => { waves.setRipple(1.0); }},
      { t: 2.90, fn: () => { screenShake(6, 0.22); }},
      { t: 3.50, fn: () => { postFx.bloomBoost(1.8, 0.6); overlay.popTagline(); }},
      { t: 5.50, fn: () => { krakenOverlays.setEyeIntensity(0.55); waves.setRipple(0); }},
      { t: 7.00, fn: () => { plankton.pullStrength = 0; if (audio) audio.stopRumble(); }},
    ],
  };
}
```

- [ ] **Step 3: Wire scheduler + moment runner into `src/main.js`**

```js
import { createScheduler } from './scheduler.js';
import { createLightning } from './lightning.js';
import { lightningStrike } from './moments/lightning.js';

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
```

In the loop, after `beadGlints.update(dt);`:

```js
  if (activeSteps) {
    const elapsedM = t - momentStart;
    for (const s of activeSteps) {
      if (!s.fired && elapsedM >= s.t) { s.fired = true; s.fn(); }
    }
  }
  scheduler.tick(dt);
  lightning.update(dt);
```

- [ ] **Step 4: Visual verify**

Reload. Press **Space**. Expected: plankton drift inward, eyes flare, lightning bolts at top, hero subtly scales, brief shake, tagline pops, then settles. Console: `[moment] lightning started`.

---

## Task 16: Kraken Roar moment

**Files:**
- Create: `src/moments/roar.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the moment**

```js
// src/moments/roar.js — Kraken Roar, 5s
export function krakenRoar(ctx) {
  const { krakenOverlays, waves, audio, postFx, screenShake } = ctx;
  return {
    duration: 5.0,
    steps: [
      { t: 0.0, fn: () => { if (audio) audio.growl(); krakenOverlays.setEyeIntensity(1.3); }},
      { t: 1.0, fn: () => { waves.setRipple(1.2); screenShake(4, 0.18); postFx.desaturate(0.3, 1.4); }},
      { t: 2.5, fn: () => { waves.setRipple(0.4); }},
      { t: 4.0, fn: () => { krakenOverlays.setEyeIntensity(0.55); waves.setRipple(0); }},
    ],
  };
}
```

- [ ] **Step 2: Register variant in `src/main.js`**

```js
import { krakenRoar } from './moments/roar.js';
const variants = { lightning: lightningStrike, roar: krakenRoar };
```

- [ ] **Step 3: Visual verify**

Reload. Press Space until a roar fires (you may have to press several times — random rotation). Expected: eyes flare and hold longer (~1.5s), wave ripple intensifies, slight screen shake, brief desaturation pulse (will become visible only after Task 21 wires up postFx).

---

## Task 17: The Watching moment

**Files:**
- Create: `src/moments/watching.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the moment**

```js
// src/moments/watching.js — silent eye drift, 3s
export function theWatching(ctx) {
  const { krakenOverlays } = ctx;
  return {
    duration: 3.0,
    steps: [
      { t: 0.0, fn: () => krakenOverlays.animateEyeDrift(3.0) },
    ],
  };
}
```

- [ ] **Step 2: Register variant**

```js
import { theWatching } from './moments/watching.js';
const variants = { lightning: lightningStrike, roar: krakenRoar, watching: theWatching };
```

- [ ] **Step 3: Visual verify**

Press Space until watching fires. Expected: eyes slowly drift sideways (one direction then the other), settle back. No flash, no shake, no audio.

---

## Task 18: Beat-down moment

**Files:**
- Create: `src/moments/beat-down.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the moment**

```js
// src/moments/beat-down.js — one robot spins, 4s
export function beatDown(ctx) {
  const { robots } = ctx;
  return {
    duration: 4.0,
    steps: [{ t: 0.0, fn: () => robots.spinOne() }],
  };
}
```

- [ ] **Step 2: Pass robots into moment context + register**

In `src/main.js`, update the `ctx` inside `runMoment`:

```js
const ctx = { plankton, krakenOverlays, lightning, waves, overlay, audio, postFx, krakenLurch, screenShake, robots };
```

```js
import { beatDown } from './moments/beat-down.js';
const variants = { lightning: lightningStrike, roar: krakenRoar, watching: theWatching, beat: beatDown };
```

- [ ] **Step 3: Visual verify**

Press Space many times until a beat fires (rare). Expected: one of the two robots spins 360° on its own axis over ~1.5s, then returns.

---

## Task 19: Border Surge moment

**Files:**
- Create: `src/moments/border-surge.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the moment**

```js
// src/moments/border-surge.js — bead cascade + corner sparks, 5s
export function borderSurge(ctx) {
  const { overlay } = ctx;
  return {
    duration: 5.0,
    steps: [{ t: 0.0, fn: () => overlay.borderSurge() }],
  };
}
```

- [ ] **Step 2: Register**

```js
import { borderSurge } from './moments/border-surge.js';
const variants = {
  lightning: lightningStrike, roar: krakenRoar, watching: theWatching,
  beat: beatDown, surge: borderSurge,
};
```

- [ ] **Step 3: Visual verify**

Press Space until surge fires. Expected: bead strands light up sequentially around the border (top → right → bottom → left), corner masks flash and grow briefly, then everything fades back.

---

## Task 20: Ink Eruption moment

**Files:**
- Create: `src/shaders/ink.glsl.js`
- Create: `src/moments/ink-eruption.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create the ink shader**

```js
// src/shaders/ink.glsl.js — billowing ink cloud mask
export const inkVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const inkFragment = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) { float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;} return v; }
  void main() {
    vec2 p = vUv;
    float r = distance(p, vec2(0.5, 0.55));
    float spread = uIntensity * 0.9;
    float n = fbm(p * 4.0 + vec2(uTime * 0.1, uTime * 0.15));
    float mask = smoothstep(spread + 0.1, spread - 0.2, r + (n - 0.5) * 0.4);
    float a = mask * uIntensity;
    gl_FragColor = vec4(vec3(0.02, 0.0, 0.05), a);
  }
`;
```

- [ ] **Step 2: Create the moment**

```js
// src/moments/ink-eruption.js — 6s
export function inkEruption(ctx) {
  const { krakenOverlays, ink } = ctx;
  return {
    duration: 6.0,
    steps: [
      { t: 0.0, fn: () => { ink.expand(0.0, 0.85, 1.5); krakenOverlays.setEyeIntensity(1.4); }},
      { t: 4.5, fn: () => { ink.expand(0.85, 0.0, 1.5); krakenOverlays.setEyeIntensity(0.55); }},
    ],
  };
}
```

- [ ] **Step 3: Add ink mesh + helper to `src/main.js` and register**

```js
import { inkVertex, inkFragment } from './shaders/ink.glsl.js';
import { inkEruption } from './moments/ink-eruption.js';

const inkU = { uTime: { value: 0 }, uIntensity: { value: 0 } };
const inkMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    vertexShader: inkVertex, fragmentShader: inkFragment,
    uniforms: inkU, transparent: true, depthWrite: false,
  })
);
inkMesh.position.z = 0.7;
scene.add(inkMesh);

const ink = {
  uniforms: inkU,
  expand(from, to, durationSec) {
    const start = performance.now();
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= durationSec) { inkU.uIntensity.value = to; return; }
      inkU.uIntensity.value = from + (to - from) * (e / durationSec);
      requestAnimationFrame(tick);
    };
    tick();
  },
};

// Update ctx (add `ink`):
const ctx = { plankton, krakenOverlays, lightning, waves, overlay, audio, postFx, krakenLurch, screenShake, robots, ink };

const variants = {
  lightning: lightningStrike, roar: krakenRoar, watching: theWatching,
  beat: beatDown, surge: borderSurge, ink: inkEruption,
};
```

In the loop, also update: `inkU.uTime.value = t;`.

- [ ] **Step 4: Visual verify**

Press Space until ink fires. Expected: dark ink cloud spreads from kraken over ~1.5s (eyes glow visibly through it), holds, then disperses over ~1.5s.

---

## Task 21: Post-processing — bloom, vignette, grain, chromatic aberration

**Files:**
- Create: `src/postprocess.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/postprocess.js`**

```js
// src/postprocess.js — EffectComposer chain (bloom + custom FX)
import * as THREE from './vendor/three.module.min.js';
import {
  EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass,
} from './vendor/three-postprocessing.js';

const FX_VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FX_FRAG = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uTime, uVignette, uGrain, uCA, uFlash, uDesat;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;
    float caR = uCA * 0.006;
    vec3 col;
    col.r = texture2D(tDiffuse, uv + c * caR).r;
    col.g = texture2D(tDiffuse, uv).g;
    col.b = texture2D(tDiffuse, uv - c * caR).b;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum), uDesat);
    col = mix(col, vec3(1.0), uFlash);
    float vig = smoothstep(0.95, 0.4, length(c) * 1.4);
    col *= mix(1.0, vig, uVignette);
    float n = hash(uv * 1024.0 + uTime * 60.0) - 0.5;
    col += n * uGrain;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function setupPostProcessing(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55, 0.5, 0.55);
  composer.addPass(bloomPass);

  const fxUniforms = {
    tDiffuse: { value: null },
    uTime:     { value: 0 },
    uVignette: { value: 0.55 },
    uGrain:    { value: 0.025 },
    uCA:       { value: 0 },
    uFlash:    { value: 0 },
    uDesat:    { value: 0 },
  };
  const fxPass = new ShaderPass({ uniforms: fxUniforms, vertexShader: FX_VERT, fragmentShader: FX_FRAG });
  composer.addPass(fxPass);
  composer.addPass(new OutputPass());

  window.addEventListener('resize', () => {
    const s = renderer.getSize(new THREE.Vector2());
    composer.setSize(s.x, s.y);
    bloomPass.setSize(s.x, s.y);
  });

  function tweenUniform(uniform, to, durationSec) {
    const from = uniform.value;
    const start = performance.now();
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= durationSec) { uniform.value = to; return; }
      uniform.value = from + (to - from) * (e / durationSec);
      requestAnimationFrame(tick);
    };
    tick();
  }

  return {
    composer, fxUniforms, bloomPass,
    flash(strength) { fxUniforms.uFlash.value = strength; tweenUniform(fxUniforms.uFlash, 0, 0.45); },
    bloomBoost(target, durationSec) {
      const start = bloomPass.strength;
      const t0 = performance.now();
      const tick = () => {
        const e = (performance.now() - t0) / 1000;
        if (e >= durationSec * 2) { bloomPass.strength = 0.55; return; }
        const k = e < durationSec ? e / durationSec : 2 - e / durationSec;
        bloomPass.strength = start + (target - start) * k;
        requestAnimationFrame(tick);
      };
      tick();
    },
    desaturate(amount, durationSec) {
      tweenUniform(fxUniforms.uDesat, amount, durationSec * 0.4);
      setTimeout(() => tweenUniform(fxUniforms.uDesat, 0, durationSec * 0.6), durationSec * 400);
    },
    chromaticBurst(strength) { fxUniforms.uCA.value = strength; tweenUniform(fxUniforms.uCA, 0, 0.25); },
    update(t) { fxUniforms.uTime.value = t; },
  };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

Replace the `postFx` stub block with:

```js
import { setupPostProcessing } from './postprocess.js';
const postFx = setupPostProcessing(renderer, scene, camera);
```

In the loop, replace `renderer.render(scene, camera)` with:

```js
postFx.update(t);
postFx.composer.render();
```

- [ ] **Step 3: Visual verify**

Reload. Expected: subtle bloom on golds + teals (text glows softly), faint vignette darkening corners, very fine film grain. Trigger Lightning Strike — chromatic aberration shudder is now visible during the crack.

---

## Task 22: Splash / start screen + fullscreen + audio toggle

**Files:**
- Create: `src/splash.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/splash.js` (builds DOM via helpers)**

```js
// src/splash.js — splash screen, fullscreen request, audio enable
import { el } from './dom.js';

export function setupSplash() {
  const splash = el('div', { id: 'splash' });
  splash.appendChild(el('img', { id: 'splash-logo', src: 'Kraken 43146K Logo.png', alt: '' }));
  const btn = el('button', { id: 'splash-btn' }, 'ROUSE THE KRAKEN');
  splash.appendChild(btn);

  const toggles = el('div', { id: 'splash-toggles' });
  const audioLabel = el('label');
  const audioBox = el('input', { type: 'checkbox', id: 'opt-audio' });
  audioLabel.appendChild(audioBox);
  audioLabel.appendChild(document.createTextNode(' 🔊 Enable audio'));
  toggles.appendChild(audioLabel);

  const fsLabel = el('label');
  const fsBox = el('input', { type: 'checkbox', id: 'opt-fs' });
  fsBox.checked = true;
  fsLabel.appendChild(fsBox);
  fsLabel.appendChild(document.createTextNode(' 🖥️ Auto-fullscreen'));
  toggles.appendChild(fsLabel);
  splash.appendChild(toggles);

  const help = el('div', { id: 'splash-help' });
  const parts = [
    'Press ', el('kbd', {}, 'F'), ' for fullscreen · ',
    el('kbd', {}, 'Space'), ' to trigger a moment · ',
    el('kbd', {}, 'Esc'), ' to exit fullscreen · ',
    el('kbd', {}, 'D'), ' for debug overlay',
  ];
  for (const p of parts) help.appendChild(typeof p === 'string' ? document.createTextNode(p) : p);
  splash.appendChild(help);

  document.body.appendChild(splash);

  return new Promise((resolve) => {
    btn.addEventListener('click', async () => {
      const audioEnabled = audioBox.checked;
      const fsEnabled = fsBox.checked;
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 600);
      if (fsEnabled) {
        try { await document.documentElement.requestFullscreen(); } catch (_) {}
      }
      resolve({ audioEnabled });
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    });
  });
}
```

- [ ] **Step 2: Wrap the existing init with the splash gate**

In `src/main.js`, refactor the top-level IIFE:

```js
import { setupSplash } from './splash.js';

(async () => {
  const { audioEnabled } = await setupSplash();
  // existing init: loadAssets, scene setup, etc. — move the previous async body here
  window.__audioEnabled = audioEnabled;
})();
```

- [ ] **Step 3: Visual verify**

Reload. Expected: fullscreen splash with kraken logo, gold ROUSE THE KRAKEN button, two toggles, and help text. Click button → splash fades, fullscreen activates, animated backdrop shows. F toggles fullscreen, Esc exits.

---

## Task 23: Audio module (WebAudio synthesis)

**Files:**
- Create: `src/audio.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/audio.js`**

```js
// src/audio.js — WebAudio-synthesized storm bed + thunder + growl. No asset files.
export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  let stormNode = null, stormGain = null;
  function startStorm() {
    if (stormNode) return;
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i=0;i<bufferSize;i++) {
      const w = Math.random()*2-1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
    }
    stormNode = ctx.createBufferSource();
    stormNode.buffer = buffer; stormNode.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 600;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05; lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    stormGain = ctx.createGain(); stormGain.gain.value = 0.0;
    stormNode.connect(filter).connect(stormGain).connect(master);
    stormNode.start();
    stormGain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);
  }

  let rumbleGain = null, rumbleOsc = null;
  function startRumble() {
    if (rumbleGain) return;
    rumbleOsc = ctx.createOscillator(); rumbleOsc.type = 'sawtooth'; rumbleOsc.frequency.value = 38;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 90;
    rumbleGain = ctx.createGain(); rumbleGain.gain.value = 0.0;
    rumbleOsc.connect(filter).connect(rumbleGain).connect(master);
    rumbleOsc.start();
    rumbleGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.5);
    setTimeout(stopRumble, 6000);
  }
  function stopRumble() {
    if (!rumbleGain) return;
    rumbleGain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.4);
    setTimeout(() => {
      try { rumbleOsc.stop(); rumbleGain.disconnect(); } catch (_) {}
      rumbleGain = null; rumbleOsc = null;
    }, 1000);
  }

  function thunder() {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * Math.exp(-i / (ctx.sampleRate * 0.6));
    const src = ctx.createBufferSource(); src.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 280;
    const g = ctx.createGain(); g.gain.value = 1.4;
    src.connect(filter).connect(g).connect(master);
    src.start();
  }

  function growl() {
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 55;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 6.5;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 12;
    lfo.connect(lfoGain).connect(osc.frequency);
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 220;
    const g = ctx.createGain(); g.gain.value = 0.0;
    osc.connect(filter).connect(g).connect(master);
    osc.start(); lfo.start();
    g.gain.setTargetAtTime(0.6, ctx.currentTime, 0.05);
    setTimeout(() => g.gain.setTargetAtTime(0.0, ctx.currentTime, 0.3), 1500);
    setTimeout(() => { try { osc.stop(); lfo.stop(); } catch (_) {} }, 2500);
  }

  return { startStorm, startRumble, stopRumble, thunder, growl };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

Replace `let audio = null;` with:

```js
import { createAudio } from './audio.js';
let audio = null;
if (audioEnabled) {
  audio = createAudio();
  audio.startStorm();
}
```

- [ ] **Step 3: Audio verify**

Reload. On splash, check the audio toggle, click ROUSE THE KRAKEN. Expected: a soft low storm-bed hum fades in. Trigger Lightning Strike — thunder cracks. Trigger Roar — low growl audible.

---

## Task 24: Debug overlay (D key)

**Files:**
- Create: `src/debug.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/debug.js` (DOM via helpers)**

```js
// src/debug.js — hidden FPS/state overlay, toggled with D
import { el, clear } from './dom.js';

const VARIANTS = ['lightning', 'roar', 'watching', 'beat', 'surge', 'ink'];

export function setupDebug({ scheduler, getFps, getState }) {
  const root = el('div', { id: 'debug' });
  document.body.appendChild(root);

  let visible = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
      visible = !visible;
      root.style.display = visible ? 'block' : 'none';
    }
  });

  function rebuild() {
    if (!visible) return;
    const fps = getFps();
    const fpsColor = fps > 50 ? '#6f6' : fps > 30 ? '#fc6' : '#f66';
    const mem = (performance.memory && performance.memory.usedJSHeapSize)
      ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + ' MB' : 'n/a';

    clear(root);
    const fpsLine = el('div', {}, 'FPS: ');
    fpsLine.appendChild(el('span', { style: { color: fpsColor } }, fps.toFixed(1)));
    root.appendChild(fpsLine);
    root.appendChild(el('div', {}, `Resolution: ${innerWidth}×${innerHeight} @ ${devicePixelRatio}x`));
    root.appendChild(el('div', {}, `State: ${getState()}`));
    root.appendChild(el('div', {}, `Next moment: ${scheduler.timeUntilNext().toFixed(1)}s`));
    root.appendChild(el('div', {}, `Memory: ${mem}`));

    const sep = el('div', { style: { marginTop: '6px', borderTop: '1px solid #6B0AC9', paddingTop: '4px' } });
    sep.appendChild(document.createTextNode('Force: '));
    VARIANTS.forEach((v, i) => {
      const btn = el('button', {
        style: { background: '#1A0033', color: '#FFD700', border: '1px solid #6B0AC9', cursor: 'pointer', margin: '0 2px' },
      }, String(i + 1));
      btn.addEventListener('click', () => { window.__forceMoment(v); });
      sep.appendChild(btn);
    });
    root.appendChild(sep);
  }

  setInterval(rebuild, 200);
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { setupDebug } from './debug.js';

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
```

In the loop: `updateFps();`.

- [ ] **Step 3: Visual verify**

Reload. After clicking ROUSE THE KRAKEN, press `D`. Expected: dark panel in top-left shows FPS (green), resolution, state, next-moment countdown, memory, six force-trigger buttons. Click "1" → Lightning fires. `D` again → panel hides.

---

## Task 25: Auto-degrade watchdog

**Files:**
- Create: `src/watchdog.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/watchdog.js`**

```js
// src/watchdog.js — rolling FPS watchdog with one-way degrade steps
export function createWatchdog({ getFps, onDegrade }) {
  const samples = [];
  let level = 0;
  setInterval(() => {
    samples.push(getFps());
    if (samples.length > 30) samples.shift();
    if (samples.length < 10) return;
    const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
    if (level < 1 && avg < 45) { level = 1; onDegrade(level, avg); }
    else if (level < 2 && avg < 35) { level = 2; onDegrade(level, avg); }
    else if (level < 3 && avg < 25) { level = 3; onDegrade(level, avg); }
  }, 1000);
  return { getLevel: () => level };
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { createWatchdog } from './watchdog.js';

createWatchdog({
  getFps: () => fpsCurrent,
  onDegrade: (lvl, fps) => {
    console.warn('[watchdog] degrade level', lvl, 'avg fps', fps.toFixed(1));
    if (lvl === 1) plankton.setCount(400);
    if (lvl === 2) postFx.bloomPass.enabled = false;
    if (lvl === 3) window.__directRender = true;
  },
});
```

In the loop, replace the render call with a fork:

```js
if (window.__directRender) renderer.render(scene, camera);
else { postFx.update(t); postFx.composer.render(); }
```

- [ ] **Step 3: Verify with throttling**

Reload. Open Chrome devtools → Performance tab → CPU throttling = "6× slower". Within ~10s expect console messages: `[watchdog] degrade level 1`, then 2, then 3. Visuals never go black. Reset throttling — degrade does NOT recover (by design).

---

## Task 26: WebGL context loss recovery

**Files:**
- Create: `src/context-recovery.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/context-recovery.js`**

```js
// src/context-recovery.js — WebGL context lost/restored handlers
export function setupContextRecovery(canvas, onRestore) {
  let lossCount = 0;
  let lastLossAt = 0;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now - lastLossAt < 60000) lossCount++;
    else lossCount = 1;
    lastLossAt = now;
    console.warn('[ctx] lost (count:', lossCount, ')');
    if (lossCount >= 2) {
      console.error('[ctx] two losses in 60s — falling back to mockup');
      window.location.replace('backdrop-mockup.html');
    }
  });
  canvas.addEventListener('webglcontextrestored', () => {
    console.log('[ctx] restored — reloading textures');
    onRestore();
  });
}
```

- [ ] **Step 2: Wire into `src/main.js`**

```js
import { setupContextRecovery } from './context-recovery.js';

setupContextRecovery(renderer.domElement, () => {
  loadAssets().then(reloaded => {
    hero.material.map = reloaded.kraken;
    hero.material.needsUpdate = true;
  }).catch(err => console.error('[ctx] texture reload failed:', err));
});
```

- [ ] **Step 3: Verify (manual context loss)**

Temporarily expose `renderer` for the test: `window.__renderer = renderer;`. In devtools console:

```js
const ext = window.__renderer.getContext().getExtension('WEBGL_lose_context');
ext.loseContext();
setTimeout(() => ext.restoreContext(), 1000);
```

Expected: brief blank, console logs `[ctx] lost`, then `[ctx] restored — reloading textures`, kraken reappears. Remove the `window.__renderer = renderer;` line afterward.

---

## Task 27: WebGL-not-supported fallback

**Files:**
- Create: `src/fallback.js`
- Modify: `src/main.js`

- [ ] **Step 1: Create `src/fallback.js`**

```js
// src/fallback.js — WebGL-not-available landing page
import { el, clear } from './dom.js';

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (_) { return false; }
}

export function showFallback() {
  clear(document.body);
  const wrap = el('div', {
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#080010', color: '#FFD700',
      fontFamily: 'Georgia, serif', textAlign: 'center', padding: '40px',
    },
  });
  wrap.appendChild(el('h1', { style: { fontSize: '5vmin' } }, "WebGL not available on this browser."));
  wrap.appendChild(el('p', { style: { margin: '24px 0', opacity: '0.85' } },
    'The animated backdrop requires WebGL. Falling back to the static mockup.'));
  wrap.appendChild(el('a', {
    href: 'backdrop-mockup.html',
    style: {
      padding: '1.4vmin 3vmin', background: '#FFD700', color: '#1A0033',
      textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '0.4vmin',
    },
  }, 'OPEN STATIC MOCKUP'));
  document.body.appendChild(wrap);
}
```

- [ ] **Step 2: Gate in `src/main.js` BEFORE the splash**

Near the top of `src/main.js`, before `setupSplash()`:

```js
import { webglOK, showFallback } from './fallback.js';

if (!webglOK()) {
  showFallback();
} else {
  (async () => {
    const { audioEnabled } = await setupSplash();
    // ... existing init
  })();
}
```

- [ ] **Step 3: Verify**

Open Chrome → `chrome://flags` → search "WebGL" → set "WebGL 2.0" to **Disabled**. Restart Chrome. Reload `backdrop-dev.html`. Expected: yellow-on-black "WebGL not available" page with working button linking to `backdrop-mockup.html`. Re-enable WebGL after.

---

## Task 28: Visibility-pause

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Pause render when document is hidden**

Add near the loop definition:

```js
let paused = false;
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (!paused) lastT = clock.getElapsedTime();  // avoid huge dt jump
});
```

Wrap the loop body in `if (!paused) { ... }` (everything except `requestAnimationFrame(loop)`).

- [ ] **Step 2: Verify**

Open `backdrop-dev.html`. Switch to another tab. Wait 10s. Switch back. Expected: animation resumes from a sensible state (no time-jump, no errors in console).

---

## Task 29: Bundle script — produce `backdrop-final.html`

**Files:**
- Create: `scripts/bundle.mjs`

- [ ] **Step 1: Create the bundle script**

```js
// scripts/bundle.mjs — produces a single self-contained backdrop-final.html
// by inlining the dev page, all ES modules under src/, and base64-encoded
// image assets. Each module becomes a Blob URL registered in a runtime
// importmap so the original specifiers (./src/...) resolve.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEV_HTML = join(ROOT, 'backdrop-dev.html');
const OUT_HTML = join(ROOT, 'backdrop-final.html');

function walkJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkJsFiles(full));
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

// 1. Inline image assets as base64 data URIs
const imgs = ['Kraken 43146K Logo.png', 'VEX Worlds Logo copy.png'];
const imgMap = {};
for (const img of imgs) {
  const data = readFileSync(join(ROOT, img));
  imgMap[img] = `data:image/png;base64,${data.toString('base64')}`;
}

// 2. Read all JS modules under src/, swap PNG path references to data URIs
const moduleFiles = walkJsFiles(join(ROOT, 'src'));
const modules = {};
for (const f of moduleFiles) {
  const rel = './' + relative(ROOT, f).replace(/\\/g, '/');
  let code = readFileSync(f, 'utf8');
  for (const [name, dataUri] of Object.entries(imgMap)) {
    code = code.replaceAll(`'${name}'`, `'${dataUri}'`);
    code = code.replaceAll(`"${name}"`, `"${dataUri}"`);
  }
  modules[rel] = code;
}

// 3. Read dev HTML; rewrite asset src; strip the original main.js script tag.
let html = readFileSync(DEV_HTML, 'utf8');
html = html.replace(/src="VEX Worlds Logo copy\.png"/g, `src="${imgMap['VEX Worlds Logo copy.png']}"`);
html = html.replace(/src="Kraken 43146K Logo\.png"/g, `src="${imgMap['Kraken 43146K Logo.png']}"`);
html = html.replace(/<script type="module" src="\.\/src\/main\.js"><\/script>/, '');

// 4. Build the loader: blob URLs for every module, then importmap, then entry import.
const blobLines = [];
const importMapEntries = [];
let i = 0;
for (const [path, code] of Object.entries(modules)) {
  const varName = `__m${i++}`;
  blobLines.push(`const ${varName} = URL.createObjectURL(new Blob([${JSON.stringify(code)}], {type:'text/javascript'}));`);
  importMapEntries.push(`  ${JSON.stringify(path)}: ${varName}`);
}

const loader = [
  '<script>',
  blobLines.join('\n'),
  'const importMap = { imports: {',
  importMapEntries.join(',\n'),
  '} };',
  "const mapEl = document.createElement('script');",
  "mapEl.type = 'importmap';",
  'mapEl.textContent = JSON.stringify(importMap);',
  'document.head.appendChild(mapEl);',
  "const entry = document.createElement('script');",
  "entry.type = 'module';",
  "entry.src = './src/main.js';",
  'document.body.appendChild(entry);',
  '</script>',
].join('\n');

html = html.replace(/<\/body>/, `${loader}\n</body>`);

writeFileSync(OUT_HTML, html);
console.log(`[bundle] wrote ${OUT_HTML} (${(html.length / 1024).toFixed(0)} KB)`);
```

- [ ] **Step 2: Run the bundle**

```bash
cd "$(git rev-parse --show-toplevel)"
node scripts/bundle.mjs
```

Expected: `[bundle] wrote .../backdrop-final.html (NNNN KB)`. File exists.

- [ ] **Step 3: Verify the bundled file works standalone**

Drag `backdrop-final.html` into Chrome (loads via `file://`). Expected: splash → click ROUSE THE KRAKEN → animated backdrop runs. Both PNGs render (kraken + VEX) — proves base64 inlining worked. Console shows no 404s.

---

## Task 30: Update `ai-prompt.md` and `CLAUDE.md`

**Files:**
- Modify: `ai-prompt.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add note to top of `ai-prompt.md`**

Insert at line 1 (above `# 43146K KRAKEN — AI Image Generation Prompts`):

```markdown
> **Note:** The primary booth deliverable is now `backdrop-final.html` — an animated, GPU-rendered HTML projection. The prompts below remain available for derivative print and social-media artwork. See `docs/superpowers/specs/2026-04-16-kraken-backdrop-animated-design.md`.

```

- [ ] **Step 2: Update `CLAUDE.md` "What this repo is" section**

Replace the existing `## What this repo is` block with:

```markdown
## What this repo is

A **creative design deliverable**, not a software project. The artifact is a projected booth backdrop for team **43146K KRAKEN** (Barbe High School, Lake Charles, LA) at the VEX Robotics World Championship *Pushback* season. Concept: *"PUSHBACK: A Kraken's Warning"* — fierce + festive (Louisiana Mardi Gras) + cinematic.

Three deliverables live at the repo root:

- `backdrop-final.html` — **primary deliverable.** A GPU-accelerated animated backdrop projected fullscreen at the booth. Single self-contained HTML file (~2-3 MB), bundled from sources in `src/` via `scripts/bundle.mjs`.
- `backdrop-mockup.html` — static low-fi mockup. Used as a fallback when WebGL is unavailable, and as a quick-reference composition.
- `ai-prompt.md` — Midjourney / Adobe Firefly / DALL-E prompts for derivative print and social-media artwork.
```

- [ ] **Step 3: Add a "Building the animated backdrop" section to `CLAUDE.md`**

Insert after the "Preview / build / test" section:

```markdown
## Building the animated backdrop

The animated backdrop is developed as multiple ES modules under `src/` and bundled into a single self-contained HTML.

**Dev preview** (live editing, uses ES modules):

    python3 -m http.server 8000
    # then open http://localhost:8000/backdrop-dev.html

ES modules require a real HTTP server — opening `backdrop-dev.html` via `file://` will not work.

**Bundle to single-file deliverable:**

    node scripts/bundle.mjs
    # writes backdrop-final.html (PNG assets inlined as base64)

`backdrop-final.html` runs from `file://` directly — drag it into Chrome.

**Run the scheduler tests:**

Open `http://localhost:8000/tests/scheduler.test.html` in a browser. All assertions should be green.

**Safe-DOM rule:** runtime DOM construction in `src/` uses the `el` / `svg` / `clear` helpers from `src/dom.js`. Stick to `createElement`, `createElementNS`, `textContent`, `appendChild`, `setAttribute`. Don't reach for HTML-string setters or sync HTML insertion APIs.
```

---

## Task 31: Soak test (final verification)

**Files:** none (verification only)

- [ ] **Step 1: Bundle and open the production deliverable**

```bash
node scripts/bundle.mjs
```

Open `backdrop-final.html` in Chrome via `file://`. Click ROUSE THE KRAKEN with audio toggle ON. Press `D` to show debug.

- [ ] **Step 2: Manual variant verification**

In the debug overlay, click force-trigger buttons 1 through 6 in order. Confirm:

1. **Lightning Strike** — flash, lightning forks, kraken lurch, screen shake, tagline pop
2. **Kraken Roar** — eyes flare and hold, wave ripple, palette desaturation pulse, growl audio
3. **The Watching** — silent eye drift left-right
4. **Beat-down** — one robot spins 360°
5. **Border Surge** — bead cascade around border + corner flashes
6. **Ink Eruption** — dark cloud expands, eyes glow through, disperses

- [ ] **Step 3: Aspect verification**

Resize the Chrome window to extreme aspect ratios (very wide, very tall). Expected: square canvas always centers and letterboxes correctly; never crops the design. Border + text overlay scales with the canvas.

- [ ] **Step 4: WebGL fallback verification**

Disable WebGL via `chrome://flags`. Reload. Expected: yellow-on-black "WebGL not available" page with working "OPEN STATIC MOCKUP" link. Re-enable WebGL after.

- [ ] **Step 5: 12-hour soak (day before the event)**

On the actual booth laptop, open `backdrop-final.html` and click ROUSE THE KRAKEN. Leave running for 12 continuous hours. After 12 hours:
- FPS in debug overlay still green (>50)
- Memory usage flat ±5% of starting value
- Console has no errors (only normal `[moment]` logs)
- All six variants observed at least once
- No visible degradation

If any check fails, diagnose before event day.

---

## Self-Review Checklist

### Spec coverage

| Spec section | Covered by task |
|---|---|
| 1:1 square canvas; letterbox on 16:9 projector | Task 3 |
| Hero kraken PNG never altered | Task 4 |
| Color palette CSS variables in HTML / shaders | Task 1 (HTML), Tasks 5–10, 12 |
| Three-zone composition (top/center/bottom) | Tasks 6, 7, 11, 12 |
| Eye-pulse + hat-specular overlays | Task 8 |
| Tentacles with idle sway | Task 7 |
| Plankton GPU particles | Task 9 |
| Wave line / ocean surface | Task 10 |
| Mardi Gras border (HTML/CSS overlay) | Task 12 |
| Bead glints | Task 13 |
| Text overlays (team name, tagline, school, VEX logo) | Task 12 |
| Post-processing (bloom, vignette, grain, CA) | Task 21 |
| Moment scheduler (75±10 s, 6 variants, no repeat, weighted) | Task 14 (TDD) |
| Lightning Strike | Task 15 |
| Kraken Roar | Task 16 |
| The Watching | Task 17 |
| Beat-down | Task 18 |
| Border Surge | Task 19 |
| Ink Eruption | Task 20 |
| Splash + ROUSE THE KRAKEN button | Task 22 |
| Audio toggle (off by default) | Task 22, 23 |
| Auto-fullscreen toggle | Task 22 |
| Spacebar manual trigger | Task 15 |
| Debug overlay (D) with FPS, state, force buttons | Task 24 |
| Auto-degrade FPS watchdog | Task 25 |
| WebGL context loss recovery | Task 26 |
| WebGL-not-supported fallback to mockup | Task 27 |
| Visibility-pause | Task 28 |
| Asset preload + missing-file handling | Task 4 |
| Single-file deliverable via bundle | Task 29 |
| Update `ai-prompt.md` | Task 30 |
| Update `CLAUDE.md` | Task 30 |
| 12-hour soak | Task 31 |
| Aspect ratio verification | Task 31 |
| WebGL fallback verification | Task 31 |
| Safe-DOM construction throughout | Task 1 (helpers); Tasks 4, 12, 22, 24, 27 |

All spec requirements are covered.

### Type / signature consistency

- `createScheduler({ weights, rng, intervalMin, intervalMax, onMoment }) → { tick, trigger, pickVariant, nextInterval, timeUntilNext }` — used identically in tests (Task 14), main.js (Task 15), and debug (Task 24).
- `createKrakenOverlays(scene, heroBox) → { eyes, hatMesh, hatUniforms, update, setEyeIntensity, animateEyeDrift }` — `setEyeIntensity` consumed by Tasks 15, 16, 17, 20; `animateEyeDrift` by Task 17.
- `createTentacles(scene) → { meshes, update }` — only `update(t)` is consumed.
- `setupPostProcessing(...) → { composer, fxUniforms, bloomPass, flash, bloomBoost, desaturate, chromaticBurst, update }` — all consumers exist (Tasks 15, 16, 21, 25).
- `createWaves(scene) → { mesh, uniforms, update, setRipple }` — `setRipple` consumed by Tasks 15 + 16.
- `mountOverlay(container) → { popTagline, borderSurge }` — both consumed.
- `createPlankton(scene) → { points, count, pullStrength, update, setCount }` — `pullStrength` mutated by Lightning; `setCount` called by watchdog.
- `createRobots(scene) → { robots, update, spinOne }` — `spinOne` called by Beat-down.
- `createLightning(scene) → { strike, update }` — both used.
- All moment factories: `(ctx) → { duration, steps: [{ t, fn }] }` — `runMoment` in main.js consumes this shape.
- `setupContextRecovery(canvas, onRestore) → void`.
- `createWatchdog({ getFps, onDegrade }) → { getLevel }`.
- `webglOK() → boolean`, `showFallback() → void`.
- `el(tag, attrs?, text?) → HTMLElement`, `svg(tag, attrs?, text?) → SVGElement`, `clear(node) → void` — used everywhere DOM is constructed.

All signatures are consistent between definition and consumers.

### Placeholder scan

No occurrences of "TBD", "TODO", "fill in later", "implement later", or generic "add error handling" exhortations. Every step body contains executable code or specific commands. All DOM construction is routed through the safe helpers in `src/dom.js`.

### Plan complete.
