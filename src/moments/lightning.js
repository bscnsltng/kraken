// src/moments/lightning.js — Lightning Strike (canonical), 7s
export function lightningStrike(ctx) {
  const { plankton, spray, embers, krakenOverlays, lightning, waves, overlay, audio, postFx, krakenLurch, screenShake, tentacles } = ctx;
  return {
    duration: 7.0,
    steps: [
      { t: 0.00, fn: () => { plankton.pullStrength = 1.0; if (audio) audio.startRumble(); }},
      { t: 1.80, fn: () => { krakenOverlays.setEyeIntensity(1.2); tentacles.curlForward(1.0); }},
      { t: 2.80, fn: () => { postFx.flash(0.18); postFx.chromaticBurst(1.5); lightning.strike(); krakenLurch(1.04, 0.12); if (audio) audio.thunder(); }},
      { t: 2.85, fn: () => { waves.setRipple(1.0); spray.burst({ y: -0.55 }); tentacles.snapForward(0.4); }},
      { t: 2.90, fn: () => { screenShake(6, 0.22); }},
      { t: 3.50, fn: () => { postFx.bloomBoost(1.8, 0.6); overlay.popTagline(); }},
      { t: 4.00, fn: () => { embers.burst({ x: -0.12, y: 0.95 }); embers.burst({ x: 0.12, y: 0.95 }); }},
      { t: 5.50, fn: () => { krakenOverlays.resetEyes(); waves.setRipple(0); }},
      { t: 7.00, fn: () => { plankton.pullStrength = 0; if (audio) audio.stopRumble(); }},
    ],
  };
}
