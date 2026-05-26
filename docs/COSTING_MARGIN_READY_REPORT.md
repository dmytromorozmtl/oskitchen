# Costing & margin — readiness report

## What changed

- **Prisma (additive migration `20260520140000_costing_profitability_command_center`)**  
  New: `CostingRun`, `ProfitabilityLine`, `CostComponent`, `LaborRate`, `PackagingItem`, `ProductPackagingRule`, `ChannelFeeRule`, `MarginRule`, `PriceScenario`.  
  Extended: `CostSnapshot.costingRunId` (nullable FK), `KitchenSettings.costingSettingsJson`.

- **Costing engine & service**  
  `services/costing/costing-service.ts` implements `runFullRecipeCosting` and `loadCostingOverviewData` (KPIs + latest lines).  
  Library modules under `lib/costing/` centralize math and rules.

- **UI**  
  `/dashboard/costing` layout + subnav; overview KPIs; tabs for items, menus, gaps, components, channel fees, scenarios, alerts, reports, settings.  
  Safety copy: estimates only; no tax/legal advice; no partner fee tables.

- **Actions**  
  `recalculateCostSnapshotsAction` now delegates to the service (writes **both** profitability data and legacy-compatible snapshots).  
  Settings, channel fee, margin rule, and scenario save actions added.

- **Documentation**  
  Audit + architecture/engine/component/margin/channel/scenario/price/purchasing/reports/QA docs in `docs/`.

## Costing engine (summary)

Per active recipe: ingredient $ (supplier history fallback to card) + labor + packaging + optional overhead + delivery + modeled platform + card fees → totals, margins, warnings, suggested list price.

## Cost components

Persisted per line for transparency (`INGREDIENT` rolled, `LABOR`, `PACKAGING`, optional `DELIVERY`, `PLATFORM_FEE`, `PAYMENT_FEE`, `OVERHEAD`).

## Margin rules

Kitchen JSON defaults + optional `MarginRule` rows (business mode specificity). Replaces hard-coded **60%** warning.

## Channel fees

User-defined `ChannelFeeRule` only — **no** fake marketplace data.

## Scenarios & price suggestions

`PriceScenario` JSON storage + `lib/costing/scenarios.ts` for deterministic math.  
`lib/costing/price-suggestions.ts` for margin-target list price rounding.

## Purchasing integration

Latest `SupplierPriceHistory` preferred per ingredient during costing.

## Reporting integration

Links to existing Reports / Executive / Price history; profitability-specific exports remain a follow-up.

## Business modes

Page title adapts via `lib/costing/terminology.ts` from `KitchenSettings.businessType`.

## Remaining limitations

- No sales-mix–weighted P&amp;L.  
- Ingredient **unit conversion** not fully enforced in engine.  
- Scenario UI saves inputs; full “replay vs latest line” UI pending.  
- Component overrides UI pending.  
- **DB migration must be applied** in each environment (`prisma migrate deploy`).

## Next recommendations

1. Volume-weighted margin using orders export.  
2. Ingredient conversion + validation warnings.  
3. Scenario replay bound to `ProfitabilityLine` + diff UI.  
4. Costing CSV presets in Import Center.  
5. Audit log entries for run/settings/scenario changes.
