import { create } from 'zustand'

export type Stage = 'intro' | 'seed' | 'grow1' | 'grow2' | 'bud' | 'bloom' | 'bloomed' | 'final'

export type CaptionVariant = 'story' | 'final'

export type CaptionStyle = 'italic' | 'bold'

export interface Caption {
  lines: string[]
  variant: CaptionVariant
  /** italic = whispered narration, bold = the dedication itself. */
  style: CaptionStyle
}

interface ExperienceStore {
  stage: Stage
  /** True while a transition timeline is running. Taps are ignored. */
  busy: boolean
  /** Canvas has rendered its first frame. */
  ready: boolean
  caption: Caption | null
  hint: string | null
  audioOn: boolean
  setStage: (stage: Stage) => void
  setBusy: (busy: boolean) => void
  setReady: (ready: boolean) => void
  setCaption: (caption: Caption | null) => void
  setHint: (hint: string | null) => void
  setAudioOn: (on: boolean) => void
}

export const useExperience = create<ExperienceStore>((set) => ({
  stage: 'intro',
  busy: false,
  ready: false,
  caption: null,
  hint: null,
  audioOn: false,
  setStage: (stage) => set({ stage }),
  setBusy: (busy) => set({ busy }),
  setReady: (ready) => set({ ready }),
  setCaption: (caption) => set({ caption }),
  setHint: (hint) => set({ hint }),
  setAudioOn: (audioOn) => set({ audioOn }),
}))
