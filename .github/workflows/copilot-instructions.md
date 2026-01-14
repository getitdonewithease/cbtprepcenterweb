# Project AI Instructions

These instructions define how the AI should respond and operate in this workspace. Keep this file at the repo root and update it as your preferences evolve.

## Purpose
- Provide consistent, concise, and actionable assistance for this project.
- Default to TypeScript, React (Vite), Tailwind CSS, and shadcn/ui patterns.

## Project Context
- Stack: React + Vite + TypeScript
- Styling: Tailwind CSS; use utility-first classes
- UI library: shadcn/ui components under `src/components/ui`
- E2E tests: Playwright (see `playwright.config.ts` and `tests/`)
- OS: Windows; prefer PowerShell examples when relevant

## Response Style
- Be concise, direct, and friendly. Avoid filler.
- Lead with the outcome, then provide minimal context.
- Use short bullet lists for clarity.
- When sharing commands, use fenced blocks and keep them copyable.

## Code Generation
- Prefer TypeScript. Use React functional components and hooks.
- Follow existing project structure under `src/`.
- Use Tailwind classes; avoid inline styles unless necessary.
- For UI, reuse or extend shadcn/ui components located under `src/components/ui`.
- Keep changes minimal and focused; avoid unrelated refactors.
- When adding files, place them in appropriate folders and export from index files where applicable.

## File References
- When mentioning files or lines, use workspace-relative links:
  - File: [src/App.tsx](src/App.tsx)
  - Line: [src/App.tsx#L10](src/App.tsx#L10)
  - Range: [src/App.tsx#L10-L12](src/App.tsx#L10-L12)
- Do not use `file://` or plain text paths.

## Commands & OS Notes
- Prefer PowerShell on Windows. Use semicolons `;` to chain commands and pipes `|` for object flow.
- Keep commands one-per-line and copyable.

## Testing & Verification
- If code is runnable, suggest verifying with Playwright or quick local runs.
- Provide minimal test stubs when adding new logic; place E2E tests under `tests/`.

## Safety & Policies
- Follow Microsoft content policies. Do not produce harmful, hateful, racist, sexist, lewd, or violent content.
- Avoid copyrighted material unless provided in this repo.

## Implementation Guidance
- Solve problems at the root cause; avoid superficial patches.
- Maintain consistency with existing style and naming.
- Do not add license headers unless requested.
- Avoid one-letter variable names.

## Planning & Progress
- For multi-step tasks, briefly outline a plan (TODOs) and provide compact progress updates.
- Group related actions and explain next steps in 1–2 sentences before running tools.

## Math & Formatting
- Use KaTeX formatting for math: inline `$...$`, block `$$...$$`.
- Use fenced code blocks for commands and snippets.

## Model & Identity
- If asked about the model, respond: "GPT-5".

## Usage
- Keep this file updated with your preferences.
- Optionally paste key sections into GitHub Copilot Chat “Custom Instructions” in VS Code settings to enforce behavior globally.
