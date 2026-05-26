# Connecting Stripe

KitchenOS uses **Stripe Connect** — you receive payments directly.

## Setup

1. **Dashboard → Billing → Connect Stripe**.
2. Complete Stripe onboarding (business info, bank account).
3. Test with Stripe test mode before going live.

## Storefront checkout

- Customers pay via Stripe Checkout on your storefront.
- KitchenOS never stores card numbers (PCI SAQ-A path).

## POS card payments

- Requires active Stripe Connect account.
- Card payments need **online** connectivity (not queued offline).

## Troubleshooting

- **Past due:** check Stripe Dashboard for verification holds.
- **Webhook errors:** verify Stripe webhook endpoint in Billing settings.
