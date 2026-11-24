# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## AI design skill: Taste Skill

This project ships with the **Taste Skill** agent skill (`design-taste-frontend`, v2.5.1, MIT, from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)). It teaches Claude Code to build and polish pages with a deliberate design system instead of generic "AI-made" layouts: one palette and font pairing, one section per screen, equal edges, real icons and photographs, restrained motion, and a check in a real browser at 1440 / 1024 / 768 / 390 px before the work is handed over.

| What | Where |
| --- | --- |
| Skill files | `.claude/skills/design-taste-frontend/` |
| Pinned version | `skills-lock.json` (source repo + content hash) |

Because the skill is committed to the repo, everyone who clones the project and opens it in Claude Code gets it automatically. Nothing else to install.

**Requirements on your machine:** Node 22+ and Chrome, Edge or Chromium (set `CHROME_PATH` if installed in a non-standard location). `ffmpeg` is optional. No API keys.

### Invoking it implicitly

Claude Code reads the skill's description and loads it on its own when a request matches it. Just describe the design work in plain language, for example:

- "Build a landing page for the CBT prep center."
- "Redesign the home page, it looks generic."
- "Polish the pricing section and make it look more professional."
- "Review the hero section's design."

Requests to build, design, redesign, restyle, polish or review a page, or complaints that a page looks templated or "AI-made", trigger it.

### Invoking it explicitly

To make sure the skill is used, call it by name:

- Slash command in Claude Code: `/design-taste-frontend`, optionally followed by the task, e.g. `/design-taste-frontend redesign src/pages/Home.tsx`
- Or name it in the prompt: "Use the design-taste-frontend skill to restyle the dashboard header."

### Good to know

- The skill is tuned for marketing and company pages (landing, about, pricing). For in-app screens such as the exam or dashboard views, tell Claude which parts of its rules to follow.
- While a Taste Skill build is in progress, the skill registers a Stop hook (`scripts/gate.mjs`) that runs its browser checks before Claude finishes a turn, so turns can take longer.
- Skills run with the agent's full permissions. Review changes to `.claude/skills/` like any other code.
- If you also have the skill installed globally (`~/.claude/skills/design-taste-frontend`), Claude Code uses the personal copy over this project's copy.

### Updating or removing it

```bash
npx skills update -p                                   # update to the latest version, then commit
npx skills remove design-taste-frontend -a claude-code # remove it from this project
```

## Environment configuration

The frontend API base URL is centralized through Vite environment variables:

- `.env.development` for local/development runs
- `.env.production` for local production simulation only (optional)

Required key:

- `VITE_API_BASE_URL`

Examples in this project:

- `.env.development.example` → `VITE_API_BASE_URL=https://your-api-base-url.example.com/`
- `.env.production.example` → `VITE_API_BASE_URL=YOUR_PROD_URL_HERE`

Production deployments must provide `VITE_API_BASE_URL` through deployment environment variables/secrets (for example, the GitHub Actions secret `VITE_API_BASE_URL_PRODUCTION`).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
