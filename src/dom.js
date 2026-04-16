// src/dom.js — safe DOM construction.
// All DOM throughout this project is built via these helpers.
const SVG_NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, text) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'id') e.id = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  if (text != null) e.textContent = String(text);
  return e;
}

export function svg(tag, attrs = {}, text) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = String(text);
  return e;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
