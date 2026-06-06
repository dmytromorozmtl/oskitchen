# Meal Prep OS setup (Era 189)

Era 189 certifies Meal Prep OS wiring (Round 2): weekly menu, cutoffs, forecasting, and subscriptions modules — with canonical proof via era114 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/meal-prep/meal-prep-os-service.ts` | Dashboard loader — menus, cycles, KPIs |
| `lib/meal-prep/meal-prep-os-builders.ts` | Four module builders, alerts, dashboard assembly |
| `lib/meal-prep/meal-prep-os-policy.ts` | Policy id and route |
| `app/dashboard/meal-prep/page.tsx` | Meal Prep OS page |
| `components/meal-prep/meal-prep-os-panel.tsx` | Module cards, menus, cycles, MRR |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:meal-prep-os-era189` | Full era189 cert + wiring audit |
| `npm run test:ci:meal-prep-os-era189` | Era189 + era114 + meal prep OS unit tests |
| `npm run test:ci:meal-prep-os-era189:cert` | Wiring cert only (CI gate) |
| `npm run smoke:meal-prep-os-era114` | Canonical era114 smoke |

## Human activation

1. Open **Dashboard → Meal Prep OS**.
2. Verify **four module cards** — Weekly Menu, Cutoffs, Forecasting, Subscriptions.
3. Review **Active weekly menus** and upcoming preorder deadlines.
4. Check **Forecast committed meals** and **Upcoming cycles**.
5. Run `npm run smoke:meal-prep-os-era189` — artifact **PASSED**.

## Modules

| Module | Data source |
|--------|-------------|
| `weekly_menu` | Published WEEKLY_PREORDER menus |
| `cutoffs` | Preorder deadlines and storefront cutoff time |
| `forecasting` | Committed meals across upcoming cycles |
| `subscriptions` | Active meal plan KPIs and MRR |

## Artifact

Summary written to `artifacts/meal-prep-os-era189-smoke-summary.json` (gitignored).

See also: [meal-prep-os-era114-setup.md](./meal-prep-os-era114-setup.md)
