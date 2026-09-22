export type QualityTier = 'low' | 'mid' | 'high'

export interface QualityProfile {
  tier: QualityTier
  isMobile: boolean
  maxDpr: number
  dustCount: number
  pollenCount: number
  floatingPetals: number
  petalSegments: [number, number]
  stemSegments: [number, number]
  bloom: boolean
  multisampling: number
}

interface NavigatorExtras {
  deviceMemory?: number
  hardwareConcurrency?: number
}

export function detectQuality(): QualityProfile {
  const nav = navigator as Navigator & NavigatorExtras
  const ua = navigator.userAgent
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && Math.min(window.innerWidth, window.innerHeight) < 900)
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? (isMobile ? 4 : 8)
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  let tier: QualityTier = 'high'
  if (isMobile) tier = 'mid'
  if (memory <= 2 || cores <= 2 || reducedMotion) tier = 'low'
  if (!isMobile && cores >= 8) tier = 'high'

  const profiles: Record<QualityTier, Omit<QualityProfile, 'tier' | 'isMobile'>> = {
    low: {
      maxDpr: 1.25,
      dustCount: 180,
      pollenCount: 70,
      floatingPetals: 6,
      petalSegments: [5, 10],
      stemSegments: [8, 60],
      bloom: true,
      multisampling: 0,
    },
    mid: {
      maxDpr: 1.75,
      dustCount: 420,
      pollenCount: 140,
      floatingPetals: 10,
      petalSegments: [7, 14],
      stemSegments: [10, 90],
      bloom: true,
      multisampling: 2,
    },
    high: {
      maxDpr: 2,
      dustCount: 800,
      pollenCount: 220,
      floatingPetals: 14,
      petalSegments: [9, 18],
      stemSegments: [14, 120],
      bloom: true,
      multisampling: 4,
    },
  }

  return { tier, isMobile, ...profiles[tier] }
}

export const quality: QualityProfile = detectQuality()
