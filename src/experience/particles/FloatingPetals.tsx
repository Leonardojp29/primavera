import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { hash } from '../../utils/math'
import { quality } from '../../utils/quality'
import { flowerWorld } from '../flower/Flower'
import { simpleLitFragment, simpleLitVertex } from '../flower/shaders/simpleLit.glsl'
import { sceneUniforms } from '../lighting/sceneUniforms'
import { anim } from '../state/anim'

function buildSmallPetal(length: number, width: number, segU = 8, segV = 4) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= segU; i++) {
    const u = i / segU
    const w = width * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 0.9)
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1
      // slight cup and curl so it is not a flat card
      positions.push(v * w, u * length, -0.35 * (v * w) * (v * w) / width + 0.25 * u * u * length)
      uvs.push(v * 0.5 + 0.5, u)
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
  g.computeVertexNormals()
  return g
}

/** A few petals that let go and drift through the golden air after the bloom. */
export function FloatingPetals() {
  const count = quality.floatingPetals
  const ref = useRef<THREE.InstancedMesh>(null)

  const geometry = useMemo(() => {
    const g = buildSmallPetal(0.11, 0.024)
    g.setAttribute('aFade', new THREE.InstancedBufferAttribute(new Float32Array(count), 1))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: simpleLitVertex,
        fragmentShader: simpleLitFragment,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
          ...sceneUniforms,
          uColorA: { value: new THREE.Color('#e0a020') },
          uColorB: { value: new THREE.Color('#ffd95a') },
          uTranslucency: { value: 0.7 },
          uSpecular: { value: 0.3 },
          uOpacity: { value: 1 },
        },
      }),
    [],
  )

  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      s: new THREE.Vector3(),
    }),
    [],
  )

  const params = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        period: 11 + hash(i * 1.7) * 7,
        offset: hash(i * 2.9) * 18,
        angle0: hash(i * 3.3) * Math.PI * 2,
        spin: 1.5 + hash(i * 4.1) * 2.5,
        wobble: hash(i * 5.7) * Math.PI * 2,
        scale: 0.75 + hash(i * 6.1) * 0.5,
        drift: 0.6 + hash(i * 7.3) * 1.2,
      })),
    [count],
  )

  useFrame(({ clock, camera }) => {
    const mesh = ref.current
    if (!mesh) return
    const drift = anim.drift
    mesh.visible = drift > 0.001
    if (!mesh.visible) return
    const t = clock.elapsedTime
    const fade = geometry.getAttribute('aFade') as THREE.InstancedBufferAttribute
    const { m, p, q, e, s } = tmp
    const headR = 0.5 * Math.max(flowerWorld.headScale, 0.1)

    for (let i = 0; i < count; i++) {
      const k = params[i]
      const tau = ((t + k.offset) % k.period) / k.period
      const life = Math.pow(Math.sin(Math.PI * tau), 0.7)
      const ang = k.angle0 + tau * 2.2 + Math.sin(t * 0.3 + k.wobble) * 0.2
      const radius = headR * 0.9 + tau * k.drift * 0.8
      const rise = tau * 1.4 + Math.sin(t * 0.7 + k.wobble) * 0.06
      p.set(
        flowerWorld.head.x + Math.cos(ang) * radius,
        flowerWorld.head.y - 0.15 + rise * 1.3 - tau * tau * 0.2,
        flowerWorld.head.z + Math.sin(ang) * radius * 0.8,
      )
      e.set(t * 0.6 * k.spin + k.wobble, t * 0.4 * k.spin, Math.sin(t * 0.8 + k.wobble) * 0.8)
      q.setFromEuler(e)
      // petals passing close to the lens shrink so they never fill the frame
      const near = Math.min(1, Math.max(0.15, (p.distanceTo(camera.position) - 0.35) / 1.1))
      const sc = k.scale * (0.6 + 0.4 * life) * near
      s.set(sc, sc, sc)
      m.compose(p, q, s)
      mesh.setMatrixAt(i, m)
      fade.setX(i, life * drift)
    }
    mesh.instanceMatrix.needsUpdate = true
    fade.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />
}
