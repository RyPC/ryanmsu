# TASK-003 — Align Trail Start With "Trail Begins Here" Dot

**Status:** Active  
**Priority:** Medium-High  
**Effort:** Medium (3–5 hrs)  
**Depends on:** Trailhead "About Me" section and "Trail begins here" dot being implemented

---

## Overview

Ensure that the visual start of the main SVG trail path and the animated marker are precisely aligned with the "Trail begins here" dot at the bottom of the trailhead/registration board area. When a visitor scrolls from the hero into the trailhead and then just past the "Trail begins here" cue, the marker should appear to sit exactly on that dot and then begin traveling down the trail from that point — not floating above/below it or starting noticeably earlier/later along the path.

---

## Motivation

The current experience has a conceptual handoff between the trailhead section and the animated trail: the pulsing "Trail begins here" dot indicates where the real hike starts, but the actual SVG trail path and marker movement are driven by a separate coordinate system and scroll mapping. If these are even slightly out of sync, the illusion breaks — the marker appears to start "in midair" or offset from the dot, making the trail metaphor feel less deliberate and more like two disconnected layers. This task tightens that handoff so the first step onto the trail feels intentional and physically grounded.

---

## Current Trail Movement Report

This section documents how the trail and marker currently move, based on the existing implementation in `lib/trailPath.ts`, `components/trail/TrailLayer.tsx`, and `hooks/useMarkerAnimation.ts`.

### 1. Trail geometry and X-position along the path

- The main trail is an SVG path with a fixed viewBox-height coordinate system:
  - Path definition (in `TrailLayer`):  
    `M 400 0 C 400 0 520 400 380 800 C 280 1200 400 1600 280 2000 C 400 2400 520 2800 400 3200 C 280 3600 400 4000 400 4000`  
    - The trail occupies X \(\approx 400\) at the very top (Y = 0), then weaves left/right as Y increases down to ~4000 units.
  - `TRAIL_CONTENT_HEIGHT` (in `trailPath`) is `4000`, matching the vertical extent of the path.
- `getTrailXAtProgress(progress)` maps a normalized trail progress (0–1) to an approximate X coordinate along the path using keyframes:
  - `TRAIL_X_KEYFRAMES` is a small set of \([t, x]\) pairs (e.g. `[0, 400]`, `[0.08, 480]`, `[0.2, 380]`, …, `[1, 400]`).
  - The function clamps `progress` to \[0, 1] and linearly interpolates between the nearest keyframe X values.
  - This function is used where only an approximate X position is needed (e.g., for HUD/landmark positioning based on normalized progress), while the actual marker/pin uses precise `getPointAtLength` samples from the path.

### 2. Trail scroll height and progress range

- `getTrailMetrics(mainTrailStopCount, sideTrailCount)` in `trailPath` computes how tall the scrollable trail segment is in pixels:
  - A base progress height plus per-stop and per-side-trail increments:
    - `TRAIL_PROGRESS_BASE_PX = 1800`
    - `MAIN_TRAIL_STOP_PROGRESS_PX = 250` per non-`trailhead` checkpoint
    - `SIDE_TRAIL_PROGRESS_PX = 200` per checkpoint with a side trail
  - `MIN_TRAIL_PROGRESS_HEIGHT = 2800` ensures the trail always has at least this much scroll distance.
  - The final `progressHeight` is multiplied by `TRAIL_SCROLL_HEIGHT_MULTIPLIER = 1.5` to get `scrollHeightPx`.
- `getTrailMetricsFromExperiences(items)` computes `mainTrailStopCount` and `sideTrailCount` from the `experiences` data and delegates to `getTrailMetrics`, so the vertical scroll range automatically adjusts when new checkpoints/side trails are added.

### 3. Mapping scroll progress to marker movement

- Scroll progress is normalized to \[0, 1] over the combined hero + trail scroll height, then converted into marker travel along the trail using `scrollProgressToMarkerProgress`:
  - Inputs: `scrollProgress` (0–1), `heroHeight`, `trailProgressHeight`.
  - `totalScrollHeight = heroHeight + trailProgressHeight`.
  - `markerMoveStart = heroHeight / totalScrollHeight`.
    - For `scrollProgress <= markerMoveStart`, the marker progress is hard-clamped to `0` — the marker is effectively "parked" at the trailhead while the user scrolls through the hero / trailhead segment.
  - For `scrollProgress > markerMoveStart`, the remaining scroll range is mapped linearly to marker trail progress:
    - `remaining = 1 - markerMoveStart`.
    - Marker progress is `(scrollProgress - markerMoveStart) / remaining`.
- The inverse, `markerProgressToScrollProgress`, uses the same `markerMoveStart` split to compute which scroll-space progress corresponds to a desired marker trail position:
  - For `markerProgress = 0`, it returns `markerMoveStart`, not 0, reflecting that the marker is allowed to be at the trailhead throughout the entire hero+lead-in scroll segment.
  - For \(0 < \text{markerProgress} \le 1\), it linearly maps back into \[markerMoveStart, 1].
- `locationToScrollProgress(locationOnTrail, heroHeight, trailProgressHeight)` maps a per-checkpoint `locationOnTrail` (0–1) to scroll progress:
  - Computes `totalHeight = heroHeight + trailProgressHeight`.
  - Uses a conceptual scrollTop: `scrollTop = heroHeight + locationOnTrail * TRAIL_CONTENT_HEIGHT`.
  - Returns `scrollTop / totalHeight`, clamped to `1`.
  - This effectively says: "after you exit the hero region, your scroll position advances proportionally through the 4000-unit SVG path height."

### 4. Marker position, view window, and side-trail behavior

- In `TrailLayer`, the marker’s *logical* trail progress is computed as:
  - `markerProgress = scrollProgressToMarkerProgress(progress, heroHeight, trailProgressHeight)`.
  - This `markerProgress` is passed into `useMarkerAnimation` as `progress`.
- `useMarkerAnimation` then:
  - Maintains a `displayedMarkerProgress` motion value:
    - In normal (non-side-trail) mode, it tracks the current `markerProgress` except during the brief scroll restoration window after returning from a side trail (it intentionally ignores `progress === 0` while a saved `returnScrollProgress > 0` exists to avoid a flicker/teleport).
    - In side-trail mode, it animates from the current marker progress to the `branchProgress` (trail position where the branch leaves the main path) over ~0.9s, using `displayedMarkerProgress` instead of immediately teleporting the marker.
  - Samples the SVG path (`pathRef`) at `displayedMarkerProgress * totalLength` to compute the marker's on-path point:
    - This is stored as `markerPoint`, with initial fallback `{x: 200, y: 0}` until the path is available, after which an initial effect snaps it to the real path position.
  - Computes a tangent-based `pinAngle` using `getTangentAngle`, which samples two close points on the path and derives the direction of travel; this is flipped depending on scroll direction so the pin points "downhill".
  - Uses a `viewYSpring` that tracks the marker’s Y coordinate:
    - It aims to keep the marker near the vertical center of the visible window (`HALF_VIEW_WINDOW_HEIGHT`) while clamping within \[TRAIL_PATH_MIN_Y − HALF_VIEW_WINDOW_HEIGHT, TRAIL_PATH_MAX_Y − HALF_VIEW_WINDOW_HEIGHT].
    - The actual `viewY` used in the SVG viewBox is a smoothed version of this target (stiffness 80, damping 20).
- The rendered SVG (`TrailLayer`) uses `viewBox={`0 ${viewY} 800 ${VIEW_WINDOW_HEIGHT}`}` so the camera effectively follows the marker down the trail.
- When a side trail is active:
  - `useMarkerAnimation` builds a cubic Bézier branch path from the main trail at `branchProgress` toward an endpoint whose offsets are derived from `BRANCH_DEFAULT_X_OFFSET` / `BRANCH_DEFAULT_Y_OFFSET` and any `selectedEndpoint` overrides, clamped to avoid going off-screen.
  - The pin then animates along this branch path (via `pinBranchProgress` and `getPointOnPath` on the branch), and the `branchEndScreenPosition` is computed by converting the branch's end SVG coordinates into pixel coordinates using the container’s `getBoundingClientRect` and the same `viewY`/`VIEW_WINDOW_HEIGHT` scaling.
  - The visible marker position (`displayPinPosition`) switches between `markerPoint` and `pinPosition` depending on mode and whether the marker has "arrived" at the branch junction.

### 5. Relationship to the "Trail begins here" dot

- The trail path currently starts at Y = 0 in SVG coordinates and the marker’s trail progress 0 corresponds to the top of that path.
- The "Trail begins here" dot in the trailhead section is a separate UI element:
  - It visually indicates the start of the main trail but is not inherently tied to the SVG path’s 0,0 origin.
  - The hero + trailhead scroll segment is represented by `heroHeight`, and the marker only begins to move once scroll progress passes `markerMoveStart = heroHeight / (heroHeight + trailProgressHeight)`.
- As a result, there are two independent "start" definitions:
  - The *visual* start at the "Trail begins here" dot (inside the trailhead layout).
  - The *SVG* start at path Y = 0 with marker trail progress 0.
- This task is about reconciling those two so:
  - At the exact scroll position where the "Trail begins here" dot is meant to represent stepping onto the trail, the marker is rendered at the precise on-path point corresponding to that dot (both in X and Y).
  - Small changes to the trailhead layout (height, padding) do not silently desync the mapping.

---

## Acceptance Criteria

- [ ] At the scroll position where the "Trail begins here" dot is visually centered/featured, the marker appears exactly on that dot (no vertical/horizontal offset).
- [ ] Scrolling *just before* the "Trail begins here" dot keeps the marker parked at the top of the trail path in a way that still feels spatially consistent with the dot’s position.
- [ ] Scrolling *just after* passing the "Trail begins here" dot causes the marker to begin moving down the trail smoothly from that exact starting point.
- [ ] Minor layout adjustments to the trailhead section (copy tweaks, padding changes) do not obviously break the alignment between the dot and the marker’s trailhead position (i.e., the mapping is robust to typical content edits).
- [ ] No regressions to side-trail branch behavior, branch endpoint positioning, or landmark glow/visibility logic.

---

## Implementation Notes (Guidance, Not a Spec)

- Consider introducing a single, well-documented "trailhead anchor" constant or function that ties together:
  - The Y position of the SVG path point that should correspond to the "Trail begins here" dot.
  - The scroll progress at which the dot is visually at its intended position (e.g., using the same hero + trailhead height measurement that feeds `heroHeight`).
- Potential approaches:
  - **Approach A — Align via scroll mapping only:**
    - Keep the SVG path as-is (starting at Y = 0).
    - Adjust `scrollProgressToMarkerProgress` and/or how `heroHeight` is computed so that the scroll value at which the "Trail begins here" dot is in view maps exactly to marker trail progress 0.
    - This keeps the geometry unchanged but centralizes the mapping in one place.
  - **Approach B — Align via SVG coordinate shift:**
    - Offset the main trail path vertically so that the path’s "visual start" (where the dot should live) sits at a more convenient Y value (e.g., TRAIL_PATH_MIN_Y) and update relevant constants (`TRAIL_PATH_MIN_Y`, `TRAIL_PATH_MAX_Y`) accordingly.
    - Place the "Trail begins here" dot using the same coordinate system (e.g., inside the SVG, or by positioning it relative to the same measurement that determines `viewBox` origin).
  - In both approaches, ensure that `locationToScrollProgress`, `markerProgressToScrollProgress`, and any checkpoint/landmark positioning logic that depends on `TRAIL_CONTENT_HEIGHT` remain internally consistent.
- Add a small visual debug mode (even temporarily) if helpful:
  - E.g., log or overlay the trailhead anchor Y value, the marker’s actual Y at progress 0, and the on-screen Y of the "Trail begins here" dot to verify they all match.

---

## Testing Instructions

- Re-run:
  - `npm run build`
  - `npm run lint`
- Manual checks:
  - Scroll slowly from the top of the hero into the trailhead and down to the "Trail begins here" dot; confirm the marker appears to "attach" to the dot at the right moment.
  - Scroll slightly above and below the dot and ensure the marker’s behavior feels physically grounded (no jumps, no hovering far away from the cue).
  - Trigger a few side trails and landmarks to confirm that branch animations, HUD, and landmark glow behavior remain unchanged.

