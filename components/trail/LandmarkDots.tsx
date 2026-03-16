"use client"

import { useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { Checkpoint } from '@/data/experiences'
import { getTrailXAtProgress, locationToScrollProgress } from '@/lib/trailPath'
import {
  LANDMARK_OPEN_THRESHOLD,
  VIEW_WINDOW_HEIGHT,
  TRAIL_PATH_MAX_Y,
} from '@/lib/constants'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

interface LandmarkDotProps {
  checkpoint: Checkpoint
  progress: number
  pathRef: React.RefObject<SVGPathElement>
  viewY: number
  heroHeight: number
  trailProgressHeight: number
  onHoverCheckpoint: (checkpoint: Checkpoint, pos: { x: number; y: number }) => void
  onHoverEnd: () => void
}

function LandmarkDot({
  checkpoint,
  progress,
  pathRef,
  viewY,
  heroHeight,
  trailProgressHeight,
  onHoverCheckpoint,
  onHoverEnd,
}: LandmarkDotProps) {
  const progressMV = useMotionValue(progress)

  useEffect(() => {
    progressMV.set(progress)
  }, [progress, progressMV])

  const landmarkScrollProgress = locationToScrollProgress(
    checkpoint.locationOnTrail,
    heroHeight,
    trailProgressHeight,
  )

  const proximity = useTransform(
    progressMV,
    [
      Math.max(0, landmarkScrollProgress - LANDMARK_OPEN_THRESHOLD),
      landmarkScrollProgress,
      Math.min(1, landmarkScrollProgress + LANDMARK_OPEN_THRESHOLD),
    ],
    [0, 1, 0],
    { clamp: true },
  )

  const glowOpacity = useTransform(proximity, [0, 1], [0.08, 0.7])

  const fallbackX = getTrailXAtProgress(landmarkScrollProgress)
  const fallbackY = checkpoint.locationOnTrail * TRAIL_PATH_MAX_Y
  let dotX = fallbackX
  let dotY = fallbackY

  const path = pathRef.current
  if (path) {
    const point = path.getPointAtLength(
      clamp(landmarkScrollProgress, 0, 1) * path.getTotalLength(),
    )
    dotX = point.x
    dotY = point.y
  }

  if (dotY < viewY - 120 || dotY > viewY + VIEW_WINDOW_HEIGHT + 120) {
    return null
  }

  return (
    <g
      className="pointer-events-auto cursor-default"
      onMouseEnter={(e) => onHoverCheckpoint(checkpoint, { x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => onHoverCheckpoint(checkpoint, { x: e.clientX, y: e.clientY })}
      onMouseLeave={onHoverEnd}
    >
      {/* Ambient glow — opacity scales with scroll proximity */}
      <motion.circle
        cx={dotX}
        cy={dotY}
        r={24}
        fill="var(--color-landmark)"
        style={{ opacity: glowOpacity, filter: 'blur(8px)' }}
      />
      {/* Pulse ring — always animating to hint interactivity */}
      <motion.circle
        cx={dotX}
        cy={dotY}
        fill="none"
        stroke="var(--color-landmark)"
        strokeWidth="2"
        initial={{ r: 9, opacity: 0.7 }}
        animate={{ r: [9, 24], opacity: [0.7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Main landmark dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r={9}
        fill="var(--color-landmark)"
        stroke="#ffffff"
        strokeWidth={2.5}
      />
    </g>
  )
}

interface LandmarkDotsProps {
  checkpoints: Checkpoint[]
  progress: number
  pathRef: React.RefObject<SVGPathElement>
  viewY: number
  heroHeight: number
  trailProgressHeight: number
  onHoverCheckpoint: (checkpoint: Checkpoint, pos: { x: number; y: number }) => void
  onHoverEnd: () => void
}

export function LandmarkDots({
  checkpoints,
  progress,
  pathRef,
  viewY,
  heroHeight,
  trailProgressHeight,
  onHoverCheckpoint,
  onHoverEnd,
}: LandmarkDotsProps) {
  const landmarks = checkpoints.filter((c) => c.isLandmark)

  return (
    <>
      {landmarks.map((checkpoint) => (
        <LandmarkDot
          key={checkpoint.id}
          checkpoint={checkpoint}
          progress={progress}
          pathRef={pathRef}
          viewY={viewY}
          heroHeight={heroHeight}
          trailProgressHeight={trailProgressHeight}
          onHoverCheckpoint={onHoverCheckpoint}
          onHoverEnd={onHoverEnd}
        />
      ))}
    </>
  )
}
