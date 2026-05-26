# Feature Flags (Developer view)

## Behavior

- `/dashboard/developer/flags` lists **`FEATURE_KEYS`** from `lib/plans/feature-registry.ts` with `canUseFeature` resolution (plan + overrides + superadmin bypass).

## Constraints

- Read-only — toggles belong in billing / entitlements flows, not the Developer console.
