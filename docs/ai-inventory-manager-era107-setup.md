# AI Inventory Manager smoke setup (Era 107)

Era 107 certifies AI Inventory Manager wiring: waste signals, theft detection, shrinkage from count variance, daily inventory brief, and dashboard UI.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/inventory-manager.ts` | Snapshot loader — waste, theft alerts, count rows |
| `lib/ai/inventory-manager-builders.ts` | Signal builders, daily brief, snapshot assembly |
| `lib/ai/inventory-manager-policy.ts` | Policy id, route, severity thresholds |
| `app/dashboard/inventory/manager/page.tsx` | AI Inventory Manager page |
| `components/inventory/inventory-manager-client.tsx` | Daily brief, waste/theft/shrinkage cards |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-inventory-manager-era107` | Full era107 cert + wiring audit |
| `npm run test:ci:ai-inventory-manager-era107` | Era107 + inventory manager unit tests |
| `npm run test:ci:ai-inventory-manager-era107:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Inventory → AI Inventory Manager**.
2. Verify **Daily inventory brief** with headline and executive summary.
3. Review **Waste (30d)**, **Theft signals**, and **Shrinkage** summary cards.
4. Drill into theft detection, waste by reason, and count shrinkage sections.
5. Run `npm run smoke:ai-inventory-manager-era107` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `waste` | Waste events grouped by reason with severity |
| `theft` | Cost variance alerts with theft score |
| `shrinkage` | Negative count variance from completed counts |
| `daily_brief` | Executive summary and action bullets |

## Artifact

Summary written to `artifacts/ai-inventory-manager-smoke-summary.json` (gitignored).
