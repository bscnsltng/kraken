// src/audio.js — WebAudio-synthesized storm bed + thunder + growl. No asset files.
export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);

  let stormNode = null, stormGain = null;
  function startStorm() {
    if (stormNode) return;
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i=0;i<bufferSize;i++) {
      const w = Math.random()*2-1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
    }
    stormNode = ctx.createBufferSource();
    stormNode.buffer = buffer; stormNode.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 600;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05; lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    stormGain = ctx.createGain(); stormGain.gain.value = 0.0;
    stormNode.connect(filter).connect(stormGain).connect(master);
    stormNode.start();
    stormGain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);
  }

  let rumbleGain = null, rumbleOsc = null;
  function startRumble() {
    if (rumbleGain) return;
    rumbleOsc = ctx.createOscillator(); rumbleOsc.type = 'sawtooth'; rumbleOsc.frequency.value = 38;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 90;
    rumbleGain = ctx.createGain(); rumbleGain.gain.value = 0.0;
    rumbleOsc.connect(filter).connect(rumbleGain).connect(master);
    rumbleOsc.start();
    rumbleGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.5);
    setTimeout(stopRumble, 6000);
  }
  function stopRumble() {
    if (!rumbleGain) return;
    rumbleGain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.4);
    setTimeout(() => {
      try { rumbleOsc.stop(); rumbleGain.disconnect(); } catch (_) {}
      rumbleGain = null; rumbleOsc = null;
    }, 1000);
  }

  function thunder() {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * Math.exp(-i / (ctx.sampleRate * 0.6));
    const src = ctx.createBufferSource(); src.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 280;
    const g = ctx.createGain(); g.gain.value = 1.4;
    src.connect(filter).connect(g).connect(master);
    src.start();
  }

  function growl() {
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 55;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 6.5;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 12;
    lfo.connect(lfoGain).connect(osc.frequency);
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 220;
    const g = ctx.createGain(); g.gain.value = 0.0;
    osc.connect(filter).connect(g).connect(master);
    osc.start(); lfo.start();
    g.gain.setTargetAtTime(0.6, ctx.currentTime, 0.05);
    setTimeout(() => g.gain.setTargetAtTime(0.0, ctx.currentTime, 0.3), 1500);
    setTimeout(() => { try { osc.stop(); lfo.stop(); } catch (_) {} }, 2500);
  }

  return { startStorm, startRumble, stopRumble, thunder, growl };
}
