# Onboarding module audit

## Current routes

| Area | Current behavior | Issue | Priority |
|------|------------------|-------|----------|
| `/onboarding` | Adaptive wizard with welcome → profile → operating model → conditional steps | Previously linear only | — |
| Dashboard gate | `app/dashboard/layout.tsx` redirects incomplete users to `/onboarding` unless platform billing bypass | Correct for owners | P2: staff users |
| Registration | `ensureAppUser` creates `KitchenSettings` | Must remain stable | P0 |

## Legacy issues (fixed)

| Issue | Why wrong | Fix |
|-------|-----------|-----|
| Fixed 6-step pill rail for everyone | Restaurants/cafés do not need weekly preorder menus | `buildOnboardingStepOrder` + `shouldShowWeeklyMenuStep` |
| Weekly menu always shown | Blocked mental model for daily-service operators | Conditional `weekly_menu` step |
| Sales channels = 3 checkboxes | Missing storefront, CSV, phone, catering, etc. | Expanded intents + `MANUAL` placeholder rows |
| Timezone free text only | “UTC+1” is not canonical | IANA validation + datalist |
| Business type dropdown only | Weak discoverability | Radio cards for all `BusinessType` values |
| No persisted adaptive state | Could not route or resume safely | `kitchen_settings.onboarding_adaptive_json` |
| Skip hid completion semantics | Skips should not mark steps “completed” | `afterSkipSuccess` vs `afterSaveSuccess` |

## Weekly menu logic

Shown only when `shouldShowWeeklyMenuStep` is true (meal prep defaults, explicit weekly preorder, bakery preorder flows). Never mandatory for manual-only, restaurant walk-in, café/bar defaults, catering quotes path.

## Data / privacy

- No OAuth secrets collected in onboarding.
- WooCommerce/Shopify/Uber rows are “connect next” placeholders until real integration setup.

## Remaining gaps

- Staff/OWNER role gate on `/onboarding` not tightened (assumes primary registrant is owner).
- “Brands” step is footprint counts only — real `Brand` rows still created in dashboard.
- Product mapping / CRM deep steps are implied via setup tasks, not full wizards.
