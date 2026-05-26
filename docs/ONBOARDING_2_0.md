# Onboarding 2.0 (roadmap)

**Current route:** `/onboarding` (existing flow remains; expand incrementally).

## Target steps

1. Business type (mode) — drives defaults from `lib/business-modes.ts`.
2. Business profile — name, timezone, service model.
3. Operating workflow — presets per mode (restaurant lines vs meal prep weekly cycle).
4. Modules — align with **Settings → Modules** recommendations + toggles.
5. Fulfillment — pickup / delivery defaults (`kitchen_settings`).
6. Menu strategy — see [MENU_STRATEGIES.md](./MENU_STRATEGIES.md) (registry; weekly behavior unchanged).
7. Storefront — template choice; see [STOREFRONT_BUSINESS_TEMPLATES.md](./STOREFRONT_BUSINESS_TEMPLATES.md).
8. Menu items — CSV import link or manual add.
9. First / test order — deep link to Orders.
10. Finish — land on **Today** with checklist from `BUSINESS_MODE_EXPERIENCE` onboarding arrays.

## Product requirements

- Progress save after each step (profile + settings JSON already patterns exist).
- Skip optional steps.
- Import demo data — `/demo` and `seedDemoWorkspace`.
- Reset onboarding — flag on `UserProfile` or settings (implement when schema ready).
- AI setup assistant — placeholder card only until grounded tools exist.

Implementation should reuse **terminology** (`lib/terminology.ts`) for headings.
