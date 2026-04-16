// src/moments/watching.js — silent eye drift, 3s
export function theWatching(ctx) {
  const { krakenOverlays } = ctx;
  return {
    duration: 3.0,
    steps: [
      { t: 0.0, fn: () => krakenOverlays.animateEyeDrift(3.0) },
    ],
  };
}
