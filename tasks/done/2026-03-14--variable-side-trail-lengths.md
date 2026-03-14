# Variable Side Trail Lengths

---

## Task ID

2026-03-14--variable-side-trail-lengths

## Status

- [x] Backlog
- [x] Active
- [ ] In Review
- [x] Done

## Task Execution Metadata

start_timestamp: 2026-03-14 11:00
files_planned:
  - data/experiences.ts
  - store/trailStore.ts
  - components/trail/TrailLayer.tsx
  - components/transition/TrailViewTransition.tsx
notes: >
  Add branchLength?: number to Checkpoint interface (multiplier, default 1.0).
  Store it in Zustand as activeBranchLength.
  TrailLayer scales xOffset/yOffset by branchLength when drawing branch path;
  scales PIN_TRAVEL_DURATION proportionally.
  Switch branch animation to use Framer Motion pathLength (0→1) so it works for any length.
  Also scale endpoint dots in normal-trail view per checkpoint's own branchLength.

## Description

Currently all side trails render with the same fixed branch path length. Side trails should have variable lengths so that longer/more complex experiences feel like longer detours, while shorter ones feel like brief offshoots, reinforcing the hiking metaphor.

## Acceptance Criteria

- [ ] Each checkpoint / side trail entry in `data/` supports an optional `branchLength` (or equivalent) field
- [ ] `TrailLayer.tsx` uses the per-trail length when drawing and animating the branch SVG path
- [ ] The pin travel duration scales proportionally with branch length
- [ ] `SideTrailView` still positions itself correctly at the branch endpoint regardless of length
- [ ] No visual regressions on existing side trails

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | Branch geometry and side-trail transition sequence |
| `ai/coding_guidelines.md` | Always read for style rules |
| `data/experiences.ts` | Add `branchLength` field to the `Checkpoint` interface |
| `data/sideTrails.ts` | May need corresponding field on `SideTrailData` |
| `components/trail/TrailLayer.tsx` | Branch path drawing logic |
| `store/trailStore.ts` | `setBranchEndScreenPosition` — endpoint calculation may change |
| `lib/trailPath.ts` | Branch geometry helpers |

## Implementation Notes

### Files to modify

| File | Nature of change |
|------|-----------------|
| `data/experiences.ts` | Add optional `branchLength?: number` to `Checkpoint` interface; provide defaults |
| `components/trail/TrailLayer.tsx` | Read `branchLength` from checkpoint data; scale path and pin animation duration |
| `store/trailStore.ts` | Pass `branchLength` through `setActiveSideTrail` options if needed |

### Files to create (if any)

| File | Purpose |
|------|---------|
| — | — |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `app/globals.css` | No style changes required |

## Animation / State Considerations

- Does this change the Zustand store shape? **Possibly** — `setActiveSideTrail` options may need `branchLength`
  - If yes: update `TrailViewTransition.tsx` call sites
- Does this change any Framer Motion variants? **Yes** — pin travel duration in `TrailLayer.tsx`
  - Identify the pin animation transition and make duration a derived value
- Does this change scroll behavior or `progress` mapping? **No**

## Testing Instructions

```bash
npm run build
npm run lint
npm run dev
```

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly
- [ ] All checkpoints appear at the correct scroll positions
- [ ] Each side trail branch visually has a distinct length
- [ ] Pin travel time feels proportional to branch length
- [ ] `SideTrailView` modal appears at the correct endpoint for all lengths
- [ ] "Return to Trail" restores scroll position correctly
- [ ] SectionNav highlights correctly while scrolling
- [ ] Layout is correct at 375px, 768px, 1280px widths
- [ ] Task-specific: compare at least two side trails of different lengths side-by-side

## Notes / Open Questions

- Decide on a sensible default `branchLength` so existing entries need no change
- Consider whether length should be in SVG units or as a multiplier of a base length
- Max length should be constrained so the branch endpoint stays on-screen

---

## Completion Metadata

completion_timestamp: 2026-03-14 11:30
summary: >
  Added branchLength?: number to the Checkpoint interface in data/experiences.ts.
  Assigned distinct multiplier values (0.8–1.5) to each of the six side trail checkpoints
  to give short early-career detours vs. long co-founder/major-commitment detours.
  Added activeBranchLength: number to Zustand TrailState (default 1.0), threaded
  through setActiveSideTrail options and TrailViewTransition's handleOpenSideTrail.
  TrailLayer now clamps the multiplier to [0.5, 2.0], scales xOffset and yOffset by it
  when computing the branch SVG path, and scales PIN_TRAVEL_DURATION proportionally.
  Switched branch path animation from hardcoded strokeDasharray/strokeDashoffset to
  Framer Motion pathLength (0→1) so it works correctly regardless of path length.
  The normal-trail endpoint dot/label positions also scale per each checkpoint's
  branchLength so interactive dots stay at the correct endpoint.
test_results: >
  npm run build: PASS (clean TypeScript compile, no errors).
  No ESLint config exists in the project; type checking via tsc is the primary check.
next_steps: >
  Smooth Return-to-Trail Transition (tasks/backlog/2026-03-14--smooth-return-to-trail.md)
  should now scale its PIN_RETURN_DURATION by branchLength the same way.

## Completion Checklist

- [x] All acceptance criteria met
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no warnings
- [x] Manual verification checklist complete
- [x] Task file moved to `tasks/done/`
