// src/splash.js — splash screen, fullscreen request, audio enable
import { el } from './dom.js';

function showFsHint() {
  const hint = el('div', {
    style: {
      position: 'fixed', top: '20px', left: '50%',
      transform: 'translateX(-50%)', zIndex: '3000',
      background: 'rgba(8,0,16,0.85)', color: '#FFD700',
      padding: '10px 24px', borderRadius: '4px',
      fontFamily: 'Georgia, serif', fontSize: '2vmin', letterSpacing: '0.3vmin',
      border: '1px solid #6B0AC9', pointerEvents: 'none',
      transition: 'opacity 400ms ease',
    },
  });
  hint.appendChild(document.createTextNode('Press '));
  hint.appendChild(el('kbd', { style: { background: '#2a005a', border: '1px solid #6B0AC9', borderRadius: '3px', padding: '1px 6px' } }, 'F'));
  hint.appendChild(document.createTextNode(' to fullscreen'));
  document.body.appendChild(hint);
  setTimeout(() => { hint.style.opacity = '0'; }, 2600);
  setTimeout(() => hint.remove(), 3000);
}

// Pre-flight benchmark: measures FPS for `durationMs` and returns avg FPS.
// Used by main.js after splash click to seed the watchdog level on weak hardware.
export async function runBenchmark(durationMs = 1000) {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    function tick() {
      frames++;
      const elapsed = performance.now() - start;
      if (elapsed >= durationMs) {
        resolve((frames * 1000) / elapsed);
        return;
      }
      requestAnimationFrame(tick);
    }
    tick();
  });
}

export function setupSplash({ assetsReady } = {}) {
  const splash = el('div', { id: 'splash' });
  splash.appendChild(el('img', { id: 'splash-logo', src: 'Kraken 43146K Logo.png', alt: '' }));
  const btn = el('button', { id: 'splash-btn', disabled: 'disabled' }, 'LOADING\u2026');
  btn.style.opacity = '0.5';
  btn.style.cursor = 'wait';
  splash.appendChild(btn);

  const toggles = el('div', { id: 'splash-toggles' });
  const audioLabel = el('label');
  const audioBox = el('input', { type: 'checkbox', id: 'opt-audio' });
  audioLabel.appendChild(audioBox);
  audioLabel.appendChild(document.createTextNode(' \uD83D\uDD0A Enable audio'));
  toggles.appendChild(audioLabel);

  const fsLabel = el('label');
  const fsBox = el('input', { type: 'checkbox', id: 'opt-fs' });
  fsBox.checked = true;
  fsLabel.appendChild(fsBox);
  fsLabel.appendChild(document.createTextNode(' \uD83D\uDDA5\uFE0F Auto-fullscreen'));
  toggles.appendChild(fsLabel);
  splash.appendChild(toggles);

  const help = el('div', { id: 'splash-help' });
  const parts = [
    'Press ', el('kbd', {}, 'F'), ' for fullscreen \xB7 ',
    el('kbd', {}, 'Space'), ' to trigger a moment \xB7 ',
    el('kbd', {}, 'Esc'), ' to exit fullscreen \xB7 ',
    el('kbd', {}, 'D'), ' for debug overlay',
  ];
  for (const p of parts) help.appendChild(typeof p === 'string' ? document.createTextNode(p) : p);
  splash.appendChild(help);

  document.body.appendChild(splash);

  if (assetsReady) {
    assetsReady.then(() => {
      btn.removeAttribute('disabled');
      btn.style.opacity = '';
      btn.style.cursor = 'pointer';
      btn.textContent = 'ROUSE THE KRAKEN';
    }).catch((err) => {
      btn.textContent = 'ASSET ERROR';
      btn.style.background = '#CC0000';
      btn.style.color = '#FFD700';
      const errLine = el('div', { style: { fontSize: '1.2vmin', color: '#CC8888', maxWidth: '60vmin', wordBreak: 'break-all' } }, err.message);
      splash.insertBefore(errLine, help);
      // button stays disabled
    });
  } else {
    // fallback: enable immediately if no assetsReady provided
    btn.removeAttribute('disabled');
    btn.style.opacity = '';
    btn.style.cursor = 'pointer';
    btn.textContent = 'ROUSE THE KRAKEN';
  }

  return new Promise((resolve) => {
    btn.addEventListener('click', async () => {
      const audioEnabled = audioBox.checked;
      const fsEnabled = fsBox.checked;
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 600);
      if (fsEnabled) {
        try { await document.documentElement.requestFullscreen(); }
        catch (_) { showFsHint(); }
      }
      resolve({ audioEnabled });
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    });
  });
}
