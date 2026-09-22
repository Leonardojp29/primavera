import * as THREE from 'three'

function grainOn(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount
    d[i] += n
    d[i + 1] += n * 0.95
    d[i + 2] += n * 0.85
  }
  ctx.putImageData(img, 0, 0)
}

/** Tileable warm paper grain. Used as a tinted map on the envelope parts. */
export function makeGrainTexture() {
  const size = 256
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f1e8d6'
  ctx.fillRect(0, 0, size, size)
  grainOn(ctx, size, size, 14)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/**
 * Front face of the envelope with the folded panels baked in as very soft
 * shadow seams, so the paper reads as folded without extra geometry.
 */
export function makeEnvelopeFrontTexture(ratio: number) {
  const w = 1024
  const h = Math.round(w / ratio)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!

  // base paper with a faint diagonal light gradient
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#f3ebdb')
  g.addColorStop(1, '#e9dfcb')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  grainOn(ctx, w, h, 12)

  const cx = w / 2
  const cy = h * 0.56 // panels meet slightly below the centre

  // side panels are a hair darker than the bottom one
  ctx.fillStyle = 'rgba(70, 50, 25, 0.045)'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(cx, cy)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(w, 0)
  ctx.lineTo(cx, cy)
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()

  // soft shadow seams where the panels overlap
  ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(60, 40, 20, 0.35)'
  ctx.shadowBlur = 14
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.16)'
  ctx.lineWidth = 3
  for (const [x, y] of [
    [0, h],
    [w, h],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(cx, cy)
    ctx.stroke()
  }
  // the bottom panel sits on top: a lighter edge line
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255, 250, 235, 0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(cx, cy)
  ctx.lineTo(w, h)
  ctx.stroke()

  // subtle vignette so edges feel like real paper
  const v = ctx.createRadialGradient(cx, h / 2, h * 0.3, cx, h / 2, w * 0.7)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(60,40,20,0.08)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
