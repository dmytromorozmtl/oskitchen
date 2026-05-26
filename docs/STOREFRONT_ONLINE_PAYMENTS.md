# Storefront online payments

## Decision

KitchenOS uses **real Stripe Checkout** (`mode=payment`) for storefront orders when:

- `onlinePaymentEnabled` is true,
- `payLaterOnly` is false,
- `STRIPE_SECRET_KEY` is present on the server,
- The existing Stripe webhook at `/api/webhooks/stripe` receives `checkout.session.completed`.

Otherwise the admin **cannot** save “online payments enabled”, and guests only see **pay later**.

## Flow

1. Guest submits checkout choosing **Pay online**.
2. Server validates cart, menu, blackout, limits, delivery zones, discounts — same as pay-later.
3. `Order` is created with `status=PENDING`, `paymentStatus=pending`; `StorefrontOrder` uses `paymentMode=ONLINE_PAYMENT`, `paymentStatus=PENDING`.
4. Stripe Checkout Session is created with metadata `purpose=storefront_order` and `storefrontOrderId`.
5. Guest is redirected to Stripe.
6. Webhook calls `applyStorefrontOrderCheckoutCompleted` which checks `payment_status=paid` and **amount_total** matches the order total (cents).
7. Only then: `paymentStatus=PAID`, internal order `CONFIRMED`, promo `usesCount` incremented if pending, customer email sent if enabled.

## Environment

- `STRIPE_SECRET_KEY` — required for online checkout and for enabling the toggle in admin.
- `STOREFRONT_STRIPE_CURRENCY` — optional ISO 4217 (default `usd`).
- `STRIPE_WEBHOOK_SECRET` — required for webhook verification (shared billing + storefront).

## Pay later

Unchanged: immediate `CONFIRMED` / `NOT_REQUIRED`, confirmation email rules preserved.
