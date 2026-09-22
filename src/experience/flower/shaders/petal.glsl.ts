import { lightingUniformsGLSL, outputGLSL, shadeGLSL } from './lighting.glsl'

/**
 * Petals and sepals share this shader. Each petal is placed procedurally from
 * per-vertex attributes (angle, ring, phase, length) and animated by uOpen.
 */
export const petalVertex = /* glsl */ `
uniform float uOpen;
uniform float uTime;
uniform float uHover;
uniform float uStagger;
uniform vec2 uHingeClosed; // inner, outer
uniform vec2 uHingeOpen;
uniform vec2 uCurlClosed;
uniform vec2 uCurlOpen;
uniform vec2 uCup;         // closed, open
uniform vec2 uRadius;      // ring radii
uniform vec2 uYBase;       // attach heights
uniform float uSwayAmp;

attribute float aAngle;
attribute float aRing;
attribute float aPhase;
attribute float aLen;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vRing;
varying float vPhase;
varying float vOpen;

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }

float openAmount() {
  float delay = (aPhase * 0.55 + (1.0 - aRing) * 0.45) * uStagger;
  float o = clamp((uOpen - delay) / max(1.0 - uStagger, 0.001), 0.0, 1.0);
  return o * o * (3.0 - 2.0 * o);
}

vec3 petalPoint(vec3 p, float o) {
  float ring = aRing;
  float hingeC = mix(uHingeClosed.x, uHingeClosed.y, ring);
  float hingeO = mix(uHingeOpen.x, uHingeOpen.y, ring);
  float eo = 1.0 - pow(1.0 - o, 2.0);
  float hinge = mix(hingeC, hingeO, eo) + (aPhase - 0.5) * 0.14 * eo;

  float oc = smoothstep(0.0, 0.75, o);
  float curl = mix(mix(uCurlClosed.x, uCurlClosed.y, ring), mix(uCurlOpen.x, uCurlOpen.y, ring), oc);
  float cup = mix(uCup.x, uCup.y, o) * (0.8 + 0.4 * aPhase);

  float sway = sin(uTime * 0.9 + aPhase * 6.2831 + p.y * 2.0) * (uSwayAmp + 0.045 * uHover) * (0.35 + 0.65 * o);
  float flutter = sin(uTime * 1.7 + aPhase * 12.0) * 0.012 * uHover * p.y;

  vec3 q = p;
  q.y *= aLen;
  q.z += cup * q.x * q.x / 0.045;
  float k = curl + flutter;
  if (abs(k) > 1e-3) {
    float a = k * q.y;
    q.y = sin(a) / k;
    q.z += (1.0 - cos(a)) / k;
  }
  q = rotX(hinge + sway) * q;
  q.z += mix(uRadius.x, uRadius.y, ring);
  q.y += mix(uYBase.x, uYBase.y, ring);
  q = rotY(aAngle) * q;
  return q;
}

void main() {
  vUv = uv;
  vRing = aRing;
  vPhase = aPhase;
  float o = openAmount();
  vOpen = o;
  vec3 P = petalPoint(position, o);
  vec3 Px = petalPoint(position + vec3(0.004, 0.0, 0.0), o);
  vec3 Py = petalPoint(position + vec3(0.0, 0.004, 0.0), o);
  vec3 N = normalize(cross(Px - P, Py - P));
  vec4 wp = modelMatrix * vec4(P, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * N);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const petalFragment = /* glsl */ `
${lightingUniformsGLSL}
uniform vec3 uColorBase;
uniform vec3 uColorTip;
uniform vec3 uColorEdge;
uniform float uTranslucency;
uniform float uSpecular;
uniform float uGlow;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
varying float vRing;
varying float vPhase;
varying float vOpen;

${shadeGLSL}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorldPos);
  float u = vUv.x;
  float v = vUv.y;

  vec3 albedo = mix(uColorBase, uColorTip, smoothstep(0.0, 0.8, u));
  albedo = mix(albedo, uColorEdge, smoothstep(0.55, 1.0, abs(v)) * 0.35);
  // fine veins along the petal
  float veins = 0.5 + 0.5 * sin(v * 26.0 + sin(u * 9.0 + vPhase * 3.0) * 0.6);
  albedo *= 1.0 - 0.08 * veins * (1.0 - u * 0.6);
  // per petal variation
  albedo *= 0.92 + 0.16 * vPhase;

  vec3 col = shade(albedo, N, V, uTranslucency, uSpecular);
  // as petals open, the golden light seems to come from within
  float inner = pow(1.0 - u, 2.0) * vOpen * uWarmth * uGlow;
  col += uColorBase * inner * 0.35;
  col = applyFog(col, vWorldPos);
  gl_FragColor = vec4(col, 1.0);
  ${outputGLSL}
}
`
