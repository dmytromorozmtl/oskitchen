# Growth Usage Events

Canonical names live in `lib/growth/growth-events.ts` (`GROWTH_USAGE_EVENTS`).

## Storage

`UsageEvent` rows: `userId`, `eventName`, optional `route`, `metadata` JSON, `createdAt`.

## Product areas to instrument

Orders, production, packing, integrations, storefront publish, AI copilot — emit concise `eventName` keys; **never** log secrets or raw tokens in `metadata`.

## Explorer

`/dashboard/growth/usage` groups by `eventName` and highlights workspaces with no events in 14 days (churn-risk hint).
