# Costing architecture

## Layers

1. **Persistence (Prisma)**  
   - `CostSnapshot` — legacy-compatible row per recalculation (linked optional `costingRunId`).  
   - `CostingRun` + `ProfitabilityLine` — canonical “command center” snapshot for a run.  
   - `CostComponent` — line-level breakdown (ingredients rolled, labor, packaging, fees, overhead).  
   - Configuration: `KitchenSettings.costingSettingsJson`, `MarginRule`, `ChannelFeeRule`, `LaborRate`, `PackagingItem`, `ProductPackagingRule`, `PriceScenario`.

2. **Domain library (`lib/costing/*`)**  
   Pure functions: settings merge, margin evaluation, channel fee math, overhead allocation, recipe unit costing, scenario evaluation, price suggestion helpers.

3. **Application service (`services/costing/costing-service.ts`)**  
   Orchestrates data load, supplier history merge, run lifecycle, Prisma writes inside a try/catch with `FAILED` run status on error.

4. **UI (`app/dashboard/costing/*`)**  
   Server-rendered pages + server actions in `actions/costing.ts`.

## Estimates vs accounting

All persisted monetary fields are **operational estimates**. Tax and statutory reporting remain outside KitchenOS.
