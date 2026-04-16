// src/moments/ink-eruption.js — 6s.
// New: caustics gain ink-influence (psychedelic warp); eye intensity 1.4 → 1.6.
export function inkEruption(ctx) {
  const { krakenOverlays, ink, residue, caustics } = ctx;
  return {
    duration: 6.0,
    steps: [
      { t: 0.0, fn: () => {
        ink.expand(0.0, 0.85, 1.5);
        krakenOverlays.setEyeIntensity(1.6);
        caustics.setInkInfluence(0.85, 0.35);
      }},
      { t: 4.5, fn: () => {
        ink.expand(0.85, 0.0, 1.5);
        krakenOverlays.resetEyes();
        residue.release({ x: 0, y: 0.05 });
        caustics.setInkInfluence(0.0, 0.04);
      }},
    ],
  };
}
