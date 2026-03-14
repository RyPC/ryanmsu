import { createNoise } from "./perlinNoise"
import { extractContours } from "./marchingSquares"
import { smoothPaths } from "./pathSmoother"
import { pathToSvgD, computeStrokeOpacity } from "./svgExport"

export interface GenerateTerrainOptions {
  /** Grid width in cells. SVG width = gridW * scaleX. Default: 80 */
  gridW: number
  /** Grid height in cells. SVG height = gridH * scaleY. Default: 400 */
  gridH: number
  /** Deterministic seed for the PRNG. Default: 42 */
  seed: number
  /** Number of evenly-spaced contour levels to extract. Default: 25 */
  numLevels: number
  /** Noise sampling scale in grid units (larger = broader features). Default: 55 */
  noiseScale: number
  /** fBm octave count. Default: 5 */
  octaves: number
  /** fBm amplitude falloff per octave. Default: 0.5 */
  persistence: number
  /** fBm frequency multiplier per octave. Default: 2.0 */
  lacunarity: number
  /** Domain warp offset strength in grid units. Default: 18 */
  warpStrength: number
  /** Discard polylines with fewer than this many points after smoothing. Default: 10 */
  minPathPoints: number
  /** Number of Chaikin subdivision passes. Default: 2 */
  chaikinIter: number
  /** SVG x scale (grid units → SVG units). Default: 10 */
  scaleX: number
  /** SVG y scale (grid units → SVG units). Default: 10 */
  scaleY: number
  /**
   * Constant added to every SVG y coordinate after scaling.
   * Set to −HALF_VIEW (−700) so the terrain spans y=−700…4700, covering
   * the hero viewport at progress=0 where the viewBox starts at y=−700.
   */
  svgYOffset: number
}

export const DEFAULT_OPTIONS: GenerateTerrainOptions = {
  gridW: 80,
  gridH: 540,
  seed: 42,
  numLevels: 25,
  noiseScale: 55,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 2.0,
  warpStrength: 18,
  minPathPoints: 10,
  chaikinIter: 2,
  scaleX: 10,
  scaleY: 10,
  svgYOffset: -700,
}

export interface TopoPath {
  d: string
  strokeOpacity: number
}

function buildHeightmap(opts: GenerateTerrainOptions): number[][] {
  const { gridW, gridH, seed, noiseScale, octaves, persistence, lacunarity, warpStrength } = opts
  const noise = createNoise(seed)
  const fbmOpts = { octaves, persistence, lacunarity, scale: noiseScale }
  const hm: number[][] = Array.from({ length: gridW }, () => new Array(gridH).fill(0))
  for (let i = 0; i < gridW; i++) {
    for (let j = 0; j < gridH; j++) {
      hm[i][j] = noise.warpedFbm(i, j, { ...fbmOpts, warpStrength })
    }
  }
  return hm
}

function buildLevels(hm: number[][], numLevels: number): number[] {
  let minH = Infinity
  let maxH = -Infinity
  for (const col of hm) {
    for (const v of col) {
      if (v < minH) minH = v
      if (v > maxH) maxH = v
    }
  }
  const step = (maxH - minH) / (numLevels + 1)
  return Array.from({ length: numLevels }, (_, i) => minH + (i + 1) * step)
}

export function generateTerrain(partial: Partial<GenerateTerrainOptions> = {}): TopoPath[] {
  const opts: GenerateTerrainOptions = { ...DEFAULT_OPTIONS, ...partial }
  const hm = buildHeightmap(opts)
  const levels = buildLevels(hm, opts.numLevels)
  const paths: TopoPath[] = []

  for (let li = 0; li < levels.length; li++) {
    const level = levels[li]
    const rawPaths = extractContours(hm, level)
    const smoothed = smoothPaths(rawPaths, opts.minPathPoints, opts.chaikinIter)
    const opacity = computeStrokeOpacity(li, levels.length)
    for (const polyline of smoothed) {
      const d = pathToSvgD(polyline, opts.scaleX, opts.scaleY, opts.svgYOffset)
      if (d) paths.push({ d, strokeOpacity: opacity })
    }
  }

  return paths
}
