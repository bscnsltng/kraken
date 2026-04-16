// src/shaders/clouds.glsl.js — top-zone storm clouds
export const cloudsVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const cloudsFragment = /* glsl */ `
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
  float fbm(vec2 p) { float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;} return v; }
  void main() {
    vec2 p = vUv;
    float a = fbm(p * 2.5 + vec2(uTime * 0.020, 0.0));
    float b = fbm(p * 4.0 - vec2(uTime * 0.035, 0.0));
    float clouds = smoothstep(0.45, 0.85, a * 0.65 + b * 0.45);
    float fade = smoothstep(0.55, 1.0, p.y);
    clouds *= fade;
    gl_FragColor = vec4(vec3(0.16, 0.00, 0.35), clouds * 0.7);
  }
`;
