// src/audio.js — buffer playback with variant pools + per-play filter variation.
// Each one-shot (thunder, growl, rumble) picks a random variant and applies
// pitch/gain/pan/filter randomization so the same moment sounds fresh each time.

const POOLS = {
  stormBed: ['src/audio/storm-bed.mp3'],
  rumble: [
    'src/audio/bass-1-drop.mp3',
    'src/audio/bass-2-linkinbio.mp3',
    'src/audio/bass-3-drop.mp3',
    'src/audio/bass-4-boom.mp3',
  ],
  roar: [
    'src/audio/whale-1-haunting.mp3',
    'src/audio/whale-2-humpback.mp3',
    'src/audio/whale-3-song.mp3',
    'src/audio/whale-4-creepy.mp3',
    'src/audio/whale-5-haunting2.mp3',
  ],
  thunder: [
    'src/audio/thunder-1-loud.mp3',
    'src/audio/thunder-2-peals.mp3',
    'src/audio/thunder-3-city.mp3',
    'src/audio/thunder-4-dry.mp3',
    'src/audio/thunder-5-clap.mp3',
  ],
  voice: ['src/audio/voice-accent.mp3'],
};

const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.30;
  master.connect(ctx.destination);

  // buffer cache: path → AudioBuffer | null (null = load failed)
  const buffers = {};

  // Kick off async loads for every variant in every pool.
  const allPaths = new Set();
  for (const list of Object.values(POOLS)) list.forEach(p => allPaths.add(p));
  for (const path of allPaths) {
    fetch(path)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(arr => ctx.decodeAudioData(arr))
      .then(buf => { buffers[path] = buf; })
      .catch(err => {
        console.warn(`[audio] ${path} failed to load:`, err.message);
        buffers[path] = null;
      });
  }

  function playVariant(pool, opts = {}) {
    const path = pick(POOLS[pool]);
    const buf = buffers[path];
    if (!buf) return null;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = !!opts.loop;
    if (!opts.loop && opts.varyPitch !== false) {
      src.playbackRate.value = rand(0.85, 1.10);
    }

    const panner = ctx.createStereoPanner();
    panner.pan.value = opts.loop ? 0 : rand(-0.25, 0.25);

    let chainHead = src;
    chainHead.connect(panner);

    // 60% chance of lowpass filter for one-shots (never on loops)
    let filter = null;
    if (!opts.loop && Math.random() < 0.6) {
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = rand(600, 1800);
      panner.connect(filter);
      chainHead = filter;
    } else {
      chainHead = panner;
    }

    const g = ctx.createGain();
    const baseGain = opts.gain ?? 1.0;
    g.gain.value = opts.loop ? 0.0 : baseGain * rand(0.8, 1.1);
    chainHead.connect(g).connect(opts.destination ?? master);
    src.start(0);
    return { src, gain: g, panner, filter };
  }

  // ── Storm bed: looping low-volume background ──
  let storm = null;
  function startStorm() {
    if (storm) return;
    const tryStart = () => {
      const handle = playVariant('stormBed', { loop: true, gain: 0.0, varyPitch: false });
      if (!handle) {
        setTimeout(tryStart, 300);
        return;
      }
      storm = handle;
      storm.gain.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
    };
    tryStart();
  }

  // ── Rumble: looping sub-bass for moment buildup ──
  let rumble = null;
  function startRumble() {
    if (rumble) return;
    rumble = playVariant('rumble', { loop: true, gain: 0.0, varyPitch: false });
    if (!rumble) return;
    rumble.gain.gain.setTargetAtTime(0.7, ctx.currentTime, 0.35);
    setTimeout(stopRumble, 6000);
  }
  function stopRumble() {
    if (!rumble) return;
    rumble.gain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.4);
    setTimeout(() => {
      try { rumble.src.stop(); rumble.gain.disconnect(); rumble.panner.disconnect(); } catch (_) {}
      rumble = null;
    }, 1000);
  }

  // ── Thunder: one-shot with variant + random filter ──
  function thunder() {
    playVariant('thunder', { gain: 1.3 });
  }

  // ── Growl (Kraken Roar): layered whale variant + voice accent ──
  function growl() {
    playVariant('roar', { gain: 1.0 });
    // Voice accent layered on top, slightly delayed
    setTimeout(() => {
      playVariant('voice', { gain: 0.9, varyPitch: false });
    }, 350);
  }

  // ── Muffle storm low-pass envelope for Roar ──
  function muffleStorm(durationSec = 1.5) {
    if (!storm) return;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    try {
      storm.gain.disconnect();
      storm.gain.connect(filter).connect(master);
      filter.frequency.setTargetAtTime(180, ctx.currentTime, 0.1);
      setTimeout(() => {
        filter.frequency.setTargetAtTime(800, ctx.currentTime, 0.4);
        setTimeout(() => {
          try {
            storm.gain.disconnect();
            storm.gain.connect(master);
            filter.disconnect();
          } catch (_) {}
        }, 800);
      }, durationSec * 1000);
    } catch (_) {}
  }

  return { startStorm, startRumble, stopRumble, thunder, growl, muffleStorm };
}
