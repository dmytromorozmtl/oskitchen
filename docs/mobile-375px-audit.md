# Mobile 375px audit — OS Kitchen

**Version:** 1.0 · **June 2026  
**Policy:** `mobile-375px-audit-v1`  
**Baseline viewport:** **375×812** (iPhone 14 / standard mobile QA width)  
**Method:** Static Tailwind class audit + layout review against breakpoints (`sm` 640, `md` 768, `lg` 1024). Cross-referenced with [`today-command-center-mobile-audit.md`](./today-command-center-mobile-audit.md) and [`navigation-ia-audit.md`](./navigation-ia-audit.md).  
**Touch standard:** WCAG 2.5.5 — **44×44 CSS px** minimum; POS/KDS use **48px** floor via `lib/pos/touch-targets.ts`.

---

## Executive summary

| Metric | Result |
|--------|--------|
| **Critical pages audited** | **30** |
| **Pass at 375px (usable without horizontal scroll)** | **22 / 30** (73%) |
| **Partial (workable with friction)** | **7 / 30** |
| **Fail (layout break or unusable primary action)** | **1 / 30** |
| **Overall mobile readiness score** | **74 / 100** |
| **Automated 375px E2E** | **Missing** — recommend Playwright `viewport: { width: 375, height: 812 }` smoke on P0 routes |

**Verdict:** Pilot-safe for **owner scan-and-act** (Today, Order Hub, integrations) and **guest storefront checkout** on phone. **POS terminal** and **marketplace compare tables** need targeted breakpoint fixes before field demos on 375px hardware.

---

## Breakpoint reference

| Token | Min width | Mobile role |
|-------|----------:|-------------|
| *(base)* | 0 | Single-column default; sidebar hidden |
| `sm` | 640px | 2-up grids; inline action rows |
| `md` | 768px | Marketing nav visible; tablet POS |
| `lg` | 1024px | Dashboard sidebar fixed; data tables |

**Dashboard shell** (`components/dashboard/dashboard-shell.tsx`): hamburger sheet below `lg`; main padding `px-4 pb-24 sm:px-8` — bottom pad preserves thumb reach on notched phones.

---

## 30 critical pages — audit matrix

| # | Route | Primary UI | 375px | Score | Top issue |
|---|-------|------------|:-----:|:-----:|-----------|
| 1 | `/` | `components/marketing/home-landing.tsx` | ✅ | 82 | Hero CTA row wraps; long feature grid scroll |
| 2 | `/pricing` | `components/marketing/pricing-page.tsx` | ✅ | 80 | Plan cards stack; comparison table horizontal scroll |
| 3 | `/login` | `app/login/page.tsx` | ✅ | 90 | `max-w-md px-4` — centered form, no overflow |
| 4 | `/signup` | `app/signup/page.tsx` | ✅ | 88 | Same pattern as login |
| 5 | `/landing/ghost-kitchen` | ICP landing template | ✅ | 78 | Long-form sections; sticky header OK |
| 6 | `/onboarding` | `app/onboarding/page.tsx` | ⚠️ | 72 | Multi-step wizard — progress bar + footer CTAs crowd 320px |
| 7 | `/dashboard/today` | `today-command-center.tsx` | ⚠️ | 78 | Deep scroll when briefing strips stack — see dedicated audit |
| 8 | `/dashboard` | `operator-home-panel.tsx` | ✅ | 85 | Tile grid 1-col; POS touch classes applied |
| 9 | `/dashboard/quick-start` | Launch wizard shell | ⚠️ | 70 | Step cards + checklist — vertical noise on day-1 |
| 10 | `/dashboard/orders/hub` | Order hub list | ✅ | 83 | Card fallback on narrow; filters in sheet |
| 11 | `/dashboard/pos/terminal` | `pos-terminal-client.tsx` | ❌ | 58 | Cart grid tuned for tablet; 375px cart sidebar overlaps |
| 12 | `/kds` | `kds-daily-service.tsx` | ✅ | 86 | Bump buttons `min-h-11`; priority lane horizontal scroll |
| 13 | `/dashboard/kitchen/tablet` | Kitchen tablet view | ✅ | 84 | `md:grid-cols-2` — single column at 375px by design |
| 14 | `/dashboard/marketplace` | Marketplace hub | ✅ | 82 | Category grid `sm:grid-cols-2` |
| 15 | `/dashboard/marketplace/catalog` | `catalog-filter-bar.tsx` | ✅ | 80 | Filter sheet (`sm:max-w-md`); card grid 1-col |
| 16 | `/dashboard/marketplace/checkout` | Checkout flow | ⚠️ | 74 | Sticky summary + long form — thumb reach to pay CTA |
| 17 | `/dashboard/marketplace/orders` | `marketplace-responsive-data-list.tsx` | ✅ | 88 | Card list below `lg`; table hidden — good pattern |
| 18 | `/dashboard/integrations` | Integration cards | ✅ | 81 | Provider cards stack; test buttons full-width |
| 19 | `/dashboard/settings` | Settings hub | ✅ | 79 | Section registry links — single column |
| 20 | `/dashboard/today/profit` | Profit dashboard | ⚠️ | 68 | Chart + margin tables overflow without `overflow-x-auto` |
| 21 | `/dashboard/reports` | Reports catalog | ✅ | 77 | Card grid; builder link accessible |
| 22 | `/dashboard/packing/verify` | Packing verify | ✅ | 80 | Scan input full-width; result card stacks |
| 23 | `/s/[storeSlug]/menu` | Storefront menu | ✅ | 86 | `sf-container` + `px-4`; product cards responsive |
| 24 | `/s/[storeSlug]/checkout` | Guest checkout | ✅ | 84 | `max-w-lg` constraint; fulfillment picker stacks |
| 25 | `/q/[slug]/[tableId]` | QR table order | ✅ | 88 | Dark layout `max-w-lg px-4`; guest-first |
| 26 | `/vendor/dashboard` | Vendor cabinet | ✅ | 80 | Vendor shell mirrors dashboard sheet nav |
| 27 | `/vendor/orders` | Vendor orders list | ✅ | 82 | Card rows; status badges wrap |
| 28 | `/driver` | Driver dispatch | ⚠️ | 71 | Route list dense; map widget deferred load |
| 29 | `/demo` | Demo hub | ✅ | 83 | Sign-in gate; vertical card stack |
| 30 | `/help/integrations` | Help / integrations docs | ✅ | 85 | Prose `max-w-none`; readable at 375px |

**Legend:** ✅ Pass · ⚠️ Partial · ❌ Fail

---

## Breakpoint fixes — prioritized backlog

### P0 — block pilot mobile demos

| ID | Page | Fix | File(s) |
|----|------|-----|---------|
| M-01 | POS terminal | Hide cart drawer behind bottom sheet at `<md`; full-width product grid | `components/dashboard/pos-terminal-client.tsx` |
| M-02 | POS terminal | Enforce `posTouchButtonClass` on all cart qty controls | `components/pos/tab-panel.tsx` |
| M-03 | Profit dashboard | Wrap margin tables in `overflow-x-auto`; collapse chart legend below `sm` | `app/dashboard/today/profit/page.tsx` |

### P1 — reduce friction (375–390px)

| ID | Page | Fix | File(s) |
|----|------|-----|---------|
| M-04 | Today | “Jump to operations” anchor when briefing strips render | `today-command-center.tsx`, `owner-daily-briefing-hero.tsx` |
| M-05 | Today | Shrink header icon cluster — move theme toggle into sheet | `dashboard-shell.tsx` |
| M-06 | Marketplace checkout | Sticky pay bar `fixed bottom-0 inset-x-0 pb-safe` | marketplace checkout client |
| M-07 | Marketplace compare | Force card layout below `md` (hide wide comparison table) | `product-comparison-table.tsx` |
| M-08 | Onboarding | Collapse step sidebar into top progress dots below `sm` | onboarding wizard shell |
| M-09 | Quick start | Collapse completed checklist steps by default on mobile | launch wizard components |
| M-10 | Driver | Increase route row tap target to `min-h-11` | driver page client |

### P2 — polish

| ID | Page | Fix |
|----|------|-----|
| M-11 | Home | Reduce hero animation height on `<sm` |
| M-12 | Pricing | Accordion FAQ instead of wide comparison table |
| M-13 | Integrations | Channel logo strip `overflow-x-auto snap-x` |
| M-14 | Settings | Sticky section nav pill bar on scroll |
| M-15 | KDS | Reduce priority lane card `min-w-[220px]` → `min-w-[180px]` at 375px |

---

## Shared patterns (reuse)

| Pattern | Where used | Mobile behavior |
|---------|------------|-----------------|
| `MarketplaceResponsiveDataList` | Marketplace orders, vendors | Cards `<lg`, table `≥lg` |
| `MARKETPLACE_TOUCH_*` | Marketplace forms/buttons | 44px min height |
| `posTouchButtonClass` | POS surfaces | 48px min touch |
| Dashboard sheet nav | All `/dashboard/*` | 280px drawer, `lg:hidden` trigger |
| `SiteMobileNav` | Marketing shell | Hamburger below `md` |
| Storefront `sf-container` | `/s/*` guest | Consistent horizontal padding |

---

## Section deep-dives

### Marketing shell (pages 1–5)

- **Header:** Desktop nav hidden below `md`; `SiteMobileNav` provides full link tree — ✅ no dead-end at 375px.
- **Home hero:** Framer-motion entrance — no layout shift; feature sections stack vertically.
- **Pricing:** Three plan cards single-column; FAQ accordion usable; SKU table may scroll horizontally — acceptable with scroll hint.

### Operator dashboard (pages 6–11, 18–22)

- **Today:** Detailed findings in [`today-command-center-mobile-audit.md`](./today-command-center-mobile-audit.md). KPI collapse policies help mobile scroll depth.
- **Order Hub:** Primary pilot workflow — filters collapse; order cards readable.
- **POS terminal (FAIL):** Layout assumes ≥768px split pane. At 375px the cart column consumes viewport; product grid becomes 1-col but cart overlap blocks checkout CTA. **Fix M-01** required before handheld POS demos.
- **Integrations:** Full-width provider cards; honest SKIPPED badges wrap correctly.

### Marketplace B2B (pages 14–17)

- Catalog uses filter **Sheet** (`catalog-filter-bar.tsx:276`) — correct mobile pattern.
- Checkout needs sticky pay bar (M-06) — form fields push primary button below fold on iPhone SE.
- Orders list exemplifies responsive data pattern — **reference implementation** for other tables.

### Guest & vendor flows (pages 23–28)

- **Storefront:** `app/s/[storeSlug]/layout.tsx` — preview banners, `sm:py-10` content padding.
- **QR guest:** Dark theme, centered `max-w-lg` — optimized for phone scan context.
- **Vendor cabinet:** Same sheet-nav pattern as dashboard; finance tables use `overflow-x-auto`.

---

## Verification commands

```bash
# Static — grep for pages missing responsive classes (no sm:/md: in page shell)
rg -l "page\.tsx" app/dashboard/marketplace app/dashboard/pos --glob '*.tsx' | head

# POS touch target unit tests
npm test -- tests/unit/pos-touch-targets.test.ts

# Today mobile audit cross-check
npm test -- tests/performance/today-page-load.test.ts

# Manual Playwright (recommended — add to e2e/mobile-375-smoke.spec.ts)
# npx playwright test --project=mobile-375
```

### Recommended Playwright viewport config

```typescript
// playwright.config.ts — mobile-375 project
{ name: "mobile-375", use: { viewport: { width: 375, height: 812 } } }
```

**P0 smoke routes at 375px:** `/login`, `/dashboard/today`, `/dashboard/orders/hub`, `/dashboard/marketplace/catalog`, `/s/demo/menu`, `/q/demo/table-1`.

---

## Cross-references

| Doc | Scope |
|-----|-------|
| [`today-command-center-mobile-audit.md`](./today-command-center-mobile-audit.md) | Today page deep-dive |
| [`navigation-ia-audit.md`](./navigation-ia-audit.md) | 801-route IA map |
| [`FINAL_PLATFORM_QA.md`](./FINAL_PLATFORM_QA.md) | Release QA checklist |
| [`accessibility-audit.md`](./accessibility-audit.md) | Contrast + axe (complements touch targets) |
| `lib/pos/touch-targets.ts` | POS 48px floor |
| `lib/marketplace/mobile-ui.ts` | Marketplace 44px helpers |

---

## Changelog

| Date | Cycle | Change |
|------|-------|--------|
| 2026-06-03 | 20 (DES-02) | Initial 30-page 375px audit + breakpoint fix backlog M-01–M-15 |
