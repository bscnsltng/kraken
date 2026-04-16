// src/shaders/multi-segment-tentacle.glsl.js — organic multi-segment bend.
// Replaces src/shaders/tentacles.glsl.js. Same fragment shader (taper + edge glow).
// Vertex shader bends the tentacle through a chain of 4 sine waves.
export const tentacleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uPeriod;
  uniform float uAmp;
  uniform float uExtraRot;
  uniform vec2  uPivot;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    float s = uv.x;

    float t = uTime / uPeriod + uPhase;
    float bend  = sin( s * 6.28318 + t * 6.28318 ) * uAmp * s;
    bend       += sin( s * 12.56637 + t * 5.70   ) * uAmp * 0.5 * s;
    bend       += sin( s * 18.84955 + t * 4.30   ) * uAmp * 0.33 * s;
    bend       += sin( s * 25.13274 + t * 7.10   ) * uAmp * 0.18 * s;

    vec2 p = position.xy - uPivot;
    float ca = cos(uExtraRot), sa = sin(uExtraRot);
    p = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    p += uPivot;

    p.y += bend;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, position.z, 1.0);
  }
`;

export const tentacleFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uEdge;
  void main() {
    float taper = 1.0 - vUv.x;
    float edge = smoothstep(0.4, 1.0, abs(vUv.y - 0.5) * 2.0);
    vec3 col = mix(uColor, uEdge, edge * 0.6);
    float a = taper * (1.0 - edge * 0.3);
    gl_FragColor = vec4(col, a * 0.85);
  }
`;
