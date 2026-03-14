# Smooth Return-to-Trail Transition

---

## Task ID

2026-03-14--smooth-return-to-trail

## Status

- [x] Backlog
- [ ] Active
- [ ] In Review
- [ ] Done

## Description

Currently, clicking "Return to Trail" inside a side trail modal feels like a page refresh: the modal disappears, the trail content immediately snaps in from off-screen, and scroll jumps to the saved position. The return journey should feel like a cinematic reverse of the entry: the modal fades out, the pin travels backward along the branch path to the main trail, the branch retracts, and only then does the main trail slide smoothly back into view.

## Acceptance Criteria

- [ ] Clicking "Return to Trail" triggers a phased reverse animation rather than an immediate swap
- [ ] Phase 1: The side trail modal fades and slides down (existing `gone` variant is fine)
- [ ] Phase 2: The pin animates backward along the branch path (endpoint → junction point on main trail)
- [ ] Phase 3: The branch path retracts/fades after the pin has returned
- [ ] Phase 4: The trail content slides back in only after the pin has reached the junction
- [ ] The full return sequence feels noticeably faster than the entry (entry is ~3.6 s; return target ≤ 2.5 s)
- [ ] Scroll position is still restored correctly when the trail content re-mounts
- [ ] No regressions on the forward entry animation

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | Side-trail transition sequence, store data flow |
| `ai/coding_guidelines.md` | Always read for style rules |
| `store/trailStore.ts` | Owns all side-trail state; needs a new `isReturning` flag and action |
| `components/transition/TrailViewTransition.tsx` | Orchestrates when trail content unmounts/remounts; must delay re-mount until pin returns |
| `components/trail/TrailLayer.tsx` | Owns the pin and branch animations; must play them in reverse during return |
| `components/side-trail/SideTrailView.tsx` | Modal; should begin fading immediately on return initiation |

## Implementation Notes

### New transition phase concept

The core problem is that calling `setActiveSideTrail(null)` currently does everything at once. The fix is to introduce a two-step return: **initiate** (start animations, keep side-trail state alive) then **complete** (clear state, re-mount trail).

Add to `TrailState` in `trailStore.ts`:
```ts
isReturning: boolean   // true while reverse animation is playing
beginReturnToTrail: () => void   // sets isReturning = true; does NOT clear activeSideTrailId
```

The existing `setActiveSideTrail(null)` call becomes the **completion** step, only fired after the reverse animation finishes.

### Proposed return sequence

| t (s) | Event |
|--------|-------|
| 0 | User clicks "Return to Trail" → `store.beginReturnToTrail()` |
| 0 → 0.35 | Modal fades/slides down (existing `gone` variant, no change needed) |
| 0 → 2.2 | Pin travels backward along branch path (endpoint → junction) |
| 0.6 → 2.4 | Branch path retracts (stroke-dashoffset reverse, or fade + scale down) |
| 2.2 | `TrailLayer` fires `onReturnComplete` callback |
| 2.2 → ... | `TrailViewTransition` calls `store.setActiveSideTrail(null)`; trail content re-mounts and slides in |

### Files to modify

| File | Nature of change |
|------|-----------------|
| `store/trailStore.ts` | Add `isReturning: boolean` field and `beginReturnToTrail()` action that sets `isReturning = true`; update `setActiveSideTrail` to reset `isReturning` to `false` on any call |
| `components/trail/TrailLayer.tsx` | Watch `isReturning`; when true, animate `pinBranchProgress` from 1 → 0 (reverse travel); retract/fade the branch `<path>`; call a new `onReturnComplete` prop when reverse animation finishes |
| `components/transition/TrailViewTransition.tsx` | (1) Pass `onReturnComplete` to `TrailLayer` — the callback calls `setActiveSideTrail(null)`. (2) Replace the "Return to Trail" button's `onClick` from `setActiveSideTrail(null)` to `beginReturnToTrail()` (button is in `SideTrailView`, so wire through a prop or read the store action directly). (3) Gate trail content re-mount: only allow when `!activeSideTrailId` (same as today — this naturally follows once `setActiveSideTrail(null)` is delayed) |
| `components/side-trail/SideTrailView.tsx` | Change `onClick` handlers (backdrop + button) from `setActiveSideTrail(null)` to `beginReturnToTrail()`. Disable both while `isReturning` is already true to prevent double-fire |

### Files to create (if any)

| File | Purpose |
|------|---------|
| — | — |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| `lib/trailPath.ts` | No geometry changes needed |
| `data/experiences.ts` | No data changes needed |
| `app/globals.css` | No style changes needed |

## Animation / State Considerations

- Does this change the Zustand store shape? **Yes** — adds `isReturning` and `beginReturnToTrail()`
  - Update every call site that currently calls `setActiveSideTrail(null)` as a "close" action to call `beginReturnToTrail()` instead
- Does this change any Framer Motion variants? **Yes** — `TrailLayer` needs to reverse `pinBranchProgress` (currently only animates 0 → 1); the branch `<path>` needs a retract animation driven by `isReturning`
- Does this change scroll behavior or `progress` mapping? **No** — scroll restore logic in `setScrollContainerRef` is unchanged; it just fires slightly later

## Pin Reverse Animation Detail

`pinBranchProgress` is a Framer Motion spring currently animated to `1` on entry.
On `isReturning`, animate it back to `0`:

```ts
// Inside TrailLayer, existing forward animation (unchanged):
useEffect(() => {
    if (isSideTrailMode && !isReturning) {
        animate(pinBranchProgress, 1, { duration: PIN_TRAVEL_DURATION, delay: PIN_TRAVEL_DELAY, ease: ... })
    }
}, [isSideTrailMode, isReturning])

// New reverse animation:
useEffect(() => {
    if (isReturning) {
        const controls = animate(pinBranchProgress, 0, {
            duration: PIN_RETURN_DURATION,   // e.g. 1.8
            ease: [0.55, 0, 1, 0.45],        // fast-in, slow-out — feels like decelerating back to trail
            onComplete: onReturnComplete,
        })
        return () => controls.stop()
    }
}, [isReturning])
```

## Testing Instructions

```bash
npm run build
npm run lint
npm run dev
```

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly
- [ ] "Side Trail" button still triggers the full forward entry animation correctly
- [ ] Clicking "Return to Trail" (button inside modal) starts the reverse sequence
- [ ] Clicking the backdrop also starts the reverse sequence
- [ ] Modal fades out promptly at t=0
- [ ] Pin visibly travels backward along the branch path
- [ ] Branch path retracts or fades before the trail content returns
- [ ] Trail content slides back in after pin reaches the junction
- [ ] Scroll position is restored to the correct trail position
- [ ] Double-clicking "Return" does not cause animation glitches
- [ ] Full return cycle completes within ~2.5 s
- [ ] SectionNav highlights the correct item after return
- [ ] Layout is correct at 375px, 768px, 1280px, 1440px widths

## Notes / Open Questions

- Decide whether the branch path retracts via stroke-dashoffset reverse (cleanest, mirrors entry) or a simple opacity/scale fade (simpler to implement)
- Consider whether the trail content re-entry direction should match the original blow-off direction (currently it does via `blowDirection`; this should be preserved)
- If "Variable Side Trail Lengths" is implemented first, `PIN_RETURN_DURATION` should scale with `branchLength` just like `PIN_TRAVEL_DURATION`

---

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] Manual verification checklist complete
- [ ] Task file moved to `tasks/done/`
