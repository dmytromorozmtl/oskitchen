# AI Inventory Manager setup (Era 182)

Era 182 certifies AI Inventory Manager wiring (Round 2): waste detection, theft alerts, count shrinkage, and daily brief — with canonical proof via era107 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/inventory-manager.ts` | Snapshot loader + waste/theft/shrinkage signal builders |
| `lib/ai/inventory-manager-builders.ts` | Signal aggregation + snapshot assembly |
| `lib/ai/inventory-manager-policy.ts` | Policy id + route constants |
| `app/dashboard/inventory/manager/page.tsx` | AI Inventory Manager route |
| `components/inventory/inventory-manager-client.tsx` | Daily brief + waste/theft/shrinkage UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:ai-inventory-manager-era182` | Full era182 cert + wiring audit |
| `npm run test:ci:ai-inventory-manager-era182` | Era182 + era107 + inventory manager unit tests |
| `npm run test:ci:ai-inventory-manager-era182:cert` | Wiring cert only (CI gate) |
| `npm run smoke:ai-inventory-manager-era107` | Canonical era107 smoke |

## Human activation

1. Open **Dashboard → Inventory → AI Inventory Manager**.
2. Verify daily inventory brief with waste, theft, and shrinkage summary.
3. Review theft detection signals and waste-by-reason cards.
4. Run `npm run smoke:ai-inventory-manager-era182` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `waste` | `buildWasteSignals` + waste-by-reason cards |
| `theft` | `buildTheftSignals` + theft detection UI |
| `shrinkage` | `buildShrinkageSignals` + count variance from inventory counts |
| `daily_brief` | `ai-inventory-manager-daily-brief` card |

## Artifact

Summary written to `artifacts/ai-inventory-manager-era182-smoke-summary.json` (gitignored).

See also: [ai-inventory-manager-era107-setup.md](./ai-inventory-manager-era107-setup.md)
