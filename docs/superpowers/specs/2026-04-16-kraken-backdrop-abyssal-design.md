# 43146K KRAKEN — Abyssal Cinematic Upgrade Design Spec

**Date:** 2026-04-16
**Team:** 43146K KRAKEN — Barbe High School, Lake Charles, LA
**Competition:** VEX Robotics World Championship — *Pushback* season
**Concept:** *"PUSHBACK: A Kraken's Warning"* — Abyssal cinematic edition
**Supersedes (visual layer only):** the visual treatment in `docs/superpowers/specs/2026-04-16-kraken-backdrop-animated-design.md`. The architecture, splash gate, scheduler, robustness systems, deployment target, and locked elements (palette / canonical strings / hero PNG / 1:1 square) all carry forward unchanged.

---

## Why this exists

The existing animated backdrop is structurally complete and live at `https://kraken.bscnsltng.com/`, but reads as unpolished:

1. **Static feeling.** Most of the time is slow drifting plankton + slow tentacle sway. Nothing happens for 70+ seconds at a stretch except in the scheduled "moments."
2. **Art quality.** Robot sprites are canvas-drawn rectangles. Shaders are minimum-viable value noise. Wave is a thin strip. The piece reads as a prototype rather than a movie poster.
3. **Dramatic ceiling.** Bloom is conservative (0.55). Vignette barely visible. Post-processing is restrained. The whole thing needs to be turned up.

This spec is a **concept-level visual rebuild** that treats the canvas as an underwater horror cinematic: the viewer is submerged, looking up at a storm-lit surface, while the kraken rises from below into the lit zone. Continuous ambient life happens at every depth so the eye never settles. The locked spec elements stay; everything else on the visual side is on the table.

---

## Goals

- **Continuous environmental life at every layer** so there is no "static" interval. Caustics dance, marine snow falls, zooplankton swarms, god-rays sweep, the camera breathes.
- **Movie-quality post-processing**: heavier bloom, tealorange split-tone color grade, lens distortion, depth fog, faint constant chromatic aberration that intensifies during moments.
- **Real organic motion**: tentacles bend through multiple segments (not single-pivot rotation), kraken subtly drifts in place ("swimming"), camera slow-zooms 1.0 ↔ 1.02 over 18s.
- **Replace canvas-art robots** with proper SVG silhouettes that read as VEX competition robots.
- **Carved-gold border**: the Mardi Gras frame becomes a chiseled, waterlogged baroque using SVG filter chains (specular lighting + composite).
- **Shippable on a school laptop** through a more aggressive auto-degrade ladder (current basic visual is the L3 fallback).

## Non-Goals

- Changing the locked elements: palette, canonical strings (`43146K KRAKEN`, `THEY SAID PUSHBACK.`, `THE KRAKEN SAID NO.`, `BARBE HIGH SCHOOL · LAKE CHARLES, LA`), hero PNG, 1:1 square aspect.
- Changing the architecture (multi-file ES modules, no build step, served from kraken.bscnsltng.com).
- Adding interactivity (still a backdrop, not a kiosk).
- Changing the splash flow, audio module, or robustness systems (watchdog, context recovery, fallback). All carry forward.

---

## Scene Composition (back-to-front depth stack)

Replaces the previous flat layer ordering with deep-water vertical depth.

| z | Layer | Tech | New for Abyssal? |
|---|---|---|---|
| -10 | Deep void gradient | Vertical fragment shader: void-purple at top fading to jet-black at bottom | Replaces value-noise void shader |
| -8  | God-rays | Volumetric light shafts piercing down from a top-center virtual sun. Animated cone sweep | NEW |
| -6  | Caustics | Animated voronoi-like pattern multiplied across underlying layers | NEW |
| -5  | Distant tentacle silhouettes | Heavily blurred, depth-faded silhouette geometry, slow sway | Distant-layer split kept |
| -4  | Marine snow | Continuous downward-drifting particles (~600), depth-sized, slight horizontal sway | NEW pool |
| -2  | Top spotlight on the kraken | Soft elliptical highlight on the kraken's pirate hat — "spotlight on champion" | NEW |
| 0   | **Hero kraken PNG** | Textured plane, locked asset, never modified | Subtle XY drift "swimming in place" added |
| +0.3| Eye-pulse + hat-specular | Two red sprite quads + diagonal sweep mask | Pulse range widened 0.4 → 0.85 |
| +0.4| Foreground tentacles | Multi-segment vertex bend (chain of 4 sin waves along length) | Replaces single-pivot rotation shader |
| +0.5| Ink wisps | Continuous trails curling from foreground tentacle tips, ~150 particles | NEW (not just during ink moment) |
| +0.7| Bioluminescent zooplankton | ~1500 motes (up from 800), per-particle teal/gold/violet color, per-particle pulse phase | Pool grown + colored |
| +0.9| Ocean surface | Full bottom 25% (was thin strip), vertical wave displacement (3 harmonic sines), foam line, faint refraction | Substantially upgraded |
| +1.0| Robots | Hand-drawn SVG silhouettes (replace `<canvas>` rectangles), motion-trail layer | NEW art |
| +10 | Mardi Gras border | Re-rendered with SVG `<filter>` chain: blur + specular lighting + composite for chiseled gold | NEW filter |
| +11 | Text overlay | Same canonical strings, gets cinematic glow grade | Color grade only |
| +12 | Post-processing | Bloom + split-tone + vignette + grain + idle CA + lens distortion + depth fog | Substantially upgraded |

---

## Continuous Ambient Motion

Constant low-amplitude motion at every layer so the eye never settles. None of these are "moments" — they happen *all the time*:

| Effect | Period | Range | Owner |
|---|---|---|---|
| God-ray sweep | 60s | side-to-side ~30° | god-rays shader uniform |
| Caustics flow | continuous | scrolling voronoi | caustics shader uTime |
| Marine snow descent | continuous | drift down + ±x sway | marine-snow particle pool |
| Zooplankton drift + per-particle pulse | continuous | curl-noise field | zooplankton pool |
| Ink wisps | continuous | tentacle-tip emission | ink-wisp pool |
| Tentacle organic bend | per-tentacle 3.8–6.0s | multi-segment sine chain | tentacle vertex shader |
| Hero "swimming" drift | 7.4s + 9.1s noise | ±5px XY | main loop, applied to hero plane |
| Camera breathing | 18s | scene scale 1.0 ↔ 1.02, sin | scene module |
| Pressure pulse | every 12s | radial subtle ripple from kraken center | new "pulse" emitter |
| Distant lightning flash | every 25±5s (jittered) | brief surface flash, not full Lightning Strike moment | new "ambient lightning" emitter |
| Eye breathing pulse | 2.6s | uIntensity 0.4 → 0.85 (was 0.4 → 0.7) | kraken module |
| Hat specular sweep | every 12s | unchanged | kraken module |

Result: **something visible is changing every fraction of a second**, on multiple time scales. The scheduled moments become *punctuation against an already-rich baseline* rather than the only events that ever happen.

---

## Shader & Art Upgrades

### New shaders

- **`shaders/depth-void.glsl.js`** — vertical gradient deep void replacing value-noise void
- **`shaders/godrays.glsl.js`** — radial-blur cone from top-center, masked to wedge, tinted teal-gold; uniform `uSweep` for slow horizontal pan
- **`shaders/caustics.glsl.js`** — animated voronoi-like cell pattern, scrolling, intensity falls off toward bottom; uniform `uTime`
- **`shaders/pressure.glsl.js`** — radial sin-wave displacement, ring expanding outward; uniforms `uOriginXY`, `uTime`, `uPhase` (pulse-by-pulse)
- **`shaders/multi-segment-tentacle.glsl.js`** — replaces current `tentacles.glsl.js`; chain of 4 sines along tentacle length for organic bend, plus existing `uExtraRot` from prior moment-behavior work
- **`shaders/ocean-surface.glsl.js`** — full-bottom-25% surface with displaced verts (3 sines), foam line shader, faint refraction sample of layers below

### New / regenerated art

- **`src/robots-svg.js`** — replaces canvas-rendered robots. Two distinct hand-drawn-in-code SVG silhouettes (square chassis, mecanum-style wheels, lift arm with end-effector, antenna). Dark purple silhouette with teal eye glow. Subtle "being-dragged-down" motion-trail layer (ghost copies offset upward, fading).
- **`src/border-baroque.js`** — same Mardi Gras border SVG composition, but wrapped in an SVG `<filter>` chain: `<feGaussianBlur>` for sub-surface softness → `<feSpecularLighting>` for chiseled-gold highlights → `<feComposite>` to merge. Beads get a separate sparkle pass (subtle radial highlight).

### New particle pools (all fixed-size, additive blending, no per-frame allocation)

- **Marine snow** — 600 particles, downward drift + ±x sway, depth-fade, slow rotation
- **Zooplankton** — 1500 (up from 800), per-particle color (teal/gold/violet via attribute), per-particle pulse phase
- **Ink wisps** — 150 particles, continuously emitted from foreground tentacle tips, short lifetime, curl-noise drift
- **Pressure ring** — 1 (just the active ring), shader-only, no particle pool

---

## Post-Processing Reboot

| Pass | Current | New |
|---|---|---|
| Bloom strength | 0.55 | **1.2** |
| Bloom threshold | 0.55 | **0.35** (more highlights bleed) |
| Vignette | 0.55 | **0.85** with subtle 14s pulse |
| Film grain | 0.025 | **0.04** with slightly coarser pattern |
| CA (idle) | 0.0 | **0.1 continuous** ("underwater glass" feel) |
| CA (moment burst) | 1.5 | **2.5** |
| **NEW: Color grade** | — | Teal-orange split-tone LUT in custom shader pass: lift teal in shadows, lift orange-amber in highlights |
| **NEW: Depth fog** | — | Linear fog by NDC z, color = deep void purple, density ramps by Z |
| **NEW: Lens distortion** | — | Subtle barrel at edges (~3% at corners) for cinematic glass feel |

These are added to the existing `EffectComposer` chain. The custom `ShaderPass` (post-FX) gains additional uniforms: `uSplitTone` (vec3 highlight + vec3 shadow + amount), `uLensDistort` (float), and the existing `uVignette` uniform gets a per-frame pulse modulation.

---

## Moment System (carried forward, sharpened)

Same six variants, same scheduler, same locked weights (30/20/15/15/15/5), same no-back-to-back constraint. **Cadence change: 75±10s → 90±10s.** Spacing more comfortably between moments lets the new continuous ambient work breathe. The user explicitly chose this cadence to avoid over-eventing.

Each variant is upgraded to leverage the new ambient layers:

- **Lightning Strike** — god-rays flare 4× peak intensity for 0.6s; caustics intensify; full-canvas refraction shake (post-fx `uLensDistort` spikes 0.06 then settles); existing flash + chromatic burst + tagline pop preserved.
- **Kraken Roar** — bubbles burst from kraken center (~120 marine-snow particles redirected upward briefly with size boost); audio gains a low-pass "muffled-water" envelope on the storm bed for ~1.5s; pressure pulse propagates outward at 2× normal amplitude.
- **The Watching** — eye drift extended to 4.0s (was 3.0s); a faint pressure ring follows the gaze position; everything else still continues underneath.
- **Beat-down** — robot is *dragged* (not just spun) toward a corner over 1.8s with a long motion trail (ghost layer alpha-blends), then springs back.
- **Border Surge** — corner sparks now bioluminescent (teal glow, not just gold); cascade synced to a faint pressure pulse.
- **Ink Eruption** — ink mixes with caustics for psychedelic warp (caustics shader gains `uInkInfluence` uniform); eyes glow brighter through the cloud (override intensity 1.6 instead of 1.4).

---

## Operator UX (carried forward unchanged)

No changes to:

- Splash screen + ROUSE THE KRAKEN button + audio toggle + auto-fullscreen toggle
- Spacebar manual moment trigger
- Debug overlay (D key) with FPS, state, force-trigger buttons
- WebGL fallback page → links to mockup
- WebGL context-loss recovery (single recover, double-loss → fallback)
- Visibility-pause for hidden tabs

The debug overlay's force-trigger buttons continue to fire any of the six variants. Spacebar continues to jitter-trigger a random variant.

---

## Long-Run Safety

All new pools are fixed-size with no per-frame allocations (same pattern as existing plankton). All new shaders are pixel-cost-only (no compute). All animation is rAF-driven (no `setTimeout` for tween timing).

### Tiered auto-degrade

The watchdog rolling-30s FPS sampler now ladders through more steps:

| Level | Trigger | Action |
|---|---|---|
| L1 | avg FPS < 50 | Disable god-rays + caustics passes; halve zooplankton (1500 → 750) and marine snow (600 → 300) |
| L2 | avg FPS < 38 | Disable bloom + lens distortion + depth fog; cap CA at 0 idle |
| L3 | avg FPS < 25 | Direct render: skip EffectComposer entirely; render raw scene only |
| L4 | avg FPS < 18 | Redirect to `backdrop-mockup.html` (existing static fallback) |

Each step is one-way (no recovery upward). Each step logged with `console.warn`.

### Self-test on load

When the splash button is clicked, run a 1-second pre-flight: render a benchmark scene (single full-canvas shader pass) and measure frame time. If average < 30 FPS, start at L1 immediately to avoid a degrade cascade in the first few seconds.

---

## File Structure & Module Map

The implementation is structured as **independent module groups** that can be built in parallel. Each new file is self-contained; main.js integration happens in a separate sequential pass.

### Group A — New shaders (parallel-safe; each agent owns one file)

- `src/shaders/depth-void.glsl.js`
- `src/shaders/godrays.glsl.js`
- `src/shaders/caustics.glsl.js`
- `src/shaders/pressure.glsl.js`
- `src/shaders/multi-segment-tentacle.glsl.js` (replaces existing `tentacles.glsl.js`)
- `src/shaders/ocean-surface.glsl.js` (replaces existing `waves.js` shader)

### Group B — New module wrappers (parallel-safe; each owns one new file plus its shader handle)

- `src/godrays.js` — instantiates god-rays plane, exposes `update(t)` + `setSweep(angle)`
- `src/caustics.js` — instantiates caustics plane, exposes `update(t)` + `setInkInfluence(v)`
- `src/marine-snow.js` — particle pool, `update(dt)` + `redirectUpward(durationSec, count)` (used by Roar)
- `src/zooplankton.js` — replaces current plankton pool with colored variant; preserves `pullStrength`, `update`, `setCount` API
- `src/ink-wisps.js` — continuous emission from foreground tentacle tips, `update(dt)` + `addEmitter(getPosition)` + `removeEmitter(id)`
- `src/pressure-pulse.js` — single radial-ring shader plane, `pulse(originXY, amplitude)` + `update(t)`
- `src/ocean-surface.js` — replaces `waves.js`; full bottom-25% surface, exposes same `update(t)` + `setRipple(v)` API
- `src/robots-svg.js` — replaces `robots.js`; SVG silhouettes + motion-trail layer; exposes same `update(t)` + `spinOne()` + new `dragOne(targetXY, durationSec)`
- `src/border-baroque.js` — replaces border construction inside `overlay.js`; extracts to its own module with SVG `<filter>` chain
- `src/ambient-events.js` — owns the 12s pressure-pulse + 25±5s distant-lightning ambient timers; takes references to `pressure-pulse`, `lightning`, `postFx` and just runs

### Group C — Updates to existing files (sequential after A & B; main agent does this)

- `src/postprocess.js` — add color-grade + depth-fog + lens-distortion uniforms to FX pass; bump bloom defaults
- `src/scene.js` — add camera-breathing scale modulation (called from main loop)
- `src/main.js` — wire all new modules in correct depth order; wire ambient events; replace plankton with zooplankton; replace canvas robots with SVG; replace waves with ocean-surface; replace tentacles shader; bump scheduler interval to 90±10s; pass new ambient handles into moment ctx
- `src/moments/lightning.js` — add god-rays flare + caustics intensify + lens-distort spike
- `src/moments/roar.js` — add bubble redirect + audio low-pass envelope + 2× pressure pulse
- `src/moments/watching.js` — extend duration 3 → 4s + add gaze-following pressure ring
- `src/moments/beat-down.js` — replace `spinOne()` with `dragOne(targetXY)` + motion trail
- `src/moments/border-surge.js` — sync teal cascade to pressure pulse
- `src/moments/ink-eruption.js` — set caustics `uInkInfluence` + bump eye intensity 1.4 → 1.6
- `src/watchdog.js` — extend degrade ladder to L4 (redirect to mockup)
- `src/splash.js` — add 1-second pre-flight benchmark on click before resolving

### Group D — Test additions

- `tests/scheduler.test.html` — update interval bounds: `n >= 80 && n <= 100` for the 90±10s cadence

---

## Parallelism Strategy (for the implementation plan)

The plan must be structured so multiple subagents can work simultaneously without main.js conflicts. Decomposition:

**Wave 1 — fully parallel (no shared files):**
- 6 shader files (Group A) — each agent owns one `.glsl.js` file
- 9 new module wrappers (Group B) — each agent owns one new `.js` file

These can run as **15 concurrent subagents**. Each builds + commits one file. Zero overlap.

**Wave 2 — sequential (single agent, modifies main.js + many small file edits):**
- Wire all new modules in main.js
- Update post-processing + scene + watchdog + splash
- Update all 6 moment files
- Update scheduler test interval
- Re-run the test suite + browser smoke test

Wave 1 + Wave 2 yields a substantial cinematic upgrade in the time of one big-prompt subagent dispatch + one wiring pass.

---

## Deliverable & Hosting

Same as the prior spec:

- `index.html` + `src/` → multi-file static site
- Served at `https://kraken.bscnsltng.com/` via GitHub Pages with Let's Encrypt + HTTPS-enforced
- No build step
- `backdrop-mockup.html` retained as L4 fallback
- `ai-prompt.md` retained for derivative artwork

---

## Day-of Operations (no change)

Same as prior spec — operator opens the URL, clicks **ROUSE THE KRAKEN**, optionally enables audio, walks away. Spot-check once per hour.

---

## Verification

Same verification gates as before, plus:

1. **Visual** — open in Chrome at full HD; confirm continuous ambient life is visible (god-rays sweep, caustics flow, marine snow falls, zooplankton drift, pressure pulse fires every ~12s, distant lightning every ~25s).
2. **Aspect** — square canvas centers and letterboxes correctly at 1920×1080, 1280×720, 3840×2160.
3. **Variant** — debug-force each of the 6 moments; each fires correctly with the new ambient effects (lightning flares god-rays, roar redirects bubbles, etc.).
4. **Auto-degrade ladder** — Chrome devtools CPU throttle 6× → confirm L1 trips first (god-rays + caustics off); throttle harder → L2, L3, L4 in order.
5. **Soak** — 12 continuous hours on the actual booth laptop the day before the event; memory flat ±5%; FPS green throughout; all six variants observed.
6. **Hosted** — same checks via `https://kraken.bscnsltng.com/`.

---

## Relationship to Prior Spec

The prior animated spec (`docs/superpowers/specs/2026-04-16-kraken-backdrop-animated-design.md`) defined the architecture, scheduler, moment system, splash, debug, watchdog, fallback, deployment, and the locked spec elements. **All carry forward unchanged.** This spec replaces only the visual treatment: the layer composition, the shaders, the particle pools, the post-processing pipeline, the robot art, the border filter chain, the camera/hero motion, and the moment-cadence value (75±10s → 90±10s).

Where the two specs would conflict, **this spec takes precedence on visual treatment**; the prior spec remains authoritative on architecture, robustness, deployment, and operator UX.
