# Vendor Portal 2.0 smoke setup (Era 117)

Era 117 certifies Vendor Portal 2.0 wiring: orders inbox, commission invoices, and sales analytics on one supplier hub.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/marketplace/vendor-portal-service.ts` | Hub loader + invoice list |
| `lib/marketplace/vendor-portal-builders.ts` | Three module builders, hub assembly |
| `lib/marketplace/vendor-portal-policy.ts` | Policy id v2, modules, base path |
| `app/vendor/(cabinet)/dashboard/page.tsx` | Vendor Portal 2.0 hub page |
| `app/vendor/(cabinet)/orders/page.tsx` | Orders inbox |
| `app/vendor/(cabinet)/invoices/page.tsx` | Commission invoices |
| `app/vendor/(cabinet)/analytics/page.tsx` | Sales analytics |
| `components/marketplace/vendor-portal-hub.tsx` | Three module cards + recent activity |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:vendor-portal-era117` | Full era117 cert + wiring audit |
| `npm run test:ci:vendor-portal-era117` | Era117 + vendor portal unit tests |
| `npm run test:ci:vendor-portal-era117:cert` | Wiring cert only (CI gate) |

## Human activation

1. Sign in as an **approved marketplace vendor**.
2. Open **Vendor Portal → Dashboard**.
3. Verify **three module cards** — Orders, Invoices, Analytics.
4. Open each module and confirm data loads (orders, invoice balances, analytics charts).
5. Run `npm run smoke:vendor-portal-era117` — artifact **PASSED**.

## Modules

| Module | Route |
|--------|-------|
| `orders` | `/vendor/orders` |
| `invoices` | `/vendor/invoices` |
| `analytics` | `/vendor/analytics` |

## Artifact

Summary written to `artifacts/vendor-portal-smoke-summary.json` (gitignored).
