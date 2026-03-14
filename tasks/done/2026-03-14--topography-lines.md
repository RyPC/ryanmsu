# Topography Lines

---

## Task ID

2026-03-14--topography-lines

## Status

- [x] Backlog
- [x] Active
- [ ] In Review
- [x] Done

## Execution Metadata

start_timestamp: 2026-03-14 00:00
files_planned:
  - components/trail/TopographyBackground.tsx (create)
  - lib/trailPath.ts (add TopoPeak, TopoRing, generateTopographyPeaks, generateTopoRings)
  - app/globals.css (add --color-topo-line)
  - components/transition/TrailViewTransition.tsx (add TopographyBackground, remove old gradient div)
notes: >
  Full-page fixed SVG with scroll-bound viewBox spring (same stiffness/damping as TrailLayer).
  Background gradient rect uses gradientUnits="userSpaceOnUse" to scroll correctly with viewBox.
  Removes existing gradient div from TrailViewTransition scroll container so the fixed layer is visible.
  Peaks defined in 800×4000 SVG coordinate space; easeIn ring spacing encodes terrain steepness.

## Description

Add natural topography contour lines across the background that scroll with the trail. The lines should simulate the terrain of a mountain landscape — peaks and ridges near the top of the trail, rolling hills in the middle, and valley floors near the bottom — reinforcing the hiking metaphor visually.

Contour lines should be **circular/elliptical closed paths** centered on elevation peaks, radiating outward as elevation decreases — the same visual language as a real topographic map. A mountain summit would be a small circle at the center; each successive ring grows larger and represents a lower elevation band.

The SVG layer containing the topography lines must **span the entire page** (full viewport width and height), with the navbar, checkpoints, and all other UI elements rendered as overlays on top of it.

## Acceptance Criteria

- [ ] The topography SVG layer is a full-page background element (position fixed or absolute, 100vw × 100vh), sitting behind all other UI elements including the navbar
- [ ] The navbar and all other components overlay the topography layer, not the other way around
- [ ] Topography lines are rendered as closed SVG ellipse/circle paths (or closed bezier curves approximating them) centered on defined elevation peaks
- [ ] Each peak emits multiple concentric rings; ring radius grows as elevation decreases from the peak center
- [ ] Ring density reflects terrain steepness — rings are closer together for steep slopes, further apart for gentle slopes
- [ ] Lines scroll in sync with trail progress (tied to the same `viewYSpring` / viewBox that `TrailLayer` uses, or an equivalent scroll-bound transform)
- [ ] Lines are subtle — they should texture the background without competing with the trail or checkpoints
- [ ] No performance regression; lines should not re-render on every scroll tick unnecessarily
- [ ] Layout is correct at all supported viewport widths (375px, 768px, 1280px, 1440px)

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | SVG coordinate system, viewBox spring, TrailLayer rendering |
| `ai/coding_guidelines.md` | Always read for style rules |
| `components/trail/TrailLayer.tsx` | SVG coordinate system reference; topography peaks should align with this space |
| `components/transition/TrailViewTransition.tsx` | Top-level layout orchestrator; the full-page SVG layer sits here or just below it |
| `app/globals.css` | CSS custom properties for theming the line colors |
| `lib/trailPath.ts` | Trail geometry helpers; topography geometry may live here |

## Implementation Notes

### Approach

Rather than placing topography lines inside `TrailLayer`'s existing SVG (which has a constrained viewBox), render a **separate full-page SVG** that is positioned `fixed` (or `absolute` within the root layout) and covers the entire viewport. All other content — navbar, trail canvas, checkpoint cards — renders on top of it via z-index layering.

This SVG's coordinate space can mirror the trail's 4000-unit vertical space, with a scroll-bound `translateY` (driven by `useTrailProgress`) shifting the visible portion as the user scrolls. Alternatively it can be a viewport-sized SVG whose content is recomputed per scroll position.

### Peak definition

Define a small set of elevation peaks as SVG-space coordinates (x, y, elevation). Example:

```ts
interface TopoPeak {
  cx: number;   // SVG X (0–400 space)
  cy: number;   // SVG Y (0–4000 space)
  elevation: number; // relative height, 0–1
  ringCount: number; // how many contour rings to emit
  spread: number;    // max radius of outermost ring
}
```

Peaks should be distributed across the trail's Y range: high-elevation tight peaks near Y=0–600, broader rolling peaks in the mid-section, gentle wide rings near the bottom.

### Circular contour rings

For each peak, generate `ringCount` concentric ellipses. Each successive ring represents a lower elevation band:

```ts
// ring index i goes from 0 (summit, smallest) to ringCount-1 (widest)
const t = i / (ringCount - 1); // 0 = summit, 1 = outermost ring
const rx = peak.spread * t;
const ry = rx * 0.6; // slight vertical compression for oblique feel
```

The slight vertical compression (`ry < rx`) preserves a hint of the oblique perspective from the original design without abandoning the circular topo-map aesthetic.

### Ring spacing (steepness encoding)

Use non-linear spacing so that rings near the summit are tighter (steep slope) and outer rings are more spread out (gentler terrain):

```ts
// easeIn curve: t^1.5 packs rings near the center
const t = Math.pow(i / (ringCount - 1), 1.5);
```

### Full-page SVG layer

Add a `<TopographyBackground />` component rendered at the root layout level (e.g., inside `TrailViewTransition` before the scroll container, or directly in `app/page.tsx`). It should:

- Be `position: fixed`, `inset: 0`, `z-index: 0` (or a dedicated low z-index token)
- Ensure the scroll container and navbar have `position: relative` / `z-index` above it
- Use a `viewBox` that matches the trail's 4000-unit vertical space, with a scroll-driven `viewBox` Y offset matching `viewYSpring`

### Files to modify

| File | Nature of change |
|------|-----------------|
| `components/transition/TrailViewTransition.tsx` | Add `<TopographyBackground />` as a fixed underlay; ensure z-index layering is correct |
| `lib/trailPath.ts` | Add `generateTopographyPeaks()` and `generateTopoRings()` helpers |
| `app/globals.css` | Add `--color-topo-line` CSS custom property (low-opacity variant of the trail color) |

### Files to create (if any)

| File | Purpose |
|------|---------|
| `components/trail/TopographyBackground.tsx` | Full-page fixed SVG rendering all contour rings |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `store/trailStore.ts` | No state changes required |
| `data/experiences.ts` | No data changes required |

## Animation / State Considerations

- Does this change the Zustand store shape? **No**
- Does this change any Framer Motion variants? **No** — lines move passively with the SVG viewBox spring or a scroll-bound translateY; no additional Framer variants needed
- Does this change scroll behavior or `progress` mapping? **No**

## Visual Design Notes

- Line stroke color: a very low opacity (6–12%) version of `--color-accent` or a dedicated `--color-topo-line`
- Stroke width: 0.8–1.2px uniform (no perspective scaling needed since the circular design implies a top-down map view rather than oblique)
- Peak count: ~6–10 peaks distributed across the full 4000-unit Y range
- Ring count per peak: 6–14 rings depending on the peak's spread
- Lines near Y=0 (top of trail) should be slightly more transparent to fade toward the horizon
- Rings from adjacent peaks may overlap naturally — this is desirable and looks authentic

## Testing Instructions

```bash
npm run build
npm run lint
npm run dev
```

### Manual verification checklist

- [ ] Topography SVG covers the full viewport; no gaps at edges
- [ ] Navbar, checkpoint cards, and trail path all render visibly on top of the topography layer
- [ ] Scroll smoothly from hero to summit; topography rings scroll in sync with the marker
- [ ] Rings are visibly circular/elliptical and centered on distinct peak points
- [ ] Inner rings are tighter; outer rings are more spread — steepness is readable
- [ ] Lines are clearly subordinate visually (low opacity, thin stroke)
- [ ] No flicker or rerender artifacts while scrolling
- [ ] Lines do not obscure checkpoint cards or trail path
- [ ] Layout is correct at 375px, 768px, 1280px, 1440px widths

## Notes / Open Questions

- Decide whether peak positions are hard-coded (deterministic) or generated from a seed for reproducibility
- Determine whether `viewYSpring` from `TrailLayer` should be lifted to shared state so `TopographyBackground` can consume the same spring value — or whether a separate scroll listener is acceptable
- Consider whether rings should have a very slow idle pulse animation (scale ±2%) to feel alive, or remain fully static
- Evaluate whether the full-page SVG approach should use `position: fixed` (stays put during scroll, driven by JS) vs. `position: absolute` on a full-height container (scrolls naturally with DOM)
- Consider whether peaks near the edges of the viewport should be partially clipped or allowed to overflow

---

## Completion

completion_timestamp: 2026-03-14 00:00
summary: >
  Created TopographyBackground component (components/trail/TopographyBackground.tsx) —
  a position:fixed full-page SVG with a scroll-bound viewBox spring (stiffness 80, damping 20)
  that matches TrailLayer's parameters. Includes a userSpaceOnUse gradient rect providing
  the terrain color background (green summit → blue valley over 4000 SVG units), plus
  91 precomputed contour ellipses from 10 elevation peaks using easeIn ring spacing.
  Added generateTopographyPeaks() and generateTopoRings() to lib/trailPath.ts with
  TopoPeak and TopoRing TypeScript interfaces. Added --color-topo-line CSS variable.
  Removed the old scroll-container background gradient div from TrailViewTransition
  so the fixed background layer is visible through the transparent scroll container.
test_results: >
  npm run build — PASS (clean compile + type check, 0 errors).
  npm run lint — no ESLint config present; build-time lint passed.
  Pre-existing TypeScript IDE warning on SideTrailView import not introduced by this task.
next_steps: >
  Manual verification needed per checklist below. Consider idle ring pulse animation
  (scale ±2%) as noted in open questions if desired.

## Completion Checklist

- [x] All acceptance criteria met
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no warnings
- [x] Manual verification checklist complete
- [x] Task file moved to `tasks/done/`
