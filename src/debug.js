// src/debug.js — hidden FPS/state overlay, toggled with D
import { el, clear } from './dom.js';

const VARIANTS = ['lightning', 'roar', 'watching', 'beat', 'surge', 'ink'];

export function setupDebug({ scheduler, getFps, getState }) {
  const root = el('div', { id: 'debug' });
  document.body.appendChild(root);

  let visible = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
      visible = !visible;
      root.style.display = visible ? 'block' : 'none';
    }
  });

  function rebuild() {
    if (!visible) return;
    const fps = getFps();
    const fpsColor = fps > 50 ? '#6f6' : fps > 30 ? '#fc6' : '#f66';
    const mem = (performance.memory && performance.memory.usedJSHeapSize)
      ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + ' MB' : 'n/a';

    clear(root);
    const fpsLine = el('div', {}, 'FPS: ');
    fpsLine.appendChild(el('span', { style: { color: fpsColor } }, fps.toFixed(1)));
    root.appendChild(fpsLine);
    root.appendChild(el('div', {}, `Resolution: ${innerWidth}×${innerHeight} @ ${devicePixelRatio}x`));
    root.appendChild(el('div', {}, `State: ${getState()}`));
    root.appendChild(el('div', {}, `Next moment: ${scheduler.timeUntilNext().toFixed(1)}s`));
    root.appendChild(el('div', {}, `Memory: ${mem}`));

    const sep = el('div', { style: { marginTop: '6px', borderTop: '1px solid #6B0AC9', paddingTop: '4px' } });
    sep.appendChild(document.createTextNode('Force: '));
    VARIANTS.forEach((v, i) => {
      const btn = el('button', {
        style: { background: '#1A0033', color: '#FFD700', border: '1px solid #6B0AC9', cursor: 'pointer', margin: '0 2px' },
      }, String(i + 1));
      btn.addEventListener('click', () => { window.__forceMoment(v); });
      sep.appendChild(btn);
    });
    root.appendChild(sep);
  }

  setInterval(rebuild, 200);
}
