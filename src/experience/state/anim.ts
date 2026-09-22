/**
 * Continuous values driven by GSAP and read every frame inside useFrame.
 * Kept outside React state on purpose: they change 60 times per second.
 */
export const anim = {
  /** Stem growth 0..1 along the rig curve. */
  stem: 0,
  /** Leaf unfolding 0..1. */
  leaf1: 0,
  leaf2: 0,
  /** Flower head scale (bud forming) 0..1. */
  bud: 0,
  /** Sepal opening 0..1. */
  sepal: 0,
  /** Petal opening 0..1. */
  open: 0,
  /** Early light increase during growth. */
  light: 0,
  /** Golden warmth of the whole scene 0..1. */
  warmth: 0,
  /** Ambient dust intensity. */
  dust: 0.06,
  /** Pollen around the head. */
  pollen: 0,
  /** Bloom postprocess intensity multiplier. */
  bloomFx: 0.12,
  /** Floating petals emission. */
  drift: 0,
  /** Camera orbit progress during bloom. */
  orbit: 0,
  /** Final close-up progress. */
  closeup: 0,
  /** Flower reacts to pointer proximity. */
  hover: 0,
  /** Tip glow pulse (idle invitation). */
  pulse: 1,
  /** Extra pulse when the user taps outside the flower. */
  nudge: 0,
}

export type AnimValues = typeof anim
