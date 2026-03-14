import type { Point, Polyline } from "./marchingSquares"

// ---------------------------------------------------------------------------
// Min-length filter
// ---------------------------------------------------------------------------

/**
 * Discards any polyline with fewer than `minPoints` vertices.
 * Very short paths (isolated marching-squares noise cells) clutter the
 * output without contributing readable contour information.
 */
export function filterShortPaths(paths: Polyline[], minPoints: number): Polyline[] {
  return paths.filter((p) => p.length >= minPoints)
}

// ---------------------------------------------------------------------------
// Chaikin corner-cutting subdivision
// ---------------------------------------------------------------------------

/**
 * Detects whether the first and last points of a polyline are close enough
 * to be treated as a closed loop (within 1 grid unit).
 */
function isClosed(path: Polyline): boolean {
  if (path.length < 3) return false
  const first = path[0]
  const last = path[path.length - 1]
  const dx = first.x - last.x
  const dy = first.y - last.y
  return Math.sqrt(dx * dx + dy * dy) < 1.0
}

/**
 * One iteration of Chaikin's corner-cutting algorithm.
 *
 * For each consecutive pair of vertices [P0, P1], two new points are inserted:
 *   Q = P0 + 0.25 * (P1 − P0)   (¼ of the way along the edge)
 *   R = P0 + 0.75 * (P1 − P0)   (¾ of the way along the edge)
 *
 * For open paths the original first and last vertices are preserved so the
 * contour does not "shrink away" from the grid boundary.
 * For closed paths wrap-around is applied.
 */
function chaikinStep(path: Polyline, closed: boolean): Polyline {
  const n = path.length
  const result: Point[] = []

  const segments = closed ? n : n - 1

  for (let i = 0; i < segments; i++) {
    const p0 = path[i]
    const p1 = path[(i + 1) % n]
    result.push(
      { x: p0.x + 0.25 * (p1.x - p0.x), y: p0.y + 0.25 * (p1.y - p0.y) },
      { x: p0.x + 0.75 * (p1.x - p0.x), y: p0.y + 0.75 * (p1.y - p0.y) },
    )
  }

  // Preserve endpoints for open paths so the contour stays anchored at edges.
  if (!closed) {
    result.unshift(path[0])
    result.push(path[n - 1])
  }

  return result
}

/**
 * Applies Chaikin's algorithm for `iterations` passes.
 * Automatically detects closed vs open paths.
 */
export function chaikin(path: Polyline, iterations: number): Polyline {
  if (path.length < 2) return path
  const closed = isClosed(path)
  let result = path
  for (let i = 0; i < iterations; i++) {
    result = chaikinStep(result, closed)
  }
  return result
}

/**
 * Applies filtering and smoothing to a collection of polylines.
 * Convenience wrapper used by the generator.
 */
export function smoothPaths(
  paths: Polyline[],
  minPoints: number,
  chaikinIter: number,
): Polyline[] {
  return filterShortPaths(paths, minPoints).map((p) => chaikin(p, chaikinIter))
}
