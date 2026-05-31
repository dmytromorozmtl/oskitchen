# Storefront Stripe — Option B (Connect)

## Current state (Option A — platform account)

- Guest checkout uses **OS Kitchen platform** Stripe keys (`STRIPE_SECRET_KEY`, webhook `/api/webhooks/stripe`).
- Funds settle to the platform; merchant payout is manual/off-platform.
- Readiness: `storefrontPaymentReadiness()` in `services/storefront/storefront-payment-service.ts`.
- Admin UI: **Dashboard → Storefront → Ordering** → “Stripe readiness”.

This is correct for **pilot / single merchant** when you control the bank account.

## Target state (Option B — Stripe Connect)

Aligns with Shopify Payments: each merchant connects their own Stripe account; OS Kitchen takes an application fee.

### Bek tasks

1. Enable Connect in Stripe Dashboard; add `STRIPE_CONNECT_CLIENT_ID` (or OAuth client id per Stripe docs).
2. Prisma: persist `stripeConnectAccountId`, `stripeConnectChargesEnabled`, `stripeConnectPayoutsEnabled` on `StorefrontSettings` (or dedicated table).
3. Onboarding route: `POST /api/storefront/stripe/connect` → Account Link or OAuth return URL.
4. Checkout: create Session/PaymentIntent with `stripeAccount: connectAccountId` and `application_fee_amount`.
5. Webhook: handle `account.updated`, `checkout.session.completed` scoped to connected account.
6. Feature flag: `STOREFRONT_STRIPE_CONNECT=1` — off by default until smoke passes.

### Front tasks

1. Ordering tab: states — **Not connected** | **Pending verification** | **Online payments ready**.
2. Connect button → Stripe hosted onboarding.
3. Public checkout: hide “Pay online” until `charges_enabled`.

### Env (production)

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Test plan

1. Connect test account in Stripe test mode.
2. Place order with online pay → payment on connected account.
3. Confirm webhook updates order to paid.
4. Verify application fee in Stripe Dashboard.

### Do not mix

- Never charge a connected account with platform-only Session IDs from pilot code paths.
- Keep Option A code path behind flag until Connect onboarding is complete for a storefront.
