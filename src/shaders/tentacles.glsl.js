// src/shaders/tentacles.glsl.js — vertex sway + fragment taper
export const tentacleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uPeriod;
  uniform float uAmp;
  uniform vec2  uPivot;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float a = sin((uTime / uPeriod + uPhase) * 6.28318) * uAmp;
    float ca = cos(a), sa = sin(a);
    vec2 p = position.xy - uPivot;
    p = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    p += uPivot;
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
