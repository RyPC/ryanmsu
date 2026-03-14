import type { Point, Polyline } from "./marchingSquares"

function filterShortPaths(paths: Polyline[], minPoints: number): Polyline[] {
  return paths.filter((p) => p.length >= minPoints)
}

function isClosed(path: Polyline): boolean {
  if (path.length < 3) return false
  const first = path[0]
  const last = path[path.length - 1]
  const dx = first.x - last.x
  const dy = first.y - last.y
  return Math.sqrt(dx * dx + dy * dy) < 1.0
}

/**
 * One Chaikin corner-cutting pass.
 * For each consecutive pair [P0, P1], inserts:
 *   Q = P0 + 0.25*(P1−P0)  and  R = P0 + 0.75*(P1−P0)
 * Open path endpoints are preserved so the contour stays anchored at grid edges.
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

  if (!closed) {
    result.unshift(path[0])
    result.push(path[n - 1])
  }

  return result
}

export function chaikin(path: Polyline, iterations: number): Polyline {
  if (path.length < 2) return path
  const closed = isClosed(path)
  let result = path
  for (let i = 0; i < iterations; i++) {
    result = chaikinStep(result, closed)
  }
  return result
}

export function smoothPaths(paths: Polyline[], minPoints: number, chaikinIter: number): Polyline[] {
  return filterShortPaths(paths, minPoints).map((p) => chaikin(p, chaikinIter))
}
