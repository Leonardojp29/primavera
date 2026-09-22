import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { damp } from '../../utils/math'
import { pointer } from '../camera/usePointer'
import { anim } from '../state/anim'
import { openLetter } from '../state/director'
import { useExperience } from '../state/store'
import { tapCue } from '../interaction/tapCue'
import { letterWorld } from './letterWorld'
import { makeEnvelopeFrontTexture, makeGrainTexture } from './paperTextures'

const W = 0.52
const H = 0.34
const FLAP_DROP = H * 0.62

/**
 * A quiet paper envelope that floats in front of the camera at the end of the
 * story. It is placed camera-relative every frame so it stays composed no
 * matter how the camera drifts. Tapping it opens the flap and lets the sheet
 * slide out; the readable letter (HTML) then takes over.
 */
export function Envelope() {
  const groupRef = useRef<THREE.Group>(null)
  const flapRef = useRef<THREE.Group>(null)
  const sheetRef = useRef<THREE.Mesh>(null)
  const stage = useExperience((s) => s.stage)
  const active = stage === 'epilogue' || stage === 'letter'

  const textures = useMemo(() => ({ grain: makeGrainTexture(), front: makeEnvelopeFrontTexture(W / H) }), [])

  const materials = useMemo(() => {
    const paper = (color: string, map: THREE.Texture, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({
        color,
        map,
        roughness: 0.92,
        metalness: 0,
        transparent: true,
        opacity: 0,
        ...extra,
      })
    const grain = textures.grain
    grain.repeat.set(3, 2)
    return {
      back: paper('#dcd2bd', grain),
      front: paper('#ffffff', textures.front),
      flap: paper('#f4ecdc', grain, { side: THREE.DoubleSide }),
      sheet: paper('#faf4e8', grain),
      seal: new THREE.MeshStandardMaterial({
        color: '#d8a83c',
        metalness: 0.35,
        roughness: 0.4,
        transparent: true,
        opacity: 0,
      }),
      sealInner: new THREE.MeshStandardMaterial({
        color: '#b8862a',
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0,
      }),
    }
  }, [textures])

  const flapGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-W / 2, 0)
    shape.lineTo(W / 2, 0)
    shape.lineTo(0.018, -FLAP_DROP)
    shape.quadraticCurveTo(0, -FLAP_DROP - 0.006, -0.018, -FLAP_DROP)
    shape.closePath()
    return new THREE.ShapeGeometry(shape, 4)
  }, [])

  const tmp = useMemo(
    () => ({
      forward: new THREE.Vector3(),
      up: new THREE.Vector3(),
      right: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      projected: new THREE.Vector3(),
      tiltX: 0,
      tiltY: 0,
    }),
    [],
  )

  useEffect(() => {
    if (active) document.body.style.cursor = 'default'
  }, [active])

  useFrame(({ camera, clock, size }, dt) => {
    const g = groupRef.current
    if (!g) return
    const delta = Math.min(dt, 0.05)
    const t = clock.elapsedTime
    const e = anim.envelope
    const portrait = size.width < size.height

    // camera-relative anchor
    camera.getWorldDirection(tmp.forward)
    tmp.up.setFromMatrixColumn(camera.matrixWorld, 1).normalize()
    tmp.right.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
    const dist = (portrait ? 1.05 : 1.3) - anim.dolly * 0.12
    const lift = (portrait ? -0.2 : -0.13) + anim.dolly * 0.05
    tmp.pos.copy(camera.position).addScaledVector(tmp.forward, dist).addScaledVector(tmp.up, lift)
    letterWorld.focus.copy(tmp.pos)

    g.visible = active && e > 0.002
    if (active) {
      const s = useExperience.getState()
      const waiting = s.stage === 'epilogue' && !s.busy && e > 0.9
      tapCue.visible = waiting
      if (waiting) {
        tmp.projected.copy(tmp.pos).project(camera)
        tapCue.x = (tmp.projected.x * 0.5 + 0.5) * size.width
        tapCue.y = (-tmp.projected.y * 0.5 + 0.5) * size.height
        tapCue.scale = 1.15
      }
    }
    if (!g.visible) return

    // entrance rises into place; the exit sinks away
    const entering = anim.sheet < 0.001
    const rise = entering ? -(1 - e) * 0.12 : -(1 - e) * 0.08
    const bob = Math.sin(t * 0.7) * 0.004 * e
    tmp.pos.addScaledVector(tmp.up, rise + bob)
    g.position.copy(tmp.pos)

    // orientation: face the camera, tilted as if presented on an unseen surface
    const px = pointer.hasMouse ? pointer.x : 0
    const py = pointer.hasMouse ? pointer.y : 0
    tmp.tiltX = damp(tmp.tiltX, -py * 0.05, 3, delta)
    tmp.tiltY = damp(tmp.tiltY, px * 0.07, 3, delta)
    const settle = (1 - e) * 0.35
    tmp.e.set(
      -0.3 + settle + tmp.tiltX + Math.sin(t * 0.45) * 0.01,
      tmp.tiltY,
      Math.sin(t * 0.5) * 0.012,
    )
    tmp.q.setFromEuler(tmp.e)
    g.quaternion.copy(camera.quaternion).multiply(tmp.q)
    g.scale.setScalar(0.92 + 0.08 * e)

    const opacity = e
    for (const m of Object.values(materials)) m.opacity = opacity

    const flap = flapRef.current
    if (flap) flap.rotation.x = anim.flap * 2.6
    const sheet = sheetRef.current
    if (sheet) {
      const s = anim.sheet
      sheet.position.set(0, 0.35 * s, 0.0045 + 0.05 * s)
      sheet.rotation.x = -0.14 * s
    }
  })

  const onClick = (ev: ThreeEvent<MouseEvent>) => {
    ev.stopPropagation()
    if (pointer.moved) return
    openLetter()
  }
  const onOver = () => {
    const s = useExperience.getState()
    if (s.stage === 'epilogue' && !s.busy) document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    document.body.style.cursor = 'default'
  }

  return (
    <group ref={groupRef} visible={false}>
      {/* generous invisible tap area */}
      <mesh onClick={onClick} onPointerOver={onOver} onPointerOut={onOut} position={[0, 0.02, 0.02]}>
        <planeGeometry args={[W * 1.35, H * 1.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* body */}
      <mesh material={materials.back} renderOrder={1}>
        <boxGeometry args={[W, H, 0.006]} />
      </mesh>
      {/* folded sheet inside */}
      <mesh ref={sheetRef} material={materials.sheet} position={[0, 0, 0.0045]} renderOrder={2}>
        <planeGeometry args={[W * 0.88, H * 0.9]} />
      </mesh>
      {/* front panels with baked seams */}
      <mesh material={materials.front} position={[0, 0, 0.0062]} renderOrder={3}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {/* hinged flap with a small golden seal */}
      <group ref={flapRef} position={[0, H / 2, 0.0078]}>
        <mesh geometry={flapGeometry} material={materials.flap} renderOrder={4} />
        <group position={[0, -FLAP_DROP + 0.036, 0.0025]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.seal} renderOrder={5}>
            <cylinderGeometry args={[0.017, 0.017, 0.004, 40]} />
          </mesh>
          <mesh material={materials.sealInner} position={[0, 0.0022, 0]} renderOrder={6}>
            <cylinderGeometry args={[0.0095, 0.0095, 0.001, 32]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
