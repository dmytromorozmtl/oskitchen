# Billing & Subscription Center — ready report

## What changed

The Billing surface was upgraded from a pricing/checkout placeholder
into a full Billing & Subscription Center:

- New `lib/billing/*` module with plan registry, status widening,
  diagnostics, stripe client, usage helpers, entitlements, and
  permissions.
- New `services/billing/*` services for billing audit, subscription
  sync, usage recomputation, entitlements, and Go-live readiness.
- Additive Prisma migration adding `BillingMode`, `InvoiceRecordStatus`,
  `BillingCustomer`, `UsageCounter`, `BillingEvent`, `InvoiceRecord`,
  `EntitlementOverride`, and 11 new columns on `Subscription`.
- New API routes `/api/billing/checkout` and `/api/billing/portal`.
- Hardened, idempotent Stripe webhook on `/api/webhooks/stripe`.
- 9-tab dashboard: Overview, Plans, Usage, Invoices, Payment Method,
  History, Entitlements, Cancel / Downgrade, Settings.
- Marketing `/pricing` aligned to the same registry.
- Go-live readiness extended with billing signals.
- 13 docs files + this report.

## Plan registry

Single source of truth: `lib/billing/plan-registry.ts`. Defines plan
prices, limits (orders, menus, integrations, staff, brands, locations,
storefronts), 21 feature flags, visible modules, allowed integrations,
support level, and the env key of the Stripe price.

## Stripe configuration diagnostics

`/dashboard/billing/settings` shows presence + shape only. Required
rows: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, the 3 price ids,
`NEXT_PUBLIC_APP_URL`. Live vs test mode is displayed.

## Checkout flow

- `POST /api/billing/checkout` with `{ plan }`.
- Server resolves price id from env (never trusts client).
- Records `CHECKOUT_SESSION_CREATED` event.
- Redirects to Stripe; success/cancel land on
  `/dashboard/billing/success` and `/dashboard/billing/cancelled`.

## Customer portal

- `POST /api/billing/portal`.
- Requires Stripe configured + existing `stripeCustomerId`.
- Records `PORTAL_SESSION_CREATED`.

## Webhooks

- Signature-verified.
- Idempotent via `BillingEvent.stripeEventId UNIQUE`.
- Handles subscription, checkout, invoice, and customer events.

## Invoices

`InvoiceRecord` is populated from Stripe `invoice.*` events. Numbers,
amounts (cents), currency, hosted URL, PDF URL, issued and paid
timestamps. Surfaced at `/dashboard/billing/invoices`.

## Usage tracking

`UsageCounter` holds per-metric counts per month. Bars show used /
limit with soft warnings at 80%.

## Entitlements

Effective flags = plan default ∪ overrides ∪ superadmin bypass. Managed
at `/dashboard/billing/entitlements`. Server APIs:
`entitlementSnapshot`, `canUseFeatureNew`, `assertWithinLimit`,
`setEntitlementOverride`.

## Trial management

Two sources cooperate: local `TrialState` + Stripe trial fields. The UI
shows real values; no fake trials.

## Cancel / downgrade

`/dashboard/billing/cancel` (owner-only) shows downgrade-blockers based
on usage vs. the target plan limits, plus the Stripe portal CTA for the
actual cancel/downgrade.

## Superadmin tools

`/dashboard/billing/settings` exposes:
- Diagnostics card.
- Admin assign plan + billing mode + status form (gated by
  `billing.mode.write`).
- Entitlement override management.

All admin actions are logged in `BillingEvent`.

## Security safeguards

See `docs/BILLING_SECURITY.md`. Summary: no secrets in client, no
client-trusted plan/price, signature-verified webhooks, idempotent
event handling, no raw card data, audit everywhere, RBAC for admin
operations.

## Remaining limitations

- The `SubscriptionStatus` DB enum stays at 4 values; the widened state
  lives in `status_detail`. Switching the enum would require a
  destructive migration.
- Embedded Stripe Elements (without redirect) is not implemented — the
  publishable key env is present but reserved.
- Yearly billing is a placeholder (the toggle on `/pricing` only
  displays the discounted view).
- `usage-service` uses `userId` as the workspace key — multi-workspace
  remains a future change.
- Entitlement overrides do not yet feed `PlanGate` (which still reads
  `lib/plans/feature-registry.ts`). Migration is incremental and safe.

## Next recommendations

1. Migrate `PlanGate` callsites to `entitlementSnapshot`.
2. Wire `assertWithinLimit` into integration creation, menu activation,
   and staff invite paths.
3. Add embedded Stripe Elements for card edits in-app.
4. Add yearly price ids + dual-toggle pricing.
5. Add a "billing health" KPI widget on the dashboard home.
