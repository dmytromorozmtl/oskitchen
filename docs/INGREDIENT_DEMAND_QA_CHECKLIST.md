# Ingredient demand QA checklist

- [ ] `/dashboard/inventory/demand` loads after migration.
- [ ] `/dashboard/inventory/demand/settings` saves waste + sources.
- [ ] CSV download with rows > 0 produces `kitchenos-ingredient-demand.csv` with legacy headers.
- [ ] Run demand saves a row in `ingredient_demand_runs` + lines.
- [ ] Purchasing reflects same totals after run (refresh both pages).
- [ ] `?demandRun=` banner appears for valid run id.
- [ ] Orders only (no production) still roll up.
- [ ] Production-only scenario contributes when `PRODUCTION_PLAN` enabled.
- [ ] Missing recipe surfaces in **Recipes missing** tab.
- [ ] Mismatched units surface warning + `conversionRequired` line.
- [ ] Superadmin / plan gating unchanged for inventory feature flag.
- [ ] `npm run typecheck` && `npm run build` succeed locally.
