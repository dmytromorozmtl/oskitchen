# Monetization QA checklist

Manual verification before inviting paying merchants:

1. **`/pricing`** — toggle monthly/annual; CTAs route to `/signup` or `/book-demo`; Uber disclaimer visible.
2. **Stripe missing** — `/dashboard/billing` shows amber setup card; checkout buttons disabled without errors.
3. **Stripe test** — Checkout redirects; webhook updates subscription row; trial converts to paid path.
4. **PlanGate** — Visit WooCommerce integration as Starter-only workspace → upgrade card, no crash.
5. **Trial banner** — Local trial shows countdown; `DEV_BYPASS_BILLING=true` surfaces bypass ribbon only in development.
6. **Trial expiry** — Owner without Stripe redirected to `/dashboard/billing`; staff sees banner (smoke test).
7. **Cancellation** — `/dashboard/billing/cancel` saves `cancellation_feedback` row and portal button behaves per Stripe config.
8. **API keys** — Enterprise plan required; hashed storage; bearer routes reject wrong tier.
9. **Exports** — `/api/export?type=integrations_metadata` downloads sanitized metadata only.
10. **Customer success** — `/dashboard/growth/customer-success` loads for Owner; CSV export 403 for Staff.
