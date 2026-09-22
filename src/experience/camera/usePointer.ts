import { useEffect } from 'react'
import { clamp } from '../../utils/math'

/**
 * Normalised pointer state shared by camera and flower.
 * x/y: hover position in [-1, 1] (mouse only).
 * dragX/dragY: accumulated drag offset in [-1, 1] (touch and mouse drag).
 */
export const pointer = {
  x: 0,
  y: 0,
  dragX: 0,
  dragY: 0,
  down: false,
  hasMouse: false,
  moved: false,
}

export function usePointerListeners() {
  useEffect(() => {
    pointer.hasMouse = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false
    let lastX = 0
    let lastY = 0

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (e.pointerType === 'mouse') {
        pointer.x = (e.clientX / w) * 2 - 1
        pointer.y = -((e.clientY / h) * 2 - 1)
      }
      if (pointer.down) {
        const dx = (e.clientX - lastX) / w
        const dy = (e.clientY - lastY) / h
        pointer.dragX = clamp(pointer.dragX + dx * 2.2, -1, 1)
        pointer.dragY = clamp(pointer.dragY - dy * 2.2, -1, 1)
        if (Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) > 2) pointer.moved = true
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    const onDown = (e: PointerEvent) => {
      pointer.down = true
      pointer.moved = false
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = () => {
      pointer.down = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])
}
