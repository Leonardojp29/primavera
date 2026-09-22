import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clamp, damp, lerp } from '../../utils/math'
import { headNormal, headPosition, stemPoint } from '../flower/flowerRig'
import { anim } from '../state/anim'
import { useExperience, type Stage } from '../state/store'
import { pointer } from './usePointer'

interface Pose {
  position: THREE.Vector3
  target: THREE.Vector3
}

/**
 * The camera tells the story: open and distant at the seed, closing in as the
 * stem grows, a slow orbit while the flower blooms and an intimate close-up at
 * the end. Poses are targets; exponential damping makes every move cinematic.
 */
export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const stage = useExperience((s) => s.stage)
  const stageRef = useRef<Stage>(stage)
  stageRef.current = stage
  const sizeRef = useRef(size)
  sizeRef.current = size

  const state = useMemo(
    () => ({
      pos: new THREE.Vector3(0, 0.9, 5.8),
      target: new THREE.Vector3(0, 0.3, 0),
      desired: { position: new THREE.Vector3(), target: new THREE.Vector3() } as Pose,
      tmp: new THREE.Vector3(),
      tmp2: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      yaw: 0,
      pitch: 0,
      parallaxX: 0,
      parallaxY: 0,
      initialised: false,
    }),
    [],
  )

  // Portrait first: keep a comfortable horizontal field of view on phones and
  // let desktop open up cinematically.
  useEffect(() => {
    const aspect = size.width / size.height
    let fov: number
    if (aspect < 1) {
      const hFov = THREE.MathUtils.degToRad(36)
      fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hFov / 2) / aspect))
      fov = clamp(fov, 42, 78)
    } else {
      fov = aspect > 1.6 ? 36 : 40
    }
    camera.fov = fov
    camera.near = 0.05
    camera.far = 40
    camera.updateProjectionMatrix()
  }, [camera, size])

  const computeDesired = (pose: Pose, t: number) => {
    const s = stageRef.current
    const head = state.tmp
    switch (s) {
      case 'intro':
      case 'seed':
        pose.position.set(0, 0.95, 5.6)
        pose.target.set(0, 0.28, 0)
        break
      case 'grow1':
        pose.position.set(0.35, 1.1, 4.5)
        pose.target.set(0, 0.62, 0)
        break
      case 'grow2':
        pose.position.set(-0.6, 1.65, 4.0)
        pose.target.set(0, 1.12, 0.02)
        break
      case 'bud':
        pose.position.set(0.55, 2.3, 3.6)
        pose.target.set(0, 1.8, 0.1)
        break
      case 'bloom':
      case 'bloomed': {
        stemPoint(anim.stem, head)
        const o = anim.orbit
        const angle = lerp(0.42, -0.7, o) + Math.sin(t * 0.08) * 0.06
        const radius = lerp(3.0, 2.35, o)
        const height = lerp(0.55, 0.3, o)
        pose.position.set(
          head.x + Math.sin(angle) * radius,
          head.y + height,
          head.z + Math.cos(angle) * radius,
        )
        pose.target.set(head.x, head.y - 0.05, head.z)
        break
      }
      case 'final': {
        const c = anim.closeup
        // approach along the flower's own gaze, slightly from the front
        const dir = state.tmp2.copy(headNormal).multiplyScalar(0.8).add(new THREE.Vector3(0, 0.02, 0.7)).normalize()
        const orbitAngle = -0.7
        const startPos = new THREE.Vector3(
          headPosition.x + Math.sin(orbitAngle) * 2.35,
          headPosition.y + 0.3,
          headPosition.z + Math.cos(orbitAngle) * 2.35,
        )
        const endPos = headPosition.clone().addScaledVector(dir, 1.75)
        pose.position.lerpVectors(startPos, endPos, c)
        pose.target.copy(headPosition)
        pose.target.y -= lerp(0.05, 0.02, c)
        break
      }
      case 'epilogue':
      case 'letter': {
        // drift back so the flower rests in the upper part of the frame and
        // leaves room for the envelope below; a little closer once it opens
        const portrait = sizeRef.current.width < sizeRef.current.height
        const dir = state.tmp2.copy(headNormal).multiplyScalar(0.8).add(new THREE.Vector3(0, 0.02, 0.7)).normalize()
        const dist = (portrait ? 3.1 : 4.2) - anim.dolly * 0.25
        pose.position.copy(headPosition).addScaledVector(dir, dist)
        pose.position.y -= 0.1
        pose.target.copy(headPosition)
        pose.target.y -= portrait ? 0.45 : 0.35
        break
      }
    }
  }

  useFrame(({ clock }, dt) => {
    const delta = Math.min(dt, 0.05)
    const t = clock.elapsedTime
    const s = stageRef.current
    computeDesired(state.desired, t)

    if (!state.initialised) {
      state.pos.copy(state.desired.position)
      state.target.copy(state.desired.target)
      state.initialised = true
    }

    // slow, cinematic follow
    const lambda = s === 'final' ? 1.1 : s === 'epilogue' || s === 'letter' ? 0.55 : 1.35
    state.pos.x = damp(state.pos.x, state.desired.position.x, lambda, delta)
    state.pos.y = damp(state.pos.y, state.desired.position.y, lambda, delta)
    state.pos.z = damp(state.pos.z, state.desired.position.z, lambda, delta)
    state.target.x = damp(state.target.x, state.desired.target.x, lambda * 1.2, delta)
    state.target.y = damp(state.target.y, state.desired.target.y, lambda * 1.2, delta)
    state.target.z = damp(state.target.z, state.desired.target.z, lambda * 1.2, delta)

    // interaction: subtle parallax everywhere, a bounded orbit at the end
    const inputX = pointer.hasMouse ? pointer.x : pointer.dragX
    const inputY = pointer.hasMouse ? pointer.y : pointer.dragY
    const final = s === 'final' || s === 'bloomed'
    const reading = s === 'letter'
    const parallaxScale = reading ? 0 : s === 'epilogue' ? 0.5 : 1
    const yawTarget = final ? clamp(pointer.dragX, -1, 1) * 0.42 + (pointer.hasMouse ? pointer.x * 0.08 : 0) : 0
    const pitchTarget = final ? clamp(pointer.dragY, -1, 1) * 0.16 + (pointer.hasMouse ? pointer.y * 0.04 : 0) : 0
    state.yaw = damp(state.yaw, yawTarget, 2.2, delta)
    state.pitch = damp(state.pitch, pitchTarget, 2.2, delta)
    state.parallaxX = damp(state.parallaxX, final ? 0 : inputX * 0.16 * parallaxScale, 2, delta)
    state.parallaxY = damp(state.parallaxY, final ? 0 : inputY * 0.08 * parallaxScale, 2, delta)

    // drag slowly relaxes back so the composition is never lost
    if (!pointer.down) {
      pointer.dragX = damp(pointer.dragX, 0, 0.35, delta)
      pointer.dragY = damp(pointer.dragY, 0, 0.35, delta)
    }

    // build the final camera position: orbit around the target by yaw/pitch
    const offset = state.tmp.copy(state.pos).sub(state.target)
    if (state.yaw !== 0 || state.pitch !== 0) {
      const r = offset.length()
      const sph = new THREE.Spherical().setFromVector3(offset)
      sph.theta += state.yaw
      sph.phi = clamp(sph.phi - state.pitch, 0.35, Math.PI / 2 + 0.25)
      offset.setFromSpherical(sph).setLength(r)
    }
    camera.position.copy(state.target).add(offset)

    // parallax in camera space
    camera.lookAt(state.target)
    state.right.setFromMatrixColumn(camera.matrix, 0)
    state.up.setFromMatrixColumn(camera.matrix, 1)
    camera.position.addScaledVector(state.right, state.parallaxX).addScaledVector(state.up, state.parallaxY)
    // breathe: almost imperceptible drift so a still frame never feels frozen
    camera.position.y += Math.sin(t * 0.35) * 0.012
    camera.lookAt(state.target)
  })

  return null
}
