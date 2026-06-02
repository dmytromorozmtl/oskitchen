# Dark mode audit — OS Kitchen

**Policy:** `dark-mode-audit-v1`  
**Date:** 2026-06-02  
**Owner:** Design + Engineering  
**Scope:** Theme architecture, token parity, surface-by-surface behavior, and remediation backlog  
**Related:** [`status-color-tokens.md`](./status-color-tokens.md) · [`marketing-page-audit.md`](./marketing-page-audit.md) · [`accessibility-audit.md`](./accessibility-audit.md) · [`typography-audit.md`](./typography-audit.md)

This audit inventories how dark mode is **implemented**, **where it is enabled**, and **where it breaks**. OS Kitchen is intentionally **white-first** on marketing; dark mode is an **operator preference** for dashboard/platform surfaces.

---

## Executive summary

| Area | Grade | Notes |
|------|:-----:|-------|
| **Theme infrastructure** | B+ | `next-themes` + Tailwind `darkMode: ["class"]`; shadcn HSL tokens in `.dark` |
| **Dashboard dark mode** | C+ | Toggle exists; shell chrome hardcodes `bg-white` — sidebar/header stay light |
| **Marketing dark mode** | N/A (by design) | `PublicThemeLock` forces light; `.dark-section` provides static dark bands |
| **Token dual-stack** | C | Legacy `--color-*` vars on `body` do not flip with `.dark` — only shadcn bridge does |
| **Status / alert parity** | B+ | Amber/emerald/rose badges include `dark:` pairs (Task 51, Task 10) |
| **Storefront theming** | Separate | Merchant `PublicThemeProvider` — not OS Kitchen light/dark toggle |
| **Accessibility in dark** | Not measured | Contrast audit was light-mode baseline; dark spot-check recommended |

**Top 5 actions (P0–P1):**

1. Replace `bg-white` in `dashboard-shell.tsx` with `bg-background` (sidebar, header, root)
2. Map legacy `--color-bg` / `--color-text` inside `.dark { … }` or migrate `body` to `bg-background text-foreground`
3. Document intentional marketing light-lock in sales/demo materials (no broken toggle expectation)
4. Spot-check KDS/POS tiles in dark mode (touch targets + overdue red on dark bg)
5. Add dark-mode smoke to `tests/e2e/accessibility.spec.ts` or visual snapshot on `/dashboard/today`

---

## Architecture

### Stack

| Layer | File | Behavior |
|-------|------|----------|
| Provider | `components/providers/theme-provider.tsx` | Wraps `next-themes` |
| Config | `components/providers/providers.tsx` | `attribute="class"`, `defaultTheme="system"`, `enableSystem` |
| Tailwind | `tailwind.config.ts` | `darkMode: ["class"]` |
| CSS tokens | `app/globals.css` | `:root` light + `.dark` shadcn HSL overrides |
| Toggle | `components/theme-toggle.tsx` | Light / Dark / System dropdown |
| Public lock | `components/providers/public-theme-lock.tsx` | Forces `light` outside `/dashboard`, `/platform`, `/onboarding` |
| Toasts | `components/ui/sonner.tsx` | Reads `useTheme()` for Sonner theme |

### Two token systems (important)

**1. Legacy marketing tokens (`:root`)**

```css
--color-bg: #ffffff;
--color-text: #0d0e12;
/* body { background: var(--color-bg); } */
```

These **do not change** when `.dark` is applied. Homepage hero/footer use `.dark-section`, which locally overrides `--color-bg` to `--dark-bg` — a **section-scoped** dark band, not global dark mode.

**2. shadcn / Tailwind bridge**

```css
.dark {
  --background: 240 6% 6%;
  --foreground: 60 9% 96%;
  /* … card, muted, border, ring … */
}
```

Components using `bg-background`, `text-foreground`, `border-border`, etc. **do** respond to `.dark` on `<html>`.

**Gap:** Mixed usage causes “light body + dark cards” or vice versa when toggle is on. Prefer one stack per surface.

### Public theme lock (intentional)

`PublicThemeLock` resets theme to `light` on:

- `/`, `/pricing`, `/login`, `/signup`, all marketing, legal, blog, compare, etc.

Allowed dark preference:

- `/dashboard/*`
- `/platform/*`
- `/onboarding/*`

**Rationale:** Marketing is designed white-first with orange accent; hero uses `.dark-section` bands. Do not expose a marketing header toggle until full token migration is done.

---

## Surface inventory

| Surface | Dark toggle? | Effective dark? | Primary tokens |
|---------|:------------:|:---------------:|----------------|
| Marketing & ICP | No (locked light) | Partial — `.dark-section` only | `--color-*`, inline styles on `/` |
| Auth shell | No (locked light) | No | `bg-background` on some pages; homepage wrapper `bg-white` |
| Dashboard | Yes — header `ThemeToggle` | **Partial** — content cards OK; shell chrome white | shadcn + many `dark:` utilities |
| Platform admin | Yes | Same as dashboard | shadcn |
| Vendor cabinet | Locked light (not in allowlist) | No | `bg-background` |
| Storefront `/s/[slug]/*` | Merchant theme | Custom accent/fonts | `PublicThemeProvider` |
| KDS / POS full-screen | Inherits dashboard session | Untested systematically | KDS realtime UI has `dark:` variants |
| Legal pages | Locked light | No | Mixed `bg-white` wrappers |

---

## Findings by area

### Dashboard shell (P0)

`components/dashboard/dashboard-shell.tsx`:

- Root: `className="flex min-h-screen bg-white"`
- Sidebar: `bg-white`
- Header: `bg-white`

When user selects Dark, main content using `bg-background` goes dark but **nav chrome stays white** — visible seam and wrong brand impression on night shifts.

**Fix:** `bg-background` / `border-border` on shell, sidebar, header.

### Marketing homepage (informational)

- Wrapper: `app/page.tsx` → `bg-white` (hardcoded)
- Hero + footer: `.dark-section` (static `#0d0e12` band)
- Middle sections: light `--color-bg`

This is a **designed light/dark band layout**, not broken dark mode. Document for sales: homepage always renders light bands regardless of system preference.

### Marketing header

`site-header-client.tsx`: `bg-white` — correct while public lock is active. If lock is removed later, switch to `bg-background/95 backdrop-blur`.

### Status & honesty UI (pass)

Components with verified `dark:` pairs:

- `components/integrations/beta-badge.tsx`
- `components/kitchen/kitchen-camera-preview-banner.tsx`
- `components/marketplace/checkout-approval-gate.tsx`
- `lib/marketplace/category-icons.ts` tile classes
- `lib/status/status-colors.ts` + `docs/status-color-tokens.md`

Amber warning surfaces use `text-amber-950 dark:text-amber-50` pattern consistently.

### Charts & data viz

Executive demo, benchmarks, food-cost builders use `dark:text-emerald-400` etc. Spot-check chart.js/recharts canvas backgrounds — may default to white unless themed.

### PDF / print

`sales-deck-print.tsx` uses `bg-background text-foreground` — respects toggle for on-screen preview; print CSS should force light (verify `@media print`).

---

## Token reference — light vs dark

| Token | Light (`:root`) | Dark (`.dark`) | Used by |
|-------|-----------------|----------------|---------|
| `--background` | `0 0% 100%` | `240 6% 6%` | Tailwind `bg-background` |
| `--foreground` | `240 6% 6%` | `60 9% 96%` | `text-foreground` |
| `--muted-foreground` | `240 5% 38%` | `240 4% 65%` | Secondary text |
| `--primary` | Orange `21 100% 56%` | Same | CTAs — accent unchanged |
| `--color-bg` | `#ffffff` | **Not mapped** | `body`, legacy marketing |
| `--dark-bg` | `#0d0e12` | Static | `.dark-section` only |

Orange primary is intentionally **unchanged** in dark mode — brand continuity for CTAs and LIVE-adjacent accents.

---

## Coverage metrics (approximate)

| Pattern | Count | Notes |
|---------|------:|-------|
| ` dark:` Tailwind variants | ~1,400+ | Concentrated in dashboard, KDS, integrations |
| `bg-white` hardcoded | ~25 files | Shell + marketing wrappers — primary debt |
| `bg-background` | Widespread | Preferred for theme-aware surfaces |
| `.dark-section` | 3 regions | Homepage hero, homepage CTA, site footer |

---

## Remediation backlog

### P0 — operator UX

| # | Action | File(s) |
|---|--------|---------|
| 1 | Shell chrome → `bg-background` | `dashboard-shell.tsx` |
| 2 | Map `--color-bg` / `--color-text` under `.dark` OR drop legacy on dashboard routes | `globals.css` |

### P1 — consistency

| # | Action |
|---|--------|
| 3 | Vendor cabinet: add to dark allowlist **or** document light-only |
| 4 | Replace remaining marketing `bg-white` with `bg-background` (no user-visible change while locked) |
| 5 | KDS/POS 15-min dark soak test — overdue tickets, bump buttons, contrast |
| 6 | Chart components: explicit dark grid/label colors |

### P2 — future

| # | Action |
|---|--------|
| 7 | Optional marketing dark theme (remove `PublicThemeLock` + full homepage migration) |
| 8 | Visual regression CI: light + dark snapshots of `/dashboard/today` |
| 9 | `prefers-color-scheme` audit on locked pages — ensure no flash before lock runs |

---

## Verification checklist

Manual QA after P0:

- [ ] Toggle Dark on `/dashboard/today` — sidebar, header, and content share same background
- [ ] Toggle System with OS dark — dashboard follows; navigate to `/pricing` — forces light
- [ ] Amber BETA badge readable in both modes on integration health page
- [ ] KDS ticket overdue state visible on dark background
- [ ] No white flash on dashboard load (theme script / `suppressHydrationWarning` on `<html>` if needed)
- [ ] Print `/deck` — output is light regardless of toggle

Automated (future):

- [ ] Extend `tests/unit/marketing-page-audit.test.ts` sibling or add `dark-mode-audit.test.ts` guard
- [ ] Playwright screenshot diff light vs dark on Today Command Center

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`status-color-tokens.md`](./status-color-tokens.md) | LIVE/BETA/NO-GO dark pairs |
| [`marketing-page-audit.md`](./marketing-page-audit.md) | `.dark-section` marketing layout |
| [`component-library.md`](./component-library.md) | ThemeToggle, BetaBadge |
| [`ACCESSIBILITY_REVIEW.md`](./ACCESSIBILITY_REVIEW.md) | Contrast tokens |

---

*Generated as Task 91 — P2 Design. Next: Task 92 — wire `ApiErrorState` to all AI feature pages.*
