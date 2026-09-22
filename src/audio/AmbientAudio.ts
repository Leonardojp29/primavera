/**
 * Ambient music playback: a single looping track (`/audio/ambient.mp3`),
 * routed through the Web Audio API so it can fade in/out smoothly and open
 * up gently as the scene warms toward the bloom. Lazily created on the first
 * user gesture so autoplay policies are respected; nothing plays until the
 * visitor taps the sound button.
 */
const TRACK_URL = `${import.meta.env.BASE_URL}audio/ambient.mp3`

export class AmbientAudio {
  private ctx: AudioContext | null = null
  private element: HTMLAudioElement | null = null
  private master: GainNode | null = null
  private tone: BiquadFilterNode | null = null
  private running = false

  get isRunning() {
    return this.running
  }

  async start() {
    if (this.running) return
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    if (!this.ctx) {
      this.ctx = new Ctx()
      this.build(this.ctx)
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    try {
      await this.element!.play()
    } catch {
      // Autoplay was blocked; the visitor will need to tap the toggle again.
      return
    }
    const now = this.ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setValueAtTime(this.master!.gain.value, now)
    this.master!.gain.linearRampToValueAtTime(0.55, now + 3.5)
    this.running = true
  }

  stop() {
    if (!this.ctx || !this.master || !this.running) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + 1.8)
    this.running = false
    window.setTimeout(() => {
      if (!this.running) this.element?.pause()
    }, 2000)
  }

  /** 0 = dark start, 1 = golden bloom. Gently opens the tone as the flower blooms. */
  setWarmth(w: number) {
    if (!this.ctx || !this.tone) return
    const now = this.ctx.currentTime
    this.tone.frequency.setTargetAtTime(1400 + w * 6000, now, 1.5)
  }

  private build(ctx: AudioContext) {
    const element = new Audio(TRACK_URL)
    element.loop = true
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'
    this.element = element

    const source = ctx.createMediaElementSource(element)

    // a soft low-pass that opens up with warmth, so the track feels a little
    // more "muffled" and intimate at the start and airier at the bloom
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 1400
    tone.Q.value = 0.4
    this.tone = tone

    const master = ctx.createGain()
    master.gain.value = 0
    this.master = master

    source.connect(tone).connect(master).connect(ctx.destination)
  }
}

export const ambientAudio = new AmbientAudio()
