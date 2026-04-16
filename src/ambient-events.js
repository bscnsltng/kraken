// src/ambient-events.js — continuous ambient timed events (NOT scheduled "moments").
// Two periodic generators: pressure pulse every 12s, distant lightning flash
// every 25±5s. Both use rAF-driven elapsed time, not setTimeout.
//
// Usage:
//   const ambient = createAmbientEvents({ pressurePulse, postFx });
//   // in loop:
//   ambient.update(t);  // t = clock.getElapsedTime()
//
// pressurePulse: object with .pulse(originX, originY, amplitude, durationSec, t0)
// postFx: object with .flash(strength) (used briefly for distant-lightning flash)
export function createAmbientEvents({ pressurePulse, postFx }) {
  let nextPressureAt = 12.0;
  let nextLightningAt = 8.0 + Math.random() * 8.0;

  return {
    update(t) {
      if (t >= nextPressureAt) {
        pressurePulse.pulse(0.5, 0.55, 0.35, 1.4, t);
        nextPressureAt = t + 12.0;
      }
      if (t >= nextLightningAt) {
        postFx.flash(0.05);
        nextLightningAt = t + 20.0 + Math.random() * 10.0;
      }
    },
  };
}
