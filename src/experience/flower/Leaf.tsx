import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'
import { frameIndex, stemCurve, stemFrames, type LeafAttachment } from './flowerRig'
import { leafFragment, leafVertex } from './shaders/leaf.glsl'

interface LeafProps {
  attachment: LeafAttachment
  /** Which anim value drives the unfolding. */
  driver: 'leaf1' | 'leaf2'
}

function buildLeafGeometry(length: number, width: number, segU = 26, segV = 10) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= segU; i++) {
    const u = i / segU
    const shape = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.78)), 0.85)
    const w = width * shape
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1
      positions.push(v * w, u * length, 0)
      uvs.push(u, v)
    }
  }
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * (segV + 1) + j
      const b = a + segV + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(indices)
  return g
}

export function Leaf({ attachment, driver }: LeafProps) {
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(
    () => buildLeafGeometry(attachment.length, attachment.width),
    [attachment.length, attachment.width],
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: leafVertex,
        fragmentShader: leafFragment,
        side: THREE.DoubleSide,
        uniforms: {
          ...sceneUniforms,
          uUnfold: { value: 0 },
          uPhase: { value: attachment.phase },
          uColorDark: { value: new THREE.Color('#25401f') },
          uColorLight: { value: new THREE.Color('#5f8f3c') },
          uColorVein: { value: new THREE.Color('#8fb85a') },
        },
      }),
    [attachment.phase],
  )

  // Attachment frame: position on the stem and a basis whose +Y points along
  // the leaf and +Z is the upper surface.
  const { position, quaternion } = useMemo(() => {
    const t = attachment.t
    const point = stemCurve.getPointAt(t)
    const tangent = stemCurve.getTangentAt(t).normalize()
    const fi = frameIndex(t)
    const n = stemFrames.normals[fi]
    const b = stemFrames.binormals[fi]
    const dir = new THREE.Vector3()
      .addScaledVector(n, Math.cos(attachment.azimuth))
      .addScaledVector(b, Math.sin(attachment.azimuth))
      .normalize()
    const yAxis = new THREE.Vector3()
      .addScaledVector(dir, Math.cos(attachment.tilt))
      .addScaledVector(tangent, Math.sin(attachment.tilt))
      .normalize()
    const zAxis = tangent.clone().addScaledVector(yAxis, -tangent.dot(yAxis)).normalize()
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
    const m = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(m)
    const position = point.clone().addScaledVector(dir, 0.012)
    return { position, quaternion }
  }, [attachment])

  useFrame(({ clock }) => {
    const unfold = anim[driver]
    material.uniforms.uUnfold.value = unfold
    const g = groupRef.current
    if (!g) return
    const visible = anim.stem > attachment.t - 0.01 && unfold > 0.001
    g.visible = visible
    if (!visible) return
    // whole-leaf breathing, stronger when open
    const t = clock.elapsedTime
    const sway = Math.sin(t * 0.55 + attachment.phase * 6.28) * 0.035 * unfold
    g.quaternion.copy(quaternion)
    g.rotateX(sway)
    g.rotateZ(Math.sin(t * 0.4 + attachment.phase * 3.1) * 0.02 * unfold)
  })

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
