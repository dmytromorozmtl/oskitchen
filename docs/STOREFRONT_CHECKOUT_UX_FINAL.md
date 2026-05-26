# Storefront checkout UX (final)

**Implemented:** `components/storefront/store-checkout-client.tsx`, `actions/storefront-order.ts`, terms/privacy checkboxes, pay-later vs Stripe online, currency alignment via `storefront-currency-service`, analytics `checkout_start` / `checkout_submit` via first-party ingest.

**Works:** Pay-later path unchanged; Stripe session creation on online path; rules + delivery validation ordering preserved with zone data for rules.

**Limits:** Client cannot bypass server validation.

**QA:** Pay-later happy path; online with Stripe env; currency mismatch blocks online; fulfillment blocker returns first message.

**Roadmap:** Saved payment methods (not started).
