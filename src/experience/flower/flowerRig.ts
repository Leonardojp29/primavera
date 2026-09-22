import * as THREE from 'three'

/**
 * Shared geometry description of the flower: the stem curve, where the leaves
 * attach and how the head is oriented. Everything else (camera, particles,
 * interaction) derives positions from here so the composition stays coherent.
 */

export const STEM_HEIGHT = 2.6

const controlPoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.04, 0.55, 0.01),
  new THREE.Vector3(-0.06, 1.25, -0.01),
  new THREE.Vector3(0.03, 1.95, 0.06),
  new THREE.Vector3(0.0, 2.38, 0.2),
  new THREE.Vector3(0.0, STEM_HEIGHT, 0.38),
]

export const stemCurve = new THREE.CatmullRomCurve3(controlPoints, false, 'centripetal', 0.5)

export const FRAME_SAMPLES = 400
export const stemFrames = stemCurve.computeFrenetFrames(FRAME_SAMPLES, false)

export interface LeafAttachment {
  /** Parameter along the stem (0..1). */
  t: number
  /** Azimuth around the stem, radians. */
  azimuth: number
  /** Upward tilt of the leaf axis, radians. */
  tilt: number
  length: number
  width: number
  phase: number
}

export const leaves: LeafAttachment[] = [
  { t: 0.36, azimuth: 0.55, tilt: 0.55, length: 0.62, width: 0.2, phase: 0.2 },
  { t: 0.62, azimuth: Math.PI + 0.45, tilt: 0.5, length: 0.55, width: 0.18, phase: 0.7 },
]

/** Head dimensions in head-local units (before `bud` scaling). */
export const head = {
  discRadius: 0.16,
  discHeight: 0.07,
  petalLength: [0.44, 0.52] as [number, number],
  petalWidth: [0.043, 0.05] as [number, number],
  petalCount: [16, 12] as [number, number],
  sepalCount: 13,
  sepalLength: 0.3,
  sepalWidth: 0.05,
  /** Approximate radius of the fully open flower. */
  openRadius: 0.68,
}

const _up = new THREE.Vector3(0, 1, 0)
const _tangent = new THREE.Vector3()
const _point = new THREE.Vector3()

/** Position on the stem at parameter t. */
export function stemPoint(t: number, target = _point) {
  return stemCurve.getPointAt(THREE.MathUtils.clamp(t, 0, 1), target)
}

/** Unit tangent on the stem at parameter t. */
export function stemTangent(t: number, target = _tangent) {
  return stemCurve.getTangentAt(THREE.MathUtils.clamp(t, 0, 1), target).normalize()
}

/** Quaternion that maps +Y to the stem tangent at t. */
export function stemQuaternion(t: number, target: THREE.Quaternion) {
  return target.setFromUnitVectors(_up, stemTangent(t))
}

/** Frenet frame index for parameter t. */
export function frameIndex(t: number) {
  return Math.min(FRAME_SAMPLES, Math.max(0, Math.round(t * FRAME_SAMPLES)))
}

/** World position of the flower head centre when fully grown. */
export const headPosition = stemCurve.getPointAt(1).clone()
export const headNormal = stemCurve.getTangentAt(1).clone().normalize()
