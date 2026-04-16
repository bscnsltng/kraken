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
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;
    float caR = uCA * 0.006;
    vec3 col;
    col.r = texture2D(tDiffuse, uv + c * caR).r;
    col.g = texture2D(tDiffuse, uv).g;
    col.b = texture2D(tDiffuse, uv - c * caR).b;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum), uDesat);
    col = mix(col, vec3(1.0), uFlash);
    float vig = smoothstep(0.95, 0.4, length(c) * 1.4);
    col *= mix(1.0, vig, uVignette);
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

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55, 0.5, 0.55);
  composer.addPass(bloomPass);

  const fxUniforms = {
    tDiffuse: { value: null },
    uTime:     { value: 0 },
    uVignette: { value: 0.55 },
    uGrain:    { value: 0.025 },
    uCA:       { value: 0 },
    uFlash:    { value: 0 },
    uDesat:    { value: 0 },
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
    update(t) { fxUniforms.uTime.value = t; },
  };
}
