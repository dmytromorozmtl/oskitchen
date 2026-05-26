# Navigation and module system — readiness report

**Date:** 2026-05-07  
**Scope:** Adaptive dashboard navigation, module registry alignment, role and business-mode filtering, command palette, setup hint, documentation, and QA artifacts.

## What improved

1. **Central metadata** — `lib/modules/module-registry.ts` remains the canonical module list; `modulePublicMeta` in `lib/modules/module-nav-groups.ts` exposes compact public fields for future consumers.  
2. **Role-aware routing** — `ModuleRouteGate` now blocks **STAFF** (and future roles) from paths outside `isDashboardPathAllowedForRole`, with a dedicated **“You do not have access”** state separate from **module disabled**.  
3. **Nav context** — `DashboardShell` passes `userRole`, `isPlatformSuper`, and enriched `navContext` into sidebar and breadcrumbs via `getFilteredNavGroups`.  
4. **Sidebar polish** — Business mode badge, ordered pins (max 6), deduped recent, clear recent, setup progress widget slot, improved group semantics.  
5. **Command palette** — Built from `getCommandPaletteRoutesFromRegistry()` + quick actions; respects **disabled modules**, **internalOnly/superAdminOnly**, **terminology** (when href maps to `NAV_GROUPS`), and **role allow-list**.  
6. **Module settings** — Search field; **internal** tier hidden unless `platformBypass` (super-admin).  
7. **Setup progress** — `lib/setup-hint.ts` derives next action from `KitchenSettings` without extra queries; surfaced in sidebar when incomplete.  
8. **Documentation** — Audit, consolidation plan, terminology QA, accessibility, performance, QA matrix (this set).

## Module registry status

- **Complete for:** path prefixes, categories, tiers, internal flags, beta flags, `moduleModeHints` for cross-mode nuance.  
- **Future enrichment:** `canonicalLabel` vs i18n `labelKey`, `healthMetricKey`, `badgeMetricKey`, `primaryAction`/`secondaryAction` per module (spec fields) — add incrementally without blocking nav.

## Business-mode visibility status

- **Implemented in** `lib/business-mode-registry.ts` (`BusinessModeExperience`: default, recommended, advanced, hidden-by-default, widgets).  
- **Focused nav** applies `hiddenByDefaultModuleKeys` until user opts into “Show all modules”.

## Role navigation status

- **Prisma today:** `OWNER` \| `STAFF` only.  
- **STAFF:** prefix allow-list in `lib/nav-role-filter.ts`.  
- **Next sprint:** expand enum + mapping for Chef, Packer, Driver, Accountant personas (see audit P3).

## Sidebar improvements

- Mode label chip; setup widget; pins/recents rules; internal group defaults collapsed for non–full-nav users.

## Command palette status

- Registry-backed route list with permission filters and BAR/MEAL_PREP/etc. labels when href matches nav config.

## Setup progress status

- Sidebar shows compact progress when `buildWorkspaceSetupHint` returns a payload; disappears when checklist complete.

## Duplicate module recommendations

- See `docs/NAVIGATION_CONSOLIDATION_PLAN.md` (Orders vs hub, packing verify, insights trio).

## Accessibility status

- See `docs/NAVIGATION_ACCESSIBILITY_REVIEW.md` — core semantics in place; arrow-key palette navigation optional.

## Performance status

- See `docs/NAVIGATION_PERFORMANCE_REVIEW.md` — sidebar remains static-derived; no new DB in client nav.

## Super-admin validation

- **`workspace.moroz@gmail.com`** and DB `SUPER_ADMIN` → `platformBypass`; full modules; internal tier in settings; module route gate bypass for disabled keys.

## Remaining risks

1. **Granular roles** not in schema — STAFF strip may be wrong for mixed ops until expanded.  
2. **Palette vs sidebar** label drift for hrefs not in `NAV_GROUPS`.  
3. **Badge data** not yet wired — must stay summarized when implemented.

## Next recommended sprint

1. Prisma `UserRole` expansion + per-role allow maps + default home routes.  
2. Wire **lazy badge** props from a single dashboard layout query.  
3. Consolidate **Orders / Order hub** primary entry with feature flag + redirect policy.  
4. Add **breadcrumb** adoption across inner pages using `PageContextHeader` + registry copy.

## Build verification

- `npm run typecheck` — pass  
- `npm run build` — pass
