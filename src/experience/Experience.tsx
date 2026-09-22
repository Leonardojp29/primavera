import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { quality } from '../utils/quality'
import { usePointerListeners } from './camera/usePointer'
import { Scene } from './Scene'
import { nudge, start } from './state/director'

/** Reveals the experience once the renderer has produced a couple of frames. */
function Ready() {
  const frames = useRef(0)
  useFrame(() => {
    if (frames.current > 2) return
    frames.current += 1
    if (frames.current === 3) start()
  })
  return null
}

export default function Experience() {
  usePointerListeners()
  const [dpr, setDpr] = useState(() => Math.min(quality.maxDpr, window.devicePixelRatio || 1))

  return (
    <Canvas
      dpr={dpr}
      frameloop="always"
      camera={{ fov: 45, near: 0.05, far: 40, position: [0, 0.95, 5.6] }}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onPointerMissed={() => nudge()}
      style={{ touchAction: 'none' }}
    >
      <PerformanceMonitor
        ms={250}
        iterations={6}
        bounds={() => [40, 58]}
        onDecline={() => setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))}
        onIncline={() => setDpr((d) => Math.min(Math.min(quality.maxDpr, window.devicePixelRatio || 1), +(d + 0.25).toFixed(2)))}
      />
      <Scene />
      <Ready />
    </Canvas>
  )
}

// Dev-only hook so the experience can be driven from automated screenshots.
if (import.meta.env.DEV) {
  void import('./state/director').then((d) =>
    import('./state/anim').then((a) =>
      import('./state/store').then((s) => {
        ;(window as unknown as { __brissa: unknown }).__brissa = {
          advance: d.advance,
          anim: a.anim,
          store: s.useExperience,
        }
      }),
    ),
  )
}
