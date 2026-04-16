// src/moments/border-surge.js — bead cascade + corner sparks, 5s.
// New: synced to a pressure pulse from canvas center.
export function borderSurge(ctx) {
  const { overlay, pressurePulse } = ctx;
  return {
    duration: 5.0,
    steps: [
      { t: 0.0, fn: () => {
        overlay.borderSurge();
        pressurePulse.pulse(0.5, 0.5, 0.55, 1.6);
      }},
    ],
  };
}
