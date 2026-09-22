import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { hash } from '../../utils/math'
import { quality } from '../../utils/quality'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'
import { head } from './flowerRig'
import { discFragment, discVertex } from './shaders/disc.glsl'
import { simpleLitFragment, simpleLitVertex } from './shaders/simpleLit.glsl'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Centre of the flower: a low dome with florets laid out on a Vogel spiral. */
export function Disc() {
  const floretsRef = useRef<THREE.InstancedMesh>(null)
  const floretCount = quality.tier === 'low' ? 150 : quality.tier === 'mid' ? 230 : 320

  const domeGeometry = useMemo(() => {
    const g = new THREE.SphereGeometry(head.discRadius, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    g.scale(1, head.discHeight / head.discRadius, 1)
    g.computeVertexNormals()
    return g
  }, [])

  const domeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: discVertex,
        fragmentShader: discFragment,
        uniforms: {
          ...sceneUniforms,
          uColorCentre: { value: new THREE.Color('#24140a') },
          uColorMid: { value: new THREE.Color('#5a3410') },
          uColorRim: { value: new THREE.Color('#b8761c') },
          uOpen: { value: 0 },
        },
      }),
    [],
  )

  const floretGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const floretMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.55,
        metalness: 0.05,
        color: '#ffffff',
      }),
    [],
  )

  const receptacleMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: simpleLitVertex,
        fragmentShader: simpleLitFragment,
        uniforms: {
          ...sceneUniforms,
          uColorA: { value: new THREE.Color('#2c4f24') },
          uColorB: { value: new THREE.Color('#4a7a33') },
          uTranslucency: { value: 0.2 },
          uSpecular: { value: 0.25 },
          uOpacity: { value: 1 },
        },
      }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = floretsRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    const p = new THREE.Vector3()
    const color = new THREE.Color()
    const cCentre = new THREE.Color('#2a180a')
    const cMid = new THREE.Color('#8a4f14')
    const cRim = new THREE.Color('#e5a336')
    const R = head.discRadius * 0.94
    for (let i = 0; i < floretCount; i++) {
      const f = (i + 0.5) / floretCount
      const r = R * Math.sqrt(f)
      const theta = i * GOLDEN_ANGLE
      const rn = r / head.discRadius
      const y = head.discHeight * Math.sqrt(Math.max(0, 1 - rn * rn)) + 0.008
      p.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
      const size = (0.009 + 0.007 * rn) * (0.85 + 0.3 * hash(i * 1.7))
      s.set(size, size * 1.3, size)
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().setY(p.y + 0.06).normalize())
      m.compose(p, q, s)
      mesh.setMatrixAt(i, m)
      color.copy(cCentre).lerp(cMid, Math.pow(rn, 1.4))
      if (rn > 0.78) color.lerp(cRim, (rn - 0.78) / 0.22)
      color.multiplyScalar(0.9 + 0.2 * hash(i * 3.3))
      mesh.setColorAt(i, color)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [floretCount])

  useFrame(() => {
    domeMaterial.uniforms.uOpen.value = anim.open
  })

  return (
    <group>
      {/* receptacle under the head */}
      <mesh position={[0, -0.035, 0]} scale={[1, 0.62, 1]} material={receptacleMaterial}>
        <sphereGeometry args={[0.125, 24, 16]} />
      </mesh>
      <mesh geometry={domeGeometry} material={domeMaterial} position={[0, 0.012, 0]} />
      <instancedMesh
        ref={floretsRef}
        args={[floretGeometry, floretMaterial, floretCount]}
        position={[0, 0.012, 0]}
        frustumCulled={false}
      />
    </group>
  )
}
