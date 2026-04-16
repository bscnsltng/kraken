// src/overlay.js — HTML/CSS overlay (border + text + tagline pop + border surge).
// Built only via createElement / createElementNS / textContent.
import { el, svg, clear } from './dom.js';

function buildBorder(root) {
  const border = el('div', { class: 'ovl-border' });
  const s = svg('svg', {
    viewBox: '0 0 1000 1000',
    xmlns: 'http://www.w3.org/2000/svg',
    preserveAspectRatio: 'none',
  });
  const defs = svg('defs');
  const beadsH = svg('pattern', { id: 'beads-h', x: '0', y: '0', width: '26', height: '26', patternUnits: 'userSpaceOnUse' });
  beadsH.appendChild(svg('circle', { cx: '6',  cy: '13', r: '5', fill: '#FFD700', opacity: '0.95' }));
  beadsH.appendChild(svg('circle', { cx: '20', cy: '13', r: '5', fill: '#00E5CC', opacity: '0.95' }));
  defs.appendChild(beadsH);
  const beadsV = svg('pattern', { id: 'beads-v', x: '0', y: '0', width: '26', height: '26', patternUnits: 'userSpaceOnUse' });
  beadsV.appendChild(svg('circle', { cx: '13', cy: '6',  r: '5', fill: '#00A550', opacity: '0.95' }));
  beadsV.appendChild(svg('circle', { cx: '13', cy: '20', r: '5', fill: '#FFD700', opacity: '0.95' }));
  defs.appendChild(beadsV);
  s.appendChild(defs);

  s.appendChild(svg('rect', { x: '3', y: '3', width: '994', height: '994', rx: '4', fill: 'none', stroke: '#FFD700', 'stroke-width': '3', opacity: '0.85' }));
  s.appendChild(svg('rect', { x: '10', y: '10', width: '980', height: '980', rx: '3', fill: 'none', stroke: '#6B0AC9', 'stroke-width': '2', opacity: '0.65' }));

  const beadAttrs = { fill: 'url(#beads-h)', rx: '6', opacity: '0.9' };
  s.appendChild(svg('rect', { id: 'bead-top',   x: '56', y: '16',  width: '888', height: '13', ...beadAttrs }));
  s.appendChild(svg('rect', { id: 'bead-bot',   x: '56', y: '971', width: '888', height: '13', ...beadAttrs }));
  const beadAttrsV = { fill: 'url(#beads-v)', rx: '6', opacity: '0.9' };
  s.appendChild(svg('rect', { id: 'bead-left',  x: '16',  y: '56', width: '13', height: '888', ...beadAttrsV }));
  s.appendChild(svg('rect', { id: 'bead-right', x: '971', y: '56', width: '13', height: '888', ...beadAttrsV }));

  const masks = [[22, 48], [978, 48], [22, 990], [978, 990]];
  for (const [x, y] of masks) {
    s.appendChild(svg('text', { x: String(x), y: String(y), 'font-size': '30', 'text-anchor': 'middle', fill: '#FFD700' }, '🎭'));
  }
  s.appendChild(svg('path', { d: 'M 430,30 Q 470,8 500,20 Q 530,8 570,30', fill: 'none', stroke: '#FFD700', 'stroke-width': '2', opacity: '0.75' }));
  s.appendChild(svg('path', { d: 'M 430,970 Q 470,992 500,980 Q 530,992 570,970', fill: 'none', stroke: '#FFD700', 'stroke-width': '2', opacity: '0.75' }));
  s.appendChild(svg('rect', { x: '48', y: '48', width: '904', height: '904', rx: '2', fill: 'none', stroke: '#FFD700', 'stroke-width': '1', opacity: '0.45' }));

  border.appendChild(s);
  root.appendChild(border);
}

export function mountOverlay(container) {
  clear(container);
  buildBorder(container);

  container.appendChild(el('div', { class: 'ovl-team' }, '⚜ 43146K KRAKEN ⚜'));

  const tagWrap = el('div', { class: 'ovl-tagline' });
  tagWrap.appendChild(el('span', { class: 'ovl-tag1' }, 'THEY SAID PUSHBACK.'));
  const tag2 = el('span', { class: 'ovl-tag2', id: 'tag2' }, 'THE KRAKEN SAID NO.');
  tagWrap.appendChild(tag2);
  container.appendChild(tagWrap);

  container.appendChild(el('div', { class: 'ovl-school' }, 'BARBE HIGH SCHOOL · LAKE CHARLES, LA'));
  container.appendChild(el('img', { class: 'ovl-vex', src: 'VEX Worlds Logo copy.png', alt: 'VEX Robotics' }));

  return {
    popTagline() {
      tag2.classList.add('pop');
      setTimeout(() => tag2.classList.remove('pop'), 240);
    },
    borderSurge() {
      const strips = ['bead-top', 'bead-right', 'bead-bot', 'bead-left'];
      strips.forEach((id, i) => {
        setTimeout(() => {
          const stripEl = container.querySelector('#' + id);
          if (!stripEl) return;
          stripEl.style.transition = 'opacity 80ms ease-out, filter 80ms ease-out';
          stripEl.style.opacity = '1.0';
          stripEl.style.filter = 'brightness(2.4) saturate(1.4) drop-shadow(0 0 6px #00E5CC)';
          setTimeout(() => {
            stripEl.style.transition = 'opacity 700ms ease-in, filter 700ms ease-in';
            stripEl.style.opacity = '0.9';
            stripEl.style.filter = '';
          }, 250);
        }, i * 220);
      });
      const masks = container.querySelectorAll('.ovl-border svg text');
      masks.forEach((mEl, i) => {
        setTimeout(() => {
          mEl.style.transition = 'all 100ms ease-out';
          mEl.setAttribute('font-size', '40');
          mEl.style.filter = 'drop-shadow(0 0 12px #FFD700)';
          setTimeout(() => {
            mEl.style.transition = 'all 600ms ease-in';
            mEl.setAttribute('font-size', '30');
            mEl.style.filter = '';
          }, 200);
        }, 200 + i * 110);
      });
    },
  };
}
