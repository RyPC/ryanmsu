'use client'

import { useState, useEffect } from 'react'

export function useViewportSize() {
  const [size, setSize] = useState(() =>
    typeof window !== 'undefined'
      ? { width: document.documentElement.clientWidth, height: window.innerHeight }
      : { width: 1200, height: 800 },
  )
  useEffect(() => {
    const update = () =>
      setSize({ width: document.documentElement.clientWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
