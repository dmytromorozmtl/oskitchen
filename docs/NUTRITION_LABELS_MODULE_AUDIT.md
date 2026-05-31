# Nutrition labels module audit

## Current implementation (post-upgrade)

| Area | State |
|------|--------|
| `/dashboard/nutrition-labels` | Label **command center** with stats, needs-review queue, links to print queue / import / reports, packing + storefront settings. |
| `/dashboard/nutrition-labels/items/[productId]` | Per-item nutrition, structured allergens, ingredient declaration, verification actions, print queue for SKU, audit log. |
| Data | Extended `NutritionProfile` (tenant `userId`, macros, verification, sources, refs). New `AllergenProfile`, `IngredientDeclaration`, `LabelVerificationEvent`. Existing `LabelTemplate` + `PrintedLabel` extended (`packagingLabelType`, `layoutJson`, `copies`). |
| Legacy fields | `Product.allergens`, `Product.ingredients`, nutrition profile `ingredientsText` / `allergens` preserved. |
| Storefront | `publicShow*WhenUnverified` flags on `StorefrontSettings` (existing rows backfilled **on** in migration for continuity). `buildStorefrontProductSurface` hides unverified structured data by default. |
| Packing | `KitchenSettings.blockPackingWithoutVerifiedAllergen/Nutrition` + helper `evaluatePackingLabelReadiness` (wire into packing UI as follow-up). |

## Issues (priority)

| # | Issue | Risk | Priority | Fix |
|---|--------|------|----------|-----|
| 1 | CSV import not implemented | Ops efficiency | **P1** | Add preview + commit path under `/dashboard/nutrition-labels/import`. |
| 2 | PDF / browser print pipeline not native | Workflow | **P1** | Integrate PDF renderer or OS print bridge; keep queue as source of truth. |
| 3 | Packing UI does not yet call `evaluatePackingLabelReadiness` everywhere | Missed gate | **P1** | Surface warnings on `PackingTask` rows when kitchen flags on. |
| 4 | Role-based edit vs verify separation | Misuse | **P2** | RBAC on label actions (owner/manager vs packer). |
| 5 | Wave-level label manifests | Scale | **P2** | Batch print from packing wave. |
| 6 | Regional allergen law mapping | Compliance perception | **P3** | Config packs per country (never auto-certify). |

## Safety

OS Kitchen **never** certifies FDA/CFIA/EU compliance. Operators must retain supplier and lab records off-platform as required.
