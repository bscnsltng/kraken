// src/kraken.js — eye-pulse overlays and hat-specular sweep on top of the hero PNG
import * as THREE from './vendor/three.module.min.js';

const RED = new THREE.Color(0xCC0000);

const EYE_VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const EYE_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uIntensity;
  uniform vec3 uColor;
  void main() {
    float r = distance(vUv, vec2(0.5));
    float a = smoothstep(0.5, 0.0, r) * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }
`;

const HAT_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float cycle = mod(uTime, 12.0);
    float sweepPos = (cycle / 0.8) * 1.4 - 0.2;
    float onScreen = step(cycle, 0.8);
    float band = abs((vUv.x + vUv.y) - sweepPos * 2.0);
    float a = smoothstep(0.06, 0.0, band) * onScreen * 0.55;
    gl_FragColor = vec4(1.0, 1.0, 0.85, a);
  }
`;

export function createKrakenOverlays(scene, heroBox) {
  const eyeY = heroBox.y + heroBox.h * 0.10;
  const eyeOffsetX = heroBox.w * 0.10;
  const eyeSize = heroBox.w * 0.085;

  const eyes = [];
  for (const sign of [-1, 1]) {
    const u = { uIntensity: { value: 0.55 }, uColor: { value: RED.clone() } };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(eyeSize, eyeSize),
      new THREE.ShaderMaterial({
        vertexShader: EYE_VERT, fragmentShader: EYE_FRAG, uniforms: u,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    mesh.position.set(heroBox.x + sign * eyeOffsetX, eyeY, 0.5);
    scene.add(mesh);
    eyes.push({ mesh, uniforms: u, baseX: mesh.position.x, baseY: mesh.position.y });
  }

  const hatU = { uTime: { value: 0 } };
  const hatMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(heroBox.w * 0.85, heroBox.h * 0.30),
    new THREE.ShaderMaterial({
      vertexShader: EYE_VERT, fragmentShader: HAT_FRAG, uniforms: hatU,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
  );
  hatMesh.position.set(heroBox.x, heroBox.y + heroBox.h * 0.30, 0.6);
  scene.add(hatMesh);

  let overrideValue = null; // when non-null, update() uses this instead of the pulse
  let driftGen = 0;

  return {
    eyes, hatMesh, hatUniforms: hatU,
    update(t) {
      if (overrideValue !== null) {
        for (const e of eyes) e.uniforms.uIntensity.value = overrideValue;
      } else {
        const pulse = 0.55 + 0.15 * Math.sin((t / 2.6) * Math.PI * 2);
        for (const e of eyes) e.uniforms.uIntensity.value = pulse;
      }
      hatU.uTime.value = t;
    },
    setEyeIntensity(v) { overrideValue = v; },
    resetEyes() { overrideValue = null; },
    animateEyeDrift(durationSec) {
      const myGen = ++driftGen;
      const start = performance.now();
      const tick = () => {
        if (myGen !== driftGen) return; // a newer call superseded us
        const e2 = (performance.now() - start) / 1000;
        if (e2 >= durationSec) { for (const eye of eyes) eye.mesh.position.x = eye.baseX; return; }
        const k = e2 / durationSec;
        const off = Math.sin(k * Math.PI * 2) * 0.018;
        for (const eye of eyes) eye.mesh.position.x = eye.baseX + off;
        requestAnimationFrame(tick);
      };
      tick();
    },
  };
}
