import { create } from 'zustand'

export type Stage =
  | 'intro'
  | 'seed'
  | 'grow1'
  | 'grow2'
  | 'bud'
  | 'bloom'
  | 'bloomed'
  | 'final'
  /** The flower recedes and the envelope appears. */
  | 'epilogue'
  /** The letter is open; the experience rests here. */
  | 'letter'
  /** The letter was closed to look at the flower; it can be reopened. */
  | 'rest'

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
  /** The HTML letter is visible (3D sheet has handed over). */
  letterOpen: boolean
  /** The reader reached the signature. */
  letterEnded: boolean
  setStage: (stage: Stage) => void
  setBusy: (busy: boolean) => void
  setReady: (ready: boolean) => void
  setCaption: (caption: Caption | null) => void
  setHint: (hint: string | null) => void
  setAudioOn: (on: boolean) => void
  setLetterOpen: (open: boolean) => void
  setLetterEnded: (ended: boolean) => void
}

export const useExperience = create<ExperienceStore>((set) => ({
  stage: 'intro',
  busy: false,
  ready: false,
  caption: null,
  hint: null,
  audioOn: true,
  letterOpen: false,
  letterEnded: false,
  setStage: (stage) => set({ stage }),
  setBusy: (busy) => set({ busy }),
  setReady: (ready) => set({ ready }),
  setCaption: (caption) => set({ caption }),
  setHint: (hint) => set({ hint }),
  setAudioOn: (audioOn) => set({ audioOn }),
  setLetterOpen: (letterOpen) => set({ letterOpen }),
  setLetterEnded: (letterEnded) => set({ letterEnded }),
}))
