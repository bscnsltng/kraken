// src/shaders/pressure.glsl.js — radial pressure ring expanding outward from an origin.
export const pressureVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const pressureFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uOrigin;
  uniform float uPhase;
  uniform float uAmplitude;

  void main() {
    if (uAmplitude < 0.001) { gl_FragColor = vec4(0.0); return; }

    float r = distance(vUv, uOrigin);
    float ringR = uPhase * 0.7;
    float ring = exp(-pow((r - ringR) / 0.025, 2.0));
    float life = 1.0 - uPhase;
    float intensity = ring * life * uAmplitude;

    vec3 col = vec3(0.6, 1.0, 0.95) * intensity;
    gl_FragColor = vec4(col, intensity * 0.8);
  }
`;
