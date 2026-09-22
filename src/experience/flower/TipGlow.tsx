import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { anim } from '../state/anim'
import { stemPoint } from './flowerRig'

function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255, 236, 170, 1)')
  grad.addColorStop(0.18, 'rgba(255, 210, 90, 0.7)')
  grad.addColorStop(0.5, 'rgba(240, 180, 60, 0.18)')
  grad.addColorStop(1, 'rgba(240, 180, 60, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * A soft golden light that lives at the growing tip. It is the seed's spark at
 * the start, the invitation to touch while the story waits, and it dissolves
 * into the bloom.
 */
export function TipGlow() {
  const ref = useRef<THREE.Sprite>(null)
  const texture = useMemo(makeGlowTexture, [])
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        color: '#ffd166',
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    [texture],
  )
  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const s = ref.current
    if (!s) return
    stemPoint(anim.stem, point)
    const headLift = anim.bud * 0.12
    s.position.set(point.x, point.y + 0.03 + headLift, point.z + anim.bud * 0.05)
    const t = clock.elapsedTime
    const breathe = 0.55 + 0.45 * Math.sin(t * 1.5)
    const base = anim.pulse * (0.28 + 0.3 * breathe) + anim.nudge * 0.45
    const fadeWithBloom = 1 - anim.open
    material.opacity = base * fadeWithBloom
    const size = (0.28 + 0.1 * breathe + anim.nudge * 0.15) * (1 + anim.bud * 0.8)
    s.scale.set(size, size, 1)
  })

  return <sprite ref={ref} material={material} frustumCulled={false} renderOrder={10} />
}
