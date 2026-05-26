# Platform billing & entitlements

## Current UI

Stub routes: `/platform/billing`, `/platform/plans`, `/platform/entitlements`, `/platform/trials`, `/platform/revenue` (all require `platform:billing:read` except where noted in navigation).

## Workspace context

Workspace detail surfaces **owner** `Subscription` and `TrialState` read-only.

## Rules

- Never display full card or payment method data.
- Do not fabricate Stripe state — UI should reflect Prisma / Stripe webhooks only.
- Writes (`platform:billing:write`, `platform:entitlements:write`) should pair with audit + confirmation modals when implemented.
