# Onboarding setup tasks

`buildSetupTasks` runs on **finish** (`onboardingComplete`) and persists into `onboardingAdaptiveJson.setupTasks`.

Examples:

- Open Today (`/dashboard/today`)
- Create menu item (skipped menu_items → stronger nudge)
- Connect sales channel when Woo/Shopify/Uber selected
- Configure storefront when intent selected
- Weekly menu reminder when skipped but business is meal prep / weekly preorder
- Catering quotes link when operating model matches
- Settings review (low priority)

Tasks are suggestions only — no automatic navigation beyond the chosen finish redirect.
