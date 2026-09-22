import gsap from 'gsap'
import { anim } from './anim'
import { useExperience, type Caption } from './store'

const store = useExperience

const caption = (
  lines: string[],
  style: Caption['style'] = 'italic',
  variant: Caption['variant'] = 'story',
) => store.getState().setCaption({ lines, style, variant })

const clearCaption = () => store.getState().setCaption(null)

let current: gsap.core.Timeline | null = null

function begin(stage: Parameters<ReturnType<typeof store.getState>['setStage']>[0]) {
  const s = store.getState()
  s.setStage(stage)
  s.setBusy(true)
  s.setHint(null)
  current?.kill()
  current = gsap.timeline({
    onComplete: () => {
      store.getState().setBusy(false)
      current = null
    },
  })
  return current
}

/* ------------------------------------------------------------------ */
/* Stage sequences                                                     */
/* ------------------------------------------------------------------ */

function runGrow1() {
  const tl = begin('grow1')
  tl.to(anim, { pulse: 0.35, duration: 0.4, ease: 'power2.out' }, 0)
  tl.to(anim, { stem: 0.4, duration: 2.2, ease: 'power2.inOut' }, 0.05)
  tl.to(anim, { light: 0.32, dust: 0.22, duration: 2.4, ease: 'sine.inOut' }, 0)
  tl.to(anim, { leaf1: 1, duration: 1.9, ease: 'power2.out' }, 1.1)
  tl.call(() => caption(['Porque una flor normal era demasiado fácil…']), [], 0.5)
  tl.call(clearCaption, [], 3.2)
  tl.to(anim, { pulse: 1, duration: 0.8, ease: 'sine.inOut' }, 2.6)
}

function runGrow2() {
  const tl = begin('grow2')
  tl.to(anim, { pulse: 0.35, duration: 0.4, ease: 'power2.out' }, 0)
  tl.to(anim, { stem: 0.72, duration: 2.1, ease: 'power2.inOut' }, 0.05)
  tl.to(anim, { light: 0.52, dust: 0.32, duration: 2.2, ease: 'sine.inOut' }, 0)
  tl.to(anim, { leaf2: 1, duration: 1.9, ease: 'power2.out' }, 0.9)
  tl.call(() => caption(['así que mejor hice la mía.']), [], 0.5)
  tl.call(clearCaption, [], 3.0)
  tl.to(anim, { pulse: 1, duration: 0.8, ease: 'sine.inOut' }, 2.4)
}

function runBud() {
  const tl = begin('bud')
  tl.to(anim, { pulse: 0.3, duration: 0.4, ease: 'power2.out' }, 0)
  tl.to(anim, { stem: 1, duration: 2.2, ease: 'power2.inOut' }, 0.05)
  tl.to(anim, { bud: 1, duration: 2.2, ease: 'power2.out' }, 0.8)
  tl.to(anim, { light: 0.72, dust: 0.42, warmth: 0.3, duration: 2.6, ease: 'sine.inOut' }, 0)
  tl.to(anim, { pulse: 1, duration: 0.8, ease: 'sine.inOut' }, 2.6)
}

function runBloom() {
  const tl = begin('bloom')
  tl.to(anim, { pulse: 0, duration: 0.7, ease: 'power2.out' }, 0)
  tl.to(anim, { sepal: 1, duration: 2.0, ease: 'power2.inOut' }, 0.1)
  tl.to(anim, { open: 1, duration: 4.4, ease: 'power1.inOut' }, 0.7)
  tl.to(anim, { warmth: 1, light: 1, duration: 4.8, ease: 'sine.inOut' }, 0.5)
  tl.to(anim, { bloomFx: 1, duration: 3.5, ease: 'sine.inOut' }, 0.8)
  tl.to(anim, { bloomFx: 0.7, duration: 2.5, ease: 'sine.inOut' }, 4.4)
  tl.to(anim, { dust: 0.7, duration: 4, ease: 'sine.inOut' }, 1.2)
  tl.to(anim, { pollen: 1, duration: 3, ease: 'sine.inOut' }, 2.2)
  tl.to(anim, { drift: 1, duration: 2.5, ease: 'sine.inOut' }, 2.8)
  tl.to(anim, { orbit: 1, duration: 6.2, ease: 'sine.inOut' }, 0)
  tl.call(() => caption(['Para ti, en esta primavera. 🌻'], 'bold'), [], 4.6)
  tl.call(clearCaption, [], 8.4)
  tl.call(
    () => {
      const s = store.getState()
      s.setStage('bloomed')
      s.setBusy(false)
    },
    [],
    6.2,
  )
  tl.call(() => store.getState().setHint('Acércate.'), [], 9.2)
  // Keep the timeline alive so that `busy` stays consistent until the hint appears.
  tl.to({}, { duration: 0.1 }, 9.3)
}

function runFinal() {
  const tl = begin('final')
  tl.to(anim, { closeup: 1, duration: 3.0, ease: 'power2.inOut' }, 0)
  tl.to(anim, { hover: 0.4, dust: 0.5, pollen: 0.7, duration: 2.6, ease: 'sine.inOut' }, 0)
  tl.call(
    () => caption(['Solo quería tener un detalle contigo y recordarte lo mucho que te quiero para toda mi vida.'], 'bold', 'final'),
    [],
    1.6,
  )
  tl.call(clearCaption, [], 7.4)
  tl.call(() => caption(['Te amo, Brissa. ❤️'], 'bold', 'final'), [], 8.4)
  tl.to({}, { duration: 0.1 }, 8.5)
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Advance the story from a tap on the scene. Ignored while busy. */
export function advance() {
  const { stage, busy } = store.getState()
  if (busy) return
  switch (stage) {
    case 'seed':
      runGrow1()
      break
    case 'grow1':
      runGrow2()
      break
    case 'grow2':
      runBud()
      break
    case 'bud':
      runBloom()
      break
    case 'bloomed':
      runFinal()
      break
    default:
      break
  }
}

/** Soft feedback when the user taps somewhere that is not the flower. */
export function nudge() {
  const { busy, stage } = store.getState()
  if (busy || stage === 'final' || stage === 'intro') return
  gsap.killTweensOf(anim, 'nudge')
  gsap.fromTo(anim, { nudge: 1 }, { nudge: 0, duration: 1.6, ease: 'power2.out' })
}

/** Called once the canvas is alive: reveal the seed. */
export function start() {
  const s = store.getState()
  if (s.stage !== 'intro') return
  s.setReady(true)
  s.setStage('seed')
}
