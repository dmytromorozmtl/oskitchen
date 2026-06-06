# Unified Customer Profile smoke setup (Era 121)

Era 121 certifies Unified Customer Profile wiring: orders, preferences, history, and loyalty in one customer view.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/crm/unified-profile-service.ts` | Hub + per-customer snapshot loaders |
| `lib/crm/unified-profile-builders.ts` | Order rows, timeline, loyalty, hub builders |
| `lib/crm/unified-profile-policy.ts` | Policy id, route, fetch limits |
| `app/dashboard/customers/unified-profile/page.tsx` | Hub — top customers by LTV |
| `app/dashboard/customers/unified-profile/[customerId]/page.tsx` | Per-customer unified profile |
| `components/crm/unified-customer-profile-panel.tsx` | Metrics, preferences, orders, history, loyalty |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:unified-profile-era121` | Full era121 cert + wiring audit |
| `npm run test:ci:unified-profile-era121` | Era121 + unified profile unit tests |
| `npm run test:ci:unified-profile-era121:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Customers → Unified Customer Profiles**.
2. Review **hub summary** — Customers, With orders, With loyalty.
3. Open a **top customer** unified profile.
4. Verify **Order history**, **Identity & preferences**, **Activity history**, and **Loyalty** sections.
5. Run `npm run smoke:unified-profile-era121` — artifact **PASSED**.

## Profile sections

| Section | Source |
|---------|--------|
| `orders` | Recent orders via `listOrdersForCustomer` |
| `preferences` | Allergies, dietary, favorites, consent |
| `history` | CRM timeline events |
| `loyalty` | Points balance + recent transactions |

## Artifact

Summary written to `artifacts/unified-profile-smoke-summary.json` (gitignored).
