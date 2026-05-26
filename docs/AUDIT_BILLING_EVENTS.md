# Billing Audit Events

## Implemented

- `STRIPE_WEBHOOK_RECEIVED` — logged once per successfully handled Stripe webhook when a workspace user id can be resolved (checkout metadata, subscription metadata, invoice customer lookup, customer.updated subscription lookup).

## Existing billing trail

`recordBillingEvent` continues to power billing-specific tables; audit rows complement workspace-level Activity / Billing tabs.

## Never log

Card PAN/CVC, raw Stripe objects, or webhook signing secrets.
