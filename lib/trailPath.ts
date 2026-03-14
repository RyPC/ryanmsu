import type { Checkpoint } from "@/data/experiences";

/**
 * X position (0-400) of the trail path at scroll progress t (0-1).
 * Path: M 200 0 C 200 0 320 400 180 800 C 80 1200 200 1600 80 2000 C 200 2400 320 2800 200 3200 C 80 3600 200 4000 200 4000
 * Four segments: seg1 curves right then left, seg2 left, seg3 right, seg4 dips left and back.
 * Keyframes derived from path structure (bezier control points and approximate arc-length distribution).
 */
const TRAIL_X_KEYFRAMES: [number, number][] = [
  [0, 200],
  [0.08, 280],
  [0.2, 180],
  [0.35, 100],
  [0.5, 80],
  [0.6, 260],
  [0.72, 200],
  [0.85, 120],
  [1, 200],
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

export function getTrailXAtProgress(progress: number): number {
  const t = Math.max(0, Math.min(1, progress))
  for (let i = 0; i < TRAIL_X_KEYFRAMES.length - 1; i++) {
    const [t0, x0] = TRAIL_X_KEYFRAMES[i]
    const [t1, x1] = TRAIL_X_KEYFRAMES[i + 1]
    if (t >= t0 && t <= t1) {
      const u = (t - t0) / (t1 - t0)
      return lerp(x0, x1, u)
    }
  }
  return TRAIL_X_KEYFRAMES[TRAIL_X_KEYFRAMES.length - 1][1]
}

/** Trail SVG is 400 units wide; returns fraction 0-1 for positioning */
export function getTrailXFraction(progress: number): number {
  return getTrailXAtProgress(progress) / 400
}

export const TRAIL_CONTENT_HEIGHT = 4000

const TRAIL_PROGRESS_BASE_PX = 1800
const MAIN_TRAIL_STOP_PROGRESS_PX = 250
const SIDE_TRAIL_PROGRESS_PX = 200
const MIN_TRAIL_PROGRESS_HEIGHT = 2800
const TRAIL_SCROLL_HEIGHT_MULTIPLIER = 1.5

export interface TrailMetrics {
  contentHeight: number
  progressHeight: number
  scrollHeightPx: number
}

export function getTrailMetrics(
  mainTrailStopCount: number,
  sideTrailCount: number
): TrailMetrics {
  const rawProgressHeight =
    TRAIL_PROGRESS_BASE_PX +
    mainTrailStopCount * MAIN_TRAIL_STOP_PROGRESS_PX +
    sideTrailCount * SIDE_TRAIL_PROGRESS_PX
  const progressHeight = Math.max(MIN_TRAIL_PROGRESS_HEIGHT, rawProgressHeight)
  return {
    contentHeight: TRAIL_CONTENT_HEIGHT,
    progressHeight,
    scrollHeightPx: Math.round(progressHeight * TRAIL_SCROLL_HEIGHT_MULTIPLIER),
  }
}

export function getTrailMetricsFromExperiences(
  items: Checkpoint[]
): TrailMetrics {
  const mainTrailStopCount = items.filter((item) => item.type !== "trailhead").length
  const sideTrailCount = items.filter((item) => item.sideTrail && item.sideTrailId).length
  return getTrailMetrics(mainTrailStopCount, sideTrailCount)
}

/**
 * Converts locationOnTrail (0-1, position in trail doc) to scroll progress (0-1).
 * When checkpoint at locationOnTrail is at top of viewport, scrollTop = heroHeight + locationOnTrail * TRAIL_CONTENT_HEIGHT.
 */
export function locationToScrollProgress(
  locationOnTrail: number,
  heroHeight: number,
  trailProgressHeight: number
): number {
  const totalHeight = heroHeight + trailProgressHeight
  const scrollTop = heroHeight + locationOnTrail * TRAIL_CONTENT_HEIGHT
  return Math.min(1, scrollTop / totalHeight)
}
