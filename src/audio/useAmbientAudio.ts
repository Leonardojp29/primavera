import { useEffect } from 'react'
import { anim } from '../experience/state/anim'
import { useExperience } from '../experience/state/store'
import { ambientAudio } from './AmbientAudio'

/**
 * Keeps the music in sync with the store and the scene. Sound is on by
 * default, but browsers only allow playback after a user gesture, so the
 * first tap on the scene is what actually starts it.
 */
export function useAmbientAudio() {
  const audioOn = useExperience((s) => s.audioOn)
  const stage = useExperience((s) => s.stage)

  useEffect(() => {
    if (!audioOn) {
      ambientAudio.stop()
      return
    }
    void ambientAudio.start()
    const onGesture = () => {
      if (ambientAudio.isRunning) {
        remove()
        return
      }
      void ambientAudio.start()
    }
    const remove = () => {
      window.removeEventListener('pointerup', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerup', onGesture)
    window.addEventListener('keydown', onGesture)
    return remove
  }, [audioOn])

  useEffect(() => {
    if (!audioOn) return
    const id = window.setInterval(() => ambientAudio.setWarmth(anim.warmth), 500)
    return () => window.clearInterval(id)
  }, [audioOn])

  // a little quieter while the letter is being read
  useEffect(() => {
    ambientAudio.setDucking(stage === 'letter' ? 0.6 : 1)
  }, [stage])

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
