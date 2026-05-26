# Growth — Customer Success

## UI

`/dashboard/growth/customer-success` — combines `computeCustomerHealth`, retention snapshot, bulk note forms.

## Data

- `CustomerHealthSnapshot` grouped in Growth overview (7d mix).
- Founder tables in command center for **at-risk** heuristics (see `churn-service.ts`).

## Next steps

- CSM assignment per workspace (`ownerUserId` pattern similar to leads).
- Renewal dates from `Subscription.currentPeriodEnd`.
