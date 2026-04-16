// src/shaders/spotlight.glsl.js — theatrical cone light from above the kraken.
// Additive-blended layer that adds a soft gold-teal cone of light down onto
// the hero. The heavy vignette (which pairs with this to create focal
// contrast) lives in the postprocess.js pass — we just bump uVignette way up.
export const spotlightVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const spotlightFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec2 p = vUv;

    // Cone light originates above the frame, opening downward.
    vec2 lightOrigin = vec2(0.5, 1.20);
    vec2 toFrag = p - lightOrigin;
    float distFromLight = length(toFrag);
    vec2 dir = toFrag / max(distFromLight, 0.001);
    float angleFromDown = atan(dir.x, dir.y);

    // Cone mask: widest at the bottom, narrower at the top.
    float cone = 1.0 - smoothstep(0.20, 0.55, abs(angleFromDown));

    // Radial falloff — strongest on the kraken (~0.55y), fading below.
    float falloff = 1.0 - smoothstep(0.25, 1.10, distFromLight);

    // Subtle breathing — slower than the eye pulse so it doesn't beat.
    float breathe = 0.88 + 0.12 * sin(uTime * 0.55);

    float b = cone * falloff * breathe * uIntensity;

    // Warm gold-teal mix (slightly more gold than teal so the kraken reads
    // "champion / hero-lit" rather than ghostly).
    vec3 col = vec3(0.95, 0.88, 0.65) * b;

    gl_FragColor = vec4(col, b * 0.85);
  }
`;
