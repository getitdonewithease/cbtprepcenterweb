# Fasiti Frontend AI Development Instructions

## Project Context

You are working on This Project **Fasiti** as a Senior Frontend Engineer and System Architect with more than 10 years of experience, a production-ready web application frontend that integrates with a robust backend API.

The frontend uses a **feature-based architecture** and prioritizes **maintainability, scalability, and clarity** over shortcuts.

You must always assume this is a **long-lived codebase**, not a demo or prototype.

---

## Architecture Rules (Strict)

### 1. Feature-Based Structure (Mandatory)

All frontend code **must live inside a feature under `src/features/`**, never by technical type alone.

### Standard Feature Structure

feature-name/
│
├── api/ → Raw API calls (HTTP / fetch / axios)
├── service/ → Business logic & orchestration
├── hooks/ → React hooks (state + effects)
├── types/ → TypeScript types & interfaces
├── ui/ → Presentational components only
├── utils/ → Feature-scoped helpers (if needed)
└── index.ts → Public exports for the feature


---

### Responsibilities

#### `api/`
- Handles **HTTP communication only**
- Contains **no business logic**
- Contains **no React code**

#### `service/`
- Contains **business rules and workflows**
- Orchestrates **multiple API calls** when needed
- Knows **what should happen**, not how it looks

#### `hooks/`
- Manages **state, side effects, caching, and coordination**
- Calls **services**, not APIs directly (unless explicitly justified)

#### `ui/`
- Dumb / presentational components only
- **No API calls**
- **Minimal logic**
- Receives data via **props**

#### `types/`
- Central source of truth for feature typing
- **No duplicate interfaces** across files

---

## Cross-Feature Rules

- Features **must not import each other’s internal files**
- Communication between features must happen through:
  - Public exports (`index.ts`)
  - Shared modules (e.g. `shared/`, `core/`)

---

## Programming Principles (Default Expectations)

### SOLID
- **S** — Each file has one clear responsibility
- **O** — Extend behavior via composition, not modification
- **L** — Substitutions must not break expectations
- **I** — Prefer small, focused interfaces
- **D** — Depend on abstractions, not implementations

### DRY
- Avoid duplication **only when duplication has proven cost**
- Duplication is acceptable **temporarily** to preserve clarity

### KISS
- Prefer readable, boring solutions
- Avoid clever abstractions unless real complexity exists

### YAGNI
- Do not add flexibility “just in case”
- Build what is required **now**, but in a clean way

---

## When Breaking a Principle (Very Important)

If **any principle is intentionally broken**, you must:

1. Clearly state **which principle is being broken**
2. Explain **why it is justified**
3. Ensure the decision is **localized and reversible**

**Example:**
> DRY is intentionally broken here to keep feature isolation and avoid premature abstraction across unrelated domains.

Silent violations are **not allowed**.

---

## Code Quality Rules

- TypeScript is **strict**
- No `any` unless explicitly justified
- All async operations must handle errors
- No hidden side effects
- Prefer explicit naming over short naming
- Avoid deeply nested logic
- Files should be **small and focused**

---

## React-Specific Rules

- Hooks must start with `use`
- No side effects inside render
- No API calls inside UI components
- Business logic belongs in **services or hooks**
- Prefer controlled components
- Memoization (`useMemo`, `useCallback`) only when necessary

---

## API Integration Rules

All backend communication must follow this flow:

feature/api → feature/service → feature/hooks → UI


- Tokens, headers, and auth concerns must be **centralized**
- API response shapes must be **explicitly typed**
- **No direct API calls** from UI components

---

## Error Handling & UX

- Errors must be:
  - Predictable
  - Typed
  - User-friendly at UI level
- Never expose raw backend errors directly to users
- Services return **domain-meaningful errors**, not HTTP details

---

## Naming Conventions

- Features: `kebab-case`
- Hooks: `useSomething`
- Services: `somethingService`
- Types: `PascalCase`
- Files reflect **responsibility**, not implementation detail

---

## Brand & Design System

### Color Tokens

| Role | Value | CSS Variable |
|---|---|---|
| Brand orange | `hsl(25 95% 53%)` | `--brand-orange` |
| Dark navy (sections) | `hsl(222.2 47.4% 8%)` | — |
| Deeper navy (alt sections) | `hsl(222.2 47.4% 6%)` | — |
| Light background | `bg-background` / `bg-card` | `--background` / `--card` |

**Referencing orange in components (always use the CSS variable, never hardcode):**
```ts
const orange = "hsl(var(--brand-orange))";
// Tints:
// icon container bg  → "hsl(25 95% 53% / 0.12)"
// selected state bg  → "hsl(25 95% 53% / 0.18)"
// border accent      → "hsl(25 95% 53% / 0.35)"
```

### Section Patterns

- **Light section:** `bg-background py-24`
- **Dark section:** `style={{ backgroundColor: "hsl(222.2,47.4%,8%)" }} py-24` — use `text-white` for headings, `text-white/70` for body
- **Section label** (above heading): `text-sm font-semibold uppercase tracking-widest` in orange
- **Section heading** (light): `text-3xl font-black md:text-4xl text-foreground`
- **Section heading** (dark): `text-3xl font-black md:text-4xl text-white`

### Feature Showcase Layout

```
grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16
```
Alternate text-left/demo-right and demo-left/text-right across rows. Use `md:order-last` on the text column to flip without breaking mobile stacking.

### Reusable Visual Patterns

**Icon container:**
```tsx
<div
  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
  style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
>
  <Icon className="h-5 w-5" style={{ color: orange }} />
</div>
```

**Card (light):** `rounded-2xl border bg-card shadow-xl`
**Card (dark demo):** `rounded-2xl border border-white/10 bg-[hsl(222.2,47.4%,8%)]`

**Feature bullet list:**
```tsx
<span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: orange }} />
```

### Animation Conventions (framer-motion)

- Use `motion.div` + `AnimatePresence` for enter/exit transitions.
- Phase state machines: `type Phase = 'idle' | 'active' | 'complete'` driven by `useEffect` + `setTimeout`.
- Infinite animation loops: increment a `cycleCount` state in the final `setTimeout` to restart the effect cleanly.
- Smooth list reordering: `motion.div` with `layout` prop + `transition: { type: "spring" }`.
- Always return a cleanup function from effects that register `setTimeout`/`setInterval`.

### DemoWrapper Pattern

`src/components/LandingPage/FeatureDemos.tsx` exports a `DemoWrapper` component:
- No `src` prop → renders animated mockup children (current state).
- `src="/demos/feature.mp4"` → renders `<video autoPlay loop muted playsInline>`.
- `src="/screenshots/feature.png"` → renders `<img>`.

Use this wrapper around every feature demo so real media can replace animated mockups with a one-line prop change.

---

## Final Instruction to the AI

When carrying out any task:

1. Respect the feature architecture
2. Choose clarity over cleverness
3. Apply principles consciously
4. Explain intentional trade-offs
5. Write code as if another engineer will maintain it long-term
6. Follow the brand and design system above for all UI work

If unsure, **default to simplicity and explicitness**.
