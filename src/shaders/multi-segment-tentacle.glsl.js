// src/shaders/multi-segment-tentacle.glsl.js — logo-style organic tentacle.
//
// Vertex: 4-sine multi-segment bend (sea-snake motion) + geometric taper
//   (width shrinks along length so the tentacle is fat at base, needle at tip —
//   matches the kraken logo's silhouette exactly; the old uniform-width ribbon
//   read as a "purple stick").
//
// Fragment: top-highlight / bottom-shadow shading + faint suction-cup dot
//   pattern on the underside + teal bioluminescent edge rim. Reads as a real
//   cartooned tentacle, not a shader ribbon.
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

    // s: 0 at base, 1 at tip (along tentacle length)
    float s = uv.x;

    // Multi-segment bend: chain of 4 sines along length → sea-snake curl.
    float t = uTime / uPeriod + uPhase;
    float bend  = sin( s * 6.28318 + t * 6.28318 ) * uAmp * s;
    bend       += sin( s * 12.56637 + t * 5.70   ) * uAmp * 0.5 * s;
    bend       += sin( s * 18.84955 + t * 4.30   ) * uAmp * 0.33 * s;
    bend       += sin( s * 25.13274 + t * 7.10   ) * uAmp * 0.18 * s;

    // Geometric taper: shrink the cross-section y toward the tip.
    //   at s=0 (base): full width
    //   at s=1 (tip):  ~12% width
    float taperFactor = 1.0 - 0.88 * pow(s, 0.7);
    float yTapered = position.y * taperFactor;

    // Apply extra rigid rotation (moment beats) around the pivot.
    vec2 p = vec2(position.x, yTapered) - uPivot;
    float ca = cos(uExtraRot), sa = sin(uExtraRot);
    p = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    p += uPivot;

    // Apply lateral bend displacement (organic curl).
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
    // u along length 0..1, v across width 0..1 (0 = bottom, 1 = top)
    float u = vUv.x;
    float v = vUv.y;

    // Sharp body alpha — previously 55% of the width was soft-gradient
    // which read as "purple cloud" at the visible base. Now only the outer
    // 12% fades; the interior is solid. Plus a hard alpha cutoff so the
    // tentacle has a defined silhouette instead of a diffuse halo.
    float centerDist = abs(v - 0.5) * 2.0;  // 0 at center, 1 at edges
    float body = 1.0 - smoothstep(0.82, 0.96, centerDist);

    // Base color: the logo's royal purple.
    vec3 col = uColor;

    // Top-side highlight — simulates rim light from above.
    float topLight = smoothstep(0.35, 0.85, v);
    col += vec3(0.18, 0.08, 0.12) * topLight;

    // Bottom-side shadow.
    float bottomShadow = smoothstep(0.65, 0.15, v);
    col *= (1.0 - bottomShadow * 0.35);

    // Suction-cup dots on underside.
    if (v < 0.45 && v > 0.18) {
      float dotU = fract(u * 10.0);
      float dotV = fract((v - 0.18) * 4.0);
      float dotD = distance(vec2(dotU, dotV), vec2(0.5));
      float dot = 1.0 - smoothstep(0.18, 0.32, dotD);
      col += vec3(0.12, 0.04, 0.08) * dot;
    }

    // Bioluminescent teal edge rim — only on the very edge of the body.
    float edgeRim = smoothstep(0.78, 1.0, centerDist);
    col = mix(col, uEdge, edgeRim * 0.55);

    // Alpha: strongest at base, fades a bit toward tip. Edge fadeout
    // sharper than before to keep a crisp silhouette (not hazy blob).
    float lengthFade = 1.0 - 0.15 * u;
    float edgeFade = 1.0 - smoothstep(0.93, 1.0, centerDist);
    float a = body * lengthFade * edgeFade;
    // Hard cutoff: anything dimmer than 0.18 is invisible (no halo).
    if (a < 0.18) a = 0.0;

    gl_FragColor = vec4(col, a);
  }
`;
