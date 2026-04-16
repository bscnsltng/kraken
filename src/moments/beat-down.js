// src/moments/beat-down.js — robot dragged toward a corner, 4s.
// New: dragOne() instead of spinOne(); motion-trail ghost layer fades back over duration.
export function beatDown(ctx) {
  const { robots } = ctx;
  return {
    duration: 4.0,
    steps: [
      { t: 0.0, fn: () => {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const targetX = sign * 0.92;
        const targetY = -0.92;
        robots.dragOne({ x: targetX, y: targetY }, 1.8);
      }},
    ],
  };
}
