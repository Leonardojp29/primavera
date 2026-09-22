import { useExperience } from '../experience/state/store'

export function AudioToggle() {
  const audioOn = useExperience((s) => s.audioOn)
  const setAudioOn = useExperience((s) => s.setAudioOn)
  const ready = useExperience((s) => s.ready)

  return (
    <button
      type="button"
      className={`audio-toggle${ready ? ' is-visible' : ''}${audioOn ? ' is-on' : ''}`}
      onClick={() => setAudioOn(!audioOn)}
      aria-label={audioOn ? 'Silenciar' : 'Activar sonido'}
      aria-pressed={audioOn}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect className="audio-toggle__bar" x="3" y="10" width="2.5" height="8" rx="1.25" />
        <rect className="audio-toggle__bar" x="8.5" y="6" width="2.5" height="12" rx="1.25" />
        <rect className="audio-toggle__bar" x="14" y="8" width="2.5" height="10" rx="1.25" />
        <rect className="audio-toggle__bar" x="19.5" y="11" width="2.5" height="7" rx="1.25" />
      </svg>
    </button>
  )
}
