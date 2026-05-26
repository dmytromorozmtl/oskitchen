# Billing QA checklist

## Static

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] No secret values appear in browser bundles (`grep -r "sk_" .next/static` returns nothing).
- [ ] `getStripeDiagnostics()` returns presence-only rows.

## Routing

- [ ] `/dashboard/billing` loads when Stripe is unconfigured.
- [ ] Subnav renders 9 items: Overview, Plans, Usage, Invoices, Payment method, History, Entitlements, Cancel / downgrade, Settings.
- [ ] Each sub-page renders on its own.

## Stripe disabled

- [ ] Checkout buttons show as disabled with a clear reason.
- [ ] Portal button is disabled.
- [ ] Diagnostics card shows missing rows.

## Stripe configured (test mode)

- [ ] Subscribe to PRO → redirected to Stripe Checkout.
- [ ] Complete checkout → webhook arrives → status detail = ACTIVE.
- [ ] `BillingEvent CHECKOUT_SESSION_CREATED` and `STRIPE_CHECKOUT_COMPLETED` are recorded.
- [ ] `InvoiceRecord` is created.
- [ ] Open Customer portal → returns to `/dashboard/billing`.

## Idempotency

- [ ] Replay a webhook event from the Stripe CLI; second call returns
      `{ received: true, duplicate: true }` and creates no extra rows.

## Plans

- [ ] Plan comparison table matches `PLAN_REGISTRY`.
- [ ] Enterprise card shows "Contact sales" not a checkout button.

## Usage

- [ ] Usage bars show correct counts.
- [ ] At 80%+ the bar turns amber. At 100%+ it turns rose.

## Entitlements

- [ ] Toggling an override changes the effective flag.
- [ ] Superadmin bypass shows all enabled.
- [ ] Clearing an override reverts.

## Cancel / downgrade

- [ ] Downgrade view shows blockers when usage > target limits.
- [ ] Owner-only.

## Security

- [ ] Logged-out users get 401 from API routes.
- [ ] Non-owners cannot reach the admin form.
- [ ] Webhook with bad signature returns 400.
- [ ] Webhook without secret returns 400.

## Go-live

- [ ] Go-live readiness includes billing signals.
- [ ] Plan-active signal fires for INTERNAL_FREE / ENTERPRISE_CONTRACT.

## Local development

- [ ] `DEV_BYPASS_BILLING=true` in dev disables gates; pages still load.
- [ ] No fake "ACTIVE" rows are auto-created.
