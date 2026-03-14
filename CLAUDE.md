# CLAUDE.md — AI Agent Guide for `ryanmsu`

This file is the primary reference for any AI coding agent working on this repository.
Read it in full before touching any code.

---

## Project Overview

**Ryan Su's personal portfolio website** — a single-page Next.js 14 application themed around
a hiking trail metaphor. The user scrolls through a sinuous SVG trail; their position drives
every animation. "Checkpoints" (experience/project/education cards) flank the trail.
Clicking a checkpoint's side-trail button triggers a full cinematic transition: the trail
"blows off" screen, a branch path animates, a pin travels to an endpoint, and a detail modal
appears. Returning to the trail restores the exact scroll position.

**Live stack:** Next.js 14 (App Router) · React 18 · TypeScript 5 · Tailwind CSS 3 ·
Framer Motion 11 · Zustand 5

---

## Architecture Summary

```
app/
  layout.tsx              Root layout — Google font (DM Sans), metadata, globals.css
  page.tsx                Single route; renders <TrailViewTransition />
  globals.css             Tailwind directives + CSS custom properties (colors, font var)

components/
  transition/
    TrailViewTransition.tsx   TOP-LEVEL ORCHESTRATOR — owns the scroll container,
                               switches between trail view and side-trail view,
                               drives the blow-off animation system
  trail/
    TrailLayer.tsx            SVG trail path + animated marker + branch path rendering
    TrailheadHero.tsx         Full-screen hero section (name, subtitle, scroll indicator)
    Checkpoint.tsx            Individual experience/project/education card
    ProgressIndicator.tsx     Fixed HUD (miles, elevation, projects, techs stats)
    TrailMarker.tsx           Unused legacy marker component — do not delete, not used
  nav/
    SectionNav.tsx            Fixed left sidebar; links scroll to checkpoints;
                               exports SECTION_NAV_WIDTH = 180
  side-trail/
    SideTrailView.tsx         Modal container for a side trail detail panel
    SideTrailContent.tsx      Content renderer inside the modal (text/list/code sections)

data/
  experiences.ts            Array of Checkpoint objects; defines the Checkpoint interface
  sideTrails.ts             Record<string, SideTrailData>; defines SideTrailContent interface

hooks/
  useTrailProgress.ts       Scroll listener → { progress: 0–1, heroReveal: 0–1 }

lib/
  trailPath.ts              Pure geometry helpers — trail X positions, scroll height math

store/
  trailStore.ts             Zustand store — all shared state (active side trail,
                             branch position, return scroll, blow-off direction)
```

### Data Flow

```
User scrolls
  └─▶ useTrailProgress  ──▶  progress (0–1)
                                ├─▶ TrailLayer  (marker Y position, viewBox spring)
                                ├─▶ Checkpoint  (fade visibility)
                                └─▶ ProgressIndicator (HUD stats)

User clicks "Side Trail" on a Checkpoint
  └─▶ trailStore.setActiveSideTrail(id, options)
        ├─▶ TrailViewTransition detects activeSideTrailId ≠ null
        │     └─▶ runs blowOff animation, mounts SideTrailView
        └─▶ TrailLayer detects activeSideTrailId
              └─▶ draws branch path, animates pin to endpoint
                    └─▶ trailStore.setBranchEndScreenPosition(pos)
                          └─▶ SideTrailView positions itself at screen coords

User clicks "Return to Trail"
  └─▶ trailStore.setActiveSideTrail(null)
        └─▶ TrailViewTransition restores scroll to returnScrollProgress
```

---

## Development Environment

> **Prerequisite:** Node.js ≥ 18, npm ≥ 9

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview the production build
npm start

# Lint the codebase
npm run lint
```

There are no environment variables. No `.env` file is needed.
There is no database, no backend API, and no authentication layer.

---

## Coding Rules for Agents

1. **Read before writing.** Read every file you plan to touch before modifying it.
2. **Follow existing patterns first.** This codebase has strong conventions — trail metaphor
   naming, Framer Motion variant objects, Zustand actions — do not introduce new patterns
   unless explicitly asked.
3. **Minimal diffs.** Make the smallest change that satisfies the requirement. Do not
   restructure unrelated code.
4. **Do not introduce new dependencies** without explicit approval. Every package must earn
   its place; the dependency list is intentionally lean.
5. **TypeScript strict mode is on.** All types must be explicit. Do not use `any`.
6. **Tailwind-first styling.** Use Tailwind utility classes for layout/spacing/typography.
   Use CSS custom properties (`var(--color-accent)`, etc.) for theme colors — do not
   hard-code hex values.
7. **Framer Motion for all animations.** Do not use CSS transitions or `@keyframes` for
   interactive animations. Define motion values as `variants` objects outside the component
   body when possible.
8. **Keep the trail metaphor intact.** Variable names, component names, and data field names
   follow the hiking metaphor (`checkpoint`, `sideTrail`, `trailhead`, `progress`,
   `locationOnTrail`, `branch`, `marker`, `summit`). Preserve this language.
9. **Client components require `"use client"`.** Every component that uses hooks, Framer
   Motion, or browser APIs must have `"use client"` as its first line.
10. **`data/` is the single source of truth.** All content (experience text, tech stacks,
    side trail details) lives in `data/experiences.ts` and `data/sideTrails.ts`. Content
    changes go only there.
11. **Do not modify `src/` or `dist/`.** Both are vestigial directories from a prior Vite
    build. They should eventually be deleted but are currently harmless — leave them alone.
12. **Do not change the `SECTION_NAV_WIDTH` export** from `SectionNav.tsx` without also
    updating every reference to it in `TrailViewTransition.tsx`.

---

## Testing Requirements

There are currently **no automated tests** in this repository. Until tests are added:

1. After any change, run `npm run build` — a clean build is the primary correctness check.
2. Run `npm run lint` to confirm no ESLint violations.
3. Start `npm run dev` and manually verify the affected functionality in the browser.

### Manual verification checklist

- [ ] Scroll smoothly from hero to summit; marker tracks correctly
- [ ] All 9 checkpoints appear at the right scroll positions
- [ ] "Side Trail" / "Explore" buttons open the correct modal
- [ ] Branch path animates from the correct trail point
- [ ] Modal appears near the branch endpoint
- [ ] "Return to Trail" restores the exact scroll position
- [ ] SectionNav highlights the correct item while scrolling
- [ ] ProgressIndicator stats update with scroll
- [ ] Layout is correct at 375px, 768px, 1280px, 1440px widths

---

## Files That Require Extra Caution

| File | Reason |
|------|--------|
| `store/trailStore.ts` | All side-trail state flows through here; breaking the shape breaks the entire transition system |
| `components/transition/TrailViewTransition.tsx` | Orchestrator of the entire blow-off / restore cycle; animation timing is carefully tuned |
| `components/trail/TrailLayer.tsx` | SVG path coordinates, viewBox spring, and branch geometry are tightly coupled; changes ripple everywhere |
| `lib/trailPath.ts` | `getTrailXAtProgress` keyframes must match the SVG path in `TrailLayer.tsx` exactly |
| `app/globals.css` | CSS custom properties here are used by Tailwind utilities and inline styles across all components |
| `data/experiences.ts` | `locationOnTrail` values control where checkpoints appear on the SVG; wrong values break the visual layout |
| `app/layout.tsx` | Changing the font variable name here breaks `tailwind.config.ts` `fontFamily.sans` |

---

## Code Style

### TypeScript / React

- Functional components only; no class components
- Props typed inline via `interface` (not `type`) directly above the component
- No default exports from `data/` or `lib/` files — named exports only
- Default exports for page and layout components (Next.js convention)
- Hooks live in `/hooks/`; pure utilities live in `/lib/`

### Naming conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| React components | PascalCase | `TrailLayer`, `SideTrailView` |
| Hooks | camelCase prefixed `use` | `useTrailProgress` |
| Zustand store file | camelCase | `trailStore.ts` |
| Data arrays/records | camelCase | `experiences`, `sideTrails` |
| CSS custom properties | `--color-*`, `--font-*` | `--color-accent` |
| Framer variants | camelCase object keys | `blowOffItem`, `markerVisible` |
| Constants | UPPER_SNAKE_CASE | `TRAIL_ZONE_WIDTH_PCT`, `SECTION_NAV_WIDTH` |

### File organization

- One component per file; file name matches the component name exactly
- Related components group into sub-folders under `/components/`
- No barrel `index.ts` files — import directly from the file

### Tailwind

- Class order: layout → sizing → spacing → typography → color → border → animation
- Responsive prefixes used for layout shifts (`md:`, `lg:`)
- No `@apply` in component files; `@apply` only permitted in `globals.css` if added

---

## Project-Specific Concepts

### `progress` (0–1)
The master scroll progress value. `0` = hero top, `1` = summit (bottom of trail).
Computed by `useTrailProgress`. Drives nearly every animation in the app.

### `locationOnTrail` (0–1)
A per-checkpoint constant in `data/experiences.ts`. Marks where on the trail the
checkpoint card appears. Converted to a scroll progress value via
`locationToScrollProgress()` in `lib/trailPath.ts`.

### Side trail transition sequence
1. User clicks "Side Trail" → `setActiveSideTrail(id, { clickedSide, branchProgress })`
2. `TrailViewTransition` detects change → blows off trail content (Framer Motion exit)
3. `TrailLayer` draws branch SVG + animates pin along it (3.2 s total)
4. Pin reaches endpoint → `setBranchEndScreenPosition(pos)` written to store
5. `SideTrailView` mounts after 3.6 s delay, reads `branchEndScreenPosition`
6. User clicks "Return" → `setActiveSideTrail(null)` → content re-enters, scroll restored

### SVG coordinate system
The trail SVG has a `viewBox` of `0 0 400 1400` (visible window). The full path spans
4000 units tall. `viewYSpring` shifts the viewBox origin to follow the marker.
All branch/endpoint positions are computed in SVG units then converted to screen pixels
using `getBoundingClientRect()`.
