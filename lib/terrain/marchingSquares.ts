// ---------------------------------------------------------------------------
// Marching Squares — contour extraction and path stitching
// ---------------------------------------------------------------------------
//
// Grid convention:
//   heightmap[col][row], col in 0..gridW-1, row in 0..gridH-1
//   Cell (i, j) has corners:
//     TL = (i,   j)    TR = (i+1, j)
//     BL = (i,   j+1)  BR = (i+1, j+1)
//
// Case index bits (MSB→LSB): TL=3, TR=2, BR=1, BL=0
//   bit = 1 when corner value ≥ level (above the contour threshold)
//
// Edges (used in lookup table):
//   0 = TOP    (between TL and TR, interpolated along row j)
//   1 = RIGHT  (between TR and BR, interpolated along col i+1)
//   2 = BOTTOM (between BL and BR, interpolated along row j+1)
//   3 = LEFT   (between TL and BL, interpolated along col i)

export interface Point {
  x: number
  y: number
}

/** A continuous polyline of grid-space points. */
export type Polyline = Point[]

// ---------------------------------------------------------------------------
// 16-case lookup table
// Each entry lists the edge-pairs that form segments in that case.
// Cases 5 and 10 are saddle points — fixed disambiguation applied.
// ---------------------------------------------------------------------------
//
// [edgeA, edgeB] means: draw a segment from the crossing on edgeA
// to the crossing on edgeB.

const CASE_SEGMENTS: [number, number][][] = [
  [],                   // 0000 = 0
  [[3, 2]],             // 0001 = 1:  BL          → LEFT–BOTTOM
  [[1, 2]],             // 0010 = 2:  BR          → RIGHT–BOTTOM
  [[3, 1]],             // 0011 = 3:  BL+BR       → LEFT–RIGHT
  [[0, 1]],             // 0100 = 4:  TR          → TOP–RIGHT
  [[0, 3], [1, 2]],     // 0101 = 5:  TR+BL sad.  → TOP–LEFT  and RIGHT–BOTTOM
  [[0, 2]],             // 0110 = 6:  TR+BR       → TOP–BOTTOM
  [[0, 3]],             // 0111 = 7:  TR+BR+BL    → TOP–LEFT
  [[0, 3]],             // 1000 = 8:  TL          → TOP–LEFT
  [[0, 2]],             // 1001 = 9:  TL+BL       → TOP–BOTTOM
  [[0, 1], [3, 2]],     // 1010 = 10: TL+BR sad.  → TOP–RIGHT and LEFT–BOTTOM
  [[0, 1]],             // 1011 = 11: TL+BR+BL    → TOP–RIGHT
  [[3, 1]],             // 1100 = 12: TL+TR       → LEFT–RIGHT
  [[1, 2]],             // 1101 = 13: TL+TR+BL    → RIGHT–BOTTOM
  [[3, 2]],             // 1110 = 14: TL+TR+BR    → LEFT–BOTTOM
  [],                   // 1111 = 15
]

// ---------------------------------------------------------------------------
// Edge interpolation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the grid-space point where the contour at `level` crosses
 * the given edge of cell (i, j).
 *
 *   Edge 0 (TOP):    between (i, j)   and (i+1, j)
 *   Edge 1 (RIGHT):  between (i+1, j) and (i+1, j+1)
 *   Edge 2 (BOTTOM): between (i, j+1) and (i+1, j+1)
 *   Edge 3 (LEFT):   between (i, j)   and (i, j+1)
 */
function edgePoint(
  i: number,
  j: number,
  edge: number,
  level: number,
  hm: number[][],
): Point {
  switch (edge) {
    case 0: {
      // TOP: from TL=(i,j) to TR=(i+1,j)
      const v0 = hm[i][j]
      const v1 = hm[i + 1][j]
      const t = v0 === v1 ? 0.5 : (level - v0) / (v1 - v0)
      return { x: i + t, y: j }
    }
    case 1: {
      // RIGHT: from TR=(i+1,j) to BR=(i+1,j+1)
      const v0 = hm[i + 1][j]
      const v1 = hm[i + 1][j + 1]
      const t = v0 === v1 ? 0.5 : (level - v0) / (v1 - v0)
      return { x: i + 1, y: j + t }
    }
    case 2: {
      // BOTTOM: from BL=(i,j+1) to BR=(i+1,j+1)
      const v0 = hm[i][j + 1]
      const v1 = hm[i + 1][j + 1]
      const t = v0 === v1 ? 0.5 : (level - v0) / (v1 - v0)
      return { x: i + t, y: j + 1 }
    }
    case 3: {
      // LEFT: from TL=(i,j) to BL=(i,j+1)
      const v0 = hm[i][j]
      const v1 = hm[i][j + 1]
      const t = v0 === v1 ? 0.5 : (level - v0) / (v1 - v0)
      return { x: i, y: j + t }
    }
    default:
      return { x: i, y: j }
  }
}

// ---------------------------------------------------------------------------
// Segment → continuous polyline stitching
// ---------------------------------------------------------------------------

/** Encode a point to a stable string key (1 decimal precision). */
function ptKey(p: Point): string {
  return `${p.x.toFixed(3)},${p.y.toFixed(3)}`
}

/**
 * Accepts a flat list of segments (each segment is a pair of Points) and
 * connects them into continuous polylines by matching shared endpoints.
 *
 * The stitcher builds an adjacency map and greedily walks chains until
 * no further extension is possible.
 */
function stitchSegments(segments: [Point, Point][]): Polyline[] {
  if (segments.length === 0) return []

  // Map: endpoint key → list of segment indices containing that endpoint
  const adj = new Map<string, number[]>()

  const register = (key: string, idx: number) => {
    const list = adj.get(key)
    if (list) list.push(idx)
    else adj.set(key, [idx])
  }

  for (let i = 0; i < segments.length; i++) {
    register(ptKey(segments[i][0]), i)
    register(ptKey(segments[i][1]), i)
  }

  const used = new Uint8Array(segments.length)
  const polylines: Polyline[] = []

  for (let start = 0; start < segments.length; start++) {
    if (used[start]) continue
    used[start] = 1

    // Build the chain from this starting segment
    const chain: Point[] = [segments[start][0], segments[start][1]]

    // Extend the tail
    let extended = true
    while (extended) {
      extended = false
      const tail = chain[chain.length - 1]
      const tailKey = ptKey(tail)
      const neighbors = adj.get(tailKey)
      if (!neighbors) break
      for (const idx of neighbors) {
        if (used[idx]) continue
        used[idx] = 1
        extended = true
        const [a, b] = segments[idx]
        // Append the far end of the segment
        chain.push(ptKey(a) === tailKey ? b : a)
        break
      }
    }

    // Extend the head
    extended = true
    while (extended) {
      extended = false
      const head = chain[0]
      const headKey = ptKey(head)
      const neighbors = adj.get(headKey)
      if (!neighbors) break
      for (const idx of neighbors) {
        if (used[idx]) continue
        used[idx] = 1
        extended = true
        const [a, b] = segments[idx]
        chain.unshift(ptKey(a) === headKey ? b : a)
        break
      }
    }

    polylines.push(chain)
  }

  return polylines
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extracts all contour polylines for the given `level` from `heightmap`.
 *
 * `heightmap[col][row]` — indexed by column first, then row.
 * Returns an array of continuous polylines in grid space.
 */
export function extractContours(heightmap: number[][], level: number): Polyline[] {
  const gridW = heightmap.length
  const gridH = heightmap[0].length
  const segments: [Point, Point][] = []

  for (let i = 0; i < gridW - 1; i++) {
    for (let j = 0; j < gridH - 1; j++) {
      const tl = heightmap[i][j]
      const tr = heightmap[i + 1][j]
      const br = heightmap[i + 1][j + 1]
      const bl = heightmap[i][j + 1]

      // Build 4-bit case index: bit3=TL, bit2=TR, bit1=BR, bit0=BL
      const caseIdx =
        (tl >= level ? 8 : 0) |
        (tr >= level ? 4 : 0) |
        (br >= level ? 2 : 0) |
        (bl >= level ? 1 : 0)

      for (const [edgeA, edgeB] of CASE_SEGMENTS[caseIdx]) {
        segments.push([
          edgePoint(i, j, edgeA, level, heightmap),
          edgePoint(i, j, edgeB, level, heightmap),
        ])
      }
    }
  }

  return stitchSegments(segments)
}
