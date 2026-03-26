# Impact Metrics Popup on Side Trail Endpoint Hover

---

## Task ID

TICKET-01-impact-hover-popup

## Status

- [ ] Backlog
- [x] Active
- [ ] In Review
- [ ] Done

## Description

Currently, hovering over a side trail endpoint dot shows a basic hover preview card with a title and short description. This ticket upgrades that preview into a richer **impact metrics popup** — surfacing quantified results, proficiency-tagged tech stack, and a role subtitle — so recruiters get meaningful signal before they even commit to clicking into a side trail.

The goal is to make every endpoint dot feel like a teaser that earns the click, not just a label.

---

## Background & Motivation

From a recruiter UX standpoint, the most valuable information on a portfolio is quantified impact (numbers, scale, outcomes) and a clear tech stack read. Right now, that information is buried inside the side trail modal — which requires a multi-second branch animation to reach. Many recruiters will not wait for the animation before moving on.

The hover popup is the lowest-friction touchpoint in the entire trail interaction model. Upgrading it to show impact metrics means the most important signal is available instantly, without disrupting the trail metaphor or requiring any navigation.

---

## Scope

This ticket covers:
- Redesigning the hover preview card component for **experience checkpoints** (not landmarks, not the trailhead, not the summit)
- Adding an `impactMetrics` data field to each experience checkpoint's data model
- Ensuring the popup is non-blocking — it must not trigger the branch animation or open the modal

This ticket does **not** cover:
- Changes to the side trail modal content
- The branch animation or pin travel behavior
- Landmark hover previews (those remain simple)
- Mobile/touch behavior (covered in a separate responsive ticket)

---

## Data Model Changes

Each experience checkpoint object should gain a new optional `impactMetrics` array field. Example shape:

```ts
interface ImpactMetric {
  value: string;      // e.g. "40%", "12k", "3"
  label: string;      // e.g. "query perf. improvement", "users affected", "features shipped"
}

interface Checkpoint {
  // ...existing fields...
  impactMetrics?: ImpactMetric[];   // max 3 recommended for layout reasons
  techStack?: TechItem[];           // already exists, used in popup too
}
```

Populate `impactMetrics` for these checkpoints:

| Checkpoint ID | Suggested Metrics (fill in real numbers) |
|---|---|
| `veeva` | query perf %, features shipped, users affected |
| `biorobotics` | e.g. accuracy %, papers/presentations, tools built |
| `commit-the-change` | team size led, features delivered, users served |
| `gowith` | e.g. load time reduction, screens built, sprint cycles |
| `anthropology-research` | e.g. data points processed, research hours, outputs |

---

## Component Changes

### `HoverPreviewCard` (or equivalent component)

The existing hover preview card should be replaced or extended with a new layout when `impactMetrics` is present on the checkpoint.

**New popup anatomy (top to bottom):**

1. **Header row**
   - Checkpoint title (e.g. "Veeva Systems") — 15px, weight 500
   - Role/subtitle line (e.g. "Software Engineering Intern") — 12px, muted color
   - Date range right-aligned — 11px, muted

2. **Impact metrics strip** — only rendered if `impactMetrics` exists and has at least 1 item
   - Horizontal row of up to 3 metric cells
   - Each cell: large number/value in amber (`#f0a85a`), monospace font, 18–20px; small label below in muted gray, 10px, max 2 lines
   - Background: very subtle amber tint (`rgba(240,168,90,0.05)`), 0.5px amber-tinted border, 7px border-radius
   - This strip is the visual anchor — it should be the first thing the eye lands on

3. **Tech stack row** — only rendered if `techStack` exists
   - Horizontal flex-wrap of skill tags
   - Each tag: 11px text, muted background, 0.5px border, 4px radius
   - Tags should use the existing proficiency dot system (amber = primary, purple = proficient, blue = familiar) if proficiency data is available; otherwise render all tags in neutral style

4. **CTA hint line** — always present
   - Small text: "Click to explore →" or "Take side trail →" (match the checkpoint's existing button copy)
   - 11px, very muted color — this is a whisper, not a call to action

**Popup sizing:**
- Min-width: 260px, max-width: 320px
- No fixed height — let content define it
- Padding: 16px all sides

**Popup positioning:**
- Use the existing cursor-tracking or endpoint-relative positioning logic
- Popup should prefer appearing to the right of the endpoint dot when there is viewport space; fall back to left if within 340px of the right edge
- Vertical anchor: top of popup aligns to the vertical center of the endpoint dot
- Add a 10px offset from the dot edge so it doesn't feel glued to it

---

## Interaction Details

- **Trigger:** `mouseenter` on the endpoint dot SVG element (or its hit area — see note below)
- **Dismiss:** `mouseleave` from either the dot OR the popup itself. Add a 120ms debounce delay on dismiss so the user can mouse from the dot into the popup without it flickering closed.
- **No animation gate:** The popup must appear and disappear without triggering the branch animation. The branch + pin animation is only triggered by `click`.
- **Z-index:** Popup must render above the trail SVG, checkpoint cards, and background topo SVG. Use a portal or ensure z-index hierarchy is respected.
- **Hit area note:** The endpoint dot is small. Add a larger invisible hit area (e.g., 24×24px transparent circle or rect centered on the dot) to make hovering feel natural, especially on smaller screens.

---

## Visual Spec

```
┌─────────────────────────────────────────┐
│ Veeva Systems              Jun–Sep 2024  │
│ Software Engineering Intern              │
│ ─────────────────────────────────────── │
│  ┌─────────────┬──────────┬───────────┐ │
│  │    40%      │    3     │   12k     │ │
│  │ query perf  │ features │  users    │ │
│  │ improvement │ shipped  │ affected  │ │
│  └─────────────┴──────────┴───────────┘ │
│                                          │
│  [Java] [Spring Boot] [PostgreSQL] …    │
│                                          │
│  Click to explore →                      │
└─────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Hovering an experience endpoint dot shows the new impact popup within 50ms (no animation delay)
- [ ] Popup displays impact metrics strip when `impactMetrics` data is present
- [ ] Popup displays tech stack tags when `techStack` data is present
- [ ] Mousing from the dot into the popup does not dismiss it
- [ ] Clicking the dot (or popup area) still triggers the branch animation and opens the modal as before — popup behavior is additive, not replacing click behavior
- [ ] Landmark dots retain their existing simple hover preview (no impact strip)
- [ ] Popup does not overflow the viewport on either side
- [ ] All 5 experience checkpoints have `impactMetrics` data populated
- [ ] No visual regression on checkpoint cards themselves (hover popup is a layer above, not a replacement)

---

## Notes

- Keep the popup stateless — it reads directly from checkpoint data, no local state needed beyond open/closed
- If `impactMetrics` is empty or missing, the popup gracefully degrades to the existing simple preview (title + description only) — don't show an empty metrics strip
- The amber color palette already used for the trail and progress HUD should carry into the metrics strip to keep visual language consistent
