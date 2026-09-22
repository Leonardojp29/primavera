import { lightingUniformsGLSL, outputGLSL, shadeGLSL } from './lighting.glsl'

/** Minimal lit shader for small parts (seed, receptacle, floating petals). */
export const simpleLitVertex = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
#ifdef USE_INSTANCING
attribute float aFade;
varying float vFade;
#endif

void main() {
  vUv = uv;
  vec3 transformed = position;
  vec3 n = normal;
  #ifdef USE_INSTANCING
    vFade = aFade;
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 wp = modelMatrix * vec4(transformed, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const simpleLitFragment = /* glsl */ `
${lightingUniformsGLSL}
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTranslucency;
uniform float uSpecular;
uniform float uOpacity;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUv;
#ifdef USE_INSTANCING
varying float vFade;
#endif

${shadeGLSL}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 albedo = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vUv.y));
  vec3 col = shade(albedo, N, V, uTranslucency, uSpecular);
  col = applyFog(col, vWorldPos);
  float alpha = uOpacity;
  #ifdef USE_INSTANCING
    alpha *= vFade;
  #endif
  gl_FragColor = vec4(col, alpha);
  ${outputGLSL}
}
`
