// src/postprocess.js — EffectComposer chain (bloom + custom FX)
import * as THREE from './vendor/three.module.min.js';
import { EffectComposer } from './vendor/EffectComposer.js';
import { RenderPass } from './vendor/RenderPass.js';
import { ShaderPass } from './vendor/ShaderPass.js';
import { UnrealBloomPass } from './vendor/UnrealBloomPass.js';
import { OutputPass } from './vendor/OutputPass.js';

const FX_VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FX_FRAG = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uTime, uVignette, uGrain, uCA, uFlash, uDesat;
  uniform vec3  uSplitToneShadow;
  uniform vec3  uSplitToneHighlight;
  uniform float uSplitToneAmount;
  uniform float uDepthFog;
  uniform float uLensDistort;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;

    // Lens distortion (subtle barrel)
    if (uLensDistort > 0.001) {
      float r2 = dot(c, c);
      uv += c * r2 * uLensDistort;
    }

    // Chromatic aberration (radial)
    float caR = uCA * 0.006;
    vec3 col;
    col.r = texture2D(tDiffuse, uv + c * caR).r;
    col.g = texture2D(tDiffuse, uv).g;
    col.b = texture2D(tDiffuse, uv - c * caR).b;

    // Split-tone color grade
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 toned = mix(uSplitToneShadow, uSplitToneHighlight, lum);
    col = mix(col, col * toned, uSplitToneAmount);

    // Desaturation
    col = mix(col, vec3(lum), uDesat);

    // Flash overlay
    col = mix(col, vec3(1.0), uFlash);

    // Vignette with subtle 14s pulse
    float vigPulse = 1.0 + 0.08 * sin(uTime * 0.45);
    float vig = smoothstep(0.95, 0.4, length(c) * 1.4 * vigPulse);
    col *= mix(1.0, vig, uVignette);

    // Depth fog
    col = mix(col, vec3(0.04, 0.0, 0.10), uDepthFog * (1.0 - lum) * 0.3);

    // Grain
    float n = hash(uv * 1024.0 + uTime * 60.0) - 0.5;
    col += n * uGrain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function setupPostProcessing(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 1.2, 0.5, 0.35);
  composer.addPass(bloomPass);

  const fxUniforms = {
    tDiffuse:            { value: null },
    uTime:               { value: 0 },
    uVignette:           { value: 0.85 },
    uGrain:              { value: 0.04 },
    uCA:                 { value: 0.1 },
    uFlash:              { value: 0 },
    uDesat:              { value: 0 },
    uSplitToneShadow:    { value: new THREE.Vector3(0.7, 1.05, 1.15) },
    uSplitToneHighlight: { value: new THREE.Vector3(1.15, 1.05, 0.85) },
    uSplitToneAmount:    { value: 0.55 },
    uDepthFog:           { value: 0.4 },
    uLensDistort:        { value: 0.03 },
  };
  const fxPass = new ShaderPass({ uniforms: fxUniforms, vertexShader: FX_VERT, fragmentShader: FX_FRAG });
  composer.addPass(fxPass);
  composer.addPass(new OutputPass());

  window.addEventListener('resize', () => {
    const s = renderer.getSize(new THREE.Vector2());
    composer.setSize(s.x, s.y);
    bloomPass.setSize(s.x, s.y);
  });

  function tweenUniform(uniform, to, durationSec) {
    const from = uniform.value;
    const start = performance.now();
    const tick = () => {
      const e = (performance.now() - start) / 1000;
      if (e >= durationSec) { uniform.value = to; return; }
      uniform.value = from + (to - from) * (e / durationSec);
      requestAnimationFrame(tick);
    };
    tick();
  }

  return {
    composer, fxUniforms, bloomPass,
    flash(strength) { fxUniforms.uFlash.value = strength; tweenUniform(fxUniforms.uFlash, 0, 0.45); },
    bloomBoost(target, durationSec) {
      const original = bloomPass.strength;
      const start = original;
      const t0 = performance.now();
      const tick = () => {
        const e = (performance.now() - t0) / 1000;
        if (e >= durationSec * 2) { bloomPass.strength = original; return; }
        const k = e < durationSec ? e / durationSec : 2 - e / durationSec;
        bloomPass.strength = start + (target - start) * k;
        requestAnimationFrame(tick);
      };
      tick();
    },
    desaturate(amount, durationSec) {
      // rAF-driven two-phase tween: ramp up over 40% of duration, then ramp down over 60%.
      const u = fxUniforms.uDesat;
      const start = performance.now();
      const upMs = durationSec * 400;
      const totalMs = durationSec * 1000;
      const tick = () => {
        const e = performance.now() - start;
        if (e >= totalMs) { u.value = 0; return; }
        u.value = e < upMs
          ? (e / upMs) * amount
          : amount * (1 - (e - upMs) / (totalMs - upMs));
        requestAnimationFrame(tick);
      };
      tick();
    },
    chromaticBurst(strength) { fxUniforms.uCA.value = strength; tweenUniform(fxUniforms.uCA, 0, 0.25); },
    setLensDistort(target, holdSec) {
      const original = fxUniforms.uLensDistort.value;
      const start = performance.now();
      const totalMs = holdSec * 1000;
      const tick = () => {
        const e = performance.now() - start;
        if (e >= totalMs) { fxUniforms.uLensDistort.value = original; return; }
        const k = e < totalMs / 2 ? (e / (totalMs / 2)) : (1 - (e - totalMs / 2) / (totalMs / 2));
        fxUniforms.uLensDistort.value = original + (target - original) * k;
        requestAnimationFrame(tick);
      };
      tick();
    },
    update(t) { fxUniforms.uTime.value = t; },
  };
}
