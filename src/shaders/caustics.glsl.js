// src/shaders/caustics.glsl.js — animated underwater caustics pattern.
export const causticsVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const causticsFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uInkInfluence;

  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }

  float voronoi(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float minDist = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash2(i + g);
        o = 0.5 + 0.5 * sin(uTime * 0.6 + 6.2831 * o);
        float d = distance(g + o - f, vec2(0.0));
        minDist = min(minDist, d);
      }
    }
    return minDist;
  }

  void main() {
    vec2 p = vUv;
    float v1 = voronoi(p * 6.0);
    float v2 = voronoi(p * 14.0 + vec2(uTime * 0.08, 0.0));
    float caust = pow(1.0 - v1 * 0.7, 4.0) + 0.5 * pow(1.0 - v2 * 0.7, 6.0);

    float depthFalloff = smoothstep(0.05, 0.85, p.y);
    caust *= depthFalloff;

    if (uInkInfluence > 0.001) {
      vec2 warp = vec2(sin(uTime * 1.2 + p.y * 8.0), cos(uTime * 0.9 + p.x * 6.0));
      float warpedV = voronoi(p * 6.0 + warp * uInkInfluence * 0.3);
      caust = mix(caust, pow(1.0 - warpedV * 0.7, 4.0), uInkInfluence);
    }

    vec3 col = vec3(0.55, 1.0, 0.95) * caust * uIntensity;

    gl_FragColor = vec4(col, caust * uIntensity * 0.55);
  }
`;
