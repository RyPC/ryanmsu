import type { Checkpoint } from "@/data/experiences";

/**
 * X position (0-800) of the trail path at scroll progress t (0-1).
 * Path: M 400 0 C 400 0 520 400 380 800 C 280 1200 400 1600 280 2000 C 400 2400 520 2800 400 3200 C 280 3600 400 4000 400 4000
 * Keyframes derived from bezier control points and approximate arc-length distribution.
 */
const TRAIL_X_KEYFRAMES: [number, number][] = [
  [0, 400],
  [0.08, 480],
  [0.2, 380],
  [0.35, 300],
  [0.5, 280],
  [0.6, 460],
  [0.72, 400],
  [0.85, 320],
  [1, 400],
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function getTrailXAtProgress(progress: number): number {
  const t = clamp01(progress)
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
 * Maps scroll-based progress (0–1 over hero+trail scroll height) into a
 * normalized marker progress (0–1 along the trail path).
 *
 * The mapping is strictly linear so that the marker, hero, and trail all
 * advance through trail-space at the same rate everywhere. A given
 * scrollProgress always corresponds to the same marker trail progress.
 */
export function scrollProgressToMarkerProgress(
  scrollProgress: number,
  _heroHeight: number,
  _trailProgressHeight: number,
): number {
  // progressHeight === TRAIL_CONTENT_HEIGHT and maxScrollTop === heroHeight + TRAIL_CONTENT_HEIGHT,
  // so scroll progress and marker trail progress are identical linear mappings.
  return clamp01(scrollProgress)
}

/**
 * Given a desired marker trail progress (0–1), returns the scroll-space
 * progress at which the marker should be at that trail position.
 *
 * This uses the same relationship as locationToScrollProgress so that
 * markerProgress, checkpoint locationOnTrail, and scroll progress remain
 * perfectly aligned.
 */
export function markerProgressToScrollProgress(
  markerProgress: number,
  _heroHeight: number,
  _trailProgressHeight: number,
): number {
  return clamp01(markerProgress)
}

export function locationToScrollProgress(
  locationOnTrail: number,
  heroHeight: number,
  trailProgressHeight: number
): number {
  return markerProgressToScrollProgress(locationOnTrail, heroHeight, trailProgressHeight)
}
