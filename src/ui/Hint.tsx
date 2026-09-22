import { useExperience } from '../experience/state/store'

/** Discreet invitation shown by the director (e.g. "Acércate."). */
export function Hint() {
  const hint = useExperience((s) => s.hint)
  return (
    <div className={`hint${hint ? ' is-visible' : ''}`} style={{ opacity: hint ? undefined : 0 }}>
      {hint ?? ''}
    </div>
  )
}
