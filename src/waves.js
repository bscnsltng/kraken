// src/waves.js — scrolling wave strip
import * as THREE from './vendor/three.module.min.js';

const VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uRipple;
  void main() {
    float y = vUv.y, x = vUv.x;
    float w1 = sin((x * 18.0) + uTime * 1.4);
    float w2 = sin((x * 11.0) - uTime * 0.9);
    float surface = 0.5 + 0.04 * w1 + 0.025 * w2 + 0.06 * uRipple * sin(x * 24.0 - uTime * 3.0);
    float foam = smoothstep(surface - 0.02, surface + 0.005, y);
    float deep = smoothstep(surface + 0.01, 1.0, y);
    vec3 col = mix(vec3(0.05, 0.0, 0.12), vec3(0.02, 0.0, 0.05), deep);
    col += vec3(0.0, 0.18, 0.18) * foam * (0.4 + 0.6 * uRipple);
    float a = smoothstep(surface - 0.03, surface, y) * 0.85;
    gl_FragColor = vec4(col, a);
  }
`;

export function createWaves(scene) {
  const u = { uTime: { value: 0 }, uRipple: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.5),
    new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthWrite: false,
    })
  );
  mesh.position.set(0, -0.55, 0.2);
  scene.add(mesh);
  return {
    mesh, uniforms: u,
    update(t) { u.uTime.value = t; },
    setRipple(v) { u.uRipple.value = v; },
  };
}
