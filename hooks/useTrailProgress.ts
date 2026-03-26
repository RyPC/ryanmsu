'use client'

import { useEffect, useRef, useState } from 'react'

interface UseTrailProgressOptions {
  heroHeight?: number
  trailHeight?: number
  summitHeight?: number
  containerReady?: boolean
}

export interface TrailProgress {
  progress: number
  heroReveal: number
  summitReveal: number
}

export function useTrailProgress(
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  options: UseTrailProgressOptions = {}
): TrailProgress {
  const { heroHeight = 0, trailHeight = 4000, summitHeight = 0, containerReady = true } = options
  const [progress, setProgress] = useState(0)
  const [heroReveal, setHeroReveal] = useState(0)
  const [summitReveal, setSummitReveal] = useState(0)
  // Track whether the previous effect run had a null container (unmounted).
  // When true, this is a re-mount after the scroll container was gone —
  // skip the immediate handleScroll() call because scrollTop hasn't been
  // restored yet (layout hasn't been computed). The scroll event fired by
  // the rAF-delayed scrollTo() will update progress once ready.
  const prevContainerWasNullRef = useRef(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      prevContainerWasNullRef.current = true
      return
    }

    const handleScroll = () => {
      const { scrollTop } = container
      // Progress starts from scroll 0 so the marker moves immediately;
      // the trail itself fades in via heroReveal.
      const totalProgressHeight = heroHeight + trailHeight
      const newProgress =
        totalProgressHeight > 0 ? Math.min(1, scrollTop / totalProgressHeight) : 0
      const newHeroReveal = heroHeight > 0 ? Math.min(1, scrollTop / heroHeight) : 0
      // Summit reveal: starts summitHeight before the end of the trail scroll area.
      const summitStart = Math.max(0, trailHeight - summitHeight)
      const newSummitReveal =
        summitHeight > 0
          ? Math.max(0, Math.min(1, (scrollTop - summitStart) / summitHeight))
          : 0
      setProgress(newProgress)
      setHeroReveal(newHeroReveal)
      setSummitReveal(newSummitReveal)
    }

    // Only read scrollTop immediately on first mount or when layout params change.
    // On re-mount (after the container was null), skip it — scrollTop is 0 until
    // the rAF-delayed scrollTo() fires, which will trigger the scroll event below.
    if (!prevContainerWasNullRef.current) {
      handleScroll()
    }
    prevContainerWasNullRef.current = false

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef, heroHeight, trailHeight, containerReady])

  return { progress, heroReveal, summitReveal }
}
