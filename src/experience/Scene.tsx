import { CameraController } from './camera/CameraController'
import { Flower } from './flower/Flower'
import { InteractionTarget } from './interaction/InteractionTarget'
import { Ground } from './lighting/Ground'
import { Lighting } from './lighting/Lighting'
import { Sky } from './lighting/Sky'
import { FloatingPetals } from './particles/FloatingPetals'
import { Particles } from './particles/Particles'
import { PostFX } from './postfx/PostFX'

export function Scene() {
  return (
    <>
      <Lighting />
      <CameraController />
      <Sky />
      <Ground />
      <Flower />
      <Particles />
      <FloatingPetals />
      <InteractionTarget />
      <PostFX />
    </>
  )
}
