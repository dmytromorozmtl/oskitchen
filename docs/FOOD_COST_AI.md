# Food Cost AI Engine

Cycle 11 — recipe-level food cost analysis with ingredient price trends and margin recommendations.

## Service

- `services/ai/food-cost-ai.ts` — `analyzeFoodCost(workspaceId)`, `analyzeFoodCostForProduct`
- `lib/ai/food-cost-builders.ts` — pure analysis logic (testable without DB)
- `lib/ai/food-cost-types.ts` — `FoodCostAnalysis`, `IngredientCostBreakdown`

## Data sources

| Input | Source |
|-------|--------|
| Margin / food cost % | Latest `ProfitabilityLine` from costing run |
| Recipes & yields | `Recipe` + `RecipeIngredient` |
| Ingredient costs | `Ingredient.costPerUnit` + `SupplierPriceHistory` (90d) |
| Targets | `costingSettingsJson` food cost & margin targets |

## Output

`FoodCostAnalysis` includes:

- `overallFoodCostPercent` / `overallGrossMarginPercent`
- `itemAnalyses[]` — per menu item with `ingredientBreakdown`, `priceTrend`, `recommendation`
- `topIngredientMovers` — ingredients with largest price swings
- `recommendations` — workspace-level actions
- `confidence` — data quality score (recipes + price history coverage)

- `services/ai/food-cost-alerts.ts` — `generateFoodCostAlerts` (margin < 30%, ingredient spike > 10%)
- `lib/ai/food-cost-alerts-builders.ts` — dollar impact from sales volume & ingredient usage

## Alerts

| Type | Trigger | Impact |
|------|---------|--------|
| `low_margin` | Gross margin < 30% | Weekly profit gap × estimated units sold |
| `ingredient_price_spike` | Price up > 10% | Unit delta × weekly ingredient usage |

## Tests

- `tests/unit/food-cost-builders.test.ts`
- `tests/integration/food-cost-ai.integration.test.ts`
- `tests/unit/food-cost-alerts-builders.test.ts`
- `tests/integration/food-cost-alerts.integration.test.ts`

## Dashboard UI

- `app/dashboard/analytics/food-cost/page.tsx` — server page
- `components/dashboard/food-cost-dashboard.tsx` — gauge, 30d trend, profitability table with drill-down, ingredient sparklines, what-if calculator, waste tracking, export PDF (print)
- `services/ai/food-cost-dashboard.ts` — `loadFoodCostDashboard(workspaceId)`
- `actions/food-cost-analytics.ts` — what-if margin server action

## Tests

- `tests/unit/food-cost-dashboard-builders.test.ts`

## Next cycle

~~Cycle 13 — Food Cost UI~~ — done

Cycle 14 — `services/ai/ai-purchasing.ts`
