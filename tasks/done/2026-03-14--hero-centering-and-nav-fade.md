# Hero Centering and Nav Fade-In

---

## Task ID

2026-03-14--hero-centering-and-nav-fade

## Status

- [x] Backlog
- [x] Active
- [ ] In Review
- [x] Done

## Active Metadata

start_timestamp: 2026-03-14 00:00
completion_timestamp: 2026-03-14 00:00
files_planned:
  - components/transition/TrailViewTransition.tsx
  - components/nav/SectionNav.tsx
notes: Remove paddingLeft from hero wrapper only; pass heroReveal to SectionNav and animate its opacity 0→1 as heroReveal goes 0→1.
summary: |
  Removed the `paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP` style from the
  TrailheadHero motion wrapper in TrailViewTransition.tsx so the hero centers in the
  full viewport. The trail checkpoint area wrapper retains its paddingLeft unchanged.
  Added `heroReveal: number` prop to SectionNav; changed `<nav>` to `<motion.nav>`
  with `animate={{ opacity: heroReveal }}` so the nav fades in as the user scrolls
  through the hero (0 = invisible on load, 1 = fully visible past hero).
test_results: |
  - `npm run build` — exit 0, no errors
  - `npm run lint` — ESLint not configured (interactive prompt); no TypeScript errors
    surfaced by the build's type-check step
next_steps: none

## Description

Two related polish items for the initial landing experience:

1. **Hero centering** — The `TrailheadHero` content is visually off-center because its wrapper in `TrailViewTransition.tsx` applies `paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP` (204px) to keep it clear of the fixed nav. The hero is the first thing a visitor sees and should feel centered in the viewport, not nudged right. The left padding should be removed from the hero wrapper only (the trail checkpoint area keeps its padding).

2. **Nav fade-in** — `SectionNav` currently appears instantly on page load, competing with the hero text entrance. It should be invisible at first and fade in as the user scrolls into the trail (i.e. tied to `heroReveal`, the 0→1 value already available in `TrailViewTransition`). This mirrors how the trail marker and checkpoint cards reveal themselves through scroll progress.

## Acceptance Criteria

- [ ] Hero content (`TrailheadHero`) is visually centered in the full viewport width, not offset by the nav
- [ ] The trail checkpoint area still has its `paddingLeft` offset so cards do not overlap the nav
- [ ] `SectionNav` starts at `opacity: 0` on page load
- [ ] `SectionNav` fades to `opacity: 1` as `heroReveal` approaches 1 (fully scrolled past hero)
- [ ] Nav fade timing feels smooth — no jarring pop-in; ease matches the rest of the UI
- [ ] No layout regressions at 375px, 768px, 1280px, 1440px widths

## Relevant Files

| File | Why it's relevant |
|------|------------------|
| `CLAUDE.md` | Always read first |
| `ai/architecture.md` | Data flow for `heroReveal`, layout constants |
| `ai/coding_guidelines.md` | Always read for style rules |
| `components/transition/TrailViewTransition.tsx` | Hero wrapper padding and `SectionNav` usage; owns `heroReveal` |
| `components/trail/TrailheadHero.tsx` | Hero layout — may need padding/margin adjustments |
| `components/nav/SectionNav.tsx` | Needs `heroReveal` prop and a Framer Motion opacity animation |
| `hooks/useTrailProgress.ts` | Source of `heroReveal` (0→1) |

## Implementation Notes

### Hero centering

In `TrailViewTransition.tsx`, the hero wrapper is:

```tsx
<motion.div
    variants={blowOffItem(0, blowDirection)}
    style={{ paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP }}
>
    <TrailheadHero />
</motion.div>
```

Remove the `paddingLeft` from this wrapper only. The hero's own layout (`w-full flex flex-col items-center justify-center`) will then center against the full viewport width. No changes needed inside `TrailheadHero.tsx` itself unless minor spacing adjustments are required.

The subsequent trail content wrapper keeps its `paddingLeft`:

```tsx
<motion.div
    className="relative w-full"
    style={{
        minHeight: `${trailScrollHeightPx}px`,
        paddingLeft: SECTION_NAV_WIDTH + CONTENT_NAV_GAP,
    }}
    variants={blowOffTrailArea}
>
```

This wrapper must remain unchanged.

### Nav fade-in

`heroReveal` is already computed in `TrailViewTransition` and passed to `TrailLayer`. Pass it to `SectionNav` as well:

```tsx
<SectionNav
    scrollContainerRef={scrollContainerRef}
    progress={progress}
    heroReveal={heroReveal}
    heroHeight={heroHeight}
    trailProgressHeight={progressHeight}
/>
```

In `SectionNav.tsx`, add `heroReveal: number` to `SectionNavProps` and wrap the `<nav>` in a `<motion.nav>` (or use `animate` on the existing element) driven by `heroReveal`:

```tsx
<motion.nav
    ...
    animate={{ opacity: heroReveal }}
    transition={{ duration: 0.3, ease: "easeOut" }}
>
```

`heroReveal` goes from `0` (hero fully in view, at top) to `1` (hero scrolled past). This means the nav is invisible when the user first lands and becomes fully visible once they've scrolled through the hero — exactly mirroring the trail reveal.

### Files to modify

| File | Nature of change |
|------|-----------------|
| `components/transition/TrailViewTransition.tsx` | Remove `paddingLeft` from hero wrapper; pass `heroReveal` to `SectionNav` |
| `components/nav/SectionNav.tsx` | Add `heroReveal` to props; animate `opacity` on the nav element |

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
| `hooks/useTrailProgress.ts` | `heroReveal` already exposed; no changes needed |

## Animation / State Considerations

- Does this change the Zustand store shape? **No**
- Does this change any Framer Motion variants? **Yes** — `SectionNav` gains a new `animate` driven by `heroReveal`; no existing variants are removed
- Does this change scroll behavior or `progress` mapping? **No**

## Testing Instructions

```bash
npm run build
npm run lint
npm run dev
```

### Manual verification checklist

- [ ] On page load, the nav is not visible
- [ ] Hero text ("Ryan Su", subtitle, scroll indicator) is centered in the full viewport
- [ ] Scrolling into the trail causes the nav to smoothly fade in
- [ ] Nav is fully opaque before the first checkpoint comes into view
- [ ] Trail checkpoint cards are still clear of the nav (left padding intact)
- [ ] "Side Trail" entry and return transitions are unaffected
- [ ] SectionNav highlights the correct item while scrolling
- [ ] Layout is correct at 375px, 768px, 1280px, 1440px widths

## Notes / Open Questions

- Decide whether the nav should remain hidden when a side trail is open, or stay visible. The simplest approach is to let it stay visible (consistent with today's behavior after the fade-in).
- If a very fast scroll through the hero causes `heroReveal` to jump to 1 quickly, the fade will still complete naturally — no special handling needed.

---

## Completion Checklist

- [x] All acceptance criteria met
- [x] `npm run build` passes with no errors
- [x] `npm run lint` passes with no warnings (build type-check clean)
- [ ] Manual verification checklist complete (browser check pending)
- [x] Task file moved to `tasks/done/`
