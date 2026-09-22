import { lightingUniformsGLSL, outputGLSL, shadeGLSL } from './lighting.glsl'

export const discVertex = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const discFragment = /* glsl */ `
${lightingUniformsGLSL}
uniform vec3 uColorCentre;
uniform vec3 uColorMid;
uniform vec3 uColorRim;
uniform float uOpen;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

${shadeGLSL}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  // sphere uv.y: 1 at the pole, 0.5 at the equator → 0 centre .. 1 rim
  float r = clamp((1.0 - vUv.y) * 2.0, 0.0, 1.0);
  vec3 albedo = mix(uColorCentre, uColorMid, smoothstep(0.0, 0.7, r));
  albedo = mix(albedo, uColorRim, smoothstep(0.7, 1.0, r) * (0.4 + 0.6 * uOpen));
  // fine spiral texture
  float ang = vUv.x * 6.2831;
  float pattern = 0.5 + 0.5 * sin(r * 70.0 + ang * 8.0) * sin(r * 40.0 - ang * 13.0);
  albedo *= 0.9 + 0.2 * pattern;
  vec3 col = shade(albedo, N, V, 0.05, 0.5);
  col = applyFog(col, vWorldPos);
  gl_FragColor = vec4(col, 1.0);
  ${outputGLSL}
}
`
