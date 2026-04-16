// src/context-recovery.js — WebGL context lost/restored handlers
export function setupContextRecovery(canvas, onRestore) {
  let lossCount = 0;
  let lastLossAt = 0;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now - lastLossAt < 60000) lossCount++;
    else lossCount = 1;
    lastLossAt = now;
    console.warn('[ctx] lost (count:', lossCount, ')');
    if (lossCount >= 2) {
      console.error('[ctx] two losses in 60s — falling back to mockup');
      window.location.replace('backdrop-mockup.html');
    }
  });
  canvas.addEventListener('webglcontextrestored', () => {
    console.log('[ctx] restored — reloading textures');
    onRestore();
  });
}
