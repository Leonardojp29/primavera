import { lazy, Suspense, useMemo } from 'react'
import { useAmbientAudio } from './audio/useAmbientAudio'
import { AudioToggle } from './ui/AudioToggle'
import { Captions } from './ui/Captions'
import { Fallback } from './ui/Fallback'
import { Hint } from './ui/Hint'
import { Intro } from './ui/Intro'
import { Letter } from './ui/Letter'
import { ReopenCue } from './ui/ReopenCue'
import { TapCue } from './ui/TapCue'
import { useIdleHints } from './ui/useIdleHints'
import { Title } from './ui/Title'
import { useExperience } from './experience/state/store'
import { isWebGLAvailable } from './utils/webgl'

const Experience = lazy(() => import('./experience/Experience'))

export default function App() {
  const webgl = useMemo(isWebGLAvailable, [])
  useAmbientAudio()
  useIdleHints()
  const stage = useExperience((s) => s.stage)

  if (!webgl) return <Fallback />

  return (
    <div className="app">
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
      <div className={`overlay${stage === 'final' ? ' overlay--final' : ''}`}>
        <Title />
        <Captions />
        <Hint />
      </div>
      <TapCue />
      <ReopenCue />
      <Letter />
      <AudioToggle />
      <Intro />
    </div>
  )
}
