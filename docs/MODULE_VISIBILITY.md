# Module visibility and preferences

## Behavior

- **Workspace module preferences** are stored per user in `KitchenModulePreference` (`moduleKey`, `enabled`, `pinned`, `sortOrder`).
- **Disabled modules** are removed from the main navigation and filtered in the command palette where applicable.
- **Direct URLs** to a disabled module show a **module disabled** empty state (no crash), except **platform superadmin**, who bypasses prefs for support.
- **Billing** and plan gates still apply: disabling a module does not grant paid features.
- **Locked modules** (always on in prefs UI): dashboard, today, settings, billing, support — see `actions/module-preferences.ts`.

## Registry

Authoritative keys and path prefixes: `lib/module-visibility.ts` (`MODULE_REGISTRY`, `MODULE_KEYS`).

## Recommended defaults by business type

`getRecommendedDisabledModuleKeys` in `lib/module-visibility.ts` applies conservative hides (e.g. meal subscriptions for modes that rarely use subscription boxes). Full mode experience (labels, nav groups, terminology) is in `lib/business-modes.ts` and `lib/terminology.ts`.

## Settings

**Settings → Modules** (`/dashboard/settings/modules`): enable/disable, reset to recommended, pin (pin persistence may extend to DB in a follow-up).
