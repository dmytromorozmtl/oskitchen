# First-Run & Onboarding Excellence

## Current flow

- `/onboarding` uses `OnboardingWizard` + `services/onboarding/onboarding-service` adaptive flow.  
- Post-login dashboard uses `buildWorkspaceSetupHint` (`lib/setup-hint.ts`) surfaced in the sidebar widget.

## Improvements (this pass)

1. **Setup hint** now includes **why it matters**, **time estimate**, and **deep links** (`/dashboard/settings/workspace`, branding).  
2. **Widget** renders the `why` line under the progress link (`SetupProgressNavWidget`).  
3. **Navigation** reduces overwhelm so first-run users see **Core** first.

## Still recommended

- Surface “Resume onboarding” banner on `/dashboard` when `onboardingCompleted` is false (already redirects? verify product decision).  
- `/dashboard/settings/modules` — add “recommended vs advanced” copy referencing business mode registry.

## Rules honored

- No forced weekly menu for every business — adaptive flow remains authoritative.  
- POS / storefront recommendations still driven by business mode + module registry.
