import { lightingUniformsGLSL, outputGLSL, shadeGLSL } from './lighting.glsl'

export const stemVertex = /* glsl */ `
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

export const stemFragment = /* glsl */ `
${lightingUniformsGLSL}
uniform vec3 uColorBase;
uniform vec3 uColorTop;
uniform float uGrowth;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

${shadeGLSL}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  // vUv.y is the parameter along the stem (0 base .. 1 tip)
  vec3 albedo = mix(uColorBase, uColorTop, smoothstep(0.0, 1.0, vUv.y));
  // subtle fibre striations
  float fibre = 0.5 + 0.5 * sin(vUv.x * 6.2831 * 6.0 + vUv.y * 40.0);
  albedo *= 0.94 + 0.08 * fibre;
  // the growing tip is a little brighter and more translucent
  float tip = smoothstep(0.9, 1.0, vUv.y);
  albedo = mix(albedo, albedo * 1.35 + vec3(0.06, 0.05, 0.0), tip * 0.6);
  vec3 col = shade(albedo, N, V, 0.35 + tip * 0.4, 0.3);
  col = applyFog(col, vWorldPos);
  gl_FragColor = vec4(col, 1.0);
  ${outputGLSL}
}
`
