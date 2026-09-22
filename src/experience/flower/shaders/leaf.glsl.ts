import { lightingUniformsGLSL, outputGLSL, shadeGLSL } from './lighting.glsl'

export const leafVertex = /* glsl */ `
uniform float uUnfold;
uniform float uTime;
uniform float uPhase;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

// position: x across (-w..w), y along (0..L), z = 0. uv: (along 0..1, across -1..1)

vec3 leafPoint(vec3 p) {
  float u = smoothstep(0.0, 1.0, uUnfold);
  vec3 q = p;
  // V-fold along the midrib: edges rise, strongly when closed
  float fold = mix(1.6, 0.28, u);
  q.z += fold * abs(q.x) * (0.6 + 0.4 * (1.0 - vUv.x));
  // roll from the tip: strong when closed, gentle droop when open
  float k = mix(5.5, 1.1, u);
  float a = k * q.y;
  float y = sin(a) / k;
  float z = (1.0 - cos(a)) / k;
  q.y = y;
  q.z += z * mix(-1.0, -0.55, u); // curl downward/inward
  // scale while unfolding
  float s = mix(0.08, 1.0, 1.0 - pow(1.0 - u, 2.2));
  q *= s;
  // gentle life
  float sway = sin(uTime * 0.7 + uPhase * 6.2831) * 0.02 * u;
  q.z += sway * vUv.x * vUv.x;
  return q;
}

void main() {
  vUv = uv;
  vec3 P = leafPoint(position);
  vec3 Px = leafPoint(position + vec3(0.004, 0.0, 0.0));
  vec3 Py = leafPoint(position + vec3(0.0, 0.004, 0.0));
  vec3 N = normalize(cross(Px - P, Py - P));
  vec4 wp = modelMatrix * vec4(P, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * N);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const leafFragment = /* glsl */ `
${lightingUniformsGLSL}
uniform vec3 uColorDark;
uniform vec3 uColorLight;
uniform vec3 uColorVein;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;

${shadeGLSL}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorldPos);
  float u = vUv.x;
  float v = vUv.y;
  vec3 albedo = mix(uColorDark, uColorLight, smoothstep(0.0, 1.0, u * 0.7 + abs(v) * 0.3));
  // midrib
  float mid = 1.0 - smoothstep(0.0, 0.07, abs(v));
  // side veins
  float veins = smoothstep(0.86, 1.0, sin((u * 11.0 + abs(v) * 2.2) * 3.14159));
  albedo = mix(albedo, uColorVein, mid * 0.75 + veins * 0.25 * (1.0 - u));
  // warmer tint as the scene turns golden
  albedo = mix(albedo, albedo * vec3(1.1, 1.02, 0.7), uWarmth * 0.35);
  vec3 col = shade(albedo, N, V, 0.6, 0.25);
  col = applyFog(col, vWorldPos);
  gl_FragColor = vec4(col, 1.0);
  ${outputGLSL}
}
`
