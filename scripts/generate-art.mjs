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
  {
    name: 'robot-1.png',
    prompt: 'A VEX robotics competition robot silhouette, dark royal purple ' +
            '(#6B0AC9), square chassis with mecanum wheels, vertical lift ' +
            'arm with end-effector claw, two glowing teal (#00E5CC) camera ' +
            'eyes, single antenna on top, viewed from a slight 3/4 angle. ' +
            'PNG with fully transparent background. Clean industrial design, ' +
            'no text, no logos, no shadows beneath, isolated subject.',
    size: '1024x1024',
  },
  {
    name: 'robot-2.png',
    prompt: 'A VEX robotics competition robot silhouette, dark royal purple ' +
            '(#6B0AC9), wider rectangular chassis with omni wheels, ' +
            'horizontally-extending intake roller arm at the front, two ' +
            'small glowing teal (#00E5CC) camera eyes, dual antennas, viewed ' +
            'from a slight 3/4 angle (mirrored from the first robot). PNG ' +
            'with fully transparent background. Clean industrial design, no ' +
            'text, no logos, no shadows beneath, isolated subject.',
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
    prompt: 'A single translucent bioluminescent deep-sea jellyfish silhouette, ' +
            'glowing teal and violet (#00E5CC, #6B0AC9), flowing tentacles ' +
            'trailing below. PNG with fully transparent background. Soft inner ' +
            'glow. Stylized but elegant. No text, isolated subject.',
    size: '1024x1024',
  },
  {
    name: 'accent-anglerfish.png',
    prompt: 'A single deep-sea anglerfish silhouette, dark royal purple body ' +
            '(#6B0AC9), single bioluminescent lure dangling above its mouth ' +
            'glowing teal (#00E5CC). Side profile. PNG with fully transparent ' +
            'background. Sinister, predatory, but stylized. No text, isolated ' +
            'subject.',
    size: '1024x1024',
  },
  {
    name: 'accent-squid.png',
    prompt: 'A small deep-sea squid silhouette, royal purple (#6B0AC9), ' +
            'tentacles trailing, suggestion of luminescent spots along its ' +
            'mantle in teal (#00E5CC). PNG with fully transparent background. ' +
            'Side profile, subtle, stylized. No text, isolated subject.',
    size: '1024x1024',
  },
];

async function generate(asset) {
  const dest = join(ART_DIR, asset.name);
  if (existsSync(dest) && !force) {
    console.log(`  - ${asset.name}: already exists, skipping (use --force to regenerate)`);
    return;
  }
  console.log(`  - ${asset.name}: requesting generation...`);
  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt: asset.prompt,
    size: asset.size,
    n: 1,
    response_format: 'b64_json',
  });
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
