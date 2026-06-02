# Component library — OS Kitchen

**Updated:** 2026-06-02 · **Scope:** 20 production components used across dashboard, marketplace, onboarding, and integrations.

This catalog is the design-engineering reference for building new surfaces. Prefer these primitives before inventing one-off markup. Styling follows Tailwind + shadcn/ui patterns; programmatic tokens live in `lib/design-tokens.ts`.

---

## Layer map

| Layer | Path prefix | Use when |
|-------|-------------|----------|
| UI primitives | `components/ui/` | Buttons, cards, badges, sheets — any surface |
| Layout | `components/layout/` | Page chrome, max-width, headers |
| Feedback | `components/feedback/` | Errors, loading, configuration gaps |
| Status | `components/status/` | Operational severity labels |
| Cards | `components/cards/` | KPI and health summaries |
| Dashboard | `components/dashboard/` | Operator home and module shells |
| Marketplace | `components/marketplace/` | B2B catalog, cart, vendor flows |
| Onboarding | `components/onboarding/` | Launch wizard and steppers |
| Integrations | `components/integrations/` | Channel maturity labels |
| Kitchen | `components/kitchen/` | Camera honesty and station UI |

---

## 1. Button

**Path:** `components/ui/button.tsx`

Primary interactive control. Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`.

**When to use:** Any click action, form submit, or navigation CTA. Pair with `Link` via `asChild` when the action is a route change.

**Example:**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="sm">Save draft</Button>
```

---

## 2. Card

**Path:** `components/ui/card.tsx`

Composable surface: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

**When to use:** Group related content on dashboard pages, empty states, and marketplace panels. Default border + subtle shadow matches `lib/design-tokens.ts` `shadow.card`.

---

## 3. Badge

**Path:** `components/ui/badge.tsx`

Compact status or count pill. Variants: `default`, `secondary`, `destructive`, `outline`.

**When to use:** Order status, filter counts, inline labels. For integration maturity, prefer `BetaBadge` (see §13).

---

## 4. EmptyState

**Path:** `components/ui/empty-state.tsx` · **Re-export:** `components/dashboard/empty-state.tsx`

Unified empty and zero-result UX with optional icon, primary/secondary CTAs, demo link, and help link.

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` | Required headline |
| `description` | `string` | Supporting copy |
| `variant` | `"card" \| "inline"` | Card for page-level; inline for tables |
| `showDemoLink` | `boolean` | Default `true`; set `false` on marketplace |
| `primaryHref` / `primaryLabel` | — | Main CTA |
| `icon` | `LucideIcon` | Optional leading icon |

**Used on:** Marketplace vendors/products/orders lists, catalog filter no-results.

**Example:**

```tsx
<EmptyState
  title="No vendors yet"
  description="Invite suppliers or browse the demo catalog."
  primaryHref="/dashboard/marketplace/vendors/new"
  primaryLabel="Add vendor"
  showDemoLink={false}
/>
```

---

## 5. Sheet

**Path:** `components/ui/sheet.tsx`

Slide-over panel (`Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`). Mobile-first drawer pattern.

**When to use:** Filters, cart preview, secondary forms on narrow viewports. See `CatalogFilterBar` (§16).

---

## 6. PageHeader

**Path:** `components/layout/page-header.tsx`

Standard page title block: `title`, optional `description`, optional `actions` slot (buttons on the right).

**When to use:** Top of every dashboard module page before `PageShell` content.

```tsx
<PageHeader
  title="Marketplace"
  description="Source ingredients and supplies from verified vendors."
  actions={<Button>New order</Button>}
/>
```

---

## 7. PageShell

**Path:** `components/layout/page-shell.tsx`

Content width wrapper. Default `max-w-6xl` from `layout.contentMaxClass`; `narrow` prop uses `max-w-3xl` for wizards.

**When to use:** Wrap main page body inside dashboard layouts for consistent horizontal rhythm.

---

## 8. PermissionDeniedCard

**Path:** `components/ui/permission-denied-card.tsx`

RBAC denial surface with surface-specific copy from `lib/ux/permission-denied-copy.ts`. Exposes `data-permission-denied-surface` for E2E.

**When to use:** User lacks entitlement for a module — never show a blank page or generic 403.

---

## 9. OnboardingStepper

**Path:** `components/onboarding/onboarding-stepper.tsx`

Progress nav for launch wizard: step pills, completion bar, optional launch checklist %.

| Prop | Type | Notes |
|------|------|-------|
| `steps` | `OnboardingStepperStep[]` | `id`, `label`, optional `optional` / `recommended` |
| `currentStepIndex` | `number` | Zero-based active step |
| `onStepClick` | `(index) => void` | Optional jump navigation |
| `launchProgressPercent` | `number` | Secondary metric in header |

**Wired in:** `components/onboarding/onboarding-wizard.tsx` · **Test id:** `onboarding-stepper`

---

## 10. TodayCommandCenterView

**Path:** `components/dashboard/today-command-center.tsx`

Operator home: shift summary, priority actions, AI briefing hook, module shortcuts. Primary GTM demo surface.

**When to use:** `/dashboard/today` and sales demos. Mobile layout audited in `docs/today-command-center-mobile-audit.md`.

---

## 11. KpiCard

**Path:** `components/cards/kpi-card.tsx`

Metric tile: uppercase label, large tabular value, optional hint.

**When to use:** Dashboard analytics rows, marketplace vendor analytics, food-cost summaries.

```tsx
<KpiCard label="Open tickets" value={12} hint="3 overdue SLA" />
```

---

## 12. OperationalStateBadge

**Path:** `components/status/operational-state-badge.tsx`

Severity-aware status badge: `none`, `info`, `warning`, `blocker` tones aligned with amber/sky/destructive tokens.

**When to use:** Integration health, sync drift, deployment blockers — anywhere LIVE/BETA/PASS/NO-GO needs honest severity (see upcoming `docs/status-color-tokens.md`).

---

## 13. BetaBadge

**Path:** `components/integrations/beta-badge.tsx`

Amber **BETA** pill for registry integrations not yet LIVE-certified. Title tooltip explains staging smoke requirement.

**Applied on:** `components/channels/channel-card.tsx`, `components/dashboard/extensions/extensions-catalog-panel.tsx`, and all seven BETA integration cards.

---

## 14. KitchenCameraPreviewBanner

**Path:** `components/kitchen/kitchen-camera-preview-banner.tsx`

Honesty banner when `KITCHEN_CAMERA_SYNTHETIC` or no live stream: amber bar, `CameraOff` icon, “Preview mode — no live camera connected”.

**Wired in:** `components/dashboard/kitchen-cameras-dashboard.tsx` · **Test id:** `kitchen-camera-preview-banner`

**Policy:** `docs/kitchen-camera-honest-positioning.md`

---

## 15. MarketplaceDataUnavailable

**Path:** `components/marketplace/marketplace-data-unavailable.tsx`

Empty state when marketplace tables are not seeded or tenant is pre-rollout. Inline SVG illustration, “Marketplace is being set up”, Contact support CTA.

| Prop | Default |
|------|---------|
| `title` | "Marketplace is being set up" |
| `description` | Rollout copy |

**Test id:** `marketplace-data-unavailable`

---

## 16. CatalogFilterBar

**Path:** `components/marketplace/catalog-filter-bar.tsx` · **Re-export:** `marketplace-catalog-filter-bar.tsx`

Catalog search and filters. Desktop: inline grid. Mobile: search field + **Sheet** drawer with filter badge count.

| Export | Purpose |
|--------|---------|
| `CatalogFilterBar` | Main component |
| `countActiveCatalogFilters` | Badge count for active filters |

**Filter model:** `MarketplaceCatalogFilters` from `lib/marketplace/catalog-filters.ts`

**Tests:** `tests/unit/catalog-filter-bar.test.ts`

---

## 17. ProductComparisonTable

**Path:** `components/marketplace/product-comparison-table.tsx`

Side-by-side comparison table for marketplace SKUs. **Max 4 products** (`MARKETPLACE_PRODUCT_COMPARISON_MAX`).

| Prop | Notes |
|------|-------|
| `products` | `MarketplaceCompareRow[]` |
| `canAddToCart` / `onAddToCart` | Optional cart actions |
| `truncatedFrom` | Show “Showing 4 of N” when list exceeds cap |

**Wired in:** `components/marketplace/marketplace-compare-client.tsx` · **Tests:** `tests/unit/product-comparison-table.test.ts`

---

## 18. MarketplaceCatalogProductCard

**Path:** `components/marketplace/marketplace-catalog-product-card.tsx`

Product tile for catalog grid: image, vendor, price, MOQ, compare checkbox (limit 4), add-to-cart.

**Related:** `MARKETPLACE_TOUCH_*` classes from `lib/marketplace/mobile-ui.ts` for 44px touch targets.

---

## 19. RetryableErrorState

**Path:** `components/feedback/retryable-error-state.tsx`

Thin wrapper over `ErrorState` with “Try again” retry button.

**When to use:** Client-side fetch failures where re-fetch is safe. Prefer this over raw error strings in AI and dashboard panels until `ApiErrorState` (task backlog) ships.

---

## 20. MarketplaceMobileShell

**Path:** `components/marketplace/marketplace-mobile-shell.tsx`

Mobile marketplace layout: offline banner, cached catalog count, floating cart drawer slot.

| Prop | Notes |
|------|-------|
| `cart` | `MarketplaceCartClientView \| null` |
| `canCartWrite` | RBAC for cart mutations |
| `children` | Page content |

**When to use:** Wrap marketplace catalog and checkout routes on viewports &lt; `md`.

---

## Conventions

### Imports

Use `@/components/...` path aliases. Do not deep-import from `components/ui/button` internals.

### Accessibility

- Steppers and banners expose `aria-label` / `role="status"`.
- Comparison table uses `scope="row"` on label cells.
- Empty states use semantic headings inside `CardTitle`.

### Testing

- Prefer `data-testid` on honesty and empty-state components (listed above).
- Unit tests live in `tests/unit/`; vitest config matches `*.test.ts`.

### When to add a new component

1. Check this catalog and `components/ui/` first.
2. If extending marketplace or dashboard, follow existing client/server split (`*-client.tsx` for `"use client"`).
3. Document new shared components here when they reach second consumer.

---

## Related docs

| Doc | Topic |
|-----|-------|
| `docs/navigation-audit.md` | Route inventory and IA |
| `docs/today-command-center-mobile-audit.md` | Today home responsive review |
| `docs/vendor-registration-flow-design.md` | Vendor onboarding screens |
| `docs/status-color-tokens.md` | LIVE/BETA/PLACEHOLDER palette (planned) |
| `docs/typography-audit.md` | Type scale audit (planned) |
| `lib/design-tokens.ts` | Radius, shadow, layout constants |

---

## Regeneration

This file is manually curated. For route counts, run `node scripts/generate-navigation-audit.mjs`. Component inventory can be rescanned with:

```bash
find components -name '*.tsx' | wc -l
```
