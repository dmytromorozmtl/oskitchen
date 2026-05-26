# Onboarding — ready report

## Summary

Onboarding is now **adaptive**: welcome + business profile + operating model drive which optional steps appear (fulfillment, weekly menu, menu items, brands footprint). Sales channels capture **intents** without collecting credentials. Module recommendations use the business-mode registry. Progress is saved to **`kitchen_settings.onboarding_adaptive_json`** (schema v2) while `onboarding_step` tracks position in the dynamic flow.

## Old problems

- Linear meal-prep-centric wizard forced weekly menus.
- Limited sales-channel options.
- Weak timezone guidance.

## New behavior

- **Weekly menu** only when `shouldShowWeeklyMenuStep` passes.
- **Finish routing** uses `computeFinishRedirect` (storefront, channels, manual-only, meal prep / weekly → today, default `/dashboard`).
- **Setup tasks** generated at completion for Today / menus / channels / settings.

## Prisma

- Added nullable `onboardingAdaptiveJson` on `kitchen_settings` (additive migration).

## Limitations

- Footprint step does not create `Brand` rows.
- Staff-role onboarding policy unchanged.
- Advanced catering/CRM wizards deferred to setup tasks + dashboard modules.

## Next recommendations

1. E2E tests for each business type path.
2. Hydrate module toggles from existing `KitchenModulePreference` rows instead of defaults-only.
3. Optional server-driven “recommended badge” copy pulled from `business-mode-registry` blurbs.
