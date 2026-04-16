// src/moments/ink-eruption.js — 6s
export function inkEruption(ctx) {
  const { krakenOverlays, ink } = ctx;
  return {
    duration: 6.0,
    steps: [
      { t: 0.0, fn: () => { ink.expand(0.0, 0.85, 1.5); krakenOverlays.setEyeIntensity(1.4); }},
      { t: 4.5, fn: () => { ink.expand(0.85, 0.0, 1.5); krakenOverlays.resetEyes(); }},
    ],
  };
}
