import * as THREE from 'three'

/**
 * Uniforms shared by every custom material in the scene. Objects are shared by
 * reference, so `Lighting` updates them once per frame and every shader sees it.
 */
export const sceneUniforms = {
  uTime: { value: 0 },
  uKeyDir: { value: new THREE.Vector3(0.45, 0.8, 0.5).normalize() },
  uKeyColor: { value: new THREE.Color('#8fa3c8') },
  uKeyIntensity: { value: 0.55 },
  uFillColor: { value: new THREE.Color('#1c2236') },
  uAmbient: { value: new THREE.Color('#0d0f18') },
  uWarmth: { value: 0 },
  uFogColor: { value: new THREE.Color('#07070b') },
  uFogNear: { value: 4 },
  uFogFar: { value: 12 },
  uHeadPos: { value: new THREE.Vector3(0, 2.6, 0.38) },
}

export type SceneUniforms = typeof sceneUniforms

/** Palette endpoints for the dark → golden transition. */
export const palette = {
  bgDark: new THREE.Color('#07070b'),
  bgWarm: new THREE.Color('#22170a'),
  keyCool: new THREE.Color('#a9b6c9'),
  keyWarm: new THREE.Color('#ffd28c'),
  fillCool: new THREE.Color('#1c2236'),
  fillWarm: new THREE.Color('#5a3a16'),
  ambientCool: new THREE.Color('#12141c'),
  ambientWarm: new THREE.Color('#463218'),
}
