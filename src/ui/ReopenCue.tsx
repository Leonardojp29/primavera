import { reopenLetter } from '../experience/state/director'
import { useExperience } from '../experience/state/store'

/** While looking at the flower after the letter, a quiet way back to it. */
export function ReopenCue() {
  const stage = useExperience((s) => s.stage)
  const busy = useExperience((s) => s.busy)
  const visible = stage === 'rest' && !busy
  return (
    <button type="button" className={`reopen${visible ? ' is-visible' : ''}`} onClick={reopenLetter} aria-hidden={!visible}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M3 7.5v9A1.5 1.5 0 0 0 4.5 18h15a1.5 1.5 0 0 0 1.5-1.5v-9" />
        <path d="M3 7.5 12 13l9-5.5" />
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5" />
      </svg>
      <span>Volver a la carta</span>
    </button>
  )
}
