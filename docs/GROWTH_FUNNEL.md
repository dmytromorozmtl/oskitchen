# Growth Funnel

## Lead → lifecycle lanes

`lib/growth/growth-funnel.ts` maps each `BetaLead` to a **Growth lifecycle lane**:

- Optional `lifecycleStage` string (uppercase) overrides everything when it matches `GROWTH_LIFECYCLE_STAGES`.
- Otherwise inferred from `BetaLeadStatus` (`NEW` → `LEAD`, `QUALIFIED` → `MQL`, …).

## Demo funnel

`DemoRequestStatus` now includes `QUALIFIED` and `NURTURE` for qualification + nurture queues.

## Activation funnel

Derived from `ActivationState` counts (onboarding, first menu/order/production, billing started) as % of tracked workspaces.

## Signup trend

Weekly buckets of `UserProfile.createdAt` for the last ~8 weeks (ISO week key).
