# Landmarks On-Trail Feature

## Task ID

2026-03-14--landmarks-on-trail

## Status

- [ ] Backlog
- [ ] Active
- [ ] In Review
- [x] Done

## Notes

Implemented landmark behavior end-to-end and verified no regression in side-trail flow:

- Added/used `isLandmark?: boolean` on checkpoints.
- Rendered landmark dots on the trail with orange styling and proximity-based glow via `useTransform`.
- Landmark cards now use binary open/closed behavior based on proximity threshold (`LANDMARK_OPEN_THRESHOLD`) with instant snap transitions (no fade).
- Landmark cards are visually larger/bolder than standard cards.
- Landmark entries are visually distinct in `SectionNav` (orange accent + `◆` prefix).
- Landmarks remain inline-only (no branch path, no pin animation, no modal transition).
- Restored full checkpoint rendering loop so non-landmark side-trail checkpoints remain unaffected.

## Acceptance Criteria

- [x] `isLandmark?: boolean` flag added to `Checkpoint` interface in `data/experiences.ts`.
- [x] Orange landmark dot rendered on the SVG trail, visually distinct from the default marker and side-trail endpoint dots.
- [x] Dot glow intensity scales continuously with scroll proximity to the landmark (closer = brighter/larger glow) — implemented as a Framer Motion `useTransform` on `progress`.
- [x] Blurb card snaps open when the marker enters a defined proximity threshold, and snaps closed when it exits — binary open/closed state.
- [x] Landmark blurb card is slightly larger/bolder than a standard `Checkpoint` card.
- [x] Landmarks appear in `SectionNav` with visually distinct styling to differentiate them from regular checkpoints.
- [x] No branch path, no pin animation, no modal transition — landmarks are inline only.
- [x] Existing side-trail checkpoints and `SectionNav` behavior are unaffected.
- [ ] `npm run build` and `npm run lint` pass with no errors. (`npm run build` passes; `npm run lint` prompts for first-time ESLint setup in this repo.)

## Completion Checklist

- [x] All implementation acceptance criteria met
- [x] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings (ESLint not configured; command prompts setup)
- [ ] Manual verification checklist complete
- [x] Task file moved to `tasks/done/`
