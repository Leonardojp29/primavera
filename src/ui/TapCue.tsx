import { useEffect, useRef } from 'react'
import { tapCue } from '../experience/interaction/tapCue'

/** A quiet ring of light that breathes around the next thing to touch. */
export function TapCue() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let shown = false
    const loop = () => {
      if (tapCue.visible) {
        el.style.transform = `translate3d(${tapCue.x.toFixed(1)}px, ${tapCue.y.toFixed(1)}px, 0) scale(${tapCue.scale.toFixed(3)})`
      }
      if (tapCue.visible !== shown) {
        shown = tapCue.visible
        el.classList.toggle('is-visible', shown)
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="tap-cue" ref={ref} aria-hidden>
      <span className="tap-cue__ring" />
      <span className="tap-cue__ring" />
      <span className="tap-cue__dot" />
    </div>
  )
}
