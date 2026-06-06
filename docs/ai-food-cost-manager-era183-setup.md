# AI Food Cost Manager setup (Era 183)

Era 183 certifies AI Food Cost Manager wiring (Round 2): real-time margin, per-item profit, price recommendations, and daily brief — with canonical proof via era108 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/food-cost-ai.ts` | Analysis assembly + daily brief generation |
| `lib/ai/food-cost-builders.ts` | Margin, profit, price recommendation builders |
| `lib/ai/food-cost-manager-policy.ts` | Policy id + route constants |
| `services/ai/food-cost-dashboard.ts` | Dashboard loader |
| `app/dashboard/analytics/food-cost/page.tsx` | Food Cost analytics route |
| `components/dashboard/food-cost-dashboard.tsx` | Daily brief + per-item margin/profit UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-food-cost-manager-era183` | Full era183 cert + wiring audit |
| `npm run test:ci:ai-food-cost-manager-era183` | Era183 + era108 + food-cost builders unit tests |
| `npm run test:ci:ai-food-cost-manager-era183:cert` | Wiring cert only (CI gate) |
| `npm run smoke:ai-food-cost-manager-era108` | Canonical era108 smoke |

## Human activation

1. Open **Dashboard → Analytics → Food Cost**.
2. Verify daily food cost brief with price bump count and avg profit per item.
3. Review per-item table — real-time margin % and profit per item columns.
4. Run `npm run smoke:ai-food-cost-manager-era183` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `real_time_margin` | `computeRealTimeMarginPercent` + dashboard column |
| `per_item_profit` | `computeProfitPerItem` + dashboard column |
| `price_recommendations` | `buildPriceRecommendation` + drill-down UI |
| `daily_brief` | `food-cost-manager-daily-brief` card |

## Artifact

Summary written to `artifacts/ai-food-cost-manager-era183-smoke-summary.json` (gitignored).

See also: [ai-food-cost-manager-era108-setup.md](./ai-food-cost-manager-era108-setup.md)
