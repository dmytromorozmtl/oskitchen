# Onboarding business modes

Prisma `BusinessType` drives defaults:

- `defaultOperatingModelForBusinessType` seeds the operating-model step before the user overrides it.
- `getDefaultOnboardingWorkflowId` (registry) aligns long-term nav; operating model save writes `kitchenWorkflowDefault` via `mapOperatingModelToWorkflowId`.

## Operating models

| Id | Typical use |
|----|-------------|
| `WALK_IN_DAILY` | Restaurants, bars |
| `PICKUP` / `DELIVERY` | Cafés, hybrid |
| `WEEKLY_PREORDERS` | Meal prep |
| `CATERING_QUOTES_EVENTS` | Catering |
| `BAKERY_CUSTOM_PREORDERS` | Bakeries |
| `STOREFRONT` | Native web |
| `SHOPIFY_WOO_MARKETPLACE` | Ghost / multi-brand |
| `MANUAL_ONLY` | Fastest path |

## Weekly menu visibility

See `shouldShowWeeklyMenuStep` — false for `MANUAL_ONLY`, catering quotes, storefront-only, meal prep + walk-in daily, etc.
