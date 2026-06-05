# OS Kitchen Design System

**Policy:** `design-system-doc-des39-v1`  
**Date:** 2026-06-05  
**Scope:** Operator dashboard, role UIs, POS/KDS surfaces, and shared `lib/design/*` audit policies  
**Stack:** Tailwind CSS · shadcn/ui (`components/ui/*`) · `next-themes` · Lucide icons

This document is the **canonical design reference** for OS Kitchen. New screens must use shared primitives and policy modules — not ad-hoc colors, z-index, or touch targets.

---

## Foundation

| Layer | Location | Rule |
|-------|----------|------|
| CSS tokens | `app/globals.css` | shadcn HSL tokens in `:root` + `.dark`; legacy `--color-*` bridged under `.dark` |
| Tailwind | `tailwind.config.ts` | `darkMode: ["class"]`; semantic utilities (`bg-background`, `text-foreground`, `border-border`) |
| Theme provider | `components/providers/theme-provider.tsx` | `attribute="class"`, `defaultTheme="system"` |
| Public lock | `components/providers/public-theme-lock.tsx` | Marketing/legal routes stay light by design |
| Utilities | `lib/utils.ts` | `cn()` for conditional class composition |

**Do:** use semantic Tailwind tokens that respond to `.dark`.  
**Don't:** hardcode `bg-white` on operator chrome — use `bg-background` (DES-24).

---

## Token registry

### Color (`lib/design/color-tokens.ts` — DES-21)

| Use | Pattern |
|-----|---------|
| Success | `text-emerald-700 dark:text-emerald-400` |
| Warning | `text-amber-800`, `border-amber-500/30`, `bg-amber-500/10` |
| Danger | `Button variant="destructive"` — never manual red overrides |
| Charts | `chartSeriesColors`, `chartAxisChrome` from `color-tokens.ts` |
| Neutral chrome | `border-border/80`, `bg-card/90`, `shadow-sm` |

### Z-index (`lib/design/z-index-scale.ts` — DES-23)

| Layer | Token | Value |
|-------|-------|------:|
| Sticky row | `z-sticky` | 10 |
| Section header | `z-sticky-header` | 20 |
| App chrome | `z-chrome` | 30 |
| Drawer | `z-drawer` | 40 |
| Overlay | `z-overlay` | 50 |
| Floating | `z-floating` | 60 |
| KDS fullscreen | `z-kitchen-fullscreen` | 90 |

**Don't** use arbitrary `z-[N]` — pick from the scale.

### Icons (`lib/design/icon-system.ts`)

| Size | Class | Use |
|------|-------|-----|
| xs | `h-3 w-3` | Badge dots |
| sm | `h-3.5 w-3.5` | Chips |
| md | `h-4 w-4` | Nav, buttons (`appIconNavClass`) |
| lg | `h-5 w-5` | Card headers |
| xl | `h-6 w-6` | Empty states, tiles |

---

## Layout primitives

### Page shell (`page-layout-patterns-des27-v1` — DES-27, `lib/design/page-layout-patterns.ts`)

| Primitive | Import | Pattern |
|-----------|--------|---------|
| Page title | `PageHeader` | `text-3xl font-semibold tracking-tight` |
| Page wrapper | `PageShell` | `space-y-8` vertical rhythm |
| Exception | `PAGE_LAYOUT_EXCEPTION` marker | Terminal/KDS/command surfaces with bespoke chrome |

**Audited routes:** integrations health, marketplace, today/profit.  
**Exempt:** `/dashboard/today`, `/dashboard/pos/terminal`, `/dashboard/command-center`.

### Spacing

- Dashboard sections: `space-y-6` to `space-y-8`
- Card grids: `gap-4` (dense ops: `gap-3`)
- Sticky ops bars: `sticky top-0 z-chrome backdrop-blur` + translucent `bg-background/95`

---

## State patterns

Stabilization capstone **DES-38** composes DES-27 through DES-37:

| State | Policy | Module |
|-------|--------|--------|
| Loading skeleton | DES-28 | `loading-skeleton-patterns.ts` |
| Route spinner | DES-36 | `route-loading-patterns.ts` |
| Empty | DES-34 | `empty-state-patterns.ts` → `EmptyState` |
| Error | DES-33 | `error-state-patterns.ts` |
| Form feedback | DES-32 | `form-feedback-patterns.ts` |
| Permission denied | DES-37 | `permission-denied-patterns.ts` |
| Filter/search | DES-30 | `filter-search-patterns.ts` |
| Table vs card | DES-31 | `table-card-patterns.ts` |
| Metric cards | DES-35 | `metric-card-patterns.ts` |
| Page sections | DES-29 | `page-section-patterns.ts` |

Every primary module needs **actionable** empty and error copy — not blank cards.

---

## Role surfaces

Five role UIs at `/dashboard/roles/{owner|manager|chef|cashier|driver}` share:

| Pattern | Module |
|---------|--------|
| Layout shell | `dashboardRoleShellClass` |
| Subnav pills | `dashboardNavPillClass` |
| Hero accent card | `ROLE_HERO_CARD_CLASS` |
| Priority tiles | `roleTileToneClass` |
| Next action | `roleNextActionCardClass` |
| PageHeader CTA | `rolePageActionClass` |

Source: `lib/design/dark-mode-everywhere-patterns.ts` — policy `dark-mode-everywhere-des26-v1` (DES-26).

---

## Mobile-first operator UX

**Policy:** `mobile-first-redesign-des25-v1` (DES-25)

| Constraint | Value |
|------------|------:|
| Viewport baseline | 375px (iPhone SE) |
| Touch floor | 44×44 CSS px (WCAG 2.5.5) |
| Swipe dismiss | 48px horizontal threshold (nav drawer) |

| Pattern | Module |
|---------|--------|
| Chrome buttons | `dashboardChromeButtonClass`, `dashboardChromeNavTriggerClass` |
| Shortcut tiles | `dashboardShortcutTileClass` |
| POS floor | `lib/pos/touch-targets.ts` (`min-h-11`, `min-h-12`) |
| Swipe handlers | `createDashboardSwipeHandlers` |

---

## Dark mode

### Shell consistency (DES-24)

- `dashboardShellRootClass` / `dashboardShellHeaderClass` → `bg-background text-foreground`
- Zero `bg-white` on operator surfaces
- Toggle: `components/theme-toggle.tsx`

### Everywhere (DES-26)

Extends DES-24 to **21 modules**: shell, 5 role panels, 5 role pages, roles layout, command center, analytics suite, data export.

Audit: `auditDarkModeEverywhere()` in `lib/design/dark-mode-everywhere-audit-policy.ts`.

---

## Audit policy index

| ID | Name | Entry point |
|----|------|-------------|
| DES-21 | Color tokens | `color-token-audit-policy.ts` |
| DES-23 | Z-index scale | `z-index-audit-policy.ts` |
| DES-24 | Dark mode shell | `dark-mode-consistency-audit-policy.ts` |
| DES-25 | Mobile-first redesign | `mobile-first-redesign-audit-policy.ts` |
| DES-26 | Dark mode everywhere | `dark-mode-everywhere-audit-policy.ts` |
| DES-27 | Page layout | `page-layout-audit-policy.ts` |
| DES-28–37 | Stabilization states | `stabilization-design-audit-policy.ts` |
| DES-38 | Stabilization capstone | `stabilization-design-patterns.ts` |
| DES-39 | Design system doc | `design-system-doc-policy.ts` |

Run targeted unit tests: `tests/unit/*-policy.test.ts`, `tests/unit/design-system-doc.test.ts`.

---

## Component primitives

| Primitive | Path | Use |
|-----------|------|-----|
| Button | `components/ui/button.tsx` | Primary happy path; `destructive` for irreversible |
| Card | `components/ui/card.tsx` | Explainable ops blocks with `CardDescription` |
| Badge | `components/ui/badge.tsx` | Environment, demo, status chips |
| EmptyState | `components/ui/empty-state.tsx` | Zero-data with CTA |
| PageHeader | `components/layout/page-header.tsx` | Standard dashboard title + actions |
| Sheet | `components/ui/sheet.tsx` | Mobile nav drawer |
| ThemeToggle | `components/theme-toggle.tsx` | Light / Dark / System |

### Typography

| Role | Class |
|------|-------|
| Page title | `text-3xl font-semibold tracking-tight` |
| Section label | `text-sm font-semibold uppercase tracking-wide text-muted-foreground` |
| Card title | `text-lg` or `text-xs font-medium text-muted-foreground` (KPI) |
| Body | `text-sm text-muted-foreground` |

### Motion

- Subtle only: `transition-colors`, `hover:bg-muted/40`
- No parallax on operational surfaces — readability under rush hour matters more

---

## References

- `components/ui/*` — shadcn primitives
- `lib/design/*` — policy modules and audit policies
- `docs/dark-mode-audit.md` — theme architecture deep-dive
- `docs/ACCESSIBILITY_REVIEW.md` — WCAG touch target guidance
- `docs/ux-design-system-roadmap.md` — role-shell roadmap
- `docs/DESIGN_SYSTEM.md` — legacy short reference (superseded by this document)
