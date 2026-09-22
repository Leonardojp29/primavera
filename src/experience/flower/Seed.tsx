import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'
import { simpleLitFragment, simpleLitVertex } from './shaders/simpleLit.glsl'

/** The seed at the base. It stays as the small bulb the stem grows out of. */
export function Seed() {
  const ref = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: simpleLitVertex,
        fragmentShader: simpleLitFragment,
        uniforms: {
          ...sceneUniforms,
          uColorA: { value: new THREE.Color('#2b1a0d') },
          uColorB: { value: new THREE.Color('#6a4520') },
          uTranslucency: { value: 0.1 },
          uSpecular: { value: 0.9 },
          uOpacity: { value: 1 },
        },
      }),
    [],
  )

  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    // a barely perceptible breath while waiting for the first touch
    const breath = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.02 * anim.pulse * (1 - Math.min(1, anim.stem * 4))
    const settle = 1 - 0.25 * Math.min(1, anim.stem / 0.3)
    m.scale.set(0.05 * breath * settle, 0.068 * breath * settle, 0.05 * breath * settle)
  })

  return (
    <mesh ref={ref} position={[0, 0.012, 0]} rotation={[0.15, 0.4, -0.1]} material={material}>
      <sphereGeometry args={[1, 24, 16]} />
    </mesh>
  )
}
