# Onboarding QA checklist

- [ ] New user: welcome → profile → operating model tail matches business type.
- [ ] Restaurant + walk-in: **no** mandatory weekly menu step.
- [ ] Meal prep default: weekly menu appears; skip still completes onboarding.
- [ ] Manual-only: fulfillment hidden; finish redirect `/dashboard/orders/new`.
- [ ] Storefront intent: finish redirect `/dashboard/storefront`.
- [ ] Channel intents (Woo/Shopify/Uber): redirect `/dashboard/sales-channels`.
- [ ] Timezone invalid string rejected server-side.
- [ ] Currency lower-case normalized to ISO uppercase.
- [ ] Skip onboarding from footer completes and lands `/dashboard`.
- [ ] Demo import still works from finish card.
- [ ] `reopenOnboardingWizard` clears adaptive JSON and resets step.
- [ ] Platform superadmin bypasses dashboard onboarding redirect (existing behavior).

Commands: `npm run typecheck`, `npm run build`.
