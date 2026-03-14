'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSpring, useMotionValue, useMotionValueEvent, animate } from 'framer-motion'
import { useTrailStore } from '@/store/trailStore'
import {
  BRANCH_DEFAULT_X_OFFSET,
  BRANCH_DEFAULT_Y_OFFSET,
  BRANCH_LENGTH_MIN,
  BRANCH_LENGTH_MAX,
  PIN_TRAVEL_DELAY,
  PIN_TRAVEL_DURATION_BASE,
  VIEW_WINDOW_HEIGHT,
  TRAIL_PATH_MIN_Y,
  TRAIL_PATH_MAX_Y,
  HALF_VIEW_WINDOW_HEIGHT,
  TRAIL_SVG_WIDTH,
} from '@/lib/constants'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getPointOnPath(pathEl: SVGPathElement | null, t: number) {
  if (!pathEl) return null
  const pt = pathEl.getPointAtLength(t * pathEl.getTotalLength())
  return { x: pt.x, y: pt.y }
}

// Returns angle in radians where 0 = downward in SVG coords.
function getTangentAngle(pathEl: SVGPathElement | null, t: number, forward: boolean): number {
  if (!pathEl) return 0
  const len = pathEl.getTotalLength()
  const delta = 0.01
  const p1 = pathEl.getPointAtLength(Math.max(0, t - delta) * len)
  const p2 = pathEl.getPointAtLength(Math.min(1, t + delta) * len)
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  if (dx === 0 && dy === 0) return 0
  let angle = Math.atan2(dx, dy)
  if (!forward) angle += Math.PI
  return angle
}

interface UseMarkerAnimationProps {
  pathRef: React.RefObject<SVGPathElement>
  branchPathRef: React.RefObject<SVGPathElement>
  containerRef: React.RefObject<HTMLDivElement>
  progress: number
  isSideTrailMode: boolean
}

export interface MarkerAnimationState {
  branchPath: string
  markerPoint: { x: number; y: number }
  pinAngle: number
  viewY: number
  displayPinPosition: { x: number; y: number }
}

export function useMarkerAnimation({
  pathRef,
  branchPathRef,
  containerRef,
  progress,
  isSideTrailMode,
}: UseMarkerAnimationProps): MarkerAnimationState {
  const branchProgress = useTrailStore((s) => s.branchProgress)
  const clickedSide = useTrailStore((s) => s.clickedSide)
  const selectedEndpoint = useTrailStore((s) => s.selectedEndpoint)
  const activeBranchLength = useTrailStore((s) => s.activeBranchLength)
  const setBranchEndScreenPosition = useTrailStore((s) => s.setBranchEndScreenPosition)

  const clampedBranchLength = clamp(activeBranchLength, BRANCH_LENGTH_MIN, BRANCH_LENGTH_MAX)
  const pinTravelDuration = PIN_TRAVEL_DURATION_BASE * clampedBranchLength

  const [markerPoint, setMarkerPoint] = useState({ x: 200, y: 0 })
  const [branchPath, setBranchPath] = useState('')
  const [pinPosition, setPinPosition] = useState({ x: 200, y: 0 })
  const [pinAngle, setPinAngle] = useState(0)
  const pinBranchProgress = useSpring(0, { stiffness: 120, damping: 30 })
  const prevProgressRef = useRef(progress)

  // Separate motion value so we can animate the marker to the branch point
  // before the pin takes over, rather than teleporting.
  const displayedMarkerProgress = useMotionValue(progress)
  const [markerHasArrived, setMarkerHasArrived] = useState(false)

  const minViewY = TRAIL_PATH_MIN_Y - HALF_VIEW_WINDOW_HEIGHT
  const maxViewY = TRAIL_PATH_MAX_Y - HALF_VIEW_WINDOW_HEIGHT
  const targetViewY = clamp(markerPoint.y - HALF_VIEW_WINDOW_HEIGHT, minViewY, maxViewY)
  const viewYSpring = useSpring(targetViewY, { stiffness: 80, damping: 20, restDelta: 0.5 })
  const [viewY, setViewY] = useState(targetViewY)

  useEffect(() => {
    viewYSpring.set(targetViewY)
  }, [targetViewY, viewYSpring])

  useMotionValueEvent(viewYSpring, 'change', (latest) => setViewY(latest))

  useEffect(() => {
    const path = pathRef.current
    if (isSideTrailMode && branchProgress != null && clickedSide && path) {
      const totalLength = path.getTotalLength()
      const point = path.getPointAtLength(branchProgress * totalLength)
      const sign = clickedSide === 'left' ? -1 : 1
      const baseXOffset = selectedEndpoint?.xOffset ?? BRANCH_DEFAULT_X_OFFSET
      const baseYOffset = selectedEndpoint?.yOffset ?? BRANCH_DEFAULT_Y_OFFSET
      const xOffset = baseXOffset * clampedBranchLength
      const yOffset = baseYOffset * clampedBranchLength
      const endX = clamp(point.x + sign * xOffset, 16, 784)
      const endY = clamp(point.y + yOffset, TRAIL_PATH_MIN_Y, TRAIL_PATH_MAX_Y)
      const deltaX = endX - point.x
      const deltaY = endY - point.y
      const midX = point.x + deltaX * 0.5
      const midY = point.y + Math.max(deltaY * 0.44, 24)
      setBranchPath(
        `M ${point.x} ${point.y} C ${point.x + deltaX * 0.14} ${point.y + Math.max(deltaY * 0.06, 6)}, ${point.x + deltaX * 0.36} ${point.y + Math.max(deltaY * 0.26, 16)}, ${midX} ${midY} C ${point.x + deltaX * 0.64} ${point.y + Math.max(deltaY * 0.62, 34)}, ${point.x + deltaX * 0.88} ${point.y + Math.max(deltaY * 0.86, 50)}, ${endX} ${endY}`,
      )
    } else {
      setBranchPath('')
      pinBranchProgress.set(0)
    }
  }, [isSideTrailMode, branchProgress, clickedSide, selectedEndpoint, clampedBranchLength, pinBranchProgress, pathRef])

  useEffect(() => {
    if (isSideTrailMode && branchProgress != null) {
      setMarkerHasArrived(false)
      const controls = animate(displayedMarkerProgress, branchProgress, {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => setMarkerHasArrived(true),
      })
      return () => controls.stop()
    } else {
      setMarkerHasArrived(false)
    }
  }, [isSideTrailMode, branchProgress, displayedMarkerProgress])

  useEffect(() => {
    if (!isSideTrailMode) {
      displayedMarkerProgress.set(progress)
    }
  }, [progress, isSideTrailMode, displayedMarkerProgress])

  useMotionValueEvent(displayedMarkerProgress, 'change', (latest) => {
    const path = pathRef.current
    if (!path) return
    const point = path.getPointAtLength(latest * path.getTotalLength())
    setMarkerPoint({ x: point.x, y: point.y })
    const scrollForward = latest >= prevProgressRef.current
    prevProgressRef.current = latest
    setPinAngle(getTangentAngle(path, latest, scrollForward))
  })

  useEffect(() => {
    if (isSideTrailMode && branchPath) {
      const controls = animate(pinBranchProgress, 1, {
        duration: pinTravelDuration,
        delay: PIN_TRAVEL_DELAY,
        ease: [0.22, 1, 0.36, 1],
      })
      return () => controls.stop()
    }
  }, [isSideTrailMode, branchPath, pinBranchProgress, pinTravelDuration])

  useMotionValueEvent(pinBranchProgress, 'change', (latest) => {
    const branchEl = branchPathRef.current
    if (isSideTrailMode && branchPath && branchEl) {
      const pt = getPointOnPath(branchEl, latest)
      if (pt) setPinPosition(pt)
      setPinAngle(getTangentAngle(branchEl, latest, true))
    } else {
      setPinPosition(markerPoint)
    }
  })

  useEffect(() => {
    if (!isSideTrailMode || !branchPath) {
      setPinPosition(markerPoint)
    }
  }, [markerPoint, isSideTrailMode, branchPath])

  const updateBranchEndScreenPosition = useCallback(() => {
    if (!isSideTrailMode || !branchPath || !containerRef.current) {
      setBranchEndScreenPosition(null)
      return
    }
    const branchEl = branchPathRef.current
    if (!branchEl) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const endPt = getPointOnPath(branchEl, 1)
    if (!endPt) return
    if (!container.querySelector('svg')) return
    const scale = Math.min(rect.width / TRAIL_SVG_WIDTH, rect.height / VIEW_WINDOW_HEIGHT)
    const contentW = TRAIL_SVG_WIDTH * scale
    const contentH = VIEW_WINDOW_HEIGHT * scale
    const offsetX = (rect.width - contentW) / 2
    const offsetY = (rect.height - contentH) / 2
    const x = rect.left + offsetX + (endPt.x / TRAIL_SVG_WIDTH) * contentW
    const y = rect.top + offsetY + ((endPt.y - viewY) / VIEW_WINDOW_HEIGHT) * contentH
    setBranchEndScreenPosition({ x, y })
  }, [isSideTrailMode, branchPath, viewY, setBranchEndScreenPosition, containerRef, branchPathRef])

  useEffect(() => {
    updateBranchEndScreenPosition()
    const id = setTimeout(updateBranchEndScreenPosition, 100)
    const ro = new ResizeObserver(updateBranchEndScreenPosition)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => {
      clearTimeout(id)
      ro.disconnect()
    }
  }, [updateBranchEndScreenPosition, containerRef])

  const displayPinPosition =
    isSideTrailMode && branchPath && markerHasArrived ? pinPosition : markerPoint

  return { branchPath, markerPoint, pinAngle, viewY, displayPinPosition }
}
