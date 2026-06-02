# AI Purchasing Engine

Cycle 14 — ingredient purchase recommendations with EOQ, 14-day demand forecast, and supplier savings.

## Service

- `services/ai/ai-purchasing.ts` — `generatePurchaseRecommendations(workspaceId)`
- `lib/ai/ai-purchasing-builders.ts` — pure logic (EOQ, daily usage, urgency, supplier ranking)
- `lib/ai/ai-purchasing-types.ts` — `PurchaseRecommendation`, `AiPurchasingResult`

## Data sources

| Input | Source |
|-------|--------|
| Daily usage | Ingredient demand rollup (`loadDemandCommandCenterPayload`) |
| 14d forecast | `ForecastLine.recommendedQuantity` when available, else dailyUsage × 14 |
| Supplier pricing | `SupplierItem` + `Supplier.leadTimeDays` |
| Stock / par | `Ingredient.currentStock`, `parLevel`, `reorderPoint` |

## Output

`PurchaseRecommendation` includes:

- `dailyUsage` — demand ÷ window days
- `predictedDemand14d` — forecast or extrapolated usage
- `daysRemaining` — currentStock ÷ dailyUsage
- `bestSupplier` — lowest unit cost with EOQ order quantity and order total
- `alternativeSupplier` — second supplier with `savingsPerOrder` when cheaper
- `confidence` — data quality score (demand + supplier catalog coverage)
- `urgency` — critical / high / normal / low from days remaining vs lead time

## EOQ

Economic order quantity: √(2DS/H) where D = annual demand, S = ordering cost ($25 default), H = holding cost (25% of unit cost).

Order quantity = max(EOQ, shortage vs 14d forecast, par gap, supplier minimum, pack rounding).

## Tests

- `tests/unit/ai-purchasing-builders.test.ts`
- `tests/integration/ai-purchasing.integration.test.ts`

## Next cycle

~~Cycle 14 — AI Purchasing engine~~ — done

## Dashboard UI

- `app/dashboard/inventory/purchasing-ai/page.tsx` — server page
- `components/dashboard/purchasing-ai-dashboard.tsx` — recommended orders, days-remaining colors, Order All, per-item Order, qty adjust, Skip with reason, savings tracker
- `services/ai/ai-purchasing-dashboard.ts` — `loadPurchasingAiDashboard`
- `services/ai/ai-purchasing-orders.ts` — draft PO creation grouped by supplier
- `actions/ai-purchasing.ts` — order, skip, quantity server actions
- Skip/qty overrides stored in `settingsCenterJson.aiPurchasing`

## Tests

- `tests/unit/ai-purchasing-dashboard-builders.test.ts`

## Next cycle

~~Cycle 15 — AI Purchasing UI~~ — done

## Automation

- `services/ai/purchasing-automation.ts` — `autoPurchase(workspaceId)`
- `lib/ai/purchasing-automation-builders.ts` — eligibility + PO status policy
- Thresholds: confidence > **0.85**, days remaining < **3**, auto-approve PO total ≤ **$500**
- Above $500 → `READY_FOR_REVIEW` + `SUBMITTED` approval event
- Settings in `settingsCenterJson.aiPurchasingAutomation` (`enabled` defaults false)

## Tests

- `tests/unit/purchasing-automation-builders.test.ts`
- `tests/integration/purchasing-automation.integration.test.ts`

## Next cycle

~~Cycle 16 — AI Purchasing automation~~ — done

Cycle 17 — `services/ai/kitchen-camera.ts`
