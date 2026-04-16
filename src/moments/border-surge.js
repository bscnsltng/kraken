// src/moments/border-surge.js — bead cascade + corner sparks, 5s
export function borderSurge(ctx) {
  const { overlay } = ctx;
  return {
    duration: 5.0,
    steps: [{ t: 0.0, fn: () => overlay.borderSurge() }],
  };
}
