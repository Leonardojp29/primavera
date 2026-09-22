/**
 * Shared GLSL: a small stylised lighting model with wrap diffuse, translucency,
 * rim and a soft specular. Plus fog that matches the scene background.
 */
export const lightingUniformsGLSL = /* glsl */ `
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform float uKeyIntensity;
uniform vec3 uFillColor;
uniform vec3 uAmbient;
uniform float uWarmth;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
`

export const shadeGLSL = /* glsl */ `
vec3 shade(vec3 albedo, vec3 N, vec3 V, float translucency, float specular) {
  float ndl = dot(N, uKeyDir);
  float wrap = clamp((ndl + 0.45) / 1.45, 0.0, 1.0);
  wrap = wrap * wrap * (3.0 - 2.0 * wrap);

  vec3 col = albedo * uAmbient * 1.3;
  col += albedo * uKeyColor * uKeyIntensity * wrap;

  // light passing through thin surfaces
  float back = clamp(-ndl, 0.0, 1.0);
  float vl = clamp(dot(-V, uKeyDir), 0.0, 1.0);
  col += albedo * uKeyColor * uKeyIntensity * (back * 0.35 + pow(vl, 3.0) * 0.5) * translucency;

  // soft fill from the opposite side
  float fill = clamp(dot(N, -uKeyDir) * 0.5 + 0.5, 0.0, 1.0);
  col += albedo * uFillColor * fill * 0.55;

  // rim
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.5);
  col += uKeyColor * uKeyIntensity * rim * 0.12 * (0.4 + specular);

  // specular
  vec3 H = normalize(uKeyDir + V);
  float spec = pow(max(dot(N, H), 0.0), 28.0);
  col += uKeyColor * uKeyIntensity * spec * specular * 0.35;

  return col;
}

vec3 applyFog(vec3 col, vec3 worldPos) {
  float d = distance(worldPos, cameraPosition);
  float f = smoothstep(uFogNear, uFogFar, d);
  return mix(col, uFogColor, f);
}
`

export const outputGLSL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`
