# Production calendar — operator checklist (pilot / staging)

**Policy:** `era13-production-calendar-operator-depth-v1` (`lib/production/production-calendar-operator-depth-era13-policy.ts`)

**Page:** `/dashboard/production/calendar` (`app/dashboard/production/calendar/page.tsx`)

**Maturity:** `pilot_ready` (qualified) — move, cross-week, and status workflow are certified in CI; not rush-hour production certified.

## Certified operator actions

| Action | Server action | Permission |
|--------|---------------|------------|
| Create batch task | `createPlanTaskAction` | `production.manage` |
| Reschedule (±1 day, cross-week) | `movePlanTaskAction` | `production.manage` |
| Status SCHEDULED / IN_PROGRESS / COMPLETED | `updatePlanTaskStatusAction` | `production.manage` |

**RBAC / UX:** Era 6 form deny (`era6-production-calendar-form-deny-v1`) — denied users see `CopilotFormErrorBanner`, not silent success.

## Not certified (honest scope)

- Drag-and-drop scheduling
- KDS / kitchen board sync from calendar tasks
- Delete-task UI (tasks persist until manual DB cleanup)
- Recipe picker on create form (service supports `recipeId`; UI not wired)
- Default CI browser E2E for production calendar

## Automated certification smoke (local / pre-pilot)

```bash
npm run smoke:production-calendar
```

Runs wired unit/cert tests (`test:ci:production-calendar-move-ui:cert` + era13 operator-depth cert). Does **not** replace manual pilot steps below.

## Manual pilot checklist

1. Sign in as a workspace user with `production.manage` (or owner).
2. Open `/dashboard/production/calendar` — confirm week label and prev / this week / next links.
3. **Create** — add batch name + plan date; confirm task on day column.
4. **Move within week** — ←/→ on a task; confirm date shifts one day.
5. **Cross-week** — Monday ← or Sunday →; confirm `?week=` changes and task moves.
6. **Status** — IN_PROGRESS then COMPLETED; confirm card styling.
7. **RBAC deny** — user without `production.manage`; submit create/move/status; confirm deny banner.

## CI certification

- `npm run test:ci:production-calendar-operator-depth-era13:cert` (chained in `test:ci:production-calendar-move-ui:cert`)
- Governance: `test:ci:governance-bundles:partition-product-kds` includes `test:ci:production-calendar-move-ui:cert`
- RBAC negatives: `npm run test:ci:rbac-wave4` (`production-calendar-actions-rbac.test.ts`)

## Related policies

- `era8-production-calendar-move-ui-v1` — week-column move controls
- `era10-production-calendar-cross-week-ui-v1` — `?week=` navigation
- `era10-production-calendar-status-workflow-ui-v1` — per-task status select
- `era11-mutation-access-recert-v1` — inline `production.manage` gate registry
