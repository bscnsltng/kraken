// src/fallback.js — WebGL-not-available landing page
import { el, clear } from './dom.js';

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (_) { return false; }
}

export function showFallback() {
  clear(document.body);
  const wrap = el('div', {
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#080010', color: '#FFD700',
      fontFamily: 'Georgia, serif', textAlign: 'center', padding: '40px',
    },
  });
  wrap.appendChild(el('h1', { style: { fontSize: '5vmin' } }, "WebGL not available on this browser."));
  wrap.appendChild(el('p', { style: { margin: '24px 0', opacity: '0.85' } },
    'The animated backdrop requires WebGL. Falling back to the static mockup.'));
  wrap.appendChild(el('a', {
    href: 'backdrop-mockup.html',
    style: {
      padding: '1.4vmin 3vmin', background: '#FFD700', color: '#1A0033',
      textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '0.4vmin',
    },
  }, 'OPEN STATIC MOCKUP'));
  document.body.appendChild(wrap);
}
