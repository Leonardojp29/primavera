import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { BlendFunction, ToneMappingMode, type BloomEffect, type DepthOfFieldEffect } from 'postprocessing'
import { useEffect, useRef, useState } from 'react'
import { quality } from '../../utils/quality'
import { letterWorld } from '../letter/letterWorld'
import { anim } from '../state/anim'
import { useExperience } from '../state/store'

/**
 * Very restrained postprocessing: a bloom that only catches the brightest
 * highlights and particles, a soft vignette and filmic tone mapping. During
 * the epilogue a depth of field keeps the envelope crisp and lets the flower
 * dissolve into the background.
 */
export function PostFX() {
  const bloomRef = useRef<BloomEffect>(null)
  const dofRef = useRef<DepthOfFieldEffect>(null)
  const stage = useExperience((s) => s.stage)
  const [dofSettled, setDofSettled] = useState(false)
  const settledRef = useRef(false)
  const useDof =
    quality.tier !== 'low' && (stage === 'epilogue' || stage === 'letter' || (stage === 'rest' && !dofSettled))

  useEffect(() => {
    const dof = dofRef.current
    if (!dof) return
    dof.target = letterWorld.focus
    return () => {
      dof.target = null
    }
  }, [useDof])

  useFrame(() => {
    const b = bloomRef.current
    if (b) b.intensity = 0.12 + anim.bloomFx * 0.95 + anim.warmth * 0.15
    const d = dofRef.current
    if (d) d.bokehScale = anim.dof * 2.6
    // once the blur has fully faded in the resting view, drop the effect
    const settled = stage === 'rest' && anim.dof < 0.01
    if (settled !== settledRef.current) {
      settledRef.current = settled
      setDofSettled(settled)
    }
  })

  return (
    <EffectComposer multisampling={quality.multisampling} enableNormalPass={false}>
      {useDof ? (
        <DepthOfField ref={dofRef} focusRange={0.35} bokehScale={0} resolutionScale={quality.tier === 'high' ? 0.6 : 0.5} />
      ) : (
        <></>
      )}
      <Bloom
        ref={bloomRef}
        mipmapBlur
        intensity={0.3}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.35}
        radius={0.75}
        levels={quality.tier === 'low' ? 5 : 7}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.72} blendFunction={BlendFunction.NORMAL} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  )
}
