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

  /* ---- epilogue: the letter ---- */
  /** Scene dims and loses protagonism 0..1. */
  dim: 0,
  /** Depth of field strength 0..1.4. */
  dof: 0,
  /** Envelope presence (fade in, later fade out) 0..1. */
  envelope: 0,
  /** Pollen gathers toward the envelope 0..1. */
  gather: 0,
  /** Envelope flap opening 0..1. */
  flap: 0,
  /** Sheet sliding out of the envelope 0..1. */
  sheet: 0,
  /** Particle motion slows down while reading 0..1. */
  slow: 0,
  /** Tiny warm lift when the reader reaches the signature. */
  glow: 0,
  /** Camera dolly toward the letter 0..1. */
  dolly: 0,
}

export type AnimValues = typeof anim
