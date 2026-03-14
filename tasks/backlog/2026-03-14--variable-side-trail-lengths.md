# Variable Side Trail Lengths

---

## Task ID

2026-03-14--variable-side-trail-lengths

## Status

- [x] Backlog
- [ ] Active
- [ ] In Review
- [ ] Done

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

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] Manual verification checklist complete
- [ ] Task file moved to `tasks/done/`
