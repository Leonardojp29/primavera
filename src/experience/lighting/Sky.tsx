import { useMemo } from 'react'
import * as THREE from 'three'
import { sceneUniforms } from './sceneUniforms'

const skyVertex = /* glsl */ `
varying vec3 vDir;
varying vec3 vWorldPos;
void main() {
  vDir = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const skyFragment = /* glsl */ `
uniform vec3 uFogColor;
uniform float uWarmth;
varying vec3 vDir;
varying vec3 vWorldPos;
uniform vec3 uHeadPos;
vec3 halo(vec3 viewDir) {
  vec3 toHead = normalize(uHeadPos - cameraPosition);
  float g = pow(max(dot(viewDir, toHead), 0.0), 18.0);
  return vec3(0.16, 0.10, 0.035) * g * uWarmth * 0.5;
}
void main() {
  // same colour as the fog so the ground horizon dissolves; a touch darker overhead
  float up = clamp(vDir.y, 0.0, 1.0);
  vec3 col = uFogColor * (1.0 - 0.45 * smoothstep(0.0, 0.8, up));
  // a faint warm glow behind the flower once it blooms (also added by the ground)
  col += halo(normalize(vWorldPos - cameraPosition));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/** A huge inverted sphere that is the sky. It shares the fog colour exactly. */
export function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uFogColor: sceneUniforms.uFogColor, uWarmth: sceneUniforms.uWarmth, uHeadPos: sceneUniforms.uHeadPos },
      }),
    [],
  )
  return (
    <mesh material={material} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[30, 24, 16]} />
    </mesh>
  )
}
