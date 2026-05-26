# Growth Analytics

## Command Center KPIs

| KPI | Source | Notes |
| --- | --- | --- |
| Workspaces | `userProfile.count` | Registered profiles. |
| Active / trialing subs | `subscription.count` by `status` | Stripe-backed when configured. |
| Paid revenue (30d) | `invoiceRecord` sum `amountPaidCents` where `paidAt` in window | **Proxy**, not GAAP MRR. |
| Activation rate | `activationState` onboardingCompleted / total states | Denominator = workspaces with a row. |
| Demo win rate | `demoRequest` WON / all | Funnel hygiene. |
| WAU | distinct `usageEvent.userId` (7d) | Lightweight DAU/WAU stand-in. |

## Charts

Rendered via Recharts in `growth-command-center.tsx` using server-serialized DTOs (no secrets).

## Next steps

- Materialized KPI snapshots for large tenants.
- Cohort retention SQL based on `usage_events` + `orders`.
