# AI Food Cost Manager smoke setup (Era 108)

Era 108 certifies AI Food Cost Manager wiring: per-item profit, real-time margin, price recommendations, daily food cost brief, and analytics dashboard.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/food-cost-ai.ts` | Food cost analysis engine, daily brief API |
| `lib/ai/food-cost-builders.ts` | Margin/profit math, price recommendations, daily brief builder |
| `lib/ai/food-cost-manager-policy.ts` | Policy id, route, recommendation thresholds |
| `services/ai/food-cost-dashboard.ts` | Dashboard payload loader |
| `app/dashboard/analytics/food-cost/page.tsx` | Food Cost analytics page |
| `components/dashboard/food-cost-dashboard.tsx` | Daily brief, per-item table, drill-down |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-food-cost-manager-era108` | Full era108 cert + wiring audit |
| `npm run test:ci:ai-food-cost-manager-era108` | Era108 + food cost builders unit tests |
| `npm run test:ci:ai-food-cost-manager-era108:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Analytics → Food Cost**.
2. Verify **Daily food cost brief** with headline and price bump count.
3. Review per-item table — **Real-time margin %** and **Profit/item** columns.
4. Expand item drill-down — confirm price recommendation and expected margin.
5. Run `npm run smoke:ai-food-cost-manager-era108` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `real_time_margin` | Margin from latest ingredient costs and menu price |
| `per_item_profit` | Profit per item with 7d volume estimate |
| `price_recommendations` | raise_price, lower_portion, hold, review actions |
| `daily_brief` | Executive summary and items needing price bump |

## Artifact

Summary written to `artifacts/ai-food-cost-manager-smoke-summary.json` (gitignored).
