# Executive profitability

Route: `/dashboard/executive/profitability`.

Permission: `executive.read.financial` (owner, manager, admin,
accountant, superadmin). Other roles see a permission-denied card.

KPIs surfaced here: `margin_estimate`, `meal_plan_recurring`,
`catering_pipeline`, `purchasing_needs`.

## Margin estimate

We read the latest `CostingRun` for the workspace, then aggregate the
profitability lines:

- `marginMedian` — median `grossMarginPercent ÷ 100`.
- `marginAtRiskItems` — count of profitability lines with
  `warningLevel ∈ {MEDIUM, HIGH}` or `foodCostPercent ≥ 40`.

These are explicitly labelled as **operational estimates, not
accounting statements**. The Costing module remains the authoritative
source for accounting figures.

**Sales narrative:** [`profit-engine-owner-margin-story.md`](./profit-engine-owner-margin-story.md) (MKT-15).

## Channel fee impact / cost increases

These deeper breakdowns live in the existing Costing and Reports
modules. The executive view links out rather than duplicating logic.

## Purchasing signals

- `purchasingNeeds` — open or draft `PurchaseOrder` rows.
- `stalePurchaseOrders` — draft POs older than 7 days.

## Meal plan recurring revenue

Σ `pricePerCycle × weekly factor` over active meal plans:

- `WEEKLY` → 1
- `BIWEEKLY` → 0.5
- `MONTHLY` → 0.25
- other frequencies → 1 (conservative)

Always labelled "recurring revenue estimate". The real recurring
billing system is the meal-plan module's billing integration.
