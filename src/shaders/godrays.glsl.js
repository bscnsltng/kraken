// src/shaders/godrays.glsl.js — volumetric light shafts piercing down from a top-center virtual sun.
export const godraysVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const godraysFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSweep;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 origin = vec2(0.5 + uSweep * 0.18, 1.05);
    vec2 d = origin - vUv;
    float dist = length(d);
    vec2 dir = d / max(dist, 0.001);

    float angleToVertical = atan(dir.x, -dir.y);
    float wedge = 1.0 - smoothstep(0.18, 0.55, abs(angleToVertical));

    float dist01 = clamp(1.0 - dist / 1.4, 0.0, 1.0);

    float stripeSeed = (vUv.x - origin.x) * 22.0 + uTime * 0.05;
    float stripe = 0.55 + 0.45 * hash(floor(stripeSeed));
    stripe = mix(stripe, 0.7 + 0.3 * sin(stripeSeed * 6.28), 0.4);

    float beam = wedge * dist01 * stripe;

    vec3 tint = vec3(1.0, 0.92, 0.55);
    vec3 col = tint * beam * uIntensity * 0.45;

    gl_FragColor = vec4(col, beam * uIntensity * 0.55);
  }
`;
