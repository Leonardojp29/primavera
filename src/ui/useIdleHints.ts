import { useEffect } from 'react'
import { useExperience, type Stage } from '../experience/state/store'

/**
 * Gentle invitations that appear only when the story is waiting for a touch.
 * They arrive after a short pause so they never compete with an animation.
 */
const HINTS: Partial<Record<Stage, { text: string; delay: number }>> = {
  seed: { text: 'Tócala para empezar.', delay: 5000 },
  grow1: { text: 'Tócala otra vez… sigue creciendo.', delay: 2000 },
  grow2: { text: 'Una vez más… ya casi.', delay: 2000 },
  bud: { text: 'Tócala… está por florecer.', delay: 2200 },
  bloomed: { text: 'Acércate… toca el centro de la flor.', delay: 2600 },
  epilogue: { text: 'Ábrelo… es para ti.', delay: 3200 },
}

export function useIdleHints() {
  const stage = useExperience((s) => s.stage)
  const busy = useExperience((s) => s.busy)
  const ready = useExperience((s) => s.ready)
  const setHint = useExperience((s) => s.setHint)

  useEffect(() => {
    const hint = HINTS[stage]
    if (!ready || busy || !hint) {
      setHint(null)
      return
    }
    const id = window.setTimeout(() => setHint(hint.text), hint.delay)
    return () => window.clearTimeout(id)
  }, [stage, busy, ready, setHint])
}
