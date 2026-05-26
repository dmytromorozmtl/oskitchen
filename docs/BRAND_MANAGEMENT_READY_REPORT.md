# Brand Management — readiness report

Date: 2026-05-07 (engineering snapshot)

## What changed

- **Prisma `Brand`:** Expanded fields for lifecycle, concept kind, identity, SEO, URLs, JSON settings, optional location + default menu; removed unsafe Prisma relations for default storefront/channel scalars.  
- **Migration:** `20260516145000_brand_management_center` (additive + enum lifecycle; no destructive data drops).  
- **Hub UI:** `/dashboard/brands` now operates as a management center with metrics, tabs, empty states, and cross-links.  
- **Wizard:** `/dashboard/brands/new` eight-step flow posting enriched `createBrand`.  
- **Detail:** `/dashboard/brands/[brandId]` multi-tab workspace with identity + lifecycle forms.  
- **Reports:** `/dashboard/brands/[brandId]/reports` revenue + top items.  
- **Templates / setup / assignment:** Dedicated routes with actionable guidance.  
- **Context:** `BrandSwitcher` fed from dashboard layout workspace query; `BrandContextProvider` wraps main content; `BrandFilter` component available for list pages.

## Models updated

- `Brand`, `Menu` (default menu back-reference), `Location` (brands array).  
- Enums `BrandLifecycleStatus`, `BrandConceptKind`.

## New routes

| Path | Description |
|------|-------------|
| `/dashboard/brands/new` | Wizard |
| `/dashboard/brands/[brandId]` | Detail |
| `/dashboard/brands/[brandId]/reports` | Scoped analytics |
| `/dashboard/brands/templates` | Template library |
| `/dashboard/brands/multi-brand-setup` | Operator guide |
| `/dashboard/brands/assignment` | Unassigned snapshot |

## Brand templates

- Eight curated templates → wizard query param defaults (`lib/brands/brand-template-defaults.ts`).

## Brand switcher

- Header select (≥2 brands).  
- Storage key `kitchenos.selectedBrandId` (`__all__` sentinel).  
- Emits `kitchenos-brand-context-changed` for provider sync.

## Assignment tools

- Snapshot + navigation; transactional bulk apply **not** shipped (documented).

## Storefront / channels / orders / production integration

- Schema & docs ready; **query-level filtering** in legacy modules still **TODO** (see audit P1 items).  
- No breaking changes to existing flows.

## Limitations

- Single `StorefrontSettings` row per user blocks full per-brand storefront isolation until schema evolves.  
- Production tasks lack direct `brandId`; brand must be inferred via relations.  
- Wizard accepts image URLs only (no upload pipeline).

## Recommendations

1. Wire brand context into Prisma queries for Orders/Menus/Products/Production.  
2. Design storefront multi-row migration with feature flag.  
3. Ship bulk assignment actions with preview + audit + soft undo.  
4. Add delete/merge flows requiring typed brand name + archive-first policy.

## Verification

- `npm run typecheck` — passing after JSON typing fix in `actions/brands.ts`.  
- `npm run build` — run in CI/local release pipeline.
