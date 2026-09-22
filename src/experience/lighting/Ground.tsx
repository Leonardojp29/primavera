import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { anim } from '../state/anim'
import { groundFragment, groundVertex } from './ground.glsl'
import { sceneUniforms } from './sceneUniforms'

/** A quiet floor that only exists as a pool of light and a soft shadow. */
export function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVertex,
        fragmentShader: groundFragment,
        uniforms: {
          uFogColor: sceneUniforms.uFogColor,
          uWarmth: sceneUniforms.uWarmth,
          uHeadPos: sceneUniforms.uHeadPos,
          uGlowColor: { value: new THREE.Color('#ffb845') },
          uLight: { value: 0 },
        },
      }),
    [],
  )

  useFrame(() => {
    material.uniforms.uLight.value = anim.light
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} material={material}>
      <circleGeometry args={[40, 48]} />
    </mesh>
  )
}
