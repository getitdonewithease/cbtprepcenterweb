# Fasiti design system (MASTER)

Global source of truth for the Fasiti redesign. A page-specific file in `pages/` overrides this one for that page only.

- **Accepted:** 2026-11-20, after the landing-page redesign was reviewed in light and dark.
- **Chosen with:** UI UX Pro Max (palette, type and style options), then built and checked with Taste Skill and Impeccable.
- **Implemented in:** `src/index.css` (`.fasiti-theme` tokens), `tailwind.config.cjs`, `index.html` (font), `src/core/theme/useThemePreference.ts`.
- **Status:** live on the landing page and the auth pages (sign in, sign up, forgot password). App screens still use the older tokens until each is redesigned; move the `.fasiti-theme` tokens to `:root` / `.dark` when the app adopts them.

## Direction

| Decision | Choice |
|---|---|
| Colour | Evolved Fasiti orange + navy |
| Typography | Plus Jakarta Sans, one family |
| Theme | Light and dark, user toggle (defaults to the OS setting) |
| Style | Soft UI: subtle offset shadows, rounded surfaces, calm motion |
| Landing pattern | Hero, Features (one row per feature, closing action), Process, For centres, CTA, Footer |

## Colour tokens

HSL values as used by the CSS variables. Names match the shadcn/Tailwind tokens already in the project.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `228 33% 97%` | `222 47% 7%` | Page ground |
| `--foreground` | `222 47% 11%` | `210 40% 96%` | Body and heading text |
| `--card` | `0 0% 100%` | `222 40% 11%` | Raised surfaces |
| `--primary` | `17 88% 40%` | `25 95% 53%` | Filled buttons, active states |
| `--primary-foreground` | `0 0% 100%` | `222 47% 8%` | Text on primary |
| `--secondary` / `--muted` / `--accent` | `220 30% 94%` | `222 32% 15%` | Quiet fills, bands |
| `--muted-foreground` | `215 19% 35%` | `215 20% 70%` | Secondary text |
| `--border` / `--input` | `220 24% 88%` | `222 25% 20%` | Hairlines, inputs |
| `--ring` | `21 90% 48%` | `25 95% 60%` | Focus rings |
| `--brand-orange` | `21 90% 48%` | `25 95% 53%` | Decorative orange: bars, dots, highlights, borders |
| `--brand-text` | `17 88% 40%` | `27 96% 61%` | Orange **text** (links, small accents) |
| `--destructive` | `0 72% 42%` | `0 80% 68%` | Error text and borders |

Navy stage: `hsl(222.2 47.4% 8%)` is the fixed ground of the nav and hero in **both** themes (they carry the `dark` class).

### Contrast (measured, WCAG 2)

| Pair | Light | Dark |
|---|---|---|
| Text on primary button | 5.31:1 | 6.80:1 |
| `--brand-text` on background / card | 4.91:1 / 5.31:1 | 8.49:1 / 7.86:1 |
| `--muted-foreground` on background / muted | 6.86:1 / 6.39:1 | 8.09:1 (on card) / 7.27:1 |
| Foreground on background | 16.55:1 | 17.51:1 |

Rules:
- Never put orange **text** in `--brand-orange`; use `--brand-text`.
- Never put white text on `--brand-orange`; filled orange surfaces use `--primary` with `--primary-foreground`.
- No raw hex colours in components; use the tokens (`bg-primary`, `text-brand-text`, `bg-brand-orange/10`, …).
- No violet or purple-to-blue gradients.

## Typography

- **Family:** Plus Jakarta Sans 400–800 (Google Fonts), `font-display` in Tailwind; the `.fasiti-theme` wrapper sets it as the base family.
- **Weights:** body 400, labels and buttons 600, headings 700–800.
- **Scale:** hero 40–64px, bold, tracking -0.03em, `text-balance`; section headings 30–36px extra-bold, tracking -0.02em; feature headings 24–30px (the lead feature 30–36px); body 16–20px; small text 12px minimum (11px only inside dense product mock-ups).
- **Numbers:** timers, scores and ranks use `tabular-nums`. No monospace face as decoration.
- **Line breaks:** headings `text-balance`, paragraphs `text-pretty`, prose 45–75 characters per line.

## Soft UI surfaces and motion

- **Radius:** `--radius` 0.75rem; cards and demo frames `rounded-2xl`; buttons `rounded-xl`.
- **Depth:** one shadow token, `shadow-soft` (`--shadow-soft`): a small offset plus a soft blur in light, an inset highlight plus a deep soft shadow in dark. No zero-offset coloured glows, no glass or backdrop blur as decoration, no cards inside cards.
- **Buttons:** primary = `bg-primary text-primary-foreground shadow-soft`, lifts 2px on hover (`hover:-translate-y-0.5 hover:brightness-110`), presses on click (`active:scale-[0.98]`). Secondary = outline or text link. One primary action per view.
- **Motion:** 150–300ms for state changes, ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, exits faster than entrances. The hero enters once on load. Product demos loop only while on screen and the tab is visible.
- **Reduced motion:** every animation has a still alternative; demos show their finished state.

## Structure rules

- **No eyebrow labels** above headings (e.g. an uppercase "FEATURES" over the H2). The heading carries the section. *Decided 2026-11-20; remove existing ones as each page is next touched.*
- **No icon tiles** above feature headings. Feature rows lead with the heading and the product demo; icons appear only where they carry meaning (a control, a status). *Decided 2026-11-20; remove existing ones as each page is next touched.*
- One section, one idea. Feature rows alternate text and demo on desktop; text always comes first on phones.
- Product mock-ups are labelled as example data and exposed to screen readers as one image with a one-sentence description (`role="img"` + `aria-label`).
- Only real proof: no invented testimonials, partners, user counts or results (see `PRODUCT.md`).

## Theme

- `useThemePreference()` (`src/core/theme/`) returns `{ theme, toggleTheme }`, stores the choice in `localStorage` (`fasiti-theme`), and follows `prefers-color-scheme` until the visitor chooses.
- Apply the theme by adding `dark` to the page wrapper. The nav holds the sun/moon toggle (44×44px, labelled "Switch to light/dark theme").
- The Settings screen's existing theme option is not wired yet; connect it to the same hook when the app screens are redesigned.

## Pre-delivery checklist

- [ ] Light and dark both checked at 390, 768, 1024 and 1440px
- [ ] Text contrast 4.5:1 or better (3:1 for 24px+ text); focus visible on every control
- [ ] Touch targets 44px or larger
- [ ] `prefers-reduced-motion` gives a still, complete state
- [ ] No horizontal scroll; headings balanced, no lone last words in key copy
- [ ] Only tokens, no raw hex; only real claims
- [ ] `impeccable detect` shows no unexplained findings
