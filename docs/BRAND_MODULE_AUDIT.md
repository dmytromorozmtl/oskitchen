# Brand module audit

**Scope:** `/dashboard/brands`, Prisma `Brand`, brand-scoped relations, header brand context, wizard, detail, templates, assignment, reports.  
**Constraints respected:** No destructive migration; nullable `brandId` preserved; superadmin `workspace.moroz@gmail.com` unchanged (platform owner helper).

## Current implementation (snapshot)

| Area | Current state |
|------|----------------|
| Hub `/dashboard/brands` | Management center: summary cards, tabbed overview/active/drafts/templates/multi/reports, quick create, brand cards with setup %, CTAs to wizard/templates/setup/assignment. |
| Wizard `/dashboard/brands/new` | Eight-step client wizard; posts to `createBrand` with optional JSON hints (`fulfillmentSettingsJson`, `productionSettingsJson`). |
| Detail `/dashboard/brands/[brandId]` | Tabbed shell: overview KPIs, identity form (`updateBrandDetails`), module deep links, lifecycle form, reports shortcut. |
| Reports `/dashboard/brands/[brandId]/reports` | Revenue aggregates + top order lines by quantity for orders with `brandId`. |
| Templates `/dashboard/brands/templates` | Cards linking to wizard with `?template=` keys. |
| Multi-brand setup | Static guided checklist + links. |
| Assignment `/dashboard/brands/assignment` | Counts of unassigned menus/products/orders/storefront/channels + module links (bulk write UI staged). |
| `Brand` model | Extended lifecycle (`BrandLifecycleStatus`), `BrandConceptKind`, identity/SEO/JSON settings, optional `locationId`, `defaultMenuId`, scalar default storefront/channel ids (no Prisma FK to avoid 1:1 issues). |
| Brand switcher | `BrandSwitcher` in `DashboardShell`; workspace brands loaded in `app/dashboard/layout.tsx`; localStorage key `kitchenos.selectedBrandId`; hidden when ≤1 brand. |
| `BrandContextProvider` | Wraps dashboard `<main>`; syncs on custom event when switcher changes. |

## `brandId` usage (high level)

Present (nullable) on: `Menu`, `Product`, `Order`, `StorefrontSettings`, `IntegrationConnection`, and others per schema. Legacy rows with `null` remain valid.

## Issues, impact, fixes, priority

### P0 — Brand lifecycle vs legacy `active` boolean

- **State:** Migrated to `lifecycle_status` enum; code must not reference removed `brand.active`.
- **Limiting:** Type/runtime drift breaks builds.
- **Affected:** All workspaces.
- **Fix:** Use `lifecycleStatus` only (done in hub/detail/actions).
- **Priority:** P0 (stabilization).

### P1 — Storefront singleton per user vs multi-brand

- **State:** `StorefrontSettings.userId` is unique; one row per owner; optional `brandId` on that row.
- **Limiting:** True “one storefront per brand” needs multiple storefront rows or tenant model change.
- **Affected:** Ghost kitchens wanting isolated domains per brand.
- **Fix:** Future schema: multiple storefront rows per workspace or brand-owned slug table; keep `brandId` optional meanwhile.
- **Priority:** P1 architecture follow-up.

### P1 — Order Hub / production filters not wired to brand context

- **State:** Switcher persists selection; list pages do not auto-filter queries yet.
- **Limiting:** Operators cannot slice live boards by brand without manual discipline.
- **Affected:** Multi-brand ghost kitchens.
- **Fix:** Pass `brandId` into Prisma `where` when context ≠ `__all__` (menus/orders/production pages).
- **Priority:** P1.

### P1 — Bulk assignment UI

- **State:** Assignment route shows counts + deep links; no transactional bulk apply/undo.
- **Limiting:** Large backfills remain manual/SQL-adjacent.
- **Affected:** Enterprises importing historical orders/channels.
- **Fix:** Server actions with preview diff, idempotent batches, audit logs, optional undo window.
- **Priority:** P1.

### P2 — Wizard file uploads

- **State:** Wizard collects logo/cover as URLs only.
- **Limiting:** Non-technical users lack CDN upload path.
- **Affected:** SMB operators.
- **Fix:** Integrate existing asset upload pipeline when available.
- **Priority:** P2.

### P2 — Brand-level RBAC

- **State:** `lib/brands/brand-permissions.ts` stubs owner/superadmin/assigned-brand matrix.
- **Limiting:** Staff cannot be scoped to single brand yet.
- **Affected:** Large teams.
- **Fix:** Workspace role + `assignedBrandIds` enforcement on server actions.
- **Priority:** P2.

### P3 — Customer cohort / overlap reports

- **State:** Not implemented.
- **Limiting:** Marketing analytics across brands.
- **Affected:** Groups running overlapping guest bases.
- **Fix:** SQL/Prisma aggregations on orders + emails hashed per policy.
- **Priority:** P3.

### UX / empty states

- **State:** Hub explains when brands matter; single-brand nudge; CTAs for templates/skip.
- **Limiting:** None critical.
- **Fix:** Iterate copy with customer research.
- **Priority:** P2 polish.

## Menu / product relationships

- `Menu.brandId` optional — menus can exist workspace-wide; assigning brand is non-destructive.
- `Product.brandId` optional — same; catalog menus may keep items unscoped.

## Permissions

- Today: workspace owner (and platform superadmin via billing bypass) can mutate brands.
- Future: `canManageSingleBrand` with `assignedBrandIds`.

## Business mode relevance

- Workspace `kitchenSettings.businessType` drives nav copy; per-brand `defaultBusinessMode` allows mixed modes (meal prep + catering) when brand context is selected — terminology merge is roadmap (`BrandContext` consumers).

## Recommended next engineering passes

1. Wire `BrandFilter` / context into Orders, Menus, Products, Production queries.
2. Storefront multi-row design doc + migration plan (non-breaking phase).
3. Bulk assignment actions with preview + audit.
