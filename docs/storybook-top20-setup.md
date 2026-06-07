# Storybook — Top 20 design system components

**Policy:** `storybook-top20-absolute-final-v1` (Absolute Final Task 65)

Interactive catalog for the same 20 primitives documented in `docs/design-system.md` § Component catalog.

## Quick start

```bash
npm install
npm run storybook
```

Open http://localhost:6006 — sidebar group **Design System / Top 20**.

Static build (optional Chromatic handoff):

```bash
npm run build-storybook
```

## Story locations

| Story file | Component |
|------------|-----------|
| `stories/top20/button.stories.tsx` | `components/ui/button.tsx` |
| `stories/top20/card.stories.tsx` | `components/ui/card.tsx` |
| `stories/top20/badge.stories.tsx` | `components/ui/badge.tsx` |
| `stories/top20/empty-state.stories.tsx` | `components/ui/empty-state.tsx` |
| `stories/top20/error-state.stories.tsx` | `components/feedback/error-state.tsx` |
| `stories/top20/skeleton.stories.tsx` | `components/ui/skeleton.tsx` |
| `stories/top20/input.stories.tsx` | `components/ui/input.tsx` |
| `stories/top20/select.stories.tsx` | `components/ui/select.tsx` |
| `stories/top20/dialog.stories.tsx` | `components/ui/dialog.tsx` |
| `stories/top20/sheet.stories.tsx` | `components/ui/sheet.tsx` |
| `stories/top20/tabs.stories.tsx` | `components/ui/tabs.tsx` |
| `stories/top20/table.stories.tsx` | `components/ui/table.tsx` |
| `stories/top20/tooltip.stories.tsx` | `components/ui/tooltip.tsx` |
| `stories/top20/switch.stories.tsx` | `components/ui/switch.tsx` |
| `stories/top20/progress.stories.tsx` | `components/ui/progress.tsx` |
| `stories/top20/alert-dialog.stories.tsx` | `components/ui/alert-dialog.tsx` |
| `stories/top20/dropdown-menu.stories.tsx` | `components/ui/dropdown-menu.tsx` |
| `stories/top20/page-header.stories.tsx` | `components/layout/page-header.tsx` |
| `stories/top20/permission-denied.stories.tsx` | `components/ui/permission-denied-card.tsx` |
| `stories/top20/theme-toggle.stories.tsx` | `components/theme-toggle.tsx` |

Title prefix for all stories: `Design System/Top 20/*` (see `lib/storybook/csf-types.ts`).

## Wiring

| Path | Role |
|------|------|
| `.storybook/main.ts` | Story globs + Next.js framework |
| `.storybook/preview.ts` | `globals.css`, centered layout, dashboard background |
| `lib/storybook/storybook-top20-policy.ts` | Registry + CI scripts |
| `lib/storybook/storybook-top20-audit.ts` | Wiring audit |
| `tests/unit/storybook-top20.test.ts` | Cert gate |

## CI cert (no Storybook server required)

```bash
npm run test:ci:storybook-top20:cert
```

Validates all 20 story files, config, and imports against the top-20 component registry.

## Dark mode review

Use Storybook toolbar backgrounds or toggle **ThemeToggle** story wrapped in `ThemeProvider`. Production dark-mode fleet audit: `npm run test:ci:new-components-dark-mode-audit:cert`.

## References

- `docs/design-system.md` — tokens, patterns, component catalog
- `docs/TESTING.md` — optional Chromatic / `CHROMATIC_PROJECT_TOKEN`
- `.github/workflows/chromatic-visual.yml` — Playwright baselines (Storybook not required for CI)
