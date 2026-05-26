# Cancel & downgrade

Route: `/dashboard/billing/cancel`. Owner-only.

## Cancel

Cancellation is performed through Stripe — KitchenOS never directly
deletes a subscription. The "Open Stripe portal" CTA on this page lets
the owner schedule a cancel-at-period-end or immediate cancel. Stripe
sends `customer.subscription.deleted`, the webhook syncs the row, and
`statusDetail` becomes `CANCELLED`.

If Stripe is not configured, the page shows the local downgrade-blocker
view + a textual instruction. We do not fake cancellation locally.

## Downgrade

Each plan has limits. Before downgrading, compute current usage and
compare to the target plan's limits. The page renders a table of
blockers — items where current usage exceeds the next-lower plan's
limit. The owner must first reduce those items (delete menus, archive
staff, disconnect integrations, etc.).

```ts
import { downgradeBlockers } from "@/services/billing/entitlement-service";
const blockers = downgradeBlockers(targetPlan, counts);
```

Once usage fits, the Stripe portal is used to switch plans.

## Cancellation feedback

The legacy `submitCancellationFeedbackVoid` server action collects an
anonymous reason + free-text details. It still works.

## Audit

Every cancel or downgrade trigger creates a `BillingEvent`. Stripe-side
state lands via the webhook idempotently.
