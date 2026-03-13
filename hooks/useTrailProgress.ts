'use client'

import { useEffect, useState } from 'react'

interface UseTrailProgressOptions {
  heroHeight?: number
  trailHeight?: number
  /** When true, the scroll container is mounted. Re-attach listener when this flips to true (e.g. after returning from side trail). */
  containerReady?: boolean
}

export interface TrailProgress {
  progress: number
  /** 0 when at top of hero, 1 when scrolled past hero. For fading trail in. */
  heroReveal: number
}

export function useTrailProgress(
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  options: UseTrailProgressOptions = {}
): TrailProgress {
  const { heroHeight = 0, trailHeight = 4000, containerReady = true } = options
  const [progress, setProgress] = useState(0)
  const [heroReveal, setHeroReveal] = useState(0)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop } = container
      // Progress from scroll 0 so marker moves immediately; trail still fades in via heroReveal
      const totalProgressHeight = heroHeight + trailHeight
      const newProgress =
        totalProgressHeight > 0 ? Math.min(1, scrollTop / totalProgressHeight) : 0
      const newHeroReveal = heroHeight > 0 ? Math.min(1, scrollTop / heroHeight) : 0
      setProgress(newProgress)
      setHeroReveal(newHeroReveal)
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef, heroHeight, trailHeight, containerReady])

  return { progress, heroReveal }
}
