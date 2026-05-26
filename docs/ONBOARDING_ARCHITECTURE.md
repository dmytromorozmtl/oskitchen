# Onboarding architecture

## Layers

1. **Types** (`lib/onboarding/onboarding-types.ts`): step ids, operating models, channel intents, adaptive JSON shape.
2. **Business rules** (`lib/onboarding/onboarding-business-modes.ts`): when to show weekly menu, fulfillment, brands step; map operating model → workflow id.
3. **Flow builder** (`lib/onboarding/onboarding-flow-builder.ts`): ordered steps + labels.
4. **Validation** (`lib/onboarding/onboarding-validation.ts`): IANA timezone, ISO currency, business name.
5. **Modules UI helper** (`lib/onboarding/onboarding-modules.ts`): candidate module keys (client-safe, no Prisma).
6. **Service** (`services/onboarding/onboarding-service.ts`): parse/merge adaptive JSON, resume index, setup tasks, finish redirect, service menu helper.
7. **Actions** (`actions/onboarding.ts`): mutate Prisma, advance/skip semantics, order channels, module prefs.
8. **UI** (`components/onboarding/onboarding-wizard.tsx`): progress bar, conditional panels, skip affordances.

## Persistence

- `UserProfile.onboardingStep` — numeric index into **current** adaptive `stepIds` array (legacy users mapped on read).
- `UserProfile.onboardingCompleted` — completion flag.
- `KitchenSettings.onboardingAdaptiveJson` — `OnboardingAdaptiveState` (schema v2).

## Skip vs complete

- **Save** path: `advanceOnboardingStepIndex` + `markStepCompleted`.
- **Skip** path: `markStepSkipped` + `advanceOnboardingStepIndex` (no completed marker).
