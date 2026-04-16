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
    // Lower-frequency, lower-amplitude harmonics — prior values (amp 0.025/
    // 0.018/0.012 at freq 2/5/11) created visible zigzag peaks that read as
    // triangles rather than water. These are half-amp and lower-freq so the
    // surface undulates smoothly.
    float disp = 0.014 * sin(x * 1.5 + uTime * 1.0)
               + 0.008 * sin(x * 3.2 - uTime * 0.65)
               + 0.004 * sin(x * 7.0 + uTime * 1.4);
    disp += uRipple * 0.025 * sin(x * 10.0 - uTime * 2.8);
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

    // Wider, softer foam line (was 0.02 Gaussian width — too sharp, read
    // as a hard teal zigzag). 0.045 gives a diffuse bright edge that feels
    // like water surface instead of a painted line.
    float foam = exp(-pow((y - surfaceY) / 0.045, 2.0));
    float deep = smoothstep(surfaceY + 0.01, 1.0, y);

    vec3 deepCol = vec3(0.02, 0.0, 0.05);
    vec3 midCol  = vec3(0.05, 0.01, 0.12);
    vec3 col = mix(midCol, deepCol, deep);

    // Foam color softer; only bloom up strongly during ripple moments.
    col += vec3(0.0, 0.28, 0.26) * foam * (0.4 + 0.6 * uRipple);

    // Sub-surface refraction shimmer — lower frequency, gentler.
    float subSurface = smoothstep(surfaceY - 0.08, surfaceY, y);
    col *= 1.0 + 0.08 * subSurface * (sin(vUv.x * 14.0 + uTime * 1.2) * 0.5 + 0.5);

    float a = smoothstep(surfaceY - 0.10, surfaceY, y) * 0.92;
    gl_FragColor = vec4(col, a);
  }
`;
