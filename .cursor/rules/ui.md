---
description: UI rules for React/TSX work (use with global.md)
globs: **/*.{tsx,jsx}
alwaysApply: false
---

# Fasiti UI Rules (React / TSX)

These rules apply when the task is **UI** (component design, styling, frontend interaction logic). They must be followed **in addition to** `.cursor/rules/global.md`.

## File Placement & Boundaries (Non-Negotiable)

- UI components live in **`src/features/<feature>/ui/`**.
- UI components are **presentational**:
  - No direct network calls (`fetch`, `axios`, raw API clients).
  - No direct access to feature `api/` modules.
  - No cross-feature internal imports (only other features’ public `index.ts` exports, or shared `core/` / `shared/` modules if they exist).
- State/side-effects belong in **hooks**:
  - Complex state, async flows, caching, subscriptions, timers, and orchestration go to `src/features/<feature>/hooks/`.
  - Hooks call `service/` (not `api/`) unless explicitly justified.
- Business rules belong in **`service/`**, never in UI.
- Types belong in **`types/`**. Don’t re-declare interfaces inline if a feature type already exists.

## Component Design Standards

- Prefer **small, focused components** with a single responsibility.
- Prefer **composition** over deeply configurable “mega-components”.
- Keep render trees shallow; extract repeated UI into subcomponents.
- Props:
  - Use explicit, descriptive names (`isLoading`, `onSendMessage`, `selectedExamId`).
  - Avoid “god props” objects unless they are domain models.
  - Prefer `onX` naming for callbacks and make them optional only when truly optional.
- Local state:
  - Use `useState` for simple UI state.
  - Use `useReducer` for multi-field state transitions or when the next state depends on multiple prior fields.
- Side effects:
  - No side effects during render.
  - Effects must be narrowly scoped and clean up correctly (subscriptions, timers, event listeners).

## TypeScript (Strict, No Surprises)

- No `any` (unless explicitly justified).
- Avoid non-null assertions (`!`) unless invariants are enforced at the boundary.
- Prefer discriminated unions for complex UI states:
  - Example: `status: 'idle' | 'loading' | 'error' | 'success'` with typed payloads.
- Event handlers must be correctly typed (e.g. `React.ChangeEvent<HTMLInputElement>`).
- Don’t suppress errors with `as unknown as ...` unless there is no other safe alternative and the risk is localized.

## Error Handling & UX

- UI must show **user-friendly errors**, not raw backend messages.
- Always handle empty/edge states:
  - No data
  - Loading
  - Error
  - Partial data / missing fields (when possible)
- Use consistent loading affordances:
  - Disable submit buttons while submitting.
  - Prevent double-submit.
  - Provide clear progress feedback for long operations.

## Accessibility (Required)

- All interactive elements must be reachable and usable by keyboard.
- Prefer semantic HTML (`button`, `label`, `input`, `nav`, `main`, `section`).
- Provide accessible names:
  - `label` + `htmlFor` for inputs, or `aria-label` when a visible label is not appropriate.
- Use `aria-*` only when needed; don’t add contradictory or redundant roles.
- Focus management:
  - When opening modals/panels, focus a meaningful element.
  - When closing, return focus appropriately (when applicable).

## Styling & Layout

- Follow existing project styling conventions found in the feature (don’t introduce a new styling paradigm).
- Keep spacing and typography consistent with existing UI primitives/components.
- Prefer responsive layouts that work on common breakpoints.
- Avoid inline styles except for truly dynamic values that can’t be expressed otherwise.

## Brand & Design System

### Color Tokens

| Role | Value | CSS Variable |
|---|---|---|
| Brand orange | `hsl(25 95% 53%)` | `--brand-orange` |
| Dark navy (sections) | `hsl(222.2 47.4% 8%)` | — |
| Deeper navy (alt sections) | `hsl(222.2 47.4% 6%)` | — |
| Light background | `bg-background` / `bg-card` | `--background` / `--card` |

**In every component file that uses orange, declare it at the top:**
```ts
const orange = "hsl(var(--brand-orange))";
```
Never hardcode `#f97316` or any hex/rgb orange. Always go through the CSS variable.

**Tints (inline style only — cannot be expressed as static Tailwind classes):**
```
icon container bg  → "hsl(25 95% 53% / 0.12)"
selected state bg  → "hsl(25 95% 53% / 0.18)"
border accent      → "hsl(25 95% 53% / 0.35)"
```

### Section Backgrounds

- **Light section:** no background override, `py-24` — inherits `bg-background`
- **Dark section:** `style={{ backgroundColor: "hsl(222.2,47.4%,8%)" }}` with `py-24`
  - Headings: `text-white`
  - Body / supporting text: `text-white/70`
  - Muted labels: `text-white/50`
- **Alternate dark:** `hsl(222.2,47.4%,6%)` for visual depth between adjacent dark sections

### Typography Scale

| Element | Classes |
|---|---|
| Section label (above heading) | `text-sm font-semibold uppercase tracking-widest` + orange color |
| Section heading (light bg) | `text-3xl font-black md:text-4xl` |
| Section heading (dark bg) | `text-3xl font-black md:text-4xl text-white` |
| Feature heading | `text-2xl font-black md:text-3xl` |
| Body / description | `text-muted-foreground` (light) or `text-white/70` (dark) |

### Layout Patterns

**Feature showcase row (text + demo side by side):**
```
grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16
```
Alternate which side the demo appears on. Add `md:order-last` to the text column to push it right on desktop while keeping it below the demo on mobile.

**Container:** always wrap page sections in `<div className="container">`.

**Section padding:** `py-24` for major sections.

### Component Patterns

**Icon container (feature icons):**
```tsx
<div
  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
  style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
>
  <Icon className="h-5 w-5" style={{ color: orange }} />
</div>
```

**Card (light):** `rounded-2xl border bg-card shadow-xl`
**Card (dark / demo):** `rounded-2xl border border-white/10 bg-[hsl(222.2,47.4%,8%)]`

**Feature bullet point:**
```tsx
<li className="flex items-center gap-2.5 text-sm text-muted-foreground">
  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: orange }} />
  {item}
</li>
```

**Primary CTA button:** orange background, white text — use inline style for background.
```tsx
<Button size="lg" className="gap-2 px-8 text-white" style={{ backgroundColor: orange }}>
```

### Animation (framer-motion — already installed)

- Use `motion.div` + `AnimatePresence` for enter/exit.
- Drive animated sequences with a phase state machine:
  ```ts
  type Phase = ‘idle’ | ‘active’ | ‘complete’;
  ```
- Infinite loops: increment a `cycleCount` state in the last `setTimeout`; the `useEffect` dependency on `cycleCount` restarts it cleanly.
- Smooth list reordering: `motion.div` with `layout` prop + `transition={{ type: "spring", stiffness: 400, damping: 32 }}`.
- Always clean up all timers in the `useEffect` return function.

### DemoWrapper Pattern

`src/components/LandingPage/FeatureDemos.tsx` exports `DemoWrapper`:
- No `src` → renders animated mockup children.
- `src="*.mp4/.webm/.mov"` → renders `<video autoPlay loop muted playsInline>`.
- `src="*.gif/.png/.jpg"` → renders `<img>`.

Wrap every feature demo in `DemoWrapper` so real recordings replace mockups with a single prop addition.

## Performance & Rendering Hygiene

- Don’t over-memoize by default.
- Use `useMemo` / `useCallback` only when:
  - Passing stable references to memoized children, or
  - Avoiding expensive recomputation proven by profiling or clear evidence.
- Avoid creating new objects/functions in render when they are passed deep into large subtrees.
- For large lists:
  - Prefer pagination/virtualization patterns if list sizes can grow.

## Imports & Public API Hygiene

- Prefer importing from a feature’s `index.ts` when consuming that feature from outside.
- Do not import sibling feature internals (enforce feature encapsulation).
- Keep imports ordered and remove unused imports.

## Testing Considerations (UI)

- Components should be testable via public behavior:
  - Stable labels and accessible names.
  - Avoid brittle selectors; prefer `getByRole`/`getByLabelText` style patterns (when tests exist).
- Don’t bake test-only behavior into production components.

## Output/Execution Protocol (When Implementing UI)

- Detect task type: **UI**.
- Load: `.cursor/rules/global.md` + this file.
- Implement UI changes inside the appropriate `src/features/<feature>/ui/` modules and keep business logic out of UI.

## Strict Rule Enforcement

Do not reinterpret or relax these rules.
Do not make assumptions that violate these constraints.
If a task conflicts with these rules, ask for clarification instead of proceeding.