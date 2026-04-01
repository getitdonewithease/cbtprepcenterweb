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