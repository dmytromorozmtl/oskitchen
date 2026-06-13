# Storybook top-20 components (P3-57)

**Policy:** `storybook-top20-p3-57-v1`  
**Department:** Design  
**Registry:** [`artifacts/storybook-top20-p3-57-registry.json`](../artifacts/storybook-top20-p3-57-registry.json)

---

## Scope

Interactive Storybook catalog for the **20 core design system components** used across dashboard, POS, KDS, and storefront surfaces.

Sidebar group: **Design System / Top 20** (`Design System/Top 20/*`)

---

## Quick start

```bash
npm install
npm run storybook
```

Open http://localhost:6006

Static build:

```bash
npm run build-storybook
```

---

## Components (20)

| Story | Component |
|-------|-----------|
| `button` | `components/ui/button.tsx` |
| `card` | `components/ui/card.tsx` |
| `badge` | `components/ui/badge.tsx` |
| `empty-state` | `components/ui/empty-state.tsx` |
| `error-state` | `components/feedback/error-state.tsx` |
| `skeleton` | `components/ui/skeleton.tsx` |
| `input` | `components/ui/input.tsx` |
| `select` | `components/ui/select.tsx` |
| `dialog` | `components/ui/dialog.tsx` |
| `sheet` | `components/ui/sheet.tsx` |
| `tabs` | `components/ui/tabs.tsx` |
| `table` | `components/ui/table.tsx` |
| `tooltip` | `components/ui/tooltip.tsx` |
| `switch` | `components/ui/switch.tsx` |
| `progress` | `components/ui/progress.tsx` |
| `alert-dialog` | `components/ui/alert-dialog.tsx` |
| `dropdown-menu` | `components/ui/dropdown-menu.tsx` |
| `page-header` | `components/layout/page-header.tsx` |
| `permission-denied` | `components/ui/permission-denied-card.tsx` |
| `theme-toggle` | `components/theme-toggle.tsx` |

Stories live in `stories/top20/*.stories.tsx`.

---

## CI cert (no Storybook server)

```bash
npm run check:storybook-top20-p3-57
npm run audit:storybook-top20-p3-57
npm run test:ci:storybook-top20:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## References

- [`docs/storybook-top20-setup.md`](storybook-top20-setup.md) — detailed setup guide
- [`docs/design-system.md`](design-system.md) — tokens and component catalog
