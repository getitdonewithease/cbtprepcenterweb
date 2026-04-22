# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # tsc + vite build (production)
npm run lint         # ESLint on .ts/.tsx (max-warnings 0 — treat warnings as errors)
npm run preview      # Preview production build locally
npm run types:supabase  # Regenerate src/types/supabase.ts from Supabase schema
```

Run Playwright e2e tests:
```bash
npx playwright test              # All tests
npx playwright test <file>       # Single test file
npx playwright test --ui         # Interactive UI mode
```

## Architecture

**Stack**: React 18 + TypeScript + Vite (SWC) + React Router v6 + Tailwind CSS

**Path alias**: `@/*` maps to `src/*`

### Feature-based structure

All frontend code must live inside a feature under `src/features/`. Never organise by technical type alone.

Each feature follows this standard layout:

```
src/features/<name>/
├── api/         # HTTP communication only — no business logic, no React code
├── service/     # Business rules & orchestration — calls api/, knows what should happen
├── hooks/       # State, side effects, caching — calls service/ (not api/ directly)
├── types/       # TypeScript interfaces; single source of truth, no duplicates
├── ui/          # Presentational components only — no API calls, minimal logic
├── utils/       # Feature-scoped helpers (only if needed)
├── contexts/    # React Context providers (when feature-level context is needed)
├── data/        # Static/seed data (when needed)
└── index.ts     # Public re-exports — the only surface other features may import
```

**Data flow (strict):** `feature/api → feature/service → feature/hooks → UI`

Hooks must call `service/`, not `api/` directly, unless explicitly justified with a stated reason.

Core shared code lives in `src/core/`:
- `api/httpClient.ts` — Axios instance with 401-refresh interceptor and request queue
- `auth/tokenStorage.ts` — localStorage/sessionStorage token helpers
- `errors/` — `AppError` / `ServerError` classes mapped from Axios errors
- `notifications/` — toast hook
- `ui/utils.ts` — `cn()` utility (clsx + tailwind-merge)

Shared UI primitives are in `src/components/ui/` (Radix + shadcn pattern).

### Cross-feature rules

Features must not import each other's internal files. Cross-feature communication happens only through:
- The feature's public `index.ts` exports
- Shared modules in `src/core/` or `src/shared/`

### Routing

All routes are defined in `src/App.tsx`. Protected routes are wrapped with `<RequireAuth>` and `<UserProvider>`. There is no file-based routing — add new routes explicitly in `App.tsx`.

Key protected routes: `/dashboard`, `/subjects`, `/resources`, `/settings`, `/practice/test/:cbtSessionId`, `/practice/review/:sessionId`, `/saved-questions`.

### State management

No Redux or Zustand. State is managed via:
1. **React Context** — `UserContext` (global user profile, available via `useUserContext()`) wraps all protected routes.
2. **Feature hooks** — `useDashboard()`, `useAuth()`, `usePrepareTest()`, etc. own their local async state.
3. **Axios interceptors** — handle token refresh; failed requests are queued and retried after a successful refresh.

### Styling

Tailwind CSS with class-based dark mode (`.dark`). Design tokens are HSL CSS variables (`--primary`, `--secondary`, `--radius`, etc.) defined in `src/index.css`. Components use CVA (`class-variance-authority`) for type-safe variant props. Always merge classes through `cn()` from `@/core/ui/utils`. Avoid inline styles except for truly dynamic values that cannot be expressed in Tailwind.

### Brand & Design System

The Fasiti brand uses two core palette roles:

| Role | Value | Usage |
|---|---|---|
| Brand orange | `hsl(25 95% 53%)` — CSS var `--brand-orange` | CTAs, accents, highlights, active states |
| Dark navy | `hsl(222.2 47.4% 8%)` | Dark section backgrounds (hero alt, How It Works) |
| Deeper navy | `hsl(222.2 47.4% 6%)` | Alternate dark sections for depth separation |
| White / card | `bg-background` / `bg-card` | Light section backgrounds |

**Referencing orange in components:**
```ts
const orange = "hsl(var(--brand-orange))";
// use as: style={{ color: orange }} or style={{ backgroundColor: orange }}
// semi-transparent tint: "hsl(25 95% 53% / 0.12)" (icon container bg)
//                        "hsl(25 95% 53% / 0.18)" (selected state bg)
```

**Section structure (landing page pattern):**
- Light sections: plain `bg-background`, `py-24`
- Dark sections: `style={{ backgroundColor: "hsl(222.2,47.4%,8%)" }}`, `py-24`
- Section label above heading: `text-sm font-semibold uppercase tracking-widest` in orange
- Section heading: `text-3xl font-black md:text-4xl` (light) or `text-white` (dark)

**Feature showcase row:**
```
grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16
```
Alternates text-left/demo-right and demo-left/text-right. Use `md:order-last` on the text column to flip order on desktop without breaking mobile stacking.

**Icon container (feature icons):**
```
inline-flex h-10 w-10 items-center justify-center rounded-xl
background: hsl(25 95% 53% / 0.12)   icon color: orange
```

**Cards:**
- Standard: `rounded-2xl border bg-card shadow-xl`
- Dark demo card: `rounded-2xl border border-white/10 bg-[hsl(222.2,47.4%,8%)]`

**Bullet list (feature bullet points):**
```tsx
<span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: orange }} />
```

**Animations (framer-motion — already installed):**
- Use `motion.div` + `AnimatePresence` for enter/exit transitions.
- Phase state machines: `type Phase = 'idle' | 'active' | 'complete'` driven by `useEffect` + `setTimeout`.
- Infinite loops: increment a `cycleCount` state in the last `setTimeout` to restart the `useEffect` cleanly.
- Smooth list reordering: `motion.div` with `layout` prop + `type: "spring"`.
- Always clean up all `setTimeout`/`setInterval` handles in the `useEffect` return.

**DemoWrapper pattern** (`src/components/LandingPage/FeatureDemos.tsx`):
- Leave `src` undefined → renders animated mockup children.
- Pass `src="/demos/feature.mp4"` → renders `<video autoPlay loop muted playsInline>`.
- Pass `src="/screenshots/feature.png"` → renders `<img>`.
- One-line swap, nothing else changes.

### Forms and validation

React Hook Form + Zod resolvers. Define a Zod schema, pass it to `zodResolver`, and use `useForm<z.infer<typeof schema>>()`. No uncontrolled form patterns.

### Content rendering

Exam questions may contain LaTeX. Use `react-markdown` + `rehype-katex` + `remark-math` for rendering; sanitize HTML with DOMPurify before rendering raw strings.

## Coding standards

### TypeScript

- No `any` unless explicitly justified with a stated reason.
- Avoid non-null assertions (`!`) unless the invariant is enforced at the call-site boundary.
- Use discriminated unions for complex async UI states: `status: 'idle' | 'loading' | 'error' | 'success'` with typed payloads.
- Event handlers must be correctly typed (e.g. `React.ChangeEvent<HTMLInputElement>`).
- All async operations must handle errors. Services return domain-meaningful errors (`AppError`), not raw HTTP details.

### Component design

- Single responsibility per component. Prefer composition over deeply configurable "mega-components".
- Props: use explicit, descriptive names (`isLoading`, `onSendMessage`, `selectedExamId`). Use `onX` for callbacks. Avoid "god props" objects unless they are domain models.
- Use `useState` for simple UI state; use `useReducer` for multi-field state transitions or when next state depends on multiple prior fields.
- Effects must be narrowly scoped and clean up correctly (subscriptions, timers, event listeners).
- No side effects during render.

### Accessibility (required)

- All interactive elements must be reachable by keyboard.
- Prefer semantic HTML (`button`, `label`, `input`, `nav`, `main`, `section`).
- Every input needs a visible `<label htmlFor>` or an `aria-label`. Don't add redundant/contradictory `aria-*` roles.
- When opening a modal or panel, focus a meaningful element inside it. When closing, return focus to the trigger.

### Error handling & UX

- UI must always handle all four edge states: **empty**, **loading**, **error**, and **success** (including partial data).
- Disable submit buttons while a request is in-flight; prevent double-submission.
- Never expose raw backend error messages to users. Services surface domain-meaningful errors; UI translates them to user-friendly copy.

### Performance

- Do not over-memoize. Use `useMemo`/`useCallback` only when passing stable references to memoized children, or when avoiding recomputation with proven cost.
- For lists that can grow large, prefer pagination or virtualization patterns.

## Naming conventions

| Thing | Convention |
|---|---|
| Feature folders | `kebab-case` |
| Hooks | `useSomething` |
| Services | `somethingService` |
| Types / interfaces | `PascalCase` |
| Files | Reflect responsibility, not implementation detail |

## Breaking principles

If any architectural principle (SOLID, DRY, KISS, YAGNI) is intentionally violated:
1. State **which principle** is being broken.
2. Explain **why it is justified**.
3. Ensure the decision is **localized and reversible**.

Silent violations are not allowed.

## Key conventions

- Feature barrel exports via `index.ts` — import from the feature root, never from internal paths.
- `AppError` is the standard error shape — always construct errors through `core/errors/` mappers.
- Environment variables are prefixed `VITE_`; access via `import.meta.env.VITE_*`.
- Keep imports ordered and remove unused imports.
- Components must be testable via public behaviour — prefer stable accessible names over brittle DOM selectors.
