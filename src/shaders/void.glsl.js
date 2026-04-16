// src/shaders/void.glsl.js — animated void/sky background
export const voidVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const voidFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  void main() {
    vec2 p = vUv;
    vec3 top = vec3(0.10, 0.00, 0.20);
    vec3 mid = vec3(0.04, 0.00, 0.10);
    vec3 bot = vec3(0.03, 0.00, 0.06);
    vec3 col = mix(bot, mid, smoothstep(0.0, 0.5, p.y));
    col = mix(col, top, smoothstep(0.5, 1.0, p.y));
    float n = noise(p * 3.0 + vec2(uTime * 0.02, uTime * 0.01));
    n += 0.5 * noise(p * 6.0 - vec2(uTime * 0.015, 0.0));
    col -= 0.04 * n;
    float r = distance(p, vec2(0.5, 0.55));
    col += 0.10 * vec3(0.42, 0.04, 0.79) * (1.0 - smoothstep(0.0, 0.55, r));
    gl_FragColor = vec4(col, 1.0);
  }
`;
