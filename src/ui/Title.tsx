import { useEffect, useState } from 'react'
import { useExperience } from '../experience/state/store'

export function Title() {
  const stage = useExperience((s) => s.stage)
  const ready = useExperience((s) => s.ready)
  const [shown, setShown] = useState(false)

  const visible = ready && stage === 'seed'

  useEffect(() => {
    if (!visible) {
      setShown(false)
      return
    }
    const a = window.setTimeout(() => setShown(true), 3000)
    return () => window.clearTimeout(a)
  }, [visible])

  return (
    <div className={`title fade${shown ? ' is-visible' : ''}`}>
      <div className="title__name">Para Brissa 🌻</div>
      <div className="title__date">Un pequeño detalle para ti.</div>
    </div>
  )
}
