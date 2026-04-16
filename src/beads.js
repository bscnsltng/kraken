// src/beads.js — random bead-glint scheduler that briefly brightens border bead strips
const STRIPS = ['bead-top', 'bead-bot', 'bead-left', 'bead-right'];

export function startBeadGlints(rootEl) {
  let nextAt = 1.2 + Math.random() * 1.3;
  let elapsed = 0;
  return {
    update(dt) {
      elapsed += dt;
      if (elapsed >= nextAt) {
        elapsed = 0;
        nextAt = 1.2 + Math.random() * 1.3;
        const id = STRIPS[Math.floor(Math.random() * STRIPS.length)];
        const stripEl = rootEl.querySelector('#' + id);
        if (!stripEl) return;
        stripEl.style.transition = 'opacity 100ms ease-out, filter 100ms ease-out';
        stripEl.style.opacity = '1.0';
        stripEl.style.filter = 'brightness(1.8) saturate(1.3)';
        setTimeout(() => {
          stripEl.style.transition = 'opacity 600ms ease-in, filter 600ms ease-in';
          stripEl.style.opacity = '0.9';
          stripEl.style.filter = '';
        }, 100);
      }
    },
  };
}
