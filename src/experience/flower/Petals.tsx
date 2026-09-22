import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { hash } from '../../utils/math'
import { quality } from '../../utils/quality'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'
import { head } from './flowerRig'
import { petalFragment, petalVertex } from './shaders/petal.glsl'

interface RingSpec {
  count: number
  ring: 0 | 1
  length: number
  width: number
  angleOffset: number
  seed: number
}

/**
 * Merges every petal of a set into a single geometry. Per-vertex attributes
 * tell the shader where each petal lives; the shader does the rest.
 */
function buildPetalSet(rings: RingSpec[], segU: number, segV: number, tipPower: number) {
  const positions: number[] = []
  const uvs: number[] = []
  const angles: number[] = []
  const ringIds: number[] = []
  const phases: number[] = []
  const lens: number[] = []
  const indices: number[] = []
  let base = 0

  for (const spec of rings) {
    for (let p = 0; p < spec.count; p++) {
      const jitter = (hash(spec.seed + p * 3.7) - 0.5) * (Math.PI * 2 / spec.count) * 0.35
      const angle = (p / spec.count) * Math.PI * 2 + spec.angleOffset + jitter
      const phase = hash(spec.seed * 7.1 + p * 1.3)
      const len = spec.length * (0.9 + 0.2 * hash(spec.seed + p * 9.2))
      for (let i = 0; i <= segU; i++) {
        const u = i / segU
        const shape = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), tipPower) * (1 - 0.12 * u)
        const w = spec.width * shape
        for (let j = 0; j <= segV; j++) {
          const v = (j / segV) * 2 - 1
          positions.push(v * w, u, 0)
          uvs.push(u, v)
          angles.push(angle)
          ringIds.push(spec.ring)
          phases.push(phase)
          lens.push(len)
        }
      }
      for (let i = 0; i < segU; i++) {
        for (let j = 0; j < segV; j++) {
          const a = base + i * (segV + 1) + j
          const b = a + segV + 1
          indices.push(a, b, a + 1, b, b + 1, a + 1)
        }
      }
      base += (segU + 1) * (segV + 1)
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setAttribute('aAngle', new THREE.Float32BufferAttribute(angles, 1))
  g.setAttribute('aRing', new THREE.Float32BufferAttribute(ringIds, 1))
  g.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))
  g.setAttribute('aLen', new THREE.Float32BufferAttribute(lens, 1))
  g.setIndex(indices)
  // generous bounds: the shader moves vertices, so let the head group cull instead
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.2, 0), 1.2)
  return g
}

interface PetalMaterialOptions {
  hingeClosed: [number, number]
  hingeOpen: [number, number]
  curlClosed: [number, number]
  curlOpen: [number, number]
  cup: [number, number]
  radius: [number, number]
  yBase: [number, number]
  stagger: number
  swayAmp: number
  colorBase: string
  colorTip: string
  colorEdge: string
  translucency: number
  specular: number
  glow: number
}

function createPetalMaterial(o: PetalMaterialOptions) {
  return new THREE.ShaderMaterial({
    vertexShader: petalVertex,
    fragmentShader: petalFragment,
    side: THREE.DoubleSide,
    uniforms: {
      ...sceneUniforms,
      uOpen: { value: 0 },
      uHover: { value: 0 },
      uStagger: { value: o.stagger },
      uHingeClosed: { value: new THREE.Vector2(...o.hingeClosed) },
      uHingeOpen: { value: new THREE.Vector2(...o.hingeOpen) },
      uCurlClosed: { value: new THREE.Vector2(...o.curlClosed) },
      uCurlOpen: { value: new THREE.Vector2(...o.curlOpen) },
      uCup: { value: new THREE.Vector2(...o.cup) },
      uRadius: { value: new THREE.Vector2(...o.radius) },
      uYBase: { value: new THREE.Vector2(...o.yBase) },
      uSwayAmp: { value: o.swayAmp },
      uColorBase: { value: new THREE.Color(o.colorBase) },
      uColorTip: { value: new THREE.Color(o.colorTip) },
      uColorEdge: { value: new THREE.Color(o.colorEdge) },
      uTranslucency: { value: o.translucency },
      uSpecular: { value: o.specular },
      uGlow: { value: o.glow },
    },
  })
}

interface PetalsProps {
  /** Damped hover value from the parent. */
  hoverRef: { current: number }
}

export function Petals({ hoverRef }: PetalsProps) {
  const [segV, segU] = quality.petalSegments

  const petalGeometry = useMemo(
    () =>
      buildPetalSet(
        [
          {
            count: head.petalCount[0],
            ring: 0,
            length: head.petalLength[0],
            width: head.petalWidth[0],
            angleOffset: 0,
            seed: 11,
          },
          {
            count: head.petalCount[1],
            ring: 1,
            length: head.petalLength[1],
            width: head.petalWidth[1],
            angleOffset: Math.PI / head.petalCount[1],
            seed: 29,
          },
        ],
        segU,
        segV,
        0.55,
      ),
    [segU, segV],
  )

  const sepalGeometry = useMemo(
    () =>
      buildPetalSet(
        [
          {
            count: Math.ceil(head.sepalCount / 2),
            ring: 0,
            length: head.sepalLength,
            width: head.sepalWidth,
            angleOffset: 0.2,
            seed: 43,
          },
          {
            count: Math.floor(head.sepalCount / 2),
            ring: 1,
            length: head.sepalLength * 0.9,
            width: head.sepalWidth * 1.1,
            angleOffset: 0.2 + Math.PI / head.sepalCount,
            seed: 57,
          },
        ],
        Math.max(6, segU - 4),
        Math.max(4, segV - 2),
        0.7,
      ),
    [segU, segV],
  )

  const petalMaterial = useMemo(
    () =>
      createPetalMaterial({
        hingeClosed: [0.1, 0.24],
        hingeOpen: [1.22, 1.58],
        curlClosed: [-2.3, -1.8],
        curlOpen: [0.45, 0.75],
        cup: [-0.5, -0.35],
        radius: [0.115, 0.14],
        yBase: [0.035, 0.012],
        stagger: 0.45,
        swayAmp: 0.02,
        colorBase: '#e8a616',
        colorTip: '#ffda3c',
        colorEdge: '#ffe76a',
        translucency: 0.65,
        specular: 0.35,
        glow: 1,
      }),
    [],
  )

  const sepalMaterial = useMemo(
    () =>
      createPetalMaterial({
        hingeClosed: [0.04, 0.12],
        hingeOpen: [1.5, 1.85],
        curlClosed: [-2.1, -1.7],
        curlOpen: [0.9, 0.7],
        cup: [-0.5, -0.4],
        radius: [0.15, 0.16],
        yBase: [0.0, -0.01],
        stagger: 0.35,
        swayAmp: 0.012,
        colorBase: '#2c5527',
        colorTip: '#5c8c3a',
        colorEdge: '#7aa64a',
        translucency: 0.45,
        specular: 0.2,
        glow: 0,
      }),
    [],
  )

  useFrame(() => {
    petalMaterial.uniforms.uOpen.value = anim.open
    petalMaterial.uniforms.uHover.value = hoverRef.current
    sepalMaterial.uniforms.uOpen.value = anim.sepal
    sepalMaterial.uniforms.uHover.value = hoverRef.current * 0.4
  })

  return (
    <>
      <mesh geometry={sepalGeometry} material={sepalMaterial} frustumCulled={false} />
      <mesh geometry={petalGeometry} material={petalMaterial} frustumCulled={false} />
    </>
  )
}
