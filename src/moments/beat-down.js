// src/moments/beat-down.js — one robot spins, 4s
export function beatDown(ctx) {
  const { robots } = ctx;
  return {
    duration: 4.0,
    steps: [{ t: 0.0, fn: () => robots.spinOne() }],
  };
}
