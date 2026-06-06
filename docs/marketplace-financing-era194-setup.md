# Marketplace Financing setup (Era 194)

Era 194 certifies Marketplace Financing wiring (Round 2): Net-30/60/90 terms, early payment discounts, and invoice factoring — with canonical proof via era119 live smoke.

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
| `npm run smoke:marketplace-financing-era194` | Full era194 cert + wiring audit |
| `npm run test:ci:marketplace-financing-era194` | Era194 + era119 + marketplace financing unit tests |
| `npm run test:ci:marketplace-financing-era194:cert` | Wiring cert only (CI gate) |
| `npm run smoke:marketplace-financing-era119` | Canonical era119 smoke |

## Human activation

1. Open **Dashboard → Marketplace → Financing**.
2. Verify **Net-30 / Net-60 / Net-90** term cards and active selection.
3. Review **Early payment** offers (2% discount within 10 days).
4. Check **Invoice factoring** when open receivables exceed $1,000.
5. Run `npm run smoke:marketplace-financing-era194` — artifact **PASSED**.

## Products

| Product | Description |
|---------|-------------|
| `net_30` / `net_60` / `net_90` | Supplier payment terms unlocked by GMV/capital |
| `early_payment` | 2% discount on scheduled net-terms POs |
| `factoring` | Receivables advance via capital partners |

## Artifact

Summary written to `artifacts/marketplace-financing-era194-smoke-summary.json` (gitignored).

See also: [marketplace-financing-era119-setup.md](./marketplace-financing-era119-setup.md)
