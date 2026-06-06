# Supplier Marketplace smoke setup (Era 116)

Era 116 certifies Supplier Marketplace wiring: food, packaging, and equipment lanes with catalog browse and one-click reorder.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/marketplace/supplier-marketplace-service.ts` | Lane loader + one-click reorder from PO history |
| `lib/marketplace/supplier-marketplace-builders.ts` | Lane snapshots, catalog hrefs, dashboard assembly |
| `lib/marketplace/supplier-marketplace-policy.ts` | Policy id, lanes, category slug map |
| `actions/marketplace/supplier-reorder.ts` | `oneClickReorderMarketplaceItemAction` |
| `app/dashboard/marketplace/page.tsx` | Supplier Marketplace hub page |
| `components/marketplace/supplier-marketplace-lanes.tsx` | Three lane cards + reorder buttons |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:supplier-marketplace-era116` | Full era116 cert + wiring audit |
| `npm run test:ci:supplier-marketplace-era116` | Era116 + supplier marketplace unit tests |
| `npm run test:ci:supplier-marketplace-era116:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Marketplace**.
2. Verify **three lane cards** — Food, Packaging, Equipment.
3. Click **Browse catalog** on a lane — confirm category filter applied.
4. Use **Reorder** on a lane with purchase history — confirm checkout redirect.
5. Run `npm run smoke:supplier-marketplace-era116` — artifact **PASSED**.

## Lanes

| Lane | Category slug |
|------|---------------|
| `food` | dry-goods |
| `packaging` | packaging-disposables |
| `equipment` | equipment, kitchenware-tools |

## Artifact

Summary written to `artifacts/supplier-marketplace-smoke-summary.json` (gitignored).
