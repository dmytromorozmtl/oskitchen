# Storefront Stripe currency alignment

## Goal

Guest-facing totals must use the same currency as Stripe Checkout minor units. Silent cross-currency charges are forbidden.

## Implementation

- `lib/storefront/currency.ts` — Stripe-supported currency helpers and minor-unit conversion.
- `services/storefront/storefront-currency-service.ts` — `resolveStorefrontStripeCheckoutCurrency` returns `aligned | unsupported | missing`.
- `services/storefront/storefront-payment-service.ts` — online checkout allowed only when Stripe is configured **and** currency status is `aligned`.
- `services/storefront/storefront-stripe-checkout-service.ts` — session uses resolved minor amount + currency.
- Admin: `/dashboard/storefront/ordering` shows storefront currency, Stripe session currency, and alignment status.

## Pay-later

Pay-later / request mode stays available even when online card checkout is blocked.
