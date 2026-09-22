import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pointer } from '../camera/usePointer'
import { flowerWorld } from '../flower/Flower'
import { head, stemPoint } from '../flower/flowerRig'
import { advance } from '../state/director'
import { anim } from '../state/anim'
import { useExperience } from '../state/store'
import { interaction } from './interactionState'

/**
 * Invisible, generous hit volume that follows the living part of the plant:
 * the seed, then the growing tip, then the open flower. Tapping it moves the
 * story forward. The scene is the interface.
 */
export function InteractionTarget() {
  const ref = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    [],
  )
  const point = useMemo(() => new THREE.Vector3(), [])
  const busy = useExperience((s) => s.busy)
  const stage = useExperience((s) => s.stage)

  useEffect(() => {
    if (busy || stage === 'final') {
      document.body.style.cursor = 'default'
      interaction.hovering = false
    }
  }, [busy, stage])

  useFrame(() => {
    const m = ref.current
    if (!m) return
    if (anim.bud > 0.3) {
      m.position.copy(flowerWorld.head)
      const r = (0.25 + head.openRadius * anim.open) * flowerWorld.headScale + 0.25
      m.scale.setScalar(r)
    } else {
      stemPoint(anim.stem, point)
      m.position.set(point.x, point.y + 0.1, point.z)
      m.scale.setScalar(anim.stem < 0.05 ? 0.55 : 0.6)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // a drag that ended over the flower is not a tap
    if (pointer.moved) return
    advance()
  }

  const onOver = () => {
    const s = useExperience.getState()
    if (s.busy || s.stage === 'final') return
    interaction.hovering = true
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    interaction.hovering = false
    document.body.style.cursor = 'default'
  }

  if (stage === 'epilogue' || stage === 'letter') return null

  return (
    <mesh ref={ref} material={material} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      <sphereGeometry args={[1, 12, 8]} />
    </mesh>
  )
}
