# Checkout flow

```
client                       server                       Stripe
[Subscribe to PRO] ─POST──▶ /api/billing/checkout
                             1. requireSessionUser
                             2. parse { plan: STARTER|PRO|TEAM }
                             3. resolveCheckoutPrice(plan)  ✓
                             4. lookup existing Subscription
                             5. stripe.checkout.sessions.create
                             6. record BillingEvent CHECKOUT_SESSION_CREATED
                             7. return { url }
                                                          ▶ checkout UI
                                                          ◀ ?success_url=…
        ◀── 303 success_url ────────────────────────────
[redirect to /dashboard/billing/success?plan=PRO&session_id=cs_…]
```

## Rules

1. Plan key comes from the **server-side enum** (`STARTER|PRO|TEAM`); the
   browser never sends a price id.
2. Price id is read from env using `PLAN_REGISTRY[plan].stripePriceEnvKey`.
3. Enterprise is **not checkoutable** — returns 400 `not_checkoutable`.
4. `customer` is reused when present; `customer_email` only when not.
5. `metadata.userId` + `metadata.plan` are attached to both the
   `Checkout.Session` and the resulting `Subscription`.
6. `success_url` = `/dashboard/billing/success?plan=<plan>&session_id={CHECKOUT_SESSION_ID}`.
7. `cancel_url` = `/dashboard/billing/cancelled?plan=<plan>`.

## Failures

- `401` Unauthorized.
- `400` Invalid payload.
- `400` `not_checkoutable` / `missing_price`.
- `503` `stripe_not_configured`.
- `500` Stripe error (message returned via `safeStripeError`).

All success and failure attempts are written to `billing_events`.
