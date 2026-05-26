# Storefront manual QA — 2026-05-17

Run locally: `npm run dev:safe` in incognito.

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 1 | `/s/hello/menu` | Menu, prices, sold-out | ☐ |
| 2 | Cart → checkout pay-later | Order confirmation + email (if Resend) | ☐ |
| 3 | `kos_brand` cookie → menu | Brand accent (e.g. `#7c3aed`) | ☐ |
| 4 | `/s/hello/robots.txt` + `sitemap.xml` | 200, Sitemap line | ☐ |
| 5 | Launch: checklist red → theme publish blocked | Button disabled | ☐ |
| 6 | Fix checklist → publish theme | Live snapshot | ☐ |
| 7 | Enable Published on overview | Only if checklist green | ☐ |
| 8 | `/dashboard/storefront/team/audit` → Export CSV | CSV with header | ☐ |
| 9 | Switcher → hello-bistro | Cookie + different slug in UI | ☐ |
| 10 | Variant PDP + modifier | Cart 409 when sold-out | ☐ |
| 11 | Checkout US/CA/EU tax lines | Stacked tax labels in summary | ☐ |
| 12 | Order detail / reorder | Market preserved via `?market=` | ☐ |
| 15 | `/dashboard/orders/[id]` | Card **Storefront preorder** — market + tax lines | ☐ |
| 16 | `npm run test -- tests/unit/storefront/order-commerce-context` | Unit tests pass | ☐ |
| 17 | `E2E_STOREFRONT_TAX_LABEL=GST npx playwright test e2e/storefront-checkout-tax-market` | Tax visible at checkout | ☐ |
| 18 | Order Hub → Export CSV (storefront) | Columns `market_id`, `tax_mode`, `tax_total` | ☐ |
| 19 | Order Hub table | Badges SF-*, Market: weekday, Tax | ☐ |
| 20 | Order confirmation email | Market + tax breakdown in body | ☐ |
| 13 | Form with file field | Submission `_meta.files` URL | ☐ |
| 14 | Domains → Recheck now | Status updates without Vercel | ☐ |

## Tax admin setup

```bash
npm run storefront:seed-pilot-tax   # CA GST+PST preset for pilot hello
```

1. Dashboard → Storefront → Ordering → **Sales tax & VAT**
2. Load preset (US / CA / EU), set rates, save
3. Checkout should show separate tax lines
4. Place order with `?market=weekday` → dashboard order card + email

## Strict launch (optional)

```bash
STOREFRONT_STRICT_LAUNCH=1 npm run dev:safe
```

Publish blocked until menu + products + fulfillment pass checklist.
