import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { damp } from '../../utils/math'
import { interaction } from '../interaction/interactionState'
import { pointer } from '../camera/usePointer'
import { anim } from '../state/anim'
import { Disc } from './Disc'
import { stemPoint, stemQuaternion } from './flowerRig'
import { Leaves } from './Leaves'
import { Petals } from './Petals'
import { Seed } from './Seed'
import { Stem } from './Stem'
import { TipGlow } from './TipGlow'

/** World-space head position, updated every frame for camera/particles. */
export const flowerWorld = {
  head: new THREE.Vector3(0, 2.6, 0.38),
  headScale: 0,
}

export function Flower() {
  const headRef = useRef<THREE.Group>(null)
  const hoverRef = useRef(0)
  const tmpQ = useMemo(() => new THREE.Quaternion(), [])
  const tiltQ = useMemo(() => new THREE.Quaternion(), [])
  const tiltEuler = useMemo(() => new THREE.Euler(), [])
  const lookX = useRef(0)
  const lookZ = useRef(0)

  useFrame(({ clock }, dt) => {
    const head = headRef.current
    if (!head) return
    const t = clock.elapsedTime
    const delta = Math.min(dt, 0.05)

    // hover: pointer over the flower or the final intimate state
    const hoverTarget = Math.max(anim.hover, interaction.hovering ? 1 : 0)
    hoverRef.current = damp(hoverRef.current, hoverTarget, 3, delta)

    // head follows the stem tip
    stemPoint(anim.stem, head.position)
    stemQuaternion(anim.stem, tmpQ)

    // the flower gently turns toward the pointer once it is open
    const follow = anim.open * 0.09
    const px = pointer.hasMouse ? pointer.x : pointer.dragX
    const py = pointer.hasMouse ? pointer.y : pointer.dragY
    lookX.current = damp(lookX.current, -py * follow, 2.5, delta)
    lookZ.current = damp(lookZ.current, -px * follow, 2.5, delta)
    // breathing of a living flower
    const breatheX = Math.sin(t * 0.6) * 0.012 * anim.open
    const breatheZ = Math.cos(t * 0.47) * 0.012 * anim.open
    tiltEuler.set(lookX.current + breatheX, 0, lookZ.current + breatheZ)
    tiltQ.setFromEuler(tiltEuler)
    head.quaternion.copy(tmpQ).multiply(tiltQ)

    const scale = Math.max(0.0001, anim.bud) * (1 + Math.sin(t * 0.8) * 0.004 * anim.open)
    head.scale.setScalar(scale)
    head.visible = anim.bud > 0.002

    head.getWorldPosition(flowerWorld.head)
    flowerWorld.headScale = scale
  })

  return (
    <group>
      <Seed />
      <Stem />
      <Leaves />
      <group ref={headRef}>
        <Disc />
        <Petals hoverRef={hoverRef} />
      </group>
      <TipGlow />
    </group>
  )
}
