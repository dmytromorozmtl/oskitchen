# Uber Direct setup

Uber Direct is **delivery dispatch**, separate from Uber Eats marketplace orders.

## Current behavior

- Dashboard captures customer ID + OAuth-style client credentials into encrypted columns on an `UBER_DIRECT` connection.
- API routes:
  - `POST /api/delivery/quote`
  - `POST /api/delivery/create`
  - `POST /api/delivery/cancel`
  - `POST /api/webhooks/uber-direct` (authenticated placeholder ingress; fails closed until live handler ships)

Each route validates ownership of the `connectionId` and returns **placeholder** payloads until real Uber Direct HTTP clients are implemented.

## Implementation checklist

1. Confirm Uber Direct **customer** provisioning with Uber business reps.
2. Add environment variables for API base URL & OAuth/token exchange if distinct from marketplace.
3. Map quote/create responses into **`DeliveryDispatch`** rows linked to internal `orders`.
4. Replace the placeholder bearer-secret ingress with provider-specific Uber Direct signature verification before mutating dispatch state.

## Operations note

Dispatch should only trigger from **internal** orders that have validated pickup windows and addresses — gate buttons in Order hub once import pipeline exists.
