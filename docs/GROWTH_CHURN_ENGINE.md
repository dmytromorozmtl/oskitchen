# Growth — Churn Engine

Implementation: `services/growth/churn-service.ts` + `lib/growth/growth-scoring.ts` (`scoreChurnHeuristic`).

## Signals

- Days since last `UsageEvent`
- Onboarding incomplete (`ActivationState.onboardingCompleted`)
- Integration connections in `ERROR`
- Subscription status/detail keywords (`past_due`, `canceled`, …)

## Output

Sorted watchlist with numeric **risk score** (0–100) + human-readable reasons for founder triage.

## Limitations

Heuristic only — replace with ML + billing dunning data as maturity increases.
