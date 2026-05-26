# Navbar width & module depth

## Pilot profile
- `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` hides secondary modules (forecast, purchasing, costing, reports subtree, copilot, meal plans, catering quotes, training, partner, developer, executive, import-export) via `lib/navigation/release-navigation.ts` + `services/modules/module-release-service.ts`.

## Superadmin
- Platform superadmin nav stays **full** (pilot filter bypasses when `fullNavAccess`).

## Registry
- `lib/modules/release-module-status.ts` reserved for future per-module flags.

Routes are **not deleted** — only default sidebar density changes.
