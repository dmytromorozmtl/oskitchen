# Organization billing model

## Today
- `subscriptions` and billing customer rows are **user / workspace owner scoped**.
- `services/billing/org-billing-service.ts` returns `WORKSPACE` scope placeholder.
- Enterprise deals should use `BillingMode.ENTERPRISE_CONTRACT` / manual invoicing (existing enums).

## Roadmap
- Org-level Stripe customer with child workspace rollups requires schema + entitlement changes — **not** simulated here.

## Copy rule
- Never imply org-level automated Stripe billing exists without migration + tests.
