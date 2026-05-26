# Business modes (FoodOps)

Business mode is stored on **`KitchenSettings.businessType`** (Prisma enum `BusinessType`).

## Where it is set

- **Onboarding** — step 1 business profile (`components/onboarding/onboarding-wizard.tsx`).
- **Settings** — “Operating mode” card (`components/dashboard/settings-form.tsx` → `actions/settings.ts`).
- **Platform admin** — read-only visibility on **Workspaces** table (`app/platform/workspaces/page.tsx`); changing a tenant’s mode remains a workspace-owner action in Settings.

## Runtime behavior

| Concern | Implementation |
| --- | --- |
| Default nav focus | `getFilteredNavGroups` in `lib/business-modes.ts` |
| Show every module | Sidebar control **“Show all modules”** (persists in `localStorage` under `kitchenos.nav.scope`) |
| Pinned shortcuts | Per-link pin control (`kitchenos.nav.pins`) |
| Nav search | Filter box above groups (in addition to **⌘K** command palette) |
| Full nav (no hiding) | Billing / platform bypass for canonical platform owner |
| Labels | `navLabelForBusinessType` in `lib/terminology.ts` (English overrides today) |
| Recommended modules | `RECOMMENDED_MODULE_HREFS` in `lib/business-modes.ts` |

## Per-mode guides

- `docs/MEAL_PREP_MODE.md`
- `docs/CATERING_MODE.md`
- `docs/RESTAURANT_MODE.md`
- `docs/CAFE_MODE.md`
- `docs/BAR_MODE.md`
- `docs/BAKERY_MODE.md`

These summarize operational focus; they are not legal or compliance advice.
