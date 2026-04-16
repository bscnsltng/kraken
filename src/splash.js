// src/splash.js — splash screen, fullscreen request, audio enable
import { el } from './dom.js';

export function setupSplash() {
  const splash = el('div', { id: 'splash' });
  splash.appendChild(el('img', { id: 'splash-logo', src: 'Kraken 43146K Logo.png', alt: '' }));
  const btn = el('button', { id: 'splash-btn' }, 'ROUSE THE KRAKEN');
  splash.appendChild(btn);

  const toggles = el('div', { id: 'splash-toggles' });
  const audioLabel = el('label');
  const audioBox = el('input', { type: 'checkbox', id: 'opt-audio' });
  audioLabel.appendChild(audioBox);
  audioLabel.appendChild(document.createTextNode(' 🔊 Enable audio'));
  toggles.appendChild(audioLabel);

  const fsLabel = el('label');
  const fsBox = el('input', { type: 'checkbox', id: 'opt-fs' });
  fsBox.checked = true;
  fsLabel.appendChild(fsBox);
  fsLabel.appendChild(document.createTextNode(' 🖥️ Auto-fullscreen'));
  toggles.appendChild(fsLabel);
  splash.appendChild(toggles);

  const help = el('div', { id: 'splash-help' });
  const parts = [
    'Press ', el('kbd', {}, 'F'), ' for fullscreen · ',
    el('kbd', {}, 'Space'), ' to trigger a moment · ',
    el('kbd', {}, 'Esc'), ' to exit fullscreen · ',
    el('kbd', {}, 'D'), ' for debug overlay',
  ];
  for (const p of parts) help.appendChild(typeof p === 'string' ? document.createTextNode(p) : p);
  splash.appendChild(help);

  document.body.appendChild(splash);

  return new Promise((resolve) => {
    btn.addEventListener('click', async () => {
      const audioEnabled = audioBox.checked;
      const fsEnabled = fsBox.checked;
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 600);
      if (fsEnabled) {
        try { await document.documentElement.requestFullscreen(); } catch (_) {}
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
