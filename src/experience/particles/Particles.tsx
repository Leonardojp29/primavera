import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { hash } from '../../utils/math'
import { quality } from '../../utils/quality'
import { flowerWorld } from '../flower/Flower'
import { head } from '../flower/flowerRig'
import { anim } from '../state/anim'
import { dustFragment, dustVertex } from './particles.glsl'

/** Golden dust drifting through the space plus pollen orbiting the open flower. */
export function Particles() {
  const gl = useThree((s) => s.gl)
  const dustCount = quality.dustCount
  const pollenCount = quality.pollenCount
  const total = dustCount + pollenCount

  const geometry = useMemo(() => {
    const positions = new Float32Array(total * 3)
    const sizes = new Float32Array(total)
    const speeds = new Float32Array(total)
    const phases = new Float32Array(total)
    const types = new Float32Array(total)
    const rands = new Float32Array(total)
    for (let i = 0; i < total; i++) {
      const isPollen = i >= dustCount
      const r1 = hash(i * 1.31 + 0.7)
      const r2 = hash(i * 2.17 + 3.1)
      const r3 = hash(i * 3.71 + 5.9)
      // cylinder around the plant, denser near the middle distance
      const radius = 0.25 + Math.pow(r1, 0.6) * 3.2
      const angle = r2 * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = r3 * 4.4 - 0.3
      positions[i * 3 + 2] = Math.sin(angle) * radius
      sizes[i] = isPollen ? 0.35 + hash(i * 7.7) * 0.7 : 0.45 + Math.pow(hash(i * 5.3), 3.0) * 2.2
      speeds[i] = 0.5 + hash(i * 9.1) * 1.1
      phases[i] = hash(i * 11.3)
      types[i] = isPollen ? 1 : 0
      rands[i] = hash(i * 13.7)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    g.setAttribute('aType', new THREE.BufferAttribute(types, 1))
    g.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 0), 6)
    return g
  }, [total, dustCount])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uDust: { value: 0 },
          uPollen: { value: 0 },
          uPixelRatio: { value: 1 },
          uHead: { value: new THREE.Vector3() },
          uHeadRadius: { value: head.openRadius },
          uNudge: { value: 0 },
          uColor: { value: new THREE.Color('#ffd27a') },
          uColorPollen: { value: new THREE.Color('#ffe9a8') },
        },
      }),
    [],
  )

  useFrame(({ clock }) => {
    const u = material.uniforms
    u.uTime.value = clock.elapsedTime
    u.uDust.value = anim.dust
    u.uPollen.value = anim.pollen
    u.uNudge.value = anim.nudge
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uHead.value.copy(flowerWorld.head)
    u.uHeadRadius.value = head.openRadius * Math.max(flowerWorld.headScale, 0.2)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
