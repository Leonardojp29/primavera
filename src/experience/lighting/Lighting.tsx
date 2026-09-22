import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { flowerWorld } from '../flower/Flower'
import { anim } from '../state/anim'
import { palette, sceneUniforms } from './sceneUniforms'

/**
 * Drives the mood: from a dim, cool, intimate darkness to a warm golden glow.
 * Updates the shared shader uniforms, the scene background and the few real
 * lights used by standard materials.
 */
export function Lighting() {
  const scene = useThree((s) => s.scene)
  const keyRef = useRef<THREE.DirectionalLight>(null)
  const fillRef = useRef<THREE.HemisphereLight>(null)
  const background = useMemo(() => new THREE.Color(palette.bgDark), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    scene.background = null
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const warmth = anim.warmth
    const light = anim.light
    // the epilogue lets everything settle; the signature lifts it a touch
    const dimK = 1 - anim.dim * 0.4 + anim.glow * 0.08
    sceneUniforms.uTime.value = t
    sceneUniforms.uWarmth.value = warmth
    sceneUniforms.uHeadPos.value.copy(flowerWorld.head)

    // key light drifts very slowly so highlights feel alive
    sceneUniforms.uKeyDir.value
      .set(0.45 + Math.sin(t * 0.07) * 0.08, 0.78, 0.5 + Math.cos(t * 0.05) * 0.08)
      .normalize()
    sceneUniforms.uKeyColor.value.copy(palette.keyCool).lerp(palette.keyWarm, warmth)
    sceneUniforms.uKeyIntensity.value = (0.55 + light * 0.45 + warmth * 0.45) * dimK
    sceneUniforms.uFillColor.value.copy(palette.fillCool).lerp(palette.fillWarm, warmth)
    sceneUniforms.uAmbient.value
      .copy(palette.ambientCool)
      .lerp(palette.ambientWarm, warmth)
      .multiplyScalar((0.7 + 0.4 * light) * (1 - anim.dim * 0.3))

    tmpColor.copy(palette.bgDark).lerp(palette.bgWarm, warmth * 0.92).multiplyScalar(1 - anim.dim * 0.35)
    background.copy(tmpColor)
    // kept for the renderer clear colour; the visible sky is the Sky dome
    sceneUniforms.uFogColor.value.copy(tmpColor)
    sceneUniforms.uFogNear.value = 4.5 - warmth * 0.5
    sceneUniforms.uFogFar.value = 13 - warmth * 2

    const key = keyRef.current
    if (key) {
      key.position.copy(sceneUniforms.uKeyDir.value).multiplyScalar(6)
      key.color.copy(sceneUniforms.uKeyColor.value)
      key.intensity = sceneUniforms.uKeyIntensity.value * 1.4
    }
    const fill = fillRef.current
    if (fill) {
      fill.color.copy(sceneUniforms.uAmbient.value).multiplyScalar(2.2)
      fill.groundColor.copy(sceneUniforms.uFillColor.value)
      fill.intensity = (0.8 + warmth * 0.6) * (1 - anim.dim * 0.3)
    }
  })

  return (
    <>
      <directionalLight ref={keyRef} position={[2.5, 4.5, 3]} intensity={1} />
      <hemisphereLight ref={fillRef} intensity={0.8} />
    </>
  )
}
