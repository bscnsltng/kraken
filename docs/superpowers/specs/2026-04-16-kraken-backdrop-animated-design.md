# 43146K KRAKEN — Animated Booth Backdrop (Final Render) Design Spec

**Date:** 2026-04-16
**Team:** 43146K KRAKEN — Barbe High School, Lake Charles, LA
**Competition:** VEX Robotics World Championship — *Pushback* season
**Concept:** "PUSHBACK: A Kraken's Warning" — animated edition
**Supersedes (as primary deliverable):** the static-PNG path defined in `docs/superpowers/specs/2026-04-15-kraken-booth-backdrop-design.md`

---

## Overview

A **single-file, self-contained HTML document (`backdrop-final.html`)** that renders a cinematic, GPU-accelerated animated version of the booth backdrop and is projected fullscreen onto the team's 8×8 ft fabric backdrop at the booth. Replaces the previously-planned static PNG output as the primary projected artifact. The original static mockup (`backdrop-mockup.html`) is retained as a low-fi fallback for hardware that cannot run WebGL.

The design preserves every locked element of the prior spec — composition, color palette, canonical strings, asset placement, the 1:1 square canvas — and layers cinematic motion, scripted "moments," and projector-grade polish on top.

---

## Goals

- Stop people walking past the booth from across the convention hall.
- Reward closer inspection with detail (judges).
- Run continuously for a full competition day (12+ hours) on a typical school-issue laptop driving a projector, without crashing, leaking memory, or visibly degrading.
- Stay faithful to the locked spec — same composition, palette, strings, hero asset.
- Recover gracefully from any single-component failure (WebGL loss, missing asset, low FPS) without ever showing a black screen at the booth.

## Non-Goals

- Touch / mouse / keyboard interactivity beyond operator controls (it is a backdrop, not a kiosk).
- Multi-monitor or video-wall layouts.
- Live data feeds (no scoreboard ticker, social feed, or external API integration).
- Authoring UI for editing moments (the six variants are hand-coded).
- Mobile / tablet rendering.

---

## Locked Elements (carried forward unchanged from prior spec)

- 1:1 square composition; canvas always renders square inside the projector frame.
- Color palette CSS variables: `--void #080010`, `--deep #1A0033`, `--royal #6B0AC9`, `--gold #FFD700`, `--green #00A550`, `--teal #00E5CC`, `--red #CC0000`, `--white #E8E8FF`.
- Three-zone composition: top 20% (storm sky + arched team name), center 55% (hero logo + tentacles + glow), bottom 25% (robots + tagline + school credit).
- Canonical strings: `43146K KRAKEN`, `THEY SAID PUSHBACK.`, `THE KRAKEN SAID NO.`, `BARBE HIGH SCHOOL · LAKE CHARLES, LA`.
- Source assets: `Kraken 43146K Logo.png` (hero, ~60% canvas width, never altered), `VEX Worlds Logo copy.png` (bottom-right, inside border).
- Mardi Gras ornate border frame on all four edges with beads, corner masks, scrollwork.
- RGB color space; output sized for projection (no print/CMYK).

---

## Tech Stack & Approach

**Approach:** Three.js (WebGL2) with EffectComposer post-processing pipeline. Hybrid rendering — WebGL canvas underneath for atmospheric/particle layers, HTML/CSS overlay on top for crisp text and the SVG-based Mardi Gras border.

**Rationale:** GPU-accelerated rendering is the only way to hit the cinematic-grade visual ceiling the team wants (depth, particles, post-processing). Three.js was chosen over hand-rolled WebGL2 to keep the code maintainable and the EffectComposer chain (bloom, chromatic aberration, vignette, film grain) trivial to set up. Text and border are kept in HTML/CSS so they render pixel-crisp at any projector resolution without SDF-font complexity.

**Single-file delivery:** Three.js, the EffectComposer chain, and (optionally) audio assets are inlined into `backdrop-final.html`. Result is one ~2–3 MB file that runs offline. No CDN dependency. The two source PNGs are loaded by relative path from the same directory.

---

## Render Target & Aspect Handling

- Square WebGL canvas sized to `min(viewportWidth, viewportHeight)`, centered horizontally and vertically.
- Page background outside the canvas is `#000000` — letterbox bars on a 16:9 projector are intentional and align with the physical 8×8 ft square fabric.
- Canvas resizes on `resize` and `orientationchange` events; renderer + camera updated.
- DPR (devicePixelRatio) clamped to `min(window.devicePixelRatio, 2)` to avoid retina-laptop-driving-projector double-render cost.

---

## Scene Composition (Depth Layers, Back-to-Front)

| # | Layer | Tech | Purpose |
|---|---|---|---|
| 0 | Void / sky shader | Custom fragment shader on a fullscreen quad | Animated noise ribbons, slow drift, deep purple → black gradient |
| 1 | Storm clouds | Two textured noise planes | Slow drift in opposite directions, full-canvas wrap ~3 min |
| 2 | Distant tentacles | Bezier-mesh geometry, vertex shader sway | Silhouettes behind kraken, low-frequency motion |
| 3 | Lightning | GPU particle system, branching fork generator | Triggered only during Lightning Strike moment (~250ms life) |
| 4 | **Hero kraken PNG** | Textured plane | The locked logo asset — never modified |
| 5 | Eye-pulse overlays | Two red sprite quads | Continuous breathing pulse, flares during moments, drifts during The Watching |
| 6 | Hat specular | Masked diagonal-sweep shader | Light highlight crossing the pirate hat every ~12s |
| 7 | Foreground tentacles | Geometry in front of kraken's lower body | Snap during moments, otherwise sway |
| 8 | Plankton | GPU particle system (~800 motes) | Curl-noise field, subtle drift; pulled toward kraken during moment buildup |
| 9 | Spray / ink wisps / embers | GPU particle pools (200 / 300 / 150) | Triggered by moments at wave line / tentacle tips / lightning impact points |
| 10 | Robots | Two stylized SVG-style sprites | Subtle tilt-jitter; one spins during Beat-down |
| 11 | **Mardi Gras border** | HTML/CSS + SVG overlay | Beads, masks, scrollwork; bead glints + Border Surge handled in this layer |
| 12 | **Text overlays** | HTML/CSS overlay | `43146K KRAKEN` arched, two-line tagline, school credit, VEX logo |
| 13 | Post-processing | EffectComposer | Selective bloom (golds/teals/reds), vignette, film grain, chromatic aberration during moment |

**Layer 11 and 12 are HTML, not WebGL** — they sit in a `<div>` overlay layered above the WebGL canvas, sized to track the canvas, so text stays sharp at any resolution.

---

## Idle State (continuous, no visible seam)

Multiple loops at incommensurate periods so nothing visibly resets:

- **Tentacles:** Perlin-noise-driven rotation around base points, periods 3.8s / 4.2s / 4.7s / 5.1s / 5.5s / 6.0s.
- **Storm clouds:** two layers drifting at 0.02 / 0.035 px/frame in opposite directions; full wrap ~3 min each.
- **Plankton:** ~800 motes following a curl-noise field; occasional accelerations toward the kraken before fading.
- **Eye pulse:** sine-wave brightness on red overlays, period 2.6s, range 0.4 → 0.7.
- **Bead glints:** every 1.2–2.5s, one random border bead briefly hits 2× brightness, fades over 600ms.
- **Hat specular sweep:** thin highlight crosses the pirate hat every ~12s, 800ms duration.
- **Wave line:** scrolling SVG wave under the logo (carried from existing mockup).
- **Robots:** ±2° tilt-jitter on 7s / 9s loops, suggesting suspension by tentacles.

---

## Moment System

A scripted dramatic beat fires every **75 seconds with ±10 s jitter**. Six variants are scheduled in weighted random rotation, with the constraint that the same variant never repeats back-to-back. Operator can manually trigger a random moment with the spacebar.

### Distribution

| Variant | Weight | Avg interval | Length |
|---|---|---|---|
| Lightning strike | 30% | ~4 min | 7.0s |
| Kraken roar | 20% | ~6 min | 5.0s |
| The Watching | 15% | ~8 min | 3.0s |
| Border surge | 15% | ~8 min | 5.0s |
| Ink eruption | 15% | ~8 min | 6.0s |
| Beat-down | 5% | ~25 min | 4.0s |

### Variant 1 — Lightning Strike (canonical)

| t (s) | Beat | What happens |
|---|---|---|
| 0.0 | Pull | Plankton accelerate inward toward kraken; background dims 18%; eye pulse rate doubles. *(Audio: low rumble fades in.)* |
| 1.8 | Charge | Eyes flare red and hold; distant tentacles curl forward; vignette closes in. |
| 2.8 | Crack | Single full-canvas white flash (180ms); two branching lightning forks against storm sky. *(Audio: thunder crack.)* |
| 2.8 | Lurch | Kraken logo scales 1.04× over 120ms with 4–6 px chromatic aberration shudder. |
| 2.85 | Snap | Foreground tentacles snap toward camera/corners; sea-spray particles burst from wave line. |
| 2.9 | Shake | Whole canvas micro-shakes ±6 px for 220ms. |
| 3.5 | Settle | Bloom intensifies then eases; `THE KRAKEN SAID NO.` gets one-shot 1.06× scale-pop with teal flash. |
| 4.0 | Embers | Gold sparks float upward from lightning impact points. |
| 5.5 | Decay | Eye pulse and bloom return to baseline. |
| 7.0 | Idle | Resume ambient. |

### Variant 2 — Kraken Roar

No lightning. Eyes flare longer (~1.5s hold). Both lower tentacles slam down, triggering a wave-displacement ripple at the logo base. Entire color palette briefly desaturates (~70% saturation) and pulses back. *(Audio: long low growl.)*

### Variant 3 — The Watching

Silent. Eye-pulse overlay sprites drift horizontally ±8 px from their painted center positions (left → hold → right → hold → return) over 3.0s, creating the illusion of the kraken slowly tracking something across the hall. No flash, no shake, no audio spike. All other ambient effects continue underneath. The creepiest 3 seconds in the loop.

### Variant 4 — Beat-down (rare gag)

One of the two foreground robots gets yanked harder than usual by a tentacle, spins 360° on its own axis over ~1.5s, then is set back. No lightning, no audio spike. Smaller-scale moment, more humor than menace — texture break.

### Variant 5 — Border Surge

Mardi Gras bead glints cascade in a sequential wave around the entire frame border (top → right → bottom → left). Gold sparks shower from the four corner masks. Brief teal pulse runs through every bead strand. Leans into the festive Mardi Gras side of the design.

### Variant 6 — Ink Eruption

Kraken releases a billowing ink cloud (Perlin-noise mask) that darkens ~60% of the canvas. Red eyes glow through the cloud — single most unsettling beat in the rotation. Cloud disperses after ~3s into bioluminescent residue.

---

## Operator UX

### Splash / start screen

Loaded state: dark page, kraken logo at 25% size, and:

- **Primary action:** large gold button — `ROUSE THE KRAKEN`. Click requests fullscreen, starts render loop, hides splash. Single user-gesture also satisfies browser autoplay-with-sound rules.
- **Toggle:** 🔊 Audio (default OFF). When on, ambient storm bed loops at ~25% with thunder/growl spikes during moments. Generated via WebAudio synthesis (no asset files).
- **Toggle:** 🖥️ Auto-fullscreen (default ON). Calls `requestFullscreen()` on the canvas container.

Below the button, in tiny gray text:
> Press **F** to toggle fullscreen · **Space** to trigger a moment · **Esc** to exit fullscreen · **D** for debug overlay

### Hidden debug overlay (toggle with `D`)

Translucent corner panel:
- FPS (current + 60s rolling avg, color-coded green / yellow / red)
- Resolution / aspect ratio / DPR
- Current state (`idle` / `moment:lightning` / etc.) with countdown to next moment
- Memory usage (if `performance.memory` available)
- Force-moment buttons (1–6)
- Audio status

Off by default. Used only during the night-before soak test.

---

## Long-Run Safety

- **Object pools** for every particle system, allocated once, fixed size: plankton (800), spray (200), embers (150), ink puffs (300), lightning forks (8). Zero `new` calls in the render loop.
- **No DOM mutations in the render loop** — only the text overlay's CSS-class toggles for moment scale-pops, and those are debounced.
- **`visibilitychange` pauses rendering** — render loop halts when tab/window is hidden; resumes on visibility. Saves GPU thermal headroom during screensaver.
- **WebGL context-loss recovery** — listens for `webglcontextlost` / `webglcontextrestored`; on restore, reloads textures and resumes. If two consecutive losses occur, falls back to mockup.
- **Auto-degrade watchdog** — rolling 10-second FPS average. <45 → cut plankton 50%. <35 → disable bloom. <25 → disable post-processing entirely. Logged to console; debug overlay shows degraded state. Never recovers upward (avoids oscillation).
- **Periodic GC nudge** — every 10 minutes, scheduler does one "quiet" frame (no moment, low particle activity).
- **Asset preload + verify** — both PNGs verified loaded before splash button enables. Failed texture → splash shows missing-file path, button disabled.
- **No `setTimeout` / `setInterval` for animation** — everything driven off `requestAnimationFrame` deltas to prevent skew over long runs.

---

## Failure Modes & Fallbacks

| Failure | Behavior |
|---|---|
| WebGL not supported | Splash shows `This browser can't run the animated backdrop` + button: **Open static mockup** → loads `backdrop-mockup.html` |
| Texture load failed | Splash shows path of missing file; start button disabled |
| Audio file missing/corrupt | Audio toggle disabled with `audio unavailable` text; visuals run normal |
| GPU context lost (one event) | Auto-recovery; render resumes |
| GPU context lost (two events in 60s) | Auto-fallback to mockup |
| Browser blocks fullscreen | Renders at window size; "Press F to fullscreen" overlay appears for 3s |
| Sustained low FPS | Silent auto-degrade pipeline (above) |

---

## Browser Support

- **Targeted:** Chrome / Edge / Firefox / Safari, last two major versions.
- **Recommended for booth use:** Chrome on the booth laptop. Most reliable WebGL + fullscreen behavior on cheap hardware.
- **Brave / private modes that block WebGL:** show WebGL-not-supported splash gracefully.

---

## Deliverable & File Structure

```
backdrop-final.html       ← new — the projected deliverable (this spec)
backdrop-mockup.html      ← unchanged — fallback + reference
ai-prompt.md              ← unchanged content + note added (see below)
Kraken 43146K Logo.png    ← unchanged
VEX Worlds Logo copy.png  ← unchanged
```

The mockup and the final renderer are **independent** — no shared CSS or JS. The only cross-reference is the WebGL-fallback splash button that opens the mockup.

`ai-prompt.md` gains a top-of-file note clarifying that the primary deliverable is now `backdrop-final.html`, and the prompts remain available for derivative print / social-media artwork.

---

## Day-of Operations Checklist

Ships in the spec for whoever drives the booth:

1. Plug projector. Confirm 1:1 keystone fits the 8×8 fabric backdrop.
2. Open `backdrop-final.html` in **Chrome** on the booth laptop.
3. Splash appears → confirm Auto-fullscreen ON, Audio toggle as desired (off by default).
4. Click **ROUSE THE KRAKEN**.
5. Verify ambient: tentacles sway, eyes pulse, plankton drift. Wait ~90 s — confirm one moment fires.
6. Press `D` to confirm FPS is green (>50). Press `D` again to hide.
7. Set laptop to never sleep / never lock screen.
8. Walk away. Spot-check once an hour.

---

## Verification (what counts as done)

This is a creative deliverable; verification is visual + endurance, in this order:

1. **Visual** — every variant manually triggered via debug overlay; all six look right; no Z-fighting; text crisp at 1080p.
2. **Aspect** — square canvas centers and letterboxes correctly at 1920×1080, 1280×720, 3840×2160.
3. **Auto-degrade** — Chrome devtools FPS throttling triggers each degrade step in order; no black screen at any step.
4. **WebGL-disabled** — opening with WebGL flagged off shows fallback splash with working "Open static mockup" button.
5. **Soak** — 12 continuous hours on the actual booth laptop the day before the event. Memory flat ±5%. FPS green throughout. No console errors. All six variants observed at least once.

---

## Out of Scope

- Touch / mouse / keyboard interactivity beyond operator controls.
- Multi-monitor or video-wall layouts.
- Live data integration.
- Authoring UI for editing moments.
- Mobile / tablet rendering.

If any become priorities later, they are separate projects.

---

## Relationship to Prior Spec

`docs/superpowers/specs/2026-04-15-kraken-booth-backdrop-design.md` defines the static canvas, palette, composition, typography, and source assets — all carried forward unchanged. This spec adds: the animated render path, the Three.js stack, the moment system, operator UX, long-run safety, fallbacks, and the day-of operations checklist. Where the two specs would conflict (the prior spec's "static PNG" output format), **this spec takes precedence as the primary projected deliverable**; the prior spec's PNG path becomes secondary use (print / social media via `ai-prompt.md`).
