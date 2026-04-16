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
