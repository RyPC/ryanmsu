'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TrailMarkerProps {
  pathRef: React.RefObject<SVGPathElement | null>
  progress: number
}

export function TrailMarker({ pathRef, progress }: TrailMarkerProps) {
  const [point, setPoint] = useState({ x: 200, y: 0 })

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const totalLength = path.getTotalLength()
    const length = progress * totalLength
    const p = path.getPointAtLength(length)
    setPoint({ x: p.x, y: p.y })
  }, [pathRef, progress])

  return (
    <motion.g
      transform={`translate(${point.x}, ${point.y})`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      style={{ willChange: 'transform' }}
    >
      {/* Hiker icon - simplified person with backpack */}
      <circle cx="0" cy="0" r="12" fill="#7c3aed" stroke="#fff" strokeWidth="2" />
      <circle cx="-3" cy="-2" r="2" fill="#fff" />
      <path
        d="M -6 4 L 6 4 L 6 12 L -6 12 Z"
        fill="#5a4a2a"
        stroke="#4a3a1a"
        strokeWidth="1"
      />
    </motion.g>
  )
}
