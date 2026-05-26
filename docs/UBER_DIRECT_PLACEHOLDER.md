# Uber Direct placeholder

## Route

`/dashboard/routes/uber-direct`

## Stance

KitchenOS records Uber Direct buttons as **placeholder events** (`DeliveryEventType.UBER_QUOTE_REQUESTED_PLACEHOLDER`) for the audit trail. We do not call Uber APIs from these screens.

## Setup checklist

The page renders a checklist that flips to green only when the env vars are present (`UBER_DIRECT_CLIENT_ID`, `UBER_DIRECT_CLIENT_SECRET`). The remaining items (`Customer ID + webhook secret`, `live quote/create dispatch implementation`, `webhook handler`) are explicit "future work" bullets — no claims of live capability.

## Existing data

`DeliveryDispatch` rows from earlier order-driven flows still appear so operators can audit prior dispatches. They are read-only on this page.

## When live dispatch ships

The migration path will:

1. Implement a `services/routes/uber-direct.ts` client gated on `getServerEnv()`.
2. Replace the placeholder action with a real quote + create flow.
3. Replace the authenticated placeholder webhook under `app/api/webhooks/uber-direct/route.ts` with real provider signature verification + dispatch state mutation.
4. Keep the placeholder event type for backwards-compat with historical audit rows.
