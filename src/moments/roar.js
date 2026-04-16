// src/moments/roar.js — Kraken Roar, 5s
// New: bubble redirect (marine snow flipped upward), 2× pressure pulse, muffled storm bed.
export function krakenRoar(ctx) {
  const {
    krakenOverlays, waves, audio, postFx, screenShake, tentacles,
    marineSnow, pressurePulse
  } = ctx;
  return {
    duration: 5.0,
    steps: [
      { t: 0.0, fn: () => {
        if (audio) { audio.growl(); audio.muffleStorm(1.5); }
        krakenOverlays.setEyeIntensity(1.3);
        marineSnow.redirectUpward(2.0, 120, -0.2);
        pressurePulse.pulse(0.5, 0.55, 1.2, 1.6);
      }},
      { t: 1.0, fn: () => { waves.setRipple(1.2); screenShake(4, 0.18); postFx.desaturate(0.3, 1.4); tentacles.slamLower(0.6); }},
      { t: 2.5, fn: () => { waves.setRipple(0.4); }},
      { t: 4.0, fn: () => { krakenOverlays.resetEyes(); waves.setRipple(0); }},
    ],
  };
}
