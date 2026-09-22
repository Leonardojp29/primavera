import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { quality } from '../../utils/quality'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'
import { frameIndex, stemCurve, stemFrames } from './flowerRig'
import { stemFragment, stemVertex } from './shaders/stem.glsl'

const BASE_RADIUS = 0.036
const MIN_GROWTH = 0.012

/**
 * The stem is a tapered tube whose rings are redistributed every frame between
 * the base and the current tip, so it literally grows along the rig curve
 * instead of being revealed.
 */
export function Stem() {
  const [radial, tubular] = quality.stemSegments
  const meshRef = useRef<THREE.Mesh>(null)
  const lastGrowth = useRef(-1)

  const { geometry, positions, normals } = useMemo(() => {
    const vertexCount = (tubular + 1) * (radial + 1)
    const positions = new Float32Array(vertexCount * 3)
    const normals = new Float32Array(vertexCount * 3)
    const uvs = new Float32Array(vertexCount * 2)
    const indices: number[] = []

    for (let i = 0; i <= tubular; i++) {
      for (let j = 0; j <= radial; j++) {
        const k = i * (radial + 1) + j
        uvs[k * 2] = j / radial
        uvs[k * 2 + 1] = i / tubular
      }
    }
    for (let i = 0; i < tubular; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j
        const b = a + radial + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    return { geometry, positions, normals }
  }, [radial, tubular])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: stemVertex,
        fragmentShader: stemFragment,
        uniforms: {
          ...sceneUniforms,
          uColorBase: { value: new THREE.Color('#2f4a24') },
          uColorTop: { value: new THREE.Color('#5c8a3a') },
          uGrowth: { value: 0 },
        },
      }),
    [],
  )

  const tmp = useMemo(
    () => ({
      point: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      radialDir: new THREE.Vector3(),
    }),
    [],
  )

  useFrame(() => {
    const growth = Math.max(MIN_GROWTH, anim.stem)
    if (Math.abs(growth - lastGrowth.current) < 1e-5) return
    lastGrowth.current = growth
    material.uniforms.uGrowth.value = growth

    const { point, tangent, normal, radialDir } = tmp
    const capStart = 0.86

    for (let i = 0; i <= tubular; i++) {
      const local = i / tubular
      const t = local * growth
      stemCurve.getPointAt(t, point)
      const fi = frameIndex(t)
      const fn = stemFrames.normals[fi]
      const fb = stemFrames.binormals[fi]
      stemCurve.getTangentAt(t, tangent)

      // taper toward the top plus a rounded cap at the growing tip
      let radius = BASE_RADIUS * (1 - 0.4 * t)
      let capFactor = 1
      if (local > capStart) {
        const c = (local - capStart) / (1 - capStart)
        capFactor = Math.sqrt(Math.max(0, 1 - c * c))
        radius *= capFactor
      }
      // very young stems are thinner
      radius *= 0.55 + 0.45 * Math.min(1, growth / 0.25)

      for (let j = 0; j <= radial; j++) {
        const angle = (j / radial) * Math.PI * 2
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        radialDir.set(
          fn.x * c + fb.x * s,
          fn.y * c + fb.y * s,
          fn.z * c + fb.z * s,
        )
        const k = (i * (radial + 1) + j) * 3
        positions[k] = point.x + radialDir.x * radius
        positions[k + 1] = point.y + radialDir.y * radius
        positions[k + 2] = point.z + radialDir.z * radius

        normal.copy(radialDir).multiplyScalar(capFactor).addScaledVector(tangent, 1 - capFactor).normalize()
        normals[k] = normal.x
        normals[k + 1] = normal.y
        normals[k + 2] = normal.z
      }
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.normal.needsUpdate = true
    geometry.computeBoundingSphere()
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
}
