L1:# Hover Preview Reset And Marker Start Sync
L2:
L3:## Task ID
L4:
L5:2026-03-15--hover-preview-reset-and-marker-start-sync
L6:
L7:## Status
L8:
L9:- [ ] Backlog
L10:- [x] Active
L11:- [ ] In Review
L12:- [ ] Done
L13:
L14:## Description
L15:
L16:Address two UX bugs in the trail flow. First, clear the side-trail hover preview state after entering and returning from a side trail so stale `hoveredInfo` is not still visible. Second, fix the marker's initial position/progress sync so it starts on the trail, follows scroll immediately from the top, and returns all the way to the top when scrolling back up.
L17:
L18:## Acceptance Criteria
L19:
L20:- [ ] Hovering a side trail shows the preview modal as expected.
L21:- [ ] Clicking the hovered side trail enters the side-trail view correctly.
L22:- [ ] After returning to the trail, no stale hover preview remains visible (`hoveredInfo` is cleared).
L23:- [ ] On initial page load at the top, the marker is visually aligned with the trail path.
L24:- [ ] From the top of the page, the marker begins moving smoothly with the very first scroll movement (no initial freeze then jump).
L25:- [ ] Scrolling back to the top returns the marker fully to its initial top position (no halfway stop).
L26:
L27:## Relevant Files
L28:
L29:| File                                            | Why it's relevant                                                      |
L30:| ----------------------------------------------- | ---------------------------------------------------------------------- |
L31:| `CLAUDE.md`                                     | Always read first                                                      |
L32:| `components/transition/TrailViewTransition.tsx` | Likely location of hover preview state (`hoveredInfo`) and return flow |
L33:| `hooks/useMarkerAnimation.ts`                   | Marker position and animation progression logic                        |
L34:| `components/trail/TrailLayer.tsx`               | Marker rendering and trail coordinate mapping                          |
L35:| `store/trailStore.ts`                           | Shared side-trail transition state and reset behavior                  |
L36:
L37:## Implementation Notes
L38:
L39:### Files to modify
L40:
L41:| File                                            | Nature of change                                           |
L42:| ----------------------------------------------- | ---------------------------------------------------------- |
L43:| `components/transition/TrailViewTransition.tsx` | Reset hover preview state at appropriate transition points |
L44:| `hooks/useMarkerAnimation.ts`                   | Fix initial marker position/progress synchronization       |
L45:| `components/trail/TrailLayer.tsx`               | Adjust marker alignment if path/screen mapping is offset   |
L46:| `store/trailStore.ts`                           | Only if needed for explicit reset action                   |
L47:
L48:### Files to create (if any)
L49:
L50:| File | Purpose |
L51:| ---- | ------- |
L52:|      |         |
L53:
L54:### Files that must NOT be changed
L55:
L56:| File                | Reason                                        |
L57:| ------------------- | --------------------------------------------- |
L58:| `data/topoPaths.ts` | Auto-generated file; unrelated to this bugfix |
L59:
L60:## Animation / State Considerations
L61:
L62:- Does this change the Zustand store shape? **No** (prefer behavior fix without state shape change)
L63:- Does this change any Framer Motion variants? **Possibly**
L64:    - If yes: verify entrance/exit timing still matches branch + pin flow
L65:- Does this change scroll behavior or `progress` mapping? **Yes**
L66:    - Re-verify marker movement continuity from top to bottom and back
L67:
L68:## Testing Instructions
L69:
L70:Run these commands after completing the implementation:
L71:
L72:```bash
L73:# 1. Type-check and build
L74:npm run build
L75:
L76:# 2. Lint
L77:npm run lint
L78:
L79:# 3. Start dev server for manual verification
L80:npm run dev
L81:```
L82:
L83:### Manual verification checklist
L84:
L85:- [ ] Scroll smoothly from hero to summit; marker tracks correctly
L86:- [ ] Affected side trail opens and closes correctly
L87:- [ ] "Return to Trail" restores scroll position correctly
L88:- [ ] Task-specific: after returning from a side trail, hover preview is cleared
L89:- [ ] Task-specific: marker is aligned at initial load and tracks immediately when scrolling from top
L90:- [ ] Task-specific: marker fully returns to top when scrolling back up
L91:
L92:## Notes / Open Questions
L93:
L94:- Confirm whether hover preview should be cleared only on side-trail entry/return, or on any hover-leave event as well.
L95:
L96:---
L97:
L98:## Completion Checklist
L99:
L100:- [ ] All acceptance criteria met
L101:- [ ] `npm run build` passes with no errors
L102:- [ ] `npm run lint` passes with no warnings
L103:- [ ] Manual verification checklist complete
L104:
