# Task Template

Copy this file into `tasks/active/` when starting a new task.
Rename it: `YYYY-MM-DD--short-description.md`

---

## Task ID

<!-- e.g. 2026-03-14--add-veeva-side-trail -->

## Status

- [ ] Backlog
- [ ] Active
- [ ] In Review
- [ ] Done

## Description

<!-- 1–3 sentences explaining what needs to change and why. -->

## Acceptance Criteria

<!-- Each item must be verifiable. Use checkboxes. -->

- [ ]
- [ ]
- [ ]

## Relevant Files

<!-- List every file the agent should read before starting. -->

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | If touching animations, state, or scroll |
| `ai/coding_guidelines.md` | Always read for style rules |
| | |

## Implementation Notes

<!-- Optional. Hints, constraints, or context that will help the agent. -->

### Files to modify

| File | Nature of change |
|------|-----------------|
| | |

### Files to create (if any)

| File | Purpose |
|------|---------|
| | |

### Files that must NOT be changed

| File | Reason |
|------|--------|
| | |

## Animation / State Considerations

<!-- Fill in if the task touches Framer Motion or Zustand. -->

- Does this change the Zustand store shape? **Yes / No**
  - If yes: list every component that reads the changed state
- Does this change any Framer Motion variants? **Yes / No**
  - If yes: identify the stagger parent and all variant children
- Does this change scroll behavior or `progress` mapping? **Yes / No**
  - If yes: re-verify `lib/trailPath.ts` keyframes match `TrailLayer.tsx` SVG path

## Testing Instructions

Run these commands after completing the implementation:

```bash
# 1. Type-check and build
npm run build

# 2. Lint
npm run lint

# 3. Start dev server for manual verification
npm run dev
```

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly
- [ ] All checkpoints appear at the correct scroll positions
- [ ] Affected side trail opens and closes correctly
- [ ] Branch animation completes without visual glitches
- [ ] "Return to Trail" restores scroll position correctly
- [ ] SectionNav highlights correctly while scrolling
- [ ] Layout is correct at 375px, 768px, 1280px widths
- [ ] Task-specific: <!-- describe the exact thing to visually verify -->

## Notes / Open Questions

<!-- Document anything uncertain or deferred. -->

---

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] Manual verification checklist complete
- [ ] Task file moved to `tasks/done/`
