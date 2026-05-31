# Trials

OS Kitchen has two trial concepts:

1. **Local app trial** (`TrialState`) — managed in `lib/billing/access.ts`.
   Starts when a user signs up, lasts 14 days, becomes EXPIRED on day 14
   if no Stripe sub exists. Drives the *trial-only* router gating.
2. **Stripe trial** (`Subscription.trialStart` / `trialEnd`) — populated
   from the Stripe object during `applyStripeSubscription`. Drives the
   *Trial days remaining* card on the Billing Center.

## States surfaced in UI

| State | UI behavior |
|-------|-------------|
| Active trial (Stripe) | "Trialing" badge, trial days countdown, next billing date = `trialEnd`. |
| Trial ending in 3 days | Same badge with amber "trial ending soon" tone via usage bars / future banner. |
| Trial expired (Stripe) | Stripe transitions to `INCOMPLETE`/`PAST_DUE`; widened status maps accordingly. |
| Trial expired (local) | `lib/billing/access.ts` flips `trialExpiredNoPayment`; the middleware (existing) confines routes to billing pages. |
| Converted | Stripe webhook calls `markTrialConverted`. |

## Honest trial UX

- Trials are derived from real subscription fields. We do not fake
  trials in the database when Stripe is misconfigured.
- The local trial is independent of Stripe and only blocks the app; it
  does not create or charge a subscription.
- A user in the local trial can still see `/dashboard/billing/plans` and
  pick a plan.
