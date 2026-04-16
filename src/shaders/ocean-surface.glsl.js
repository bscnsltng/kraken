// src/shaders/ocean-surface.glsl.js — full bottom-25% ocean surface shader.
// Replaces the old waves.js shader. Three harmonic sines for vertex displacement,
// foam line + faint refraction in fragment.
export const oceanVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDisplace;
  uniform float uTime;
  uniform float uRipple;

  void main() {
    vUv = uv;
    float x = uv.x * 6.28318;
    float disp = 0.025 * sin(x * 2.0 + uTime * 1.4)
               + 0.018 * sin(x * 5.0 - uTime * 0.9)
               + 0.012 * sin(x * 11.0 + uTime * 2.1);
    disp += uRipple * 0.04 * sin(x * 18.0 - uTime * 3.5);
    vDisplace = disp;
    vec3 p = position;
    p.y += disp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const oceanFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying float vDisplace;
  uniform float uTime;
  uniform float uRipple;

  void main() {
    float y = vUv.y;
    float surfaceY = 0.5 + vDisplace;
    float foam = exp(-pow((y - surfaceY) / 0.02, 2.0));
    float deep = smoothstep(surfaceY + 0.01, 1.0, y);

    vec3 deepCol = vec3(0.02, 0.0, 0.05);
    vec3 midCol  = vec3(0.05, 0.01, 0.12);
    vec3 col = mix(midCol, deepCol, deep);

    col += vec3(0.0, 0.45, 0.40) * foam * (0.6 + 0.7 * uRipple);

    float subSurface = smoothstep(surfaceY - 0.06, surfaceY, y);
    col *= 1.0 + 0.12 * subSurface * (sin(vUv.x * 30.0 + uTime * 2.0) * 0.5 + 0.5);

    float a = smoothstep(surfaceY - 0.08, surfaceY, y) * 0.92;
    gl_FragColor = vec4(col, a);
  }
`;
