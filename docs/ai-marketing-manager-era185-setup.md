# AI Marketing Manager setup (Era 185)

Era 185 certifies AI Marketing Manager wiring (Round 2): auto campaigns, weather promos, and daily brief — with canonical proof via era110 live smoke.

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
| `npm run smoke:ai-marketing-manager-era185` | Full era185 cert + wiring audit |
| `npm run test:ci:ai-marketing-manager-era185` | Era185 + era110 + marketing manager unit tests |
| `npm run test:ci:ai-marketing-manager-era185:cert` | Wiring cert only (CI gate) |
| `npm run smoke:ai-marketing-manager-era110` | Canonical era110 smoke |

## Human activation

1. Open **Dashboard → Marketing → AI Marketing Manager**.
2. Verify **Daily marketing brief** with weather mode and executive summary.
3. Review **Auto campaigns** — win-back, abandoned cart, welcome, post-purchase.
4. Check **Weather & calendar promos** — rain, heat, cold, holiday suggestions.
5. Run `npm run smoke:ai-marketing-manager-era185` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `auto_campaigns` | Klaviyo-triggered flows ranked by readiness |
| `weather_promos` | Rain/heat/cold/holiday promo suggestions |
| `daily_brief` | Executive summary and action bullets |

## Artifact

Summary written to `artifacts/ai-marketing-manager-era185-smoke-summary.json` (gitignored).

See also: [ai-marketing-manager-era110-setup.md](./ai-marketing-manager-era110-setup.md)
