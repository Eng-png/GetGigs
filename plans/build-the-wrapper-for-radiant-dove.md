# Yondr — V3 Result Animations

## Context

V3 Result currently renders fully static. This pass adds load-in, ring-draw, and scroll-reveal animations using `motion/react` (already in V2). Only V3 is touched. Layout, content, spacing, copy, icons, and the existing Reserve button hover/press behaviour stay exactly as built — only opacity / transform / SVG stroke-dashoffset / a numeric counter animate. The screen must still render correctly fully settled (the intro/summary thumbnail uses the existing `noScroll` prop, which doubles as the instant-mode trigger).

## Approach

### 1. Instant mode
Add `AnimCtx = createContext<{ instant: boolean }>` at the top of `src/app/components/v3/Version3Screen.tsx`, mirroring the V2 pattern. Value `{ instant: noScroll || prefers-reduced-motion }`. Every animated subcomponent reads it; when `instant` is true the load-in wrappers render plain divs, the rings render at full draw and full final percentage, and the scroll-reveals render at their resting state. This guarantees the V3 thumbnail in the intro shows the fully settled hero (including final rings at 91%) and the reduced-motion preference is honoured.

### 2. Hero image — focus-in
Wrap the hero's background image div in a `motion.div` that animates from `{ scale: 1.06, opacity: 0 }` to `{ scale: 1, opacity: 1 }` over 0.55 s with `ease: "easeOut"`. The dark gradient overlay sits on top and fades at the same time so the hero "comes into focus". The image element already has `overflow: hidden` via the hero container — the scale won't bleed.

### 3. Hero text and divider — staggered rise + wipe
Reuse the V2 `Rise` helper (port the same tiny component here — fade + 12 px easeOut over 0.3 s at given delay) for:

| Element                                  | delay   | duration |
|------------------------------------------|---------|----------|
| TopBar (back arrow + Yondr wordmark)     | 0.10 s  | 0.30 s   |
| Header divider (scaleX wipe)             | 0.18 s  | 0.35 s   |
| Y monogram                               | 0.22 s  | 0.30 s   |
| "Your perfect place"                     | 0.28 s  | 0.30 s   |
| "Barcelona · Jun 15-22 · 2 guests"       | 0.34 s  | 0.30 s   |
| Pin SVG                                  | 0.50 s  | 0.30 s   |
| "Cozy Den" title                         | 0.56 s  | 0.30 s   |
| Stat-row top divider (scaleX wipe)       | 0.74 s  | 0.40 s   |
| Stat-row bottom divider (scaleX wipe)    | 0.78 s  | 0.40 s   |

Divider wipes: `motion.div` with `initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}` and `transformOrigin: 'left center'`. The wipe is on the line element only; the row layout stays intact.

### 4. Stat rings — arc draw + number count-up
Replace the static `<path>` ring in `Ring` with a draw animation using SVG stroke-dasharray. The arc is the existing `pb2c5d00` path. Approach:

- Compute the path's `getTotalLength()` once on mount via a ref. Use that as `strokeDasharray`. Animate `strokeDashoffset` from `length * (1 - finalPct/100)` (i.e. show none) up to 0… actually for an "empty → full" sweep we initialise `strokeDashoffset = length` (entirely hidden) and animate to `length * (1 - finalPct/100)` so the visible arc length equals the value. For all rings the final value is `91%`, so the resting state is 91 % of the arc drawn.
- Animate duration `0.9 s`, `ease: "easeOut"`. Per-ring delays stagger them: Walk `0.85 s`, Food `1.00 s`, Activity `1.15 s` (all after the hero text settles).
- The `%` number counts up from 0 to the final value over the same window, synced to each ring's delay/duration. Use a `useMotionValue(0)` driven by `animate(mv, finalValue, { duration: 0.9, ease: "easeOut", delay })`, with a `useMotionValueEvent` (or `mv.on("change", …)`) updating local state for the displayed integer. Render `Math.round(value)` so the count looks crisp.
- The label ("Walk" / "Food" / "Activity") above the percentage is static — no animation.
- Instant mode: stroke is drawn at the final dashoffset on first render, the number renders as `91%`. No animation runs.

The `Ring` signature stays `{ label, value }` but `value` is parsed once (`parseInt(value, 10)`) to drive the count-up; rendered text uses the live count value + "%".

### 5. Compare Alternatives & Why we matched you — scroll-reveal
Each section animates in when it enters the viewport. Use `motion.div` with `whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} viewport={{ once: true, amount: 0.25 }}` and a transition of `0.4 s easeOut`. Applied at section granularity:

- **Compare Alternatives**: one wrapper around the whole block (heading + table). A second light stagger on the table rows is overkill — keep it understated as the user asked.
- **Why we matched you**: one wrapper around the heading + the three rows. Optionally add a small per-row stagger of `0.06 s` if it reads better; keep duration short (`0.32 s`) to stay understated.

The "Price + Reserve" block also gets the same scroll-reveal so it doesn't pop in cold at the bottom. Reserve button itself keeps its existing hover/press handlers and its 150 ms color transition exactly as is — no wrapper changes its behaviour.

### 6. Bottom menu — no animation
Already visible chrome. Untouched.

### 7. Instant-mode rendering details
- `Rise` short-circuits to a plain `<div>` so layout is identical to the static build.
- `Ring`: when instant, `strokeDashoffset` is computed once and rendered with no transition; the displayed percentage is the final value.
- Scroll-reveal blocks: when instant, render with `initial=false` and `animate={{ opacity: 1, y: 0 }}` immediately (or just render plain divs).
- Hero image focus-in: when instant, just render the static `background` (no motion wrapper) so summary thumbnails show the photo at 1× immediately.

## Critical files to modify

- `src/app/components/v3/Version3Screen.tsx` — add `AnimCtx`, `useReducedMotion`, `Rise`, port the ring draw + count-up into `Ring`, wrap hero image / text / dividers / sections per the spec. No new files, no dependencies (motion/react already in V2).

## Verification

1. Load V3 fresh. Hero image fades + eases from a slight 1.06× zoom down to 1× over ~0.55 s. The TopBar / divider / monogram / "Your perfect place" / trip line / pin / "Cozy Den" / stat-row top divider / stat-row bottom divider cascade in per the table above. Then the three rings draw their arcs from empty up to 91 % while their numbers count 0 → 91, staggered ~150 ms apart.
2. Scroll down — Compare Alternatives and Why we matched you fade + rise into place once they enter the viewport, then stay settled.
3. Reserve button still goes transparent → `#bd8e3c` with white text on hover/press with the 150 ms transition — verify by hovering.
4. Switch to summary view (V3 thumbnail in the intro) — V3 renders fully settled: hero at 1×, all text in place, three rings already showing 91 % with full arc, every section visible.
5. With `prefers-reduced-motion: reduce` set, V3 also renders fully settled.
6. V1 and V2 unchanged. Wrapper, navigation, global styles unchanged.
