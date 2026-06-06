# AI Purchasing Manager smoke setup (Era 106)

Era 106 certifies AI Purchasing wiring: shortage prediction, price optimization, alternative supplier selection, daily purchasing brief, and dashboard UI.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/ai-purchasing.ts` | Recommendation engine, daily brief API |
| `lib/ai/ai-purchasing-builders.ts` | Shortage prediction, price optimization, EOQ, daily brief builder |
| `services/ai/ai-purchasing-dashboard.ts` | Dashboard payload loader |
| `app/dashboard/inventory/purchasing-ai/page.tsx` | AI Purchasing page |
| `components/dashboard/purchasing-ai-dashboard.tsx` | Daily brief card, recommendations table, order actions |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-purchasing-era106` | Full era106 cert + wiring audit |
| `npm run test:ci:ai-purchasing-era106` | Era106 + purchasing builders unit tests |
| `npm run test:ci:ai-purchasing-era106:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Inventory → AI Purchasing**.
2. Verify **Daily purchasing brief** with headline, executive summary, and shortage/price badges.
3. Review recommendations — EOQ quantities, best supplier, alternative supplier savings.
4. Click **Order** or **Order All** — draft PO created in Purchasing.
5. Run `npm run smoke:ai-purchasing-era106` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `shortage_prediction` | 14-day demand vs stock, days until shortage |
| `price_optimization` | switch_supplier, bulk_up, order_now, hold |
| `alternative_supplier` | Second-best supplier with savings per order |
| `daily_brief` | Executive summary, top shortages, top savings |

## Artifact

Summary written to `artifacts/ai-purchasing-smoke-summary.json` (gitignored).
