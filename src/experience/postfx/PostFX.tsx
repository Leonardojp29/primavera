import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { BlendFunction, ToneMappingMode, type BloomEffect } from 'postprocessing'
import { useRef } from 'react'
import { quality } from '../../utils/quality'
import { anim } from '../state/anim'

/**
 * Very restrained postprocessing: a bloom that only catches the brightest
 * highlights and particles, a soft vignette and filmic tone mapping.
 */
export function PostFX() {
  const bloomRef = useRef<BloomEffect>(null)

  useFrame(() => {
    const b = bloomRef.current
    if (!b) return
    b.intensity = 0.12 + anim.bloomFx * 0.95 + anim.warmth * 0.15
  })

  return (
    <EffectComposer multisampling={quality.multisampling} enableNormalPass={false}>
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
