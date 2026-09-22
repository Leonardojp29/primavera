/**
 * Screen-space position of the thing to touch next, updated from the 3D scene
 * every frame and rendered as a breathing golden ring by the UI.
 */
export const tapCue = {
  x: 0,
  y: 0,
  visible: false,
  /** Ring size multiplier: small for the seed, larger for the open flower. */
  scale: 1,
}
