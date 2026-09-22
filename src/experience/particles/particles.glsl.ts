export const dustVertex = /* glsl */ `
attribute float aSize;
attribute float aSpeed;
attribute float aPhase;
attribute float aType;   // 0 = ambient dust, 1 = pollen around the head
attribute float aRand;

uniform float uTime;
uniform float uDust;
uniform float uPollen;
uniform float uPixelRatio;
uniform vec3 uHead;
uniform float uHeadRadius;
uniform float uNudge;
uniform float uSpeedScale;

varying float vAlpha;
varying float vType;

void main() {
  vec3 p = position;
  float t = uTime * aSpeed * uSpeedScale;
  float alpha;
  if (aType < 0.5) {
    float h = mod(p.y + t * 0.09 + aPhase * 4.0, 4.4) - 0.3;
    p.y = h;
    p.x += sin(t * 0.45 + aPhase * 6.2831) * 0.28;
    p.z += cos(t * 0.38 + aPhase * 4.1) * 0.28;
    float fade = smoothstep(-0.3, 0.4, h) * (1.0 - smoothstep(3.2, 4.1, h));
    // keep the very centre a little clearer so the flower reads
    float centre = smoothstep(0.15, 0.9, length(p.xz));
    alpha = uDust * fade * (0.35 + 0.65 * centre);
  } else {
    float ang = aPhase * 6.2831 + t * 0.32;
    float r = uHeadRadius * (0.55 + 1.5 * aRand);
    float lift = sin(t * 0.5 + aPhase * 20.0) * 0.3 + aRand * 0.25;
    p = uHead + vec3(cos(ang) * r, lift, sin(ang) * r * 0.85);
    alpha = uPollen * (0.5 + 0.5 * aRand);
  }
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSpeed * 0.8) + aPhase * 40.0);
  float big = smoothstep(1.2, 2.6, aSize);
  vAlpha = alpha * twinkle * (1.0 + uNudge * 0.8) * mix(1.0, 0.35, big);
  vType = aType;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = aSize * (1.0 + uNudge * 0.4);
  gl_PointSize = size * uPixelRatio * (34.0 / max(-mv.z, 0.5));
}
`

export const dustFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColorPollen;
varying float vAlpha;
varying float vType;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float soft = pow(1.0 - d, 2.2);
  float core = pow(1.0 - d, 8.0);
  vec3 col = mix(uColor, uColorPollen, vType);
  vec3 rgb = col * (soft * 0.8 + core * 1.6);
  gl_FragColor = vec4(rgb, vAlpha * soft);
  #include <colorspace_fragment>
}
`
