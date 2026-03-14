# Coding Guidelines — `ryanmsu`

Specific rules and patterns for writing code in this repository. These supplement
the high-level rules in `CLAUDE.md`.

---

## TypeScript

### Do

```typescript
// Named export with inline interface
interface CheckpointProps {
  data: Checkpoint
  progress: number
  index: number
}

export function CheckpointCard({ data, progress, index }: CheckpointProps) { ... }
```

```typescript
// Derive don't store — avoid redundant useState
const isVisible = Math.abs(progress - data.locationOnTrail) < 0.15
```

```typescript
// Constant named exports from data files
export const experiences: Checkpoint[] = [...]
export const sideTrails: Record<string, SideTrailData> = {...}
```

### Do Not

```typescript
// ❌ No 'any'
const handler = (e: any) => { ... }

// ❌ No default exports from data/lib files
export default experiences

// ❌ No redundant state for derived values
const [isVisible, setIsVisible] = useState(false)
useEffect(() => { setIsVisible(progress > 0.1) }, [progress])

// ❌ No class components
class Trail extends React.Component { ... }
```

---

## React / Next.js

### Client vs Server components

All components in this app are client components because they use:
- Framer Motion hooks (`useSpring`, `useMotionValue`, `useTransform`, `useAnimation`)
- Zustand store (browser-only)
- `useRef` for DOM measurement
- Scroll event listeners

Every component file must begin with `"use client"` — **no exceptions**.

`app/layout.tsx` and `app/page.tsx` can stay as Server Components (they only render
other components and set metadata).

### Refs and DOM measurement

```typescript
// Pattern for measuring DOM elements
const svgRef = useRef<SVGSVGElement>(null)

useEffect(() => {
  if (!svgRef.current) return
  const rect = svgRef.current.getBoundingClientRect()
  // use rect.x, rect.y, rect.width, rect.height
}, [dependency])
```

---

## Framer Motion

### Variant pattern

```typescript
// Define variants at module scope (outside component)
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -200, rotate: -8, transition: { duration: 0.3 } },
}

// Use inside component
<motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit">
```

### Stagger pattern (used in blow-off system)

```typescript
const containerVariants = {
  blowOff: {
    transition: { staggerChildren: 0.05 }
  }
}

// Each child responds to parent variant name "blowOff"
const itemVariants = {
  blowOff: { x: '120vw', rotate: 15, opacity: 0 }
}
```

### Spring values (used for marker and viewBox)

```typescript
const rawValue = useMotionValue(0)
const springValue = useSpring(rawValue, { stiffness: 80, damping: 20 })

// Update the source value; spring follows smoothly
useEffect(() => { rawValue.set(newTarget) }, [newTarget])
```

### AnimatePresence

Always wrap conditionally rendered components:

```typescript
<AnimatePresence mode="wait">
  {activeSideTrailId ? (
    <SideTrailView key="side-trail" />
  ) : (
    <TrailContent key="trail" />
  )}
</AnimatePresence>
```

---

## Tailwind CSS

### Class ordering convention

```
[display/position] [sizing] [spacing] [typography] [color/bg] [border] [shadow] [transition]
```

Example:
```
"fixed left-0 top-0 w-44 h-full flex flex-col gap-2 px-4 py-6 text-sm font-medium text-stone-600 bg-white/80 border-r border-stone-200"
```

### Using CSS custom properties with Tailwind

For theme colors that are not in the Tailwind palette, use inline style or a CSS variable:

```typescript
// Preferred — CSS variable
<div style={{ color: 'var(--color-accent)' }}>

// Avoid — hard-coded hex
<div style={{ color: '#7c3aed' }}>

// OK for standard Tailwind colors already in the palette
<div className="text-violet-600">
```

---

## Zustand Store

### Reading state

```typescript
// Prefer selective subscription (avoids unnecessary re-renders)
const activeSideTrailId = useTrailStore(s => s.activeSideTrailId)
const setActiveSideTrail = useTrailStore(s => s.setActiveSideTrail)
```

### Writing state (inside actions only)

```typescript
// Actions live inside the store definition in trailStore.ts
setActiveSideTrail: (id, options = {}) => set({
  activeSideTrailId: id,
  // ...
})
```

Do not call `set()` from outside the store file. Always expose named action functions.

---

## Data Files (`data/`)

### Adding a new Checkpoint

```typescript
// data/experiences.ts
{
  id: 'my-new-item',          // kebab-case, unique
  variant: 'experience',       // 'experience' | 'project' | 'education'
  title: 'Company Name',
  role: 'Job Title',
  period: '2024 – Present',
  summary: 'One sentence summary.',
  tags: ['React', 'TypeScript'],
  locationOnTrail: 0.55,       // between existing values; check neighbors
  sideTrailId: 'my-new-item',  // omit if no side trail modal
}
```

### Adding a Side Trail

```typescript
// data/sideTrails.ts
'my-new-item': {
  title: 'Modal Title',
  theme: 'corporate',          // 'workshop' | 'lab' | 'campus' | 'corporate' | 'startup' | 'academic'
  description: 'Short intro paragraph.',
  techStack: ['React', 'Node.js'],
  url: 'https://example.com', // optional
  sections: [
    { type: 'text', content: 'A paragraph...' },
    { type: 'list', items: ['Point one', 'Point two'] },
    // type: 'code' also available
  ],
}
```

---

## File Creation Rules

- One component per file — file name = component name (PascalCase)
- New hooks → `/hooks/useXxx.ts`
- New pure utilities → `/lib/xxxUtil.ts` (camelCase + descriptive suffix)
- New data → `/data/xxx.ts`
- New components follow existing sub-folder grouping:
  - Trail SVG/marker/path components → `components/trail/`
  - Side trail modal components → `components/side-trail/`
  - Navigation → `components/nav/`
  - Full-screen transitions → `components/transition/`

---

## What Agents Must Never Do

- Rename or restructure existing component files without explicit instruction
- Change the SVG path in `TrailLayer.tsx` without updating `lib/trailPath.ts` keyframes
- Add `console.log` statements to production code
- Use `// @ts-ignore` or `// @ts-expect-error`
- Install packages without approval
- Modify `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, or `postcss.config.js`
  without explicit instruction — these affect the entire build
