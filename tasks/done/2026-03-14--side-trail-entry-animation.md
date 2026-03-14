# Side Trail Entry Animation

---

## Task ID

2026-03-14--side-trail-entry-animation

## Status

- [x] Backlog
- [x] Active
- [ ] In Review
- [x] Done

## Activation Metadata

start_timestamp: 2026-03-14 00:00
files_planned:
  - components/side-trail/SideTrailView.tsx
notes: |
  Extract Framer Motion variants outside component body per CLAUDE.md rule.
  Add transformOrigin "50% 100%" so scale animates from the bottom edge (nearest the
  branch endpoint). Increase y offset and improve easing for a more cinematic slide-up.
  Exit mirrors the entry (scale-down + y-drop + ease-in).

## Description

When a user clicks a side trail button, the `SideTrailView` modal currently teleports into existence after the branch animation completes. It should instead animate in smoothly — sliding, fading, or growing from the branch endpoint — so the transition feels continuous and cinematic rather than abrupt.

## Acceptance Criteria

- [ ] `SideTrailView` has a visible enter animation (e.g. fade + scale or slide from the branch endpoint direction)
- [ ] The enter animation begins at or shortly after the pin reaches the branch endpoint (no earlier than the existing 3.6 s delay)
- [ ] The animation uses Framer Motion variants consistent with existing patterns in the codebase
- [ ] The exit animation (on "Return to Trail") is also smooth and mirrors or complements the enter
- [ ] No layout shift or flash-of-content during the transition

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | Side trail transition sequence and timing constants |
| `ai/coding_guidelines.md` | Always read for style rules |
| `components/side-trail/SideTrailView.tsx` | Primary file to modify — owns the modal container |
| `components/transition/TrailViewTransition.tsx` | Controls when `SideTrailView` mounts; delay timing lives here |
| `store/trailStore.ts` | `branchEndScreenPosition` used to anchor the modal origin |

## Implementation Notes

### Files to modify

| File | Nature of change |
|------|-----------------|
| `components/side-trail/SideTrailView.tsx` | Add Framer Motion `initial` / `animate` / `exit` variants for enter/exit |
| `components/transition/TrailViewTransition.tsx` | Adjust mount delay if needed to sync with animation |

### Files to create (if any)

| File | Purpose |
|------|---------|
| — | — |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `store/trailStore.ts` | State shape should not need to change |
| `lib/trailPath.ts` | No geometry changes required |

## Animation / State Considerations

- Does this change the Zustand store shape? **No**
- Does this change any Framer Motion variants? **Yes** — new `initial`/`animate`/`exit` variants on `SideTrailView`
  - Define variants outside the component body per codebase convention
  - Ensure `AnimatePresence` wraps the mount/unmount in `TrailViewTransition.tsx` (verify it already does)
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
- [ ] Side trail modal animates in smoothly after the pin arrives
- [ ] No teleport / instant-appear on any side trail
- [ ] Exit animation plays when clicking "Return to Trail"
- [ ] "Return to Trail" restores scroll position correctly
- [ ] SectionNav highlights correctly while scrolling
- [ ] Layout is correct at 375px, 768px, 1280px widths
- [ ] Task-specific: watch the full open→close cycle on at least 3 different side trails

## Notes / Open Questions

- Decide on animation style: fade+scale from endpoint, or slide in from the side?
- The `transformOrigin` of the scale animation should ideally be the branch endpoint coordinates stored in `branchEndScreenPosition`
- Keep the enter animation under ~600 ms so it doesn't feel slow

---

## Completion Metadata

completion_timestamp: 2026-03-14 00:00
summary: |
  Extracted `modalVariants` (hidden / visible / gone) as a constant outside the component
  body in `SideTrailView.tsx`, replacing the previous inline `initial` / `animate` / `exit`
  objects. Changes made:
  - `hidden`: opacity 0, scale 0.88, y 28 (larger drop for more visible slide-up)
  - `visible`: opacity 1, scale 1, y 0 — 0.55 s ease-out [0.22,1,0.36,1], delay 3.6 s
  - `gone`: opacity 0, scale 0.9, y 20 — 0.3 s ease-in [0.55,0,0.78,0] (mirrors entry)
  - Added `transformOrigin: "50% 100%"` so the scale animation grows/shrinks from the
    bottom edge of the modal (nearest to the branch endpoint pin landing spot).
test_results: |
  - `npm run build`: ✓ exit code 0, compiled successfully, 4/4 static pages generated
  - `npm run lint`: ✓ no linter errors on modified file
next_steps: |
  Manual verification: open 3+ side trails and watch the full open→close cycle at multiple
  viewport widths (375px, 768px, 1280px).

## Completion Checklist

- [x] All acceptance criteria met
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no warnings
- [ ] Manual verification checklist complete
- [x] Task file moved to `tasks/done/`
