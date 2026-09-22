import { useEffect, useState } from 'react'
import { useExperience } from '../experience/state/store'

const MIN_DURATION = 2600

/**
 * The loading moment is part of the story: a single golden spark slowly forms
 * in the dark and then becomes the seed on the stage.
 */
export function Intro() {
  const ready = useExperience((s) => s.ready)
  const [minElapsed, setMinElapsed] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setMinElapsed(true), MIN_DURATION)
    return () => window.clearTimeout(id)
  }, [])

  const hidden = ready && minElapsed

  useEffect(() => {
    if (!hidden) return
    const id = window.setTimeout(() => setGone(true), 2400)
    return () => window.clearTimeout(id)
  }, [hidden])

  if (gone) return null
  return (
    <div className={`intro${hidden ? ' is-hidden' : ''}`} aria-hidden>
      <div className="intro__spark" />
    </div>
  )
}
