# Storefront checkout — final reference

## Modes

1. **Pay later / request (default)** — `paymentMode=PAY_LATER`, `paymentStatus=NOT_REQUIRED`. No Stripe required.
2. **Online payment** — architectural toggles only until Stripe Connect (or similar) is implemented per merchant.
3. **Deposit** — placeholder enum value; not exposed as a customer flow yet.

## Server validations (current)

- Storefront `enabled`, `published`, `preorderEnabled`, not in closure window.
- Fulfillment type allowed (`pickupEnabled` / `deliveryEnabled`).
- Optional legal terms acceptance when `termsText` set.
- Daily `orderCutoffTime` in merchant timezone (`lib/storefront/checkout.ts`).
- Daily **order cap** uses `storefrontId` scope (excludes future `isTestOrder` usage from count when flagged).
- Menu membership + `storefrontVisible` products.
- Per-line **max storefront quantity**.
- **Blackout dates** vs chosen pickup/delivery day.
- Minimum subtotal.
- **Promo codes** (`StorefrontDiscount`) with transactional increment on success.
- Duplicate-submit guard (45s window, email + cart fingerprint).

## Client

- `components/storefront/store-checkout-client.tsx` collects fulfillment, notes, optional promo.

See flow narrative: `docs/STOREFRONT_CHECKOUT_FLOW.md`.
