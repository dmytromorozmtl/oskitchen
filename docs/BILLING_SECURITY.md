# Billing security

## Hard rules

1. **No secret values in client bundles.** `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, and any *_SECRET env var are server-only.
   Diagnostics return presence + shape only.
2. **No client-supplied price ids.** Checkout takes a plan key
   (`STARTER | PRO | TEAM`). The price id is read from env on the server
   via `resolvePlanPriceId`.
3. **No client-supplied plan mutations.** The only way to change a
   workspace's plan is (a) a verified Stripe webhook, or (b) an
   `adminAssignPlan` server action gated by `billing.mode.write`.
4. **Webhook signature verification.** Every webhook call is verified
   with `stripe.webhooks.constructEvent`. Invalid signatures → 400.
5. **Idempotency.** Each handled event is keyed by `stripeEventId` in
   `billing_events`. Duplicate deliveries are no-ops.
6. **No raw card data.** Card management is delegated to the Stripe
   customer portal. OS Kitchen never sees PAN.
7. **Audit log.** Every state mutation writes a `BillingEvent` row
   (Stripe-driven and admin-driven).
8. **Permission gating.** `lib/billing/billing-permissions.ts` defines a
   capability matrix used by `actions/billing.ts` and by UI pages that
   conditionally render admin controls.
9. **Superadmin bypass.** `isSuperAdminEmail(profile.email)` grants all
   capabilities. The bypass is centralized and reusable.
10. **No fake payment success.** The only path to `ACTIVE` is a Stripe
    webhook event or a documented admin override.

## Threat model summary

| Threat | Mitigation |
|--------|------------|
| Browser sends `priceId: price_evil` | Plan key is enum; price id resolved server-side. |
| Webhook spoofing | Signature verification. |
| Duplicate webhooks | Idempotency table. |
| Client toggles plan in DevTools | All mutations go through server actions/webhooks. |
| Leaking secrets via diagnostics | Diagnostics show presence + shape only. |
| Card data theft | Stripe portal owns card data. |
| Cross-workspace data leak | All queries scoped by `userId` (workspace owner). |
