// src/watchdog.js — rolling FPS watchdog with one-way degrade steps
export function createWatchdog({ getFps, onDegrade }) {
  const samples = [];
  let level = 0;
  setInterval(() => {
    samples.push(getFps());
    if (samples.length > 30) samples.shift();
    if (samples.length < 10) return;
    const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
    if (level < 1 && avg < 50) { level = 1; onDegrade(level, avg); }
    else if (level < 2 && avg < 38) { level = 2; onDegrade(level, avg); }
    else if (level < 3 && avg < 25) { level = 3; onDegrade(level, avg); }
    else if (level < 4 && avg < 18) { level = 4; onDegrade(level, avg); }
  }, 1000);
  return { getLevel: () => level };
}
