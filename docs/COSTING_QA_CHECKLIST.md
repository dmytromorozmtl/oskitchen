# Costing QA checklist

- [ ] `npm run typecheck` / `npm run build` clean  
- [ ] Apply migration `20260520140000_costing_profitability_command_center` to target DB  
- [ ] `/dashboard/costing` loads with PlanGate (PRO plan)  
- [ ] No recipes → empty state “Recipes are missing”  
- [ ] With recipes → **Recalculate costs** creates `CostingRun` + lines + snapshots  
- [ ] Settings: change target/warning margin → re-run → badges update  
- [ ] Channel fee rule → platform column non-zero when expected  
- [ ] `SupplierPriceHistory` newer than card → ingredient $ follows history  
- [ ] Purchasing + Ingredient Demand pages still load  
- [ ] Superadmin bypass still reaches module (platform bypass unchanged)
