// src/shaders/depth-void.glsl.js — vertical deep-void gradient (replaces value-noise void).
export const depthVoidVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const depthVoidFragment = /* glsl */ `
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
    vec3 surface = vec3(0.04, 0.02, 0.18);
    vec3 mid     = vec3(0.06, 0.00, 0.14);
    vec3 abyss   = vec3(0.01, 0.00, 0.02);
    vec3 col;
    col = mix(abyss, mid, smoothstep(0.0, 0.55, p.y));
    col = mix(col, surface, smoothstep(0.55, 1.0, p.y));
    float n = noise(p * 4.0 + vec2(uTime * 0.012, uTime * 0.005));
    col += (n - 0.5) * 0.012;
    float bottomCorner = max(0.0, 0.4 - distance(p, vec2(0.5, 0.0)));
    col -= bottomCorner * 0.08;
    gl_FragColor = vec4(col, 1.0);
  }
`;
