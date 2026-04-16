// scripts/generate-art.mjs — DALL-E 3 build-time art generation.
// Reads OPENAI_API_KEY (and optionally OPENAI_PROJECT_ID) from .env.
// Generates 6 PNGs into src/art/ if missing. Pass --force to regenerate all.
import 'dotenv/config';
import OpenAI from 'openai';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ART_DIR = join(ROOT, 'src/art');
mkdirSync(ART_DIR, { recursive: true });

const force = process.argv.includes('--force');

// Support both OPENAI_API_KEY (standard) and openai_platform_api_key (this repo's .env).
const apiKey   = process.env.OPENAI_API_KEY        || process.env.openai_platform_api_key;
const project  = process.env.OPENAI_PROJECT_ID     || process.env.openai_platform_project_id;
if (!apiKey) {
  console.error('[generate-art] no API key found (set OPENAI_API_KEY or openai_platform_api_key in .env)');
  process.exit(1);
}
const client = new OpenAI({ apiKey, project });

const ASSETS = [
  // Robots + marine accents use gpt-image-1 (true alpha channel support).
  // The abyssal backdrop stays on DALL-E 3 (no transparency needed; opaque
  // background IS the point — it's the scene).
  {
    name: 'robot-1.png',
    model: 'gpt-image-1',
    transparent: true,
    prompt: 'Isolated VEX robotics competition robot on a pure transparent ' +
            'background (no environment, no scene). Dark royal purple chassis ' +
            '(#6B0AC9), square frame with mecanum wheels, vertical lift arm with ' +
            'end-effector claw, two glowing teal (#00E5CC) camera eye indicators, ' +
            'single antenna on top. Crisp clean vector-illustration feel, slight ' +
            'side-3/4 angle. No text, no logos, no ground shadow, no backdrop.',
    size: '1024x1024',
  },
  {
    name: 'robot-2.png',
    model: 'gpt-image-1',
    transparent: true,
    prompt: 'Isolated VEX robotics competition robot on a pure transparent ' +
            'background (no environment, no scene). Dark royal purple chassis ' +
            '(#6B0AC9), wider rectangular frame with omni wheels, horizontal ' +
            'intake roller arm at front, two small glowing teal (#00E5CC) camera ' +
            'eyes, dual antennas. Crisp clean vector-illustration feel, slight ' +
            'side-3/4 angle mirrored from the other robot. No text, no logos, ' +
            'no ground shadow, no backdrop.',
    size: '1024x1024',
  },
  {
    name: 'abyssal-backdrop.png',
    prompt: 'Cinematic deep-ocean abyss vertical scene. Top of frame is a ' +
            'bruised storm-blue surface with very subtle distant light shafts ' +
            'piercing down. Middle is a vast deep purple void (#1A0033 to ' +
            '#080010). Bottom is jet-black abyssal depth. Soft caustic light ' +
            'patterns hint at the upper third. Distant submerged geometric ' +
            'silhouettes vaguely visible in the murk. Color palette dominated ' +
            'by #080010, #1A0033, #6B0AC9, with hints of #00E5CC. No text, ' +
            'no border, no fish, no creatures, no ships. Painterly cinematic ' +
            'concept-art style. Square aspect ratio. Atmospheric, unsettling, ' +
            'beautiful.',
    size: '1024x1024',
  },
  {
    name: 'accent-jellyfish.png',
    model: 'gpt-image-1',
    transparent: true,
    prompt: 'Isolated single translucent bioluminescent deep-sea jellyfish on a ' +
            'pure transparent background. Glowing teal and violet (#00E5CC, ' +
            '#6B0AC9), flowing tentacles trailing below. Soft inner glow. ' +
            'Stylized but elegant. No scene, no water, no background, no text.',
    size: '1024x1024',
  },
  {
    name: 'accent-anglerfish.png',
    model: 'gpt-image-1',
    transparent: true,
    prompt: 'Isolated single deep-sea anglerfish on a pure transparent ' +
            'background. Dark royal purple body (#6B0AC9), single bioluminescent ' +
            'lure dangling above its mouth glowing teal (#00E5CC). Side profile. ' +
            'Sinister, predatory, but stylized. No scene, no water, no ' +
            'background, no text.',
    size: '1024x1024',
  },
  {
    name: 'accent-squid.png',
    model: 'gpt-image-1',
    transparent: true,
    prompt: 'Isolated single deep-sea squid on a pure transparent background. ' +
            'Royal purple body (#6B0AC9), tentacles trailing, suggestion of ' +
            'luminescent spots along its mantle in teal (#00E5CC). Side profile, ' +
            'subtle, stylized. No scene, no water, no background, no text.',
    size: '1024x1024',
  },
];

async function generate(asset) {
  const dest = join(ART_DIR, asset.name);
  if (existsSync(dest) && !force) {
    console.log(`  - ${asset.name}: already exists, skipping (use --force to regenerate)`);
    return;
  }
  console.log(`  - ${asset.name}: requesting generation (${asset.model || 'dall-e-3'})...`);
  const params = {
    model: asset.model || 'dall-e-3',
    prompt: asset.prompt,
    size: asset.size,
    n: 1,
  };
  // gpt-image-1 supports true transparency via `background: "transparent"`.
  // DALL-E 3 does not; it returns base64 directly via response_format.
  if (params.model === 'gpt-image-1') {
    if (asset.transparent) params.background = 'transparent';
  } else {
    params.response_format = 'b64_json';
  }
  const response = await client.images.generate(params);
  const b64 = response.data[0].b64_json;
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(dest, buf);
  console.log(`  - ${asset.name}: wrote ${(buf.length / 1024).toFixed(0)} KB`);
}

console.log('[generate-art] starting...');
for (const asset of ASSETS) {
  try {
    await generate(asset);
  } catch (err) {
    console.error(`  - ${asset.name}: FAILED — ${err.message}`);
    process.exit(1);
  }
}
console.log('[generate-art] complete.');
