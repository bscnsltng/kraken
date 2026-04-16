// src/moments/roar.js — Kraken Roar, 5s
export function krakenRoar(ctx) {
  const { krakenOverlays, waves, audio, postFx, screenShake } = ctx;
  return {
    duration: 5.0,
    steps: [
      { t: 0.0, fn: () => { if (audio) audio.growl(); krakenOverlays.setEyeIntensity(1.3); }},
      { t: 1.0, fn: () => { waves.setRipple(1.2); screenShake(4, 0.18); postFx.desaturate(0.3, 1.4); }},
      { t: 2.5, fn: () => { waves.setRipple(0.4); }},
      { t: 4.0, fn: () => { krakenOverlays.resetEyes(); waves.setRipple(0); }},
    ],
  };
}
