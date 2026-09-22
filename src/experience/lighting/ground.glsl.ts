export const groundVertex = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const groundFragment = /* glsl */ `
uniform vec3 uFogColor;
uniform vec3 uGlowColor;
uniform float uWarmth;
uniform float uLight;
varying vec3 vWorldPos;
uniform vec3 uHeadPos;
vec3 halo(vec3 viewDir) {
  vec3 toHead = normalize(uHeadPos - cameraPosition);
  float g = pow(max(dot(viewDir, toHead), 0.0), 18.0);
  return vec3(0.16, 0.10, 0.035) * g * uWarmth * 0.5;
}

void main() {
  float r = length(vWorldPos.xz);
  // warm pool of light beneath the flower
  float pool = exp(-r * r * 0.9);
  vec3 col = uFogColor;
  col += uGlowColor * pool * (0.05 * uLight + 0.22 * uWarmth);
  // soft contact shadow at the base of the stem
  float shadow = exp(-r * r * 60.0);
  col *= 1.0 - shadow * 0.55;
  // fade into the fog with distance
  float d = distance(vWorldPos, cameraPosition);
  float f = smoothstep(3.0, 11.0, d);
  col = mix(col, uFogColor, f);
  col += halo(normalize(vWorldPos - cameraPosition));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`
