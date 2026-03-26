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
  PIN_RETURN_DURATION,
  VIEW_WINDOW_HEIGHT,
  TRAIL_PATH_MIN_Y,
  TRAIL_PATH_MAX_Y,
  HALF_VIEW_WINDOW_HEIGHT,
  TRAIL_SVG_WIDTH,
} from '@/lib/constants'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
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
  onReturnComplete?: () => void
}

export interface MarkerAnimationState {
  branchPath: string
  markerPoint: { x: number; y: number }
  pinAngle: number
  viewY: number
  displayPinPosition: { x: number; y: number }
  isReturning: boolean
  isMoving: boolean
  movementScale: number
}

export function useMarkerAnimation({
  pathRef,
  branchPathRef,
  containerRef,
  progress,
  isSideTrailMode,
  onReturnComplete,
}: UseMarkerAnimationProps): MarkerAnimationState {
  const branchProgress = useTrailStore((s) => s.branchProgress)
  const clickedSide = useTrailStore((s) => s.clickedSide)
  const selectedEndpoint = useTrailStore((s) => s.selectedEndpoint)
  const activeBranchLength = useTrailStore((s) => s.activeBranchLength)
  const isReturning = useTrailStore((s) => s.isReturning)
  const returnScrollProgress = useTrailStore((s) => s.returnScrollProgress)
  const setBranchEndScreenPosition = useTrailStore((s) => s.setBranchEndScreenPosition)

  const clampedBranchLength = clamp(activeBranchLength, BRANCH_LENGTH_MIN, BRANCH_LENGTH_MAX)
  const pinTravelDuration = PIN_TRAVEL_DURATION_BASE * clampedBranchLength

  // Marker starts exactly on the trail path once the SVG path is available.
  const [markerPoint, setMarkerPoint] = useState({ x: 200, y: 0 })
  const [branchPath, setBranchPath] = useState('')
  const [pinPosition, setPinPosition] = useState({ x: 200, y: 0 })
  const [pinAngle, setPinAngle] = useState(0)
  const pinBranchProgress = useSpring(0, { stiffness: 120, damping: 30 })
  const prevProgressRef = useRef(progress)
  const prevMarkerPointRef = useRef<{ x: number; y: number }>({ x: 200, y: 0 })
  const prevPinPositionRef = useRef<{ x: number; y: number }>({ x: 200, y: 0 })
  const isReturningRef = useRef(isReturning)
  isReturningRef.current = isReturning
  const [isMoving, setIsMoving] = useState(false)
  const movementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const movementScaleRef = useRef(0)
  const [movementScale, setMovementScale] = useState(0)

  const MARKER_MOVEMENT_EPSILON_SQ = 0.75 * 0.75
  const PIN_MOVEMENT_EPSILON_SQ = 0.75 * 0.75

  const scheduleMovementStop = useCallback(() => {
    if (movementTimeoutRef.current !== null) {
      clearTimeout(movementTimeoutRef.current)
    }
    movementTimeoutRef.current = setTimeout(() => {
      setIsMoving(false)
      movementScaleRef.current = 0
      setMovementScale(0)
      movementTimeoutRef.current = null
    }, 140)
  }, [])

  const markMoving = useCallback((distanceSq: number) => {
    const distance = Math.sqrt(distanceSq)
    const normalized = clamp(distance / 12, 0, 1)
    const blended = lerp(movementScaleRef.current, normalized, 0.4)
    movementScaleRef.current = blended
    setMovementScale(blended)
    if (!isMoving) {
      setIsMoving(true)
    }
    scheduleMovementStop()
  }, [isMoving, scheduleMovementStop])

  // Separate motion value so we can animate the marker to the branch point
  // before the pin takes over, rather than teleporting.
  const displayedMarkerProgress = useMotionValue(progress)
  const [markerHasArrived, setMarkerHasArrived] = useState(false)

  // Start with the marker lower on screen (bottom 25%), then blend to the
  // normal mid-screen lock once it reaches the middle.
  const startOffsetY = VIEW_WINDOW_HEIGHT * 0.75
  const heroOffsetY = VIEW_WINDOW_HEIGHT * 0.5
  const rampDistance = VIEW_WINDOW_HEIGHT * 0.25
  const rampT = rampDistance > 0 ? markerPoint.y / rampDistance : 1
  const baseOffsetY = lerp(startOffsetY, heroOffsetY, rampT)

  // As the marker approaches the summit, lift it toward the top of the viewport
  // so the summit section scrolls into view beneath it.
  const endOffsetY = VIEW_WINDOW_HEIGHT * 0.22
  const summitRampStart = 2300
  const summitRampLength = TRAIL_PATH_MAX_Y - summitRampStart
  const summitT = clamp((markerPoint.y - summitRampStart) / summitRampLength, 0, 1)
  const targetOffsetY = lerp(baseOffsetY, endOffsetY, summitT)

  // Allow the camera to start above the trail so the marker can sit in the
  // bottom quarter immediately (this requires viewY < -HALF_VIEW_WINDOW_HEIGHT).
  const minViewY = TRAIL_PATH_MIN_Y - startOffsetY
  const maxViewY = TRAIL_PATH_MAX_Y - endOffsetY
  const viewY = clamp(markerPoint.y - targetOffsetY, minViewY, maxViewY)

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
      // Skip progress=0 while scroll is being restored after returning from a side trail.
      // The scroll container remounts at 0 then jumps to the saved position after 2 rAFs,
      // which would teleport the marker to the top and spring it back down.
      if (progress === 0 && returnScrollProgress != null && returnScrollProgress > 0) return
      displayedMarkerProgress.set(progress)
    }
  }, [progress, isSideTrailMode, returnScrollProgress, displayedMarkerProgress])

  useMotionValueEvent(displayedMarkerProgress, 'change', (latest) => {
    const path = pathRef.current
    if (!path) return
    const point = path.getPointAtLength(latest * path.getTotalLength())
    const nextMarkerPoint = { x: point.x, y: point.y }
    const prevMarkerPoint = prevMarkerPointRef.current
    const dx = nextMarkerPoint.x - prevMarkerPoint.x
    const dy = nextMarkerPoint.y - prevMarkerPoint.y
    const distanceSq = dx * dx + dy * dy
    if (distanceSq > MARKER_MOVEMENT_EPSILON_SQ) {
      markMoving(distanceSq)
    }
    prevMarkerPointRef.current = nextMarkerPoint
    setMarkerPoint(nextMarkerPoint)
    const scrollForward = latest >= prevProgressRef.current
    prevProgressRef.current = latest
    setPinAngle(getTangentAngle(path, latest, scrollForward))
  })

  // On initial mount, once the main trail path exists, snap the marker to the
  // correct position on the path for the current progress (typically 0 at top),
  // so it does not briefly appear offset to the left before the first scroll.
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const t = displayedMarkerProgress.get()
    const point = path.getPointAtLength(t * path.getTotalLength())
    setMarkerPoint({ x: point.x, y: point.y })
    prevProgressRef.current = t
    const scrollForward = true
    setPinAngle(getTangentAngle(path, t, scrollForward))
  }, [pathRef, displayedMarkerProgress])

  useEffect(() => {
    if (isSideTrailMode && branchPath && !isReturning) {
      const controls = animate(pinBranchProgress, 1, {
        duration: pinTravelDuration,
        delay: PIN_TRAVEL_DELAY,
        ease: [0.22, 1, 0.36, 1],
      })
      return () => controls.stop()
    }
  }, [isSideTrailMode, branchPath, isReturning, pinBranchProgress, pinTravelDuration])

  useEffect(() => {
    if (!isReturning) return
    const controls = animate(pinBranchProgress, 0, {
      duration: PIN_RETURN_DURATION,
      ease: [0.22, 1, 0.36, 1],
      onComplete: onReturnComplete,
    })
    return () => controls.stop()
  }, [isReturning, pinBranchProgress, onReturnComplete])

  useMotionValueEvent(pinBranchProgress, 'change', (latest) => {
    const branchEl = branchPathRef.current
    if (isSideTrailMode && branchPath && branchEl) {
      const pt = getPointOnPath(branchEl, latest)
      if (pt) {
        const nextPinPosition = { x: pt.x, y: pt.y }
        const prevPinPosition = prevPinPositionRef.current
        const dx = nextPinPosition.x - prevPinPosition.x
        const dy = nextPinPosition.y - prevPinPosition.y
        const distanceSq = dx * dx + dy * dy
        if (distanceSq > PIN_MOVEMENT_EPSILON_SQ) {
          markMoving(distanceSq)
        }
        prevPinPositionRef.current = nextPinPosition
        setPinPosition(nextPinPosition)
      }
      setPinAngle(getTangentAngle(branchEl, latest, !isReturningRef.current))
    } else {
      setPinPosition(markerPoint)
      // In the absence of an active branch, defer movement status to the main marker updates.
      if (!isSideTrailMode) {
        setIsMoving(false)
      }
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

  return {
    branchPath,
    markerPoint,
    pinAngle,
    viewY,
    displayPinPosition,
    isReturning,
    isMoving,
    movementScale,
  }
}
