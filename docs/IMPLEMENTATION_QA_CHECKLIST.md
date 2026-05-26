# Implementation Center — QA checklist

## Build hygiene

- [x] `npx prisma migrate deploy` applies the
  `20260521000000_implementation_center` migration cleanly.
- [x] `npx prisma generate` succeeds.
- [x] `npx tsc --noEmit` produces zero errors.
- [x] `npm run build` completes with no `Failed to compile` output.

## Functional smoke

- [ ] Visit `/dashboard/implementation` with **no** project → empty
  state shows the three CTAs (Start, Templates, Go-Live).
- [ ] Visit `/dashboard/implementation/new` → wizard renders nine steps;
  Back/Continue navigate; submission creates the project.
- [ ] After creation: visit `/dashboard/implementation/[projectId]` →
  KPIs, phases, next best action render; sub-tabs navigate.
- [ ] Checklist tab: toggling status writes through
  `updateChecklistItemAction` and refreshes via `router.refresh()`.
- [ ] Generate tasks: **Preview** lists checklist items; selecting and
  pressing **Generate selected** creates `KitchenTask` rows with
  `sourceType = IMPLEMENTATION`.
- [ ] Go-live tab: **Run readiness check** writes
  `GoLiveReadinessCheck` rows and updates `readinessScore`.
- [ ] Go-live tab: **Mark live** fails with a descriptive error when a
  required check fails.
- [ ] Migration tab: dataset cards link to the right modules; recent
  imports list renders.
- [ ] Integrations tab: real `IntegrationConnection` rows are
  reflected; placeholders are labelled placeholders.
- [ ] UAT tab: each scenario opens the linked module.
- [ ] Risks tab: add → list → resolve all persist + audit.
- [ ] Activity tab: events appear with timestamps.
- [ ] Reports tab: readiness rollup + checklist rollup render.

## Data-safety smoke

- [ ] Creating a project does **not** create any `Order`,
  `KitchenCustomer`, `Product`, `Brand`, `Location` rows.
- [ ] Running readiness does **not** mutate any data outside
  `implementation_*` / `go_live_readiness_checks`.
- [ ] Marking live only updates `ImplementationProject.status`.

## Permissions smoke

- [ ] As workspace owner / admin: full access.
- [ ] As superadmin `workspace.moroz@gmail.com`: full access.
- [ ] As staff: view-only on tabs that allow `view`, restricted on
  state-changing actions.
