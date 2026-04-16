// scripts/generate-tts.mjs — OpenAI TTS build-time voice-accent generation.
import 'dotenv/config';
import OpenAI from 'openai';
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'src/audio/voice-accent.mp3');
const force = process.argv.includes('--force');

if (existsSync(DEST) && !force) {
  console.log(`[generate-tts] ${DEST} exists, skipping (use --force to regenerate)`);
  process.exit(0);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

console.log('[generate-tts] requesting voice accent...');

const response = await client.audio.speech.create({
  model: 'gpt-4o-mini-tts',
  voice: 'onyx',
  input: 'Pushback... denied.',
  instructions: 'Speak in a very low, gravelly, menacing growl — half whispered, ' +
                'half threatening, like a deep-sea creature. Slow, ominous, with ' +
                'rasp in the voice. Almost subvocal.',
  format: 'mp3',
});

const buf = Buffer.from(await response.arrayBuffer());
writeFileSync(DEST, buf);
console.log(`[generate-tts] wrote ${DEST} (${(buf.length / 1024).toFixed(0)} KB)`);
