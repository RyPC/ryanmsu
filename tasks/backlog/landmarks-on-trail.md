# Landmarks On-Trail Feature

## Task ID

<!-- 2026-03-14--landmarks-on-trail -->

## Status

- [x] Backlog
- [ ] Active
- [ ] In Review
- [ ] Done

## Description

Add a **landmark** concept to the trail — distinct from side trails, landmarks are significant
milestones that sit directly on the trail itself (e.g. UC Irvine). When the scroll marker
approaches a landmark, the orange SVG dot glows with increasing intensity; when close enough
(within a defined scroll-distance threshold) the blurb card snaps open instantly and stays
open until the marker moves out of range, at which point it snaps closed — no fade, purely
binary open/closed. Landmarks also appear in `SectionNav` with distinct styling to signal
they are different from regular checkpoints.

## Acceptance Criteria

- [ ] `isLandmark?: boolean` flag added to `Checkpoint` interface in `data/experiences.ts`.
- [ ] Orange landmark dot rendered on the SVG trail, visually distinct from the default marker
      and side-trail endpoint dots.
- [ ] Dot glow intensity scales continuously with scroll proximity to the landmark (closer =
      brighter/larger glow) — implemented as a Framer Motion `useTransform` on `progress`.
- [ ] Blurb card **snaps open** (no fade-in) when the marker enters a defined proximity
      threshold, and **snaps closed** (no fade-out) when it exits — binary open/closed state.
- [ ] Landmark blurb card is slightly larger/bolder than a standard `Checkpoint` card.
- [ ] Landmarks appear in `SectionNav` with visually distinct styling (e.g. orange accent,
      different icon or weight) to differentiate them from regular checkpoints.
- [ ] No branch path, no pin animation, no modal transition — landmarks are inline only.
- [ ] Existing side-trail checkpoints and `SectionNav` behavior are unaffected.
- [ ] `npm run build` and `npm run lint` pass with no errors.

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | Scroll/animation architecture |
| `ai/coding_guidelines.md` | Style and naming rules |
| `data/experiences.ts` | Add `isLandmark` flag (or new type); defines `Checkpoint` interface |
| `components/trail/TrailLayer.tsx` | Renders SVG trail + endpoint dots; landmark dot goes here |
| `components/trail/TrailEndpointDots.tsx` | Reference for how endpoint dots are rendered on the SVG |
| `components/Checkpoint.tsx` | Existing card component — landmark card should extend or derive from this |
| `hooks/useTrailProgress.ts` | Provides `progress` (0–1) used to drive scroll-proximity visibility |
| `lib/trailPath.ts` | `locationToScrollProgress()` — used to convert landmark position to scroll value |
| `app/globals.css` | CSS custom properties for colors — use `--color-accent` family, not hard-coded hex |

## Implementation Notes

### Design decisions to make before coding

1. **Type extension** — Add `isLandmark?: boolean` to the existing `Checkpoint` interface.
   Avoids touching the `CheckpointType` union; backward-compatible.
2. **Orange color** — Add `--color-landmark` CSS custom property in `globals.css`. Do not
   hard-code hex values anywhere.
3. **Card component** — Prefer a `variant="landmark"` prop on the existing `Checkpoint`
   component over creating a separate file, to reduce duplication. If the sizing/layout
   diverges significantly, extract `LandmarkCard.tsx` under `components/trail/`.
4. **SVG dot + glow** — Render landmark dots directly in `TrailLayer.tsx` (or
   `TrailEndpointDots.tsx`). Drive glow via a Framer Motion `motion.circle` with a
   `filter` / `boxShadow` style fed by `useTransform(progressMotionValue, ...)`.
   The motion value from `useTrailProgress` must be exposed as a Framer Motion
   `MotionValue` (not a plain number) to enable `useTransform`; confirm this is already
   the case or thread it through.
5. **Binary open/closed** — Compute a boolean `isNearLandmark` from the raw `progress`
   value (no spring, no interpolation) and use it as the `animate` key on the blurb card.
   Framer Motion's `initial={false}` on the card prevents the mount animation so the snap
   feels instantaneous. Define a hard threshold constant in `lib/constants.ts` (e.g.
   `LANDMARK_OPEN_THRESHOLD = 0.06`).
6. **SectionNav** — Add a landmark-specific style branch inside `SectionNav.tsx` — orange
   dot/icon, possibly bolder label weight. Keep `SECTION_NAV_WIDTH` unchanged.

### Files to modify

| File | Nature of change |
|------|-----------------|
| `data/experiences.ts` | Add `isLandmark?: boolean` to `Checkpoint` interface; mark relevant entries (e.g. `uc-irvine`) |
| `components/trail/TrailLayer.tsx` or `TrailEndpointDots.tsx` | Render orange glowing dot for landmark checkpoints; drive glow via `useTransform` on progress |
| `components/Checkpoint.tsx` | Accept `variant="landmark"` (or `isLandmark` prop) — larger/bolder layout, binary snap open/closed |
| `components/nav/SectionNav.tsx` | Render landmark items with orange accent and distinct styling |
| `lib/constants.ts` | Add `LANDMARK_OPEN_THRESHOLD` constant (proximity window that triggers open state) |
| `app/globals.css` | Add `--color-landmark` CSS custom property (orange) |

### Files to create (if any)

| File | Purpose |
|------|---------|
| *(none expected — prefer extending existing components)* | |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `store/trailStore.ts` | Landmarks are stateless (no modal/transition); store should not need changes |
| `hooks/useMarkerAnimation.ts` | Branch/pin logic is irrelevant to landmarks |

## Animation / State Considerations

- Does this change the Zustand store shape? **No** — landmarks are purely scroll-driven; no
  Zustand state needed.
- Does this change any Framer Motion variants? **Yes** — two effects:
  1. **Glow** on the SVG dot: a continuous `useTransform` mapping proximity → filter/opacity.
  2. **Snap card**: `animate={isNearLandmark ? "open" : "closed"}` with `initial={false}` so
     the card never fades — just instantly appears/disappears.
- Does this change scroll behavior or `progress` mapping? **No** — reuses existing
  `locationToScrollProgress()` and `useTrailProgress`.

## Testing Instructions

```bash
# 1. Type-check and build
npm run build

# 2. Lint
npm run lint

# 3. Start dev server for manual verification
npm run dev
```

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly (no regression)
- [ ] All 9 existing checkpoints appear at the right scroll positions (no regression)
- [ ] Orange landmark dot appears on the SVG trail at the correct `locationOnTrail`
- [ ] Dot glow visibly intensifies as the scroll marker approaches the landmark
- [ ] Landmark blurb card snaps **open instantly** when marker enters the threshold; no fade-in
- [ ] Landmark blurb card snaps **closed instantly** when marker exits the threshold; no fade-out
- [ ] Landmark card is visually larger/bolder than a standard checkpoint card
- [ ] Landmark appears in `SectionNav` with orange accent / distinct styling
- [ ] No branch animation or modal is triggered for landmarks
- [ ] Existing side-trail transitions and checkpoint cards are unaffected
- [ ] `SectionNav` non-landmark items are unaffected
- [ ] Layout is correct at 375px, 768px, 1280px widths

## Notes / Open Questions

- `LANDMARK_OPEN_THRESHOLD` value needs tuning during implementation — start around `0.06`
  (6% of total scroll height) and adjust based on feel.
- Confirm whether `useTrailProgress` already exposes `progress` as a Framer Motion
  `MotionValue`; if it returns a plain number, a `useMotionValue` + `useEffect` wrapper
  will be needed to feed `useTransform` for the glow effect.
- Consider a subtle pulse animation on the dot even before the threshold (e.g. slow
  scale pulse) to hint that something is ahead — nice-to-have for v2.

---

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] Manual verification checklist complete
- [ ] Task file moved to `tasks/done/`
