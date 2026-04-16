// src/shaders/ink.glsl.js — billowing ink cloud mask
export const inkVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const inkFragment = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
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
    float r = distance(p, vec2(0.5, 0.55));
    float spread = uIntensity * 0.9;
    float n = fbm(p * 4.0 + vec2(uTime * 0.1, uTime * 0.15));
    float mask = smoothstep(spread + 0.1, spread - 0.2, r + (n - 0.5) * 0.4);
    float a = mask * uIntensity;
    gl_FragColor = vec4(vec3(0.02, 0.0, 0.05), a);
  }
`;
