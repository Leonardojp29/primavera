import { useEffect } from 'react'
import { anim } from '../experience/state/anim'
import { useExperience } from '../experience/state/store'
import { ambientAudio } from './AmbientAudio'

/** Keeps the ambient sound in sync with the store and the scene's warmth. */
export function useAmbientAudio() {
  const audioOn = useExperience((s) => s.audioOn)

  useEffect(() => {
    if (audioOn) void ambientAudio.start()
    else ambientAudio.stop()
  }, [audioOn])

  useEffect(() => {
    if (!audioOn) return
    const id = window.setInterval(() => ambientAudio.setWarmth(anim.warmth), 500)
    return () => window.clearInterval(id)
  }, [audioOn])

  // pause when the tab is hidden, resume when it comes back
  useEffect(() => {
    const onVisibility = () => {
      if (!useExperience.getState().audioOn) return
      if (document.hidden) ambientAudio.stop()
      else void ambientAudio.start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
}
