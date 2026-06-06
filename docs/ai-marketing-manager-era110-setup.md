# AI Marketing Manager smoke setup (Era 110)

Era 110 certifies AI Marketing Manager wiring: auto campaign recommendations, weather-driven promos, daily marketing brief, and dashboard UI.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/marketing-manager.ts` | Snapshot loader — churn, carts, Klaviyo flows |
| `lib/ai/marketing-manager-builders.ts` | Auto campaigns, weather promos, daily brief |
| `lib/ai/marketing-manager-policy.ts` | Policy id, route, churn threshold |
| `app/dashboard/marketing/manager/page.tsx` | AI Marketing Manager page |
| `components/marketing/marketing-manager-client.tsx` | Daily brief, auto campaigns, weather promos |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-marketing-manager-era110` | Full era110 cert + wiring audit |
| `npm run test:ci:ai-marketing-manager-era110` | Era110 + marketing manager unit tests |
| `npm run test:ci:ai-marketing-manager-era110:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Marketing → AI Marketing Manager**.
2. Verify **Daily marketing brief** with weather mode and executive summary.
3. Review **Auto campaigns** — win-back, abandoned cart, welcome, post-purchase.
4. Check **Weather & calendar promos** — rain, heat, cold, holiday suggestions.
5. Run `npm run smoke:ai-marketing-manager-era110` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `auto_campaigns` | Klaviyo-triggered flows ranked by readiness |
| `weather_promos` | Rain/heat/cold/holiday promo suggestions |
| `daily_brief` | Executive summary and action bullets |

## Artifact

Summary written to `artifacts/ai-marketing-manager-smoke-summary.json` (gitignored).
