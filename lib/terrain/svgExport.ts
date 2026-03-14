import type { Polyline } from "./marchingSquares"

// ---------------------------------------------------------------------------
// SVG path string generation
// ---------------------------------------------------------------------------

/**
 * Converts a polyline from grid space to SVG space and returns an SVG path
 * `d` attribute string of the form `"M x0 y0 L x1 y1 L x2 y2 ..."`.
 *
 * @param points  Polyline in grid coordinates
 * @param scaleX  Multiply grid x by this to reach SVG x (e.g. 10 for 80→800)
 * @param scaleY  Multiply grid y by this to reach SVG y (e.g. 10 for 540→5400)
 * @param offsetY Add this constant to every SVG y coordinate after scaling.
 *                Use a negative value (e.g. −700) to shift the terrain upward
 *                so paths exist above y=0 and fill the hero viewport.
 */
export function pathToSvgD(
  points: Polyline,
  scaleX: number,
  scaleY: number,
  offsetY: number = 0,
): string {
  if (points.length < 2) return ""

  const parts: string[] = []
  for (let i = 0; i < points.length; i++) {
    const x = (points[i].x * scaleX).toFixed(1)
    const y = (points[i].y * scaleY + offsetY).toFixed(1)
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
  }

  return parts.join(" ")
}

// ---------------------------------------------------------------------------
// Stroke opacity mapping
// ---------------------------------------------------------------------------

/**
 * Maps a contour level index to a stroke opacity value in the 0.06–0.11 range.
 *
 * `levelIndex` is the index into the sorted contour level array, where 0
 * corresponds to the lowest elevation and `numLevels - 1` the highest.
 *
 * Higher contour lines (upper elevation bands) are rendered slightly more
 * prominently to reinforce the vertical relief near the summit.
 */
export function computeStrokeOpacity(levelIndex: number, numLevels: number): number {
  // Normalise to 0–1; higher = closer to summit
  const t = numLevels > 1 ? levelIndex / (numLevels - 1) : 0.5
  // Range: 0.06 (valley) → 0.11 (summit)
  return parseFloat((0.06 + t * 0.05).toFixed(4))
}
