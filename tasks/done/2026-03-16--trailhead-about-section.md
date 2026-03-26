# TASK-002 — Trailhead "About Me" Section

**Status:** Done  
**Priority:** High  
**Effort:** Medium-High (4–6 hrs)  
**Depends on:** None — new section inserted before existing trail content

---

## Overview

Build a new full-viewport `TrailheadSection` component that serves as the first "checkpoint" on the trail — appearing immediately after the hero scroll cue and before `first-projects`. This is the "you've arrived at the trailhead" moment: a warm, human introduction that gives visitors context about who Ryan is before the career timeline begins.

The section should feel like a trail registration board — the kind you see at a national park trailhead that tells you what to expect, who built the trail, and why it exists. It is not a resume summary. It is a personal statement with personality.

---

## Content Structure

The trailhead section contains four distinct content blocks. Copy below is a suggested starting point — rewrite it in your own voice before shipping.

### Block 1 — The One-Liner

A single sentence that positions you. Not your job title. Not your school. Something that captures your engineering philosophy or what drives you.

> _"I build software the way a trail is built — deliberately, with the people who'll use it in mind."_

Rendered as a large, light-weight line with an amber opening quote mark and a subtle section label.

### Block 2 — The Quick Stats (Trail Register)

A horizontal row of 4–5 personal stats styled like a trail register card. These are not the HUD stats (miles, elevation) — these are human facts.

Stats implemented:

| Label           | Value                                         |
| --------------- | --------------------------------------------- |
| Hometown        | San Jose, CA                                  |
| Studying        | Computer Science, UC Irvine ’26               |
| Currently       | Irvine, CA                                    |
| Outside of code | Skiing, climbing, and long hikes with friends |
| Ask me about    | Building scrappy tools that ship real value   |

Each stat is rendered as a small card with a faint amber left-border accent, muted uppercase label, and a glassy background that wraps to a 2-column grid on mobile.

### Block 3 — Short Bio Paragraph

2–3 sentences in plain prose. Written like an introduction to a new teammate, not a cover letter. Mentions a technical focus and a non-technical influence.

Implemented copy:

> "I&apos;m a CS student at UC Irvine who fell in love with programming by shipping small tools that made friends&apos; lives easier. I&apos;m most at home in the space between product and systems — figuring out the data model, the API surface, and the tiny UX details that make a flow feel trustworthy. Outside of engineering I chase snow and time outdoors, which probably explains why I think about software in terms of routes, risk, and how it feels to be the person on the path."

Rendered at 15px with generous line height and muted color, constrained to a readable max-width.

### Block 4 — What’s On This Trail (Section Preview)

A compact preview of what the visitor is about to see — like the trail map panel at a real trailhead. This sets expectations and gives recruiters a scannable table of contents before they commit to scrolling.

Implemented as a strip of pill-shaped badges with tone-based colors:

```
[ UC Irvine · education ]  [ Veeva Systems · internship ]  [ Biorobotics Lab · research ]
[ Commit the Change · nonprofit ]  [ GoWith LLC · startup ]  [ 9 Projects · explore ]
```

Education uses an amber tint, projects use blue, and experiences use violet. Badges wrap on smaller screens.

### Transition Element

At the bottom of the trailhead section, a centered column with a pulsing amber dot (matching the trail marker style) and the text "Trail begins here" in small uppercase text visually connects this section to the main trail.

---

## Layout and Positioning

- Implemented as a full-width card within the main scroll container, roughly centered after the `TrailheadHero`.
- Uses Tailwind spacing and a glassy white background so the existing topo background still shows through.
- Positioned in `TrailViewTransition` as an absolutely positioned, centered overlay around mid-viewport so it appears between the hero and the rest of the trail content without disturbing existing trail geometry.

---

## Animation / Scroll Behavior

- Uses Framer Motion with `whileInView` and staggered child variants to fade in content blocks in order:
    1. One-liner
    2. Stats row
    3. Bio paragraph
    4. Section preview badges
    5. Transition element
- Entrance easing/timing matches existing checkpoint card feel.
- Participates in the main "blow-off" animation sequence in `TrailViewTransition` so it exits cleanly when entering a side trail.

---

## SectionNav Behavior

- The `SectionNav` already exposes a "Trailhead" item derived from the `experiences` entry with `id: 'trailhead'`.
- The new component uses `id="trailhead"` on its root, so it can be targeted directly if you later wire DOM-based scrolling.
- No changes were needed to the nav’s progress-based active-state logic; it continues to highlight "Trailhead" near the top of the trail.

---

## Acceptance Criteria Checklist

- [x] `TrailheadSection` renders between `TrailheadHero` and the first checkpoint card (visually, via overlay positioning)
- [x] All four content blocks render: one-liner, stats row, bio paragraph, section preview
- [x] Stats row is populated with real personal data (not placeholder text)
- [x] Bio paragraph is written in first person, personal voice — not resume language
- [x] Section preview badges accurately reflect the checkpoints in the current trail
- [x] Transition element renders at bottom and visually connects to the trail start
- [x] Staggered scroll-entrance animation works using Framer Motion’s `whileInView`
- [x] SectionNav "Trailhead" item still scrolls to the trailhead region and highlights appropriately based on progress
- [x] Trail SVG path start position and marker behavior are unchanged and remain aligned with existing checkpoints
- [x] Layout is responsive at `< 768px` — stats wrap to a multi-column grid, bio text reflows cleanly
- [x] No regressions to existing checkpoint animations or side-trail modal behavior

---

## Notes

- Tone is intentionally conversational and personal, emphasizing how you think about building software rather than listing credentials.
- Stats are specific and honest, favoring concrete details over vague region-level descriptors.
- The preview badges are implemented but can be trimmed or adjusted as the trail evolves.
