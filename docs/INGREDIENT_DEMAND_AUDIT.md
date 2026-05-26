# Ingredient demand audit (KitchenOS)

**Scope:** `/dashboard/inventory/demand`, calculation path, CSV, purchasing, recipes, inventory, production, empty states, performance, data model.

## Summary

| Area | Current state | Limitation | Affected operators | Fix | Priority |
|------|---------------|------------|-------------------|-----|----------|
| Route & UI | Command center with tabs, KPIs, filters, run + save | Not all tabs are deep-linked; product table shows IDs until catalog join | All | Join product titles in contribution rollup | P2 |
| Demand math | Centralized in `lib/ingredient-demand/demand-calculation.ts` | Mixed unit rollups fall back to “recipe unit only” with warnings | Multi-unit kitchens | Per-line split storage vs recipe unit | P1 |
| Waste buffer | `KitchenSettings.ingredientDemandSettingsJson` + per-ingredient overrides in JSON | UI does not yet edit per-ingredient % | Fine-dining, bakery | Ingredient edit form + buffer column | P1 |
| CSV export | Same columns as before (`DemandCsvDownload`) | No PDF yet | Commissary | PDF engine reuse rollup (stub) | P2 |
| Orders | Confirmed / in-flight + optional storefront + pending (draft) | No channel-specific confidence beyond source toggles | Ghost / multi-brand | Channel weights in JSON | P2 |
| Production | `ProductionWorkItem` × active/draft batches in window | No explicit “link demand run” from Production UI | Production leads | Production page CTA → demand with date | P1 |
| Recipes | Inactive recipes excluded (`active === false` only) | Legacy rows without `active` column until migrate still behave as active | All | Migration default `true` | P0 |
| Inventory | `Ingredient.currentStock` + optional `InventoryStock` rows (same unit only) | Location-level stock with mismatched units is skipped silently in sum | Multi-site | Conversion on stock lots | P1 |
| Purchasing | Same `loadDemandCommandCenterPayload` rollup; optional `?demandRun=` banner | No auto PO creation | Buyers | PO draft API | P3 |
| Costing | Line `estimatedCost` from `costPerUnit × required` when units convert | Missing conversion drops cost line | Finance | Force purchase-unit cost | P2 |
| Catering / events | Stub sources only | No guest-count engine | Catering | Model + contributions | P1 |
| Empty states | Contextual copy in demand lines tab | Other tabs still generic when empty | New tenants | Tab-specific empty components | P2 |
| Performance | Cap 500 orders / 800 production lines per load | Large tenants may truncate | Enterprise | Cursor pagination + server rollup job | P1 |
| Permissions | Same as inventory plan gate | No chef/purchasing split yet | RBAC | Role matrix in `lib/ingredient-demand` (future) | P2 |
| Audit | Persisted run + lines; server action on save | No diff vs prior run | QA | Compare endpoint | P3 |

## Data model gaps (addressed in this iteration)

- **Runs:** `IngredientDemandRun` + `IngredientDemandRunLine` for saved snapshots.
- **Settings:** JSON on `kitchen_settings` for waste/sources (avoids destructive ingredient table churn).
- **Stock lots:** `InventoryStock` (additive).
- **Substitutions:** `IngredientSubstitution` (additive).
- **Ingredient / recipe:** `category`, `purchaseUnit`, `conversionJson`, `reorderPoint`, `active`; recipe `active`, `version`; `RecipeIngredient.notes`.

Apply migration: `npm run db:deploy` (or `prisma migrate dev`) so `ingredient_demand_settings_json` and related tables exist.

## Performance notes

- Keep heavy rollups on the server (`loadDemandCommandCenterPayload`).
- Avoid returning full JSON blobs to the client beyond what the command center needs (future: trim `contributions` for mobile).
