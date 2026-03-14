import type { Polyline } from "./marchingSquares"

/**
 * Converts a polyline from grid space to an SVG path `d` string.
 * scaleX/scaleY multiply grid coordinates; offsetY shifts all y values after scaling
 * (use a negative value to shift terrain upward into the hero viewport).
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

/** Maps a contour level index to stroke opacity in the 0.06–0.11 range. Higher = closer to summit. */
export function computeStrokeOpacity(levelIndex: number, numLevels: number): number {
  const t = numLevels > 1 ? levelIndex / (numLevels - 1) : 0.5
  return parseFloat((0.06 + t * 0.05).toFixed(4))
}
