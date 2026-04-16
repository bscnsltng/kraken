// src/moments/watching.js — silent eye drift, 4s (was 3s).
// New: faint pressure ring follows the gaze position.
export function theWatching(ctx) {
  const { krakenOverlays, pressurePulse } = ctx;
  return {
    duration: 4.0,
    steps: [
      { t: 0.0, fn: () => krakenOverlays.animateEyeDrift(4.0) },
      { t: 0.5, fn: () => pressurePulse.pulse(0.42, 0.65, 0.18, 3.0) },
    ],
  };
}
