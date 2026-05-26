# Onboarding flow builder

`buildOnboardingFlow({ businessType, operatingModel })` returns:

- `stepIds`: canonical order array.
- `steps`: UI metadata (`label`, `description`, `optional`, `recommended`).

`buildOnboardingStepOrder` inserts:

1. Universal: `welcome`, `business_profile`, `operating_model`.
2. Conditional: `brands_locations` (ghost/cloud/multi-brand), `fulfillment` (unless manual-only), `weekly_menu`, `menu_items`.
3. Universal tail: `sales_channels`, `recommended_modules`, `finish`.

Resume logic lives in `resolveInitialWizardStepIndex` (maps legacy linear indices onto the new flow).
