# AI Purchasing Manager setup (Era 181)

Era 181 certifies AI Purchasing Manager wiring (Round 2): shortage prediction, price optimization, alternative supplier, and daily brief — with canonical proof via era106 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/ai-purchasing.ts` | Recommendations, daily brief, result assembly |
| `lib/ai/ai-purchasing-builders.ts` | Shortage prediction, price optimization, EOQ |
| `services/ai/ai-purchasing-dashboard.ts` | Dashboard loader |
| `app/dashboard/inventory/purchasing-ai/page.tsx` | AI Purchasing route |
| `components/dashboard/purchasing-ai-dashboard.tsx` | Daily brief + recommendations UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-purchasing-era181` | Full era181 cert + wiring audit |
| `npm run test:ci:ai-purchasing-era181` | Era181 + era106 + builders unit tests |
| `npm run test:ci:ai-purchasing-era181:cert` | Wiring cert only (CI gate) |
| `npm run smoke:ai-purchasing-era106` | Canonical era106 smoke |

## Human activation

1. Open **Dashboard → Inventory → AI Purchasing**.
2. Verify daily purchasing brief with shortage signals and price switch count.
3. Review recommendations — confirm alternative supplier savings and EOQ quantities.
4. Run `npm run smoke:ai-purchasing-era181` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `shortage_prediction` | `predictShortage` in ai-purchasing-builders |
| `price_optimization` | `optimizePrice` + price switch count in daily brief |
| `alternative_supplier` | `alternativeSupplier` in builders + dashboard UI |
| `daily_brief` | `generateAiPurchasingDailyBrief` + `ai-purchasing-daily-brief` card |

## Artifact

Summary written to `artifacts/ai-purchasing-era181-smoke-summary.json` (gitignored).

See also: [ai-purchasing-era106-setup.md](./ai-purchasing-era106-setup.md)
