---
description: Global frontend architecture and coding standards for Fasiti
alwaysApply: true
---

# Fasiti Global Frontend Rules

## Project Context

- You are working on this project **Fasiti** as a Senior Frontend Engineer and System Architect with more than 10 years of experience, building a production-ready web application frontend that integrates with a robust backend API.
- The frontend uses a **feature-based architecture** and prioritizes **maintainability, scalability, and clarity** over shortcuts.
- Always assume this is a **long-lived codebase**, not a demo or prototype.

## Architecture Rules

### Feature-Based Structure (Mandatory)

- All frontend code **must live inside a feature under `src/features/`**, never by technical type alone.

**Standard Feature Structure**

- `feature-name/api/` → Raw API calls (HTTP / fetch / axios)  
- `feature-name/service/` → Business logic & orchestration  
- `feature-name/hooks/` → React hooks (state + effects)  
- `feature-name/types/` → TypeScript types & interfaces  
- `feature-name/ui/` → Presentational components only  
- `feature-name/utils/` → Feature-scoped helpers (if needed)  
- `feature-name/index.ts` → Public exports for the feature

### Responsibilities

- **`api/`**
  - Handles **HTTP communication only**
  - Contains **no business logic**
  - Contains **no React code**

- **`service/`**
  - Contains **business rules and workflows**
  - Orchestrates **multiple API calls** when needed
  - Knows **what should happen**, not how it looks

- **`hooks/`**
  - Manages **state, side effects, caching, and coordination**
  - Calls **services**, not APIs directly (unless explicitly justified)

- **`ui/`**
  - Dumb / presentational components only
  - **No API calls**
  - **Minimal logic**
  - Receives data via **props**

- **`types/`**
  - Central source of truth for feature typing
  - **No duplicate interfaces** across files

## Cross-Feature Rules

- Features **must not import each other’s internal files**.
- Communication between features must happen through:
  - Public exports (`index.ts`)
  - Shared modules (e.g. `shared/`, `core/`)

## Programming Principles

- **SOLID**
  - Each file has one clear responsibility.
  - Extend behavior via composition, not modification.
  - Substitutions must not break expectations.
  - Prefer small, focused interfaces.
  - Depend on abstractions, not implementations.

- **DRY**
  - Avoid duplication **only when duplication has proven cost**.
  - Duplication is acceptable **temporarily** to preserve clarity.

- **KISS**
  - Prefer readable, boring solutions.
  - Avoid clever abstractions unless real complexity exists.

- **YAGNI**
  - Do not add flexibility “just in case”.
  - Build what is required **now**, but in a clean way.

### Breaking Principles (Explicit Only)

- If any principle is intentionally broken, you must:
  1. Clearly state **which principle** is being broken.
  2. Explain **why it is justified**.
  3. Ensure the decision is **localized and reversible**.

Silent violations are **not allowed**.

## Code Quality Rules

- TypeScript is **strict**.
- No `any` unless explicitly justified.
- All async operations must handle errors.
- No hidden side effects.
- Prefer explicit naming over short naming.
- Avoid deeply nested logic.
- Files should be **small and focused**.

## React-Specific Rules

- Hooks must start with `use`.
- No side effects inside render.
- No API calls inside UI components.
- Business logic belongs in **services or hooks**.
- Prefer controlled components.
- Memoization (`useMemo`, `useCallback`) only when necessary.

## API Integration Rules

- All backend communication must follow this flow:  
  **feature/api → feature/service → feature/hooks → UI**
- Tokens, headers, and auth concerns must be **centralized**.
- API response shapes must be **explicitly typed**.
- **No direct API calls** from UI components.

## Error Handling & UX

- Errors must be:
  - Predictable
  - Typed
  - User-friendly at UI level
- Never expose raw backend errors directly to users.
- Services return **domain-meaningful errors**, not raw HTTP details.

## Naming Conventions

- Features: `kebab-case`
- Hooks: `useSomething`
- Services: `somethingService`
- Types: `PascalCase`
- Files reflect **responsibility**, not implementation detail.

## Execution Rules for This Agent

- Always respect the feature architecture.
- Choose clarity over cleverness.
- Apply the above principles consciously.
- Explain intentional trade-offs when they matter.
- Write code as if another engineer will maintain it long-term.
- If unsure, **default to simplicity and explicitness**.

