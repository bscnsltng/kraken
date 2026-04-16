// scripts/bundle.mjs — produces a single self-contained backdrop-final.html
// by inlining the dev page, all ES modules under src/, and base64-encoded
// image assets. Each module becomes a Blob URL registered in a runtime
// importmap so the original specifiers (./src/...) resolve.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEV_HTML = join(ROOT, 'backdrop-dev.html');
const OUT_HTML = join(ROOT, 'backdrop-final.html');

function walkJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkJsFiles(full));
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

// 1. Inline image assets as base64 data URIs
const imgs = ['Kraken 43146K Logo.png', 'VEX Worlds Logo copy.png'];
const imgMap = {};
for (const img of imgs) {
  const data = readFileSync(join(ROOT, img));
  imgMap[img] = `data:image/png;base64,${data.toString('base64')}`;
}

// 2. Read all JS modules under src/, swap PNG path references to data URIs
const moduleFiles = walkJsFiles(join(ROOT, 'src'));
const modules = {};
for (const f of moduleFiles) {
  const rel = './' + relative(ROOT, f).replace(/\\/g, '/');
  let code = readFileSync(f, 'utf8');
  for (const [name, dataUri] of Object.entries(imgMap)) {
    code = code.replaceAll(`'${name}'`, `'${dataUri}'`);
    code = code.replaceAll(`"${name}"`, `"${dataUri}"`);
  }
  modules[rel] = code;
}

// 3. Read dev HTML; rewrite asset src; strip the original main.js script tag.
let html = readFileSync(DEV_HTML, 'utf8');
html = html.replace(/src="VEX Worlds Logo copy\.png"/g, `src="${imgMap['VEX Worlds Logo copy.png']}"`);
html = html.replace(/src="Kraken 43146K Logo\.png"/g, `src="${imgMap['Kraken 43146K Logo.png']}"`);
html = html.replace(/<script type="module" src="\.\/src\/main\.js"><\/script>/, '');

// 4. Build the loader: blob URLs for every module, then importmap, then entry import.
const blobLines = [];
const importMapEntries = [];
let i = 0;
for (const [path, code] of Object.entries(modules)) {
  const varName = `__m${i++}`;
  blobLines.push(`const ${varName} = URL.createObjectURL(new Blob([${JSON.stringify(code)}], {type:'text/javascript'}));`);
  importMapEntries.push(`  ${JSON.stringify(path)}: ${varName}`);
}

const loader = [
  '<script>',
  blobLines.join('\n'),
  'const importMap = { imports: {',
  importMapEntries.join(',\n'),
  '} };',
  "const mapEl = document.createElement('script');",
  "mapEl.type = 'importmap';",
  'mapEl.textContent = JSON.stringify(importMap);',
  'document.head.appendChild(mapEl);',
  "const entry = document.createElement('script');",
  "entry.type = 'module';",
  "entry.src = './src/main.js';",
  'document.body.appendChild(entry);',
  '</script>',
].join('\n');

html = html.replace(/<\/body>/, `${loader}\n</body>`);

writeFileSync(OUT_HTML, html);
console.log(`[bundle] wrote ${OUT_HTML} (${(html.length / 1024).toFixed(0)} KB)`);
