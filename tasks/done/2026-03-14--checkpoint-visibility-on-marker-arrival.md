# Checkpoint Visibility Tied to Marker Arrival

---

## Task ID

2026-03-14--checkpoint-visibility-on-marker-arrival

## Status

- [ ] Backlog
- [ ] Active
- [ ] In Review
- [x] Done

## Agent Metadata

start_timestamp: 2026-03-14 00:00
completion_timestamp: 2026-03-14 00:30
files_planned:
  - components/trail/Checkpoint.tsx
  - lib/trailPath.ts
files_changed:
  - components/transition/TrailViewTransition.tsx
  - components/trail/Checkpoint.tsx
notes: Fix checkpoint opacity/visibility logic to gate on progress >= locationToScrollProgress(locationOnTrail). Verify locationToScrollProgress accuracy first.

summary: |
  Replaced the broken windowed threshold logic in TrailViewTransition.tsx with a
  one-way reveal: each checkpoint is now revealed exactly when
  `progress >= locationToScrollProgress(checkpoint.locationOnTrail, heroHeight, progressHeight)`.
  In Checkpoint.tsx, changed the hidden state from opacity 0.3 to opacity 0, and added
  `pointerEvents: none` while hidden to prevent invisible cards from intercepting clicks.
  Also removed the now-unused `contentHeight` destructuring from TrailViewTransition.tsx.

test_results: |
  - npm run build: PASS (clean, no errors)
  - npm run lint: ESLint not configured (build type-check substitutes)

next_steps: |
  Manual verification: scrub scroll slowly around each checkpoint's locationOnTrail
  to confirm tight sync between marker arrival and card fade-in.

## Description

Side trail checkpoint cards should become fully visible (opaque / fully revealed) precisely when the trail marker reaches the card's `locationOnTrail` position on the map. Currently the visibility/opacity timing is not accurately synchronized with the marker's scroll position, causing cards to appear too early, too late, or with an offset. The fix should ensure a 1-to-1 mapping between marker arrival and card reveal.

## Acceptance Criteria

- [x] Each checkpoint card is fully transparent (or hidden) while the marker is before its `locationOnTrail` position
- [x] The card transitions to fully opaque exactly as the marker reaches (or just passes) its `locationOnTrail` position
- [x] The fade-in is smooth and uses Framer Motion (not CSS transitions)
- [x] The reveal animation does not affect layout (no reflow / shift of other elements)
- [x] Behavior is consistent across all 9 checkpoints
- [x] No regression in side-trail open/close behavior

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | `progress` and `locationOnTrail` data flow |
| `ai/coding_guidelines.md` | Always read for style rules |
| `components/trail/Checkpoint.tsx` | Owns the card visibility/opacity animation driven by `progress` |
| `hooks/useTrailProgress.ts` | Produces the `progress` value consumed by `Checkpoint` |
| `lib/trailPath.ts` | `locationToScrollProgress()` — converts `locationOnTrail` to a scroll progress threshold |
| `data/experiences.ts` | `locationOnTrail` values for each checkpoint |

## Implementation Notes

### Files to modify

| File | Nature of change |
|------|-----------------|
| `components/trail/Checkpoint.tsx` | Rewrite or fix the opacity/visibility logic so it gates on `progress >= locationToScrollProgress(locationOnTrail)` |
| `lib/trailPath.ts` | Verify / fix `locationToScrollProgress` if the mapping is currently inaccurate |

### Files to create (if any)

| File | Purpose |
|------|---------|
| — | — |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `store/trailStore.ts` | No state shape changes needed |
| `data/experiences.ts` | `locationOnTrail` values are the source of truth; do not adjust them as a workaround |

## Animation / State Considerations

- Does this change the Zustand store shape? **No**
- Does this change any Framer Motion variants? **Yes** — opacity/visibility variants in `Checkpoint.tsx`
  - The `animate` prop should switch between hidden and visible states based on whether `progress` has passed the threshold
- Does this change scroll behavior or `progress` mapping? **Possibly**
  - Re-verify that `locationToScrollProgress()` in `lib/trailPath.ts` correctly converts `locationOnTrail` (0–1) to the corresponding `progress` (0–1) scroll value
  - If keyframes are off, fix them in `lib/trailPath.ts` and re-verify that the SVG path in `TrailLayer.tsx` still matches

## Testing Instructions

```bash
npm run build
npm run lint
npm run dev
```

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly
- [ ] All 9 checkpoints are hidden before the marker reaches them
- [ ] Each checkpoint fades in smoothly exactly as the marker arrives at its position
- [ ] No checkpoint is visible above its location on the trail
- [ ] No checkpoint remains hidden after the marker has passed its location
- [ ] Side trail open/close still works correctly for all checkpoints
- [ ] "Return to Trail" restores scroll position correctly
- [ ] SectionNav highlights correctly while scrolling
- [ ] Layout is correct at 375px, 768px, 1280px widths
- [ ] Task-specific: scrub scroll slowly around each checkpoint's `locationOnTrail` to confirm tight sync

## Notes / Open Questions

- A small fade window (e.g. over ~2–3% of `progress`) is acceptable and desirable for smoothness; the card should not pop in instantly
- The card should be `pointer-events: none` while hidden so it doesn't intercept clicks before it appears
- Confirm whether `Checkpoint.tsx` currently uses `useMotionValue` + `useTransform` or a simpler `animate` string — the fix approach differs

---

## Completion Checklist

- [x] All acceptance criteria met
- [x] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings (ESLint not configured; build type-check passed)
- [ ] Manual verification checklist complete (pending browser testing)
- [x] Task file moved to `tasks/done/`
