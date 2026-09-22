import { useEffect, useRef, useState } from 'react'
import { pointer } from '../experience/camera/usePointer'
import { closeLetter, letterEnd } from '../experience/state/director'
import { useExperience } from '../experience/state/store'

/** Seconds before the title appears, then the stagger between paragraphs. */
const FIRST_DELAY = 0.5
const BODY_DELAY = 1.4
const STAGGER = 0.9
const REVEAL_DURATION = 1.5

const paragraphs: React.ReactNode[] = [
  'Bueno... no soy muy bueno escribiendo estas cosas y probablemente en persona me daría un poco de vergüenza decir todo esto así de corrido, pero quería aprovechar este pequeño detalle para decirte algunas cosas.',
  'Han pasado un montón de años desde que empezamos todo esto... y es medio loco pensar en todo lo que hemos vivido juntos. Hemos crecido, cambiado, pasado momentos demasiado bonitos y también otros no tan bonitos... pero al final, de una u otra manera, seguimos acá.',
  'Y creo que a veces, con el tiempo, uno se acostumbra tanto a tener a una persona a su lado que se olvida de decirle ciertas cosas... así que quería recordártelo.',
  <strong>Te amo muchísimo, Brissa... ❤️</strong>,
  'Y quizás no siempre soy el mejor demostrándolo o diciéndotelo, pero de verdad te amo demasiado. Eres una persona demasiado importante para mí y después de tantos años ya eres parte de mi vida de una forma que sinceramente no podría explicar tan fácil.',
  'Amo poder contarte todo lo que me pasa, molestarte, hacerte renegar jaja, reírme contigo... hasta esos momentos en los que simplemente estamos juntos sin hacer absolutamente nada.',
  'Obviamente no todo siempre es perfecto... hemos tenido nuestros momentos buenos, nuestros momentos malos y un montón de cosas en medio. Pero incluso con todo eso, si miro todos estos años contigo, me quedo con todo lo bonito que hemos construido juntos. ❤️',
  'Y todavía nos falta demasiado... lugares por conocer, cosas por hacer, momentos que todavía ni siquiera sabemos que vamos a vivir.',
  'No sé exactamente cómo será todo más adelante... nadie lo sabe. Pero sí sé que cuando pienso en mi futuro, me hace feliz imaginarte ahí conmigo.',
  'Así que nada...',
  <>
    Solo quería hacerte algo diferente para recordarte cuánto te amo... porque probablemente no te lo digo de esta
    manera todos los días, pero de verdad <strong>te amo muchísimo y eres demasiado importante para mí. ❤️</strong>
  </>,
  'Y aunque a veces sea medio medio para demostrar algunas cosas... espero que detalles como este que sinceramente tampoco son la gran cosa, puedan recordártelo aunque sea un poquito.',
  <strong>Te amo, mi amor... muchísimo. ❤️</strong>,
]

const SIGNATURE_INDEX = paragraphs.length
const SIGNATURE_READY = (BODY_DELAY + SIGNATURE_INDEX * STAGGER + REVEAL_DURATION) * 1000

/**
 * The letter itself. It is the calm ending of the experience: a warm sheet of
 * paper whose paragraphs arrive one after another, readable at one's own pace.
 */
export function Letter() {
  const open = useExperience((s) => s.letterOpen)
  const ended = useExperience((s) => s.letterEnded)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [moreBelow, setMoreBelow] = useState(false)
  /** After the first full reveal (or a close) the text simply is there. */
  const [settled, setSettled] = useState(false)
  const paperRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const signRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      if (mounted) {
        setVisible(false)
        setSettled(true)
      }
      return
    }
    setMounted(true)
    const id = window.setTimeout(() => setVisible(true), 60)
    const settleId = window.setTimeout(() => setSettled(true), SIGNATURE_READY + 1500)
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(settleId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Reaching the signature (once it has been revealed) closes the story softly.
  useEffect(() => {
    if (!visible || ended) return
    const paper = paperRef.current
    const sign = signRef.current
    if (!paper || !sign) return
    let armed = false
    let inView = false
    const tryEnd = () => {
      if (armed && inView) letterEnd()
    }
    const armId = window.setTimeout(() => {
      armed = true
      tryEnd()
    }, SIGNATURE_READY)
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting)
        tryEnd()
      },
      { root: paper, threshold: 0.85 },
    )
    observer.observe(sign)
    return () => {
      window.clearTimeout(armId)
      observer.disconnect()
    }
  }, [visible, ended])

  // Invite to keep reading when the paper holds more than it shows.
  useEffect(() => {
    if (!visible) return
    const paper = paperRef.current
    if (!paper) return
    const update = () => {
      const overflow = paper.scrollHeight - paper.clientHeight
      setMoreBelow(overflow > 24 && paper.scrollTop < 30)
    }
    const showId = window.setTimeout(update, (BODY_DELAY + STAGGER * 2) * 1000)
    paper.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.clearTimeout(showId)
      paper.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [visible])

  // Desktop only: the sheet leans a couple of degrees toward the cursor.
  useEffect(() => {
    if (!visible || !pointer.hasMouse) return
    const el = tiltRef.current
    if (!el) return
    let rx = 0
    let ry = 0
    let raf = 0
    const loop = () => {
      rx += (-pointer.y * 1.6 - rx) * 0.06
      ry += (pointer.x * 2.2 - ry) * 0.06
      el.style.transform = `perspective(1400px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [visible])

  if (!mounted) return null

  const delay = (i: number) => ({ animationDelay: `${(BODY_DELAY + i * STAGGER).toFixed(2)}s` })

  return (
    <div className={`letter${visible ? ' is-visible' : ''}${settled ? ' is-settled' : ''}`} aria-live="polite">
      <div className="letter__backdrop" onClick={closeLetter} />
      <div className="letter__enter">
        <button type="button" className="letter__close" onClick={closeLetter} aria-label="Guardar la carta y ver la flor">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="letter__tilt" ref={tiltRef}>
          <div className="letter__paper" ref={paperRef}>
            <h2 className="letter__title reveal" style={{ animationDelay: `${FIRST_DELAY}s` }}>
              Para ti, mi amor ❤️
            </h2>
            <div className="letter__rule reveal" style={{ animationDelay: `${FIRST_DELAY + 0.4}s` }} />
            {paragraphs.map((content, i) => (
              <p key={i} className="reveal" style={delay(i)}>
                {content}
              </p>
            ))}
            <div className={`letter__sign-wrap${ended ? ' is-ended' : ''}`} ref={signRef}>
              <p className="letter__sign reveal" style={delay(SIGNATURE_INDEX)}>
                <strong>Leo ❤️</strong>
              </p>
              <span className="letter__spark" aria-hidden />
            </div>
          </div>
          <div className={`letter__more${moreBelow ? ' is-visible' : ''}`} aria-hidden>
            <span>sigue leyendo…</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
