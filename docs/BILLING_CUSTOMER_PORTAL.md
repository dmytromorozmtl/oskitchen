# Customer portal

Route: `POST /api/billing/portal`

## Behavior

1. `requireSessionUser()`.
2. Load `Subscription`; abort with 400 `no_customer` if no
   `stripeCustomerId`.
3. Create `stripe.billingPortal.sessions.create({ customer, return_url })`.
4. Record `BillingEvent PORTAL_SESSION_CREATED`.
5. Return `{ url }`.

## UI

The portal button (`<PortalButton />`) is **enabled** only when:

- Stripe is fully configured (`getStripeConfigState() === "configured"`).
- A Stripe customer id is on file (`Subscription.stripeCustomerId`).

The portal button is rendered on:

- `/dashboard/billing` (top right CTA).
- `/dashboard/billing/payment-method`.
- `/dashboard/billing/cancel` (via legacy `BillingPanelLinkPortal`).

## Permissions

Server-side: any signed-in workspace owner can open the portal. Staff and
admin roles whose capability list contains `billing.portal.open` may
trigger it (today: owner/admin/accountant).

## Failures

- `401` Unauthorized.
- `400` `no_customer`.
- `503` `stripe_not_configured`.
- `500` Stripe error.

The legacy `/api/billing-portal` endpoint stays for back-compat and uses
the same enforcement.
