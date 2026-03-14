// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------

/** Returns a deterministic pseudo-random number generator seeded with `seed`. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let z = Math.imul(s ^ (s >>> 15), 1 | s)
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Classic Perlin gradient noise
// ---------------------------------------------------------------------------

/** Smooth-step quintic: 6t^5 − 15t^4 + 10t^3 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

/**
 * Returns the dot product of the gradient vector for corner `hash` and
 * the distance vector `(dx, dy)`. Gradient table uses 8 directions.
 */
function grad2(hash: number, dx: number, dy: number): number {
  const h = hash & 7
  // 8 unit-ish gradients around a circle
  const u = h < 4 ? dx : dy
  const v = h < 4 ? dy : dx
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FbmOptions {
  octaves: number
  persistence: number
  lacunarity: number
  scale: number
}

export interface WarpedFbmOptions extends FbmOptions {
  warpStrength: number
}

export interface NoiseEngine {
  /** Classic 2-D Perlin noise, returns value in roughly −1…1. */
  perlin(x: number, y: number): number
  /** Fractal Brownian Motion — sums `octaves` Perlin layers. */
  fBm(x: number, y: number, opts: FbmOptions): number
  /**
   * Domain-warped fBm: two independent Perlin samples offset the sample
   * coordinates before the main fBm call, producing river-like folds.
   */
  warpedFbm(x: number, y: number, opts: WarpedFbmOptions): number
}

/**
 * Creates a fully deterministic noise engine from `seed`.
 * All methods are pure given the permutation table built at construction time.
 */
export function createNoise(seed: number): NoiseEngine {
  const rand = mulberry32(seed)

  // Build a shuffled permutation table of 0–255, doubled to avoid modular wrap.
  const perm = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  const p = [...perm, ...perm] // doubled: length 512

  function perlin(x: number, y: number): number {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const dx = x - Math.floor(x)
    const dy = y - Math.floor(y)
    const u = fade(dx)
    const v = fade(dy)

    const aa = p[p[xi] + yi]
    const ab = p[p[xi] + yi + 1]
    const ba = p[p[xi + 1] + yi]
    const bb = p[p[xi + 1] + yi + 1]

    return lerp(
      lerp(grad2(aa, dx, dy), grad2(ba, dx - 1, dy), u),
      lerp(grad2(ab, dx, dy - 1), grad2(bb, dx - 1, dy - 1), u),
      v,
    )
  }

  function fBm(x: number, y: number, opts: FbmOptions): number {
    const { octaves, persistence, lacunarity, scale } = opts
    let total = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += perlin((x / scale) * frequency, (y / scale) * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }

    return total / maxValue
  }

  function warpedFbm(x: number, y: number, opts: WarpedFbmOptions): number {
    const { warpStrength, ...fbmOpts } = opts
    // Two independent low-frequency Perlin samples define the warp field.
    const warpScale = opts.scale * 2
    const wx = perlin(x / warpScale, y / warpScale) * warpStrength
    const wy = perlin(x / warpScale + 100, y / warpScale + 100) * warpStrength
    return fBm(x + wx, y + wy, fbmOpts)
  }

  return { perlin, fBm, warpedFbm }
}
