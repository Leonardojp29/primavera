import { useEffect, useState } from 'react'
import { useExperience, type Caption } from '../experience/state/store'

/**
 * Story phrases fade in and out on top of the scene. The rendered caption is
 * held for the fade-out so the text never snaps.
 */
export function Captions() {
  const caption = useExperience((s) => s.caption)
  const [rendered, setRendered] = useState<Caption | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (caption) {
      // swap text after the previous one has faded
      if (rendered && visible) {
        setVisible(false)
        const id = window.setTimeout(() => {
          setRendered(caption)
          setVisible(true)
        }, 700)
        return () => window.clearTimeout(id)
      }
      setRendered(caption)
      const id = window.setTimeout(() => setVisible(true), 30)
      return () => window.clearTimeout(id)
    }
    setVisible(false)
    const id = window.setTimeout(() => setRendered(null), 1300)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caption])

  if (!rendered) return null
  const cls = [
    'caption',
    rendered.variant === 'final' ? 'caption--final' : '',
    rendered.style === 'bold' ? 'caption--bold' : '',
    visible ? 'is-visible' : '',
  ].join(' ')
  return (
    <div className={cls} style={{ opacity: visible ? 1 : 0 }} aria-live="polite">
      {rendered.lines.map((line, i) => (
        <div key={`${line}-${i}`} className="caption__line">
          {line}
        </div>
      ))}
    </div>
  )
}
