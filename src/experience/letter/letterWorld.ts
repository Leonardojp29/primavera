import * as THREE from 'three'

/** World-space anchor of the envelope, shared with camera focus and particles. */
export const letterWorld = {
  focus: new THREE.Vector3(0, 2.4, 2.5),
  /** Half extent used by the pollen gather. */
  radius: 0.3,
}
