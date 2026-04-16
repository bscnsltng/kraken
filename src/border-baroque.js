// src/border-baroque.js — Mardi Gras border with carved-gold SVG filter chain.
// Replaces the buildBorder() function inside src/overlay.js. Exported as
// buildBorderBaroque(rootEl) which appends the border to rootEl.
import { svg, el } from './dom.js';

export function buildBorderBaroque(root) {
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

  const sparkle = svg('radialGradient', { id: 'sparkle' });
  sparkle.appendChild(svg('stop', { offset: '0%', 'stop-color': '#FFFCE0', 'stop-opacity': '1' }));
  sparkle.appendChild(svg('stop', { offset: '50%', 'stop-color': '#FFD700', 'stop-opacity': '0.4' }));
  sparkle.appendChild(svg('stop', { offset: '100%', 'stop-color': '#FFD700', 'stop-opacity': '0' }));
  defs.appendChild(sparkle);

  const filter = svg('filter', { id: 'baroque-chisel', x: '-10%', y: '-10%', width: '120%', height: '120%' });
  filter.appendChild(svg('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '1.6', result: 'blur' }));
  const specLight = svg('feSpecularLighting', {
    in: 'blur', surfaceScale: '4', specularConstant: '1.5', specularExponent: '22',
    'lighting-color': '#FFFFE0', result: 'spec'
  });
  specLight.appendChild(svg('fePointLight', { x: '-1000', y: '-1000', z: '400' }));
  filter.appendChild(specLight);
  filter.appendChild(svg('feComposite', {
    in: 'spec', in2: 'SourceAlpha', operator: 'in', result: 'specMasked'
  }));
  filter.appendChild(svg('feComposite', {
    in: 'SourceGraphic', in2: 'specMasked', operator: 'arithmetic',
    k1: '0', k2: '1', k3: '1', k4: '0', result: 'litResult'
  }));
  defs.appendChild(filter);

  s.appendChild(defs);

  const baroqueGroup = svg('g', { filter: 'url(#baroque-chisel)' });
  baroqueGroup.appendChild(svg('rect', { x: '3', y: '3', width: '994', height: '994', rx: '4', fill: 'none', stroke: '#FFD700', 'stroke-width': '4', opacity: '0.95' }));
  baroqueGroup.appendChild(svg('rect', { x: '10', y: '10', width: '980', height: '980', rx: '3', fill: 'none', stroke: '#6B0AC9', 'stroke-width': '2.5', opacity: '0.75' }));
  baroqueGroup.appendChild(svg('rect', { x: '48', y: '48', width: '904', height: '904', rx: '2', fill: 'none', stroke: '#FFD700', 'stroke-width': '1.5', opacity: '0.55' }));
  baroqueGroup.appendChild(svg('path', { d: 'M 380,28 Q 420,4 470,18 Q 500,4 530,18 Q 580,4 620,28', fill: 'none', stroke: '#FFD700', 'stroke-width': '2.5', opacity: '0.85' }));
  baroqueGroup.appendChild(svg('path', { d: 'M 380,972 Q 420,996 470,982 Q 500,996 530,982 Q 580,996 620,972', fill: 'none', stroke: '#FFD700', 'stroke-width': '2.5', opacity: '0.85' }));
  s.appendChild(baroqueGroup);

  const beadAttrs   = { fill: 'url(#beads-h)', rx: '6', opacity: '0.92' };
  const beadAttrsV  = { fill: 'url(#beads-v)', rx: '6', opacity: '0.92' };
  s.appendChild(svg('rect', { id: 'bead-top',   x: '56', y: '16',  width: '888', height: '13', ...beadAttrs }));
  s.appendChild(svg('rect', { id: 'bead-bot',   x: '56', y: '971', width: '888', height: '13', ...beadAttrs }));
  s.appendChild(svg('rect', { id: 'bead-left',  x: '16',  y: '56', width: '13', height: '888', ...beadAttrsV }));
  s.appendChild(svg('rect', { id: 'bead-right', x: '971', y: '56', width: '13', height: '888', ...beadAttrsV }));

  const masks = [[22, 48], [978, 48], [22, 990], [978, 990]];
  for (const [x, y] of masks) {
    s.appendChild(svg('text', { x: String(x), y: String(y), 'font-size': '32', 'text-anchor': 'middle', fill: '#FFD700', filter: 'url(#baroque-chisel)' }, '🎭'));
  }

  border.appendChild(s);
  root.appendChild(border);
  return border;
}
