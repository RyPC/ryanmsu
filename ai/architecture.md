# Architecture Reference — `ryanmsu`

Deep-dive reference for AI agents. Read this when working on anything involving animations,
state, scroll behavior, or layout.

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 14.2.x |
| UI library | React | 18.2 |
| Language | TypeScript (strict) | 5.6 |
| Styling | Tailwind CSS | 3.4 |
| Animations | Framer Motion | 11.x |
| State | Zustand | 5.x |
| Font | DM Sans (Google Fonts, next/font) | — |

---

## Route Structure

There is exactly **one route**: `/` (app/page.tsx).

The entire application lives inside `<TrailViewTransition />`. There is no router-level
navigation — all "navigation" is scroll-based or modal-based.

---

## Component Hierarchy

```
app/layout.tsx
└── app/page.tsx
    └── TrailViewTransition        (client, orchestrator)
        ├── SectionNav             (client, fixed left sidebar)
        ├── ProgressIndicator      (client, fixed top-right HUD)
        │
        ├── [trail view — AnimatePresence]
        │   ├── TrailheadHero      (client, hero intro, scroll cue)
        │   ├── TrailheadSection   (client, "about me" trailhead card)
        │   ├── TrailLayer         (client, SVG trail + marker + branches)
        │   └── Checkpoint ×9      (client, experience/project/education cards)
        │
        └── [side-trail view — AnimatePresence]
            └── SideTrailView      (client, modal container)
                └── SideTrailContent  (client, text/list/code renderer)
```

---

## Scroll Architecture

The scroll container is **not `window`** — it is a `div` inside `TrailViewTransition`
referenced by `scrollContainerRef`. This is critical: all `scrollTop` reads must use
this ref, not `window.scrollY`.

```
scrollContainerRef.current
  ├── <TrailheadHero />       height = 100vh (heroHeight)
  └── <trail content area>    height = progressHeight (computed by lib/trailPath.ts)
        ├── TrailLayer (sticky, fills viewport)
        └── Checkpoint cards (absolute, positioned by locationOnTrail)
```

`progressHeight` is calculated by `getTrailMetricsFromExperiences()`:

```
max(2800, 1800 + (stops × 250) + (sideTrails × 200))   [pixels]
```

With 9 checkpoints and 6 side trails: `max(2800, 1800 + 2250 + 1200) = 5250px`

---

## Zustand Store Shape

```typescript
interface TrailState {
  activeSideTrailId: string | null
  branchProgress: number | null                 // trail-space progress (0–1) at branch point
  clickedSide: 'left' | 'right' | null          // which side the checkpoint was on
  selectedEndpoint: {
    xOffset?: number                     // SVG units from trail center
    yOffset?: number                     // SVG units from branch point
  } | null
  activeBranchLength: number                    // multiplier for branch animation length
  branchEndScreenPosition: { x: number; y: number } | null  // px, for modal placement
  returnScrollProgress: number | null    // restores scroll on return
  isReturning: boolean                   // set during return animation

  // Actions
  setActiveSideTrail: (
    id: string | null,
    options?: {
      branchProgress?: number
      returnScrollProgress?: number
      side?: 'left' | 'right'
      checkpointId?: string
      endpoint?: { xOffset?: number; yOffset?: number }
      branchLength?: number
    }
  ) => void
  beginReturnToTrail: () => void
  setBranchEndScreenPosition: (pos: { x: number; y: number } | null) => void
}
```

**Warning:** `branchEndScreenPosition` is written by `TrailLayer` and read by
`SideTrailView`. It is set asynchronously after the branch animation completes, so the
modal entrance is timed to occur after pin arrival.

---

## SVG Trail System

### Path definition (in `TrailLayer.tsx`)

```svg
M 200 0
C 200 0   320 400   180 800
C 80 1200  200 1600  80 2000
C 200 2400 320 2800  200 3200
C 80 3600  200 4000  200 4000
```

- Total height: 4000 SVG units
- X oscillates between ~80 and ~320 (center ≈ 200)
- ViewBox width: 400 units

### ViewBox scrolling

`viewYSpring` is a Framer Motion spring value:

```
viewY = progress × (TRAIL_CONTENT_HEIGHT - VIEW_WINDOW_HEIGHT)
      = progress × (4000 - 1400)
      = progress × 2600
```

ViewBox: `0 {viewY} 400 1400`

### Branch path

When `activeSideTrailId` is set:
1. Compute branch start: `(trailX, trailY)` at `branchProgress` on the SVG path
2. Compute endpoint: offset from branch start by `selectedEndpoint.{xOffset, yOffset}`
3. Draw a quadratic Bezier from start → midpoint → endpoint
4. Animate a purple circle pin along the path using `offsetDistance`
5. Call `getBoundingClientRect()` on the SVG to convert endpoint SVG units → screen px
6. Write result to `trailStore.setBranchEndScreenPosition(pos)`

### X position interpolation (`lib/trailPath.ts`)

```typescript
// Keyframes matching the SVG path control points
const keyframes = [
  { t: 0.0,  x: 200 },
  { t: 0.15, x: 250 },
  { t: 0.3,  x: 150 },
  { t: 0.5,  x: 200 },
  { t: 0.7,  x: 270 },
  { t: 0.85, x: 160 },
  { t: 1.0,  x: 200 },
]
```

These must stay synchronized with the SVG path. If the path changes, update these.

---

## Blow-Off Transition System

When a side trail is activated, `TrailViewTransition` runs a choreographed exit:

```
blowOffContainer  →  stagger parent
  blowOffTrailArea  →  the SVG trail (slides left or right 120vw)
  blowOffItem ×N    →  each Checkpoint (staggers, 15deg rotation, slides off)
```

Direction is determined by `clickedSide` in the store:
- `'left'` checkpoint clicked → trail area and items blow off to the left (`x: -120vw`)
- `'right'` checkpoint clicked → blow off to the right (`x: 120vw`)

Return animation: items re-enter from the opposite direction using the same variants
with `initial` set to the off-screen position.

---

## Color System

All colors are defined as CSS custom properties in `app/globals.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg` | `#faf9f7` | Page background |
| `--color-text` | `#1a1a1a` | Primary text |
| `--color-text-muted` | `#6b6b6b` | Secondary text |
| `--color-accent` | `#7c3aed` | Trail marker, buttons, active states |
| `--color-trail-early` | `#2d5016` | Early trail segment color |
| `--color-trail-mid` | `#5a4a2a` | Mid trail segment color |
| `--color-trail-late` | `#2c5282` | Late trail segment color |

Tailwind `theme.extend.fontFamily.sans` references `var(--font-dm-sans)` which is set by
`next/font/google` in `app/layout.tsx`.

---

## Known Technical Debt

| Item | Location | Impact |
|------|----------|--------|
| Stale `dist/` directory | repo root | None (gitignored) |
| Empty `src/` directory | repo root | None |
| No automated tests | — | Manual verification required for all changes |
| No CI/CD | — | Deploy manually |
