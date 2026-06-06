# Marketplace Financing smoke setup (Era 119)

Era 119 certifies Marketplace Financing wiring: Net-30/60/90 terms, early payment discounts, and invoice factoring.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/marketplace/financing.ts` | Snapshot loader, net terms setter, credit line integration |
| `lib/marketplace/financing-builders.ts` | Term products, early pay offers, factoring offers |
| `lib/marketplace/financing-policy.ts` | Policy id, net terms options, discount/threshold constants |
| `actions/marketplace/financing.ts` | `selectMarketplaceNetTermsAction` |
| `app/dashboard/marketplace/financing/page.tsx` | Marketplace Financing page |
| `components/marketplace/marketplace-financing-panel.tsx` | Credit summary, terms, early pay, factoring UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:marketplace-financing-era119` | Full era119 cert + wiring audit |
| `npm run test:ci:marketplace-financing-era119` | Era119 + marketplace financing unit tests |
| `npm run test:ci:marketplace-financing-era119:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Marketplace → Financing**.
2. Verify **Net-30 / Net-60 / Net-90** term cards and active selection.
3. Review **Early payment** offers (2% discount within 10 days).
4. Check **Invoice factoring** when open receivables exceed $1,000.
5. Run `npm run smoke:marketplace-financing-era119` — artifact **PASSED**.

## Products

| Product | Description |
|---------|-------------|
| `net_30` / `net_60` / `net_90` | Supplier payment terms unlocked by GMV/capital |
| `early_payment` | 2% discount on scheduled net-terms POs |
| `factoring` | Receivables advance via capital partners |

## Artifact

Summary written to `artifacts/marketplace-financing-smoke-summary.json` (gitignored).
