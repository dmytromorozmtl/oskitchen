# Price Intelligence smoke setup (Era 118)

Era 118 certifies Price Intelligence wiring: cheapest supplier detection, switch recommendations, and one-click auto-switch.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/marketplace/price-intelligence.ts` | Spend scan, cheapest supplier lookup, snapshot builder |
| `lib/marketplace/price-intelligence-builders.ts` | Snapshot assembly, summary metrics |
| `lib/marketplace/price-intelligence-policy.ts` | Policy id, route, savings thresholds |
| `actions/marketplace/price-intelligence.ts` | Toggle/apply auto-switch server actions |
| `app/dashboard/marketplace/price-intelligence/page.tsx` | Price Intelligence page |
| `components/marketplace/price-intelligence-panel.tsx` | Switch list, auto-switch toggle, cheapest leaders |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:price-intelligence-era118` | Full era118 cert + wiring audit |
| `npm run test:ci:price-intelligence-era118` | Era118 + price intelligence unit tests |
| `npm run test:ci:price-intelligence-era118:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Marketplace → Price Intelligence**.
2. Review **switch opportunities** and **monthly savings** cards.
3. Toggle **Auto-switch** policy on/off.
4. Click **Switch to cheapest** on a recommendation — verify checkout redirect.
5. Run `npm run smoke:price-intelligence-era118` — artifact **PASSED**.

## Capabilities

| Capability | Description |
|------------|-------------|
| `spend_scan` | 90-day PO line analysis per SKU |
| `cheapest_supplier` | GTIN/category/name match across approved vendors |
| `auto_switch` | One-click cart add for eligible switches |

## Artifact

Summary written to `artifacts/price-intelligence-smoke-summary.json` (gitignored).
