# Go-live QA checklist

Run through this list before considering a workspace truly ready for
production launch.

## Routing

- [ ] `/dashboard/go-live` loads for a workspace without a project and
      shows the legacy 13 checklist labels read-only.
- [ ] `/dashboard/go-live` loads for a workspace with a project and
      shows the Command Center.
- [ ] `/dashboard/go-live/test-run` still works (legacy simulation).
- [ ] `/dashboard/go-live/projects/{projectId}` renders.

## Readiness

- [ ] Readiness % recalculates after adding a menu, product, staff,
      billing, or production batch.
- [ ] Required missing signals are listed in the validation report.
- [ ] Business-type weighting changes readiness when the type is
      changed (MEAL_PREP raises packing/routes weights).

## Blockers

- [ ] Removing all products triggers `no_active_menu` (CRITICAL).
- [ ] Disabling Stripe triggers `no_billing` (CRITICAL).
- [ ] Marking a sales channel `ERROR` triggers `broken_channel`
      (CRITICAL).
- [ ] Unresolved unmapped products with a connected channel trigger
      `unmapped_products` (CRITICAL).

## Checklist

- [ ] Auto-validated rows update after `refreshAutoValidation`.
- [ ] Manual rows can be set to DONE / NEEDS_REVIEW / WAIVED.
- [ ] Assigning an item shows in the row form.
- [ ] Audit event is recorded for each save.

## Simulations

- [ ] Each scenario type writes a `GoLiveSimulation` row with
      `outputJson`.
- [ ] FAILED scenarios surface a recommendation.
- [ ] PASSED scenarios stamp `completedAt`.

## Approvals

- [ ] Recording an approval upserts the row and re-runs validation.
- [ ] Cannot move to APPROVED while any CRITICAL blocker is open.
- [ ] Cannot move to LIVE without APPROVED first.

## Incidents

- [ ] Creating an incident from the project page works.
- [ ] Updating status to RESOLVED stamps `resolvedAt`.
- [ ] Severity + status badges render correctly.

## Rollback

- [ ] Default plans seeded on project creation.
- [ ] Custom plan creation succeeds with multi-line steps.
- [ ] `ROLLBACK_MODE` transition locks the project.

## Permissions

- [ ] Owner of the workspace can perform all actions.
- [ ] `workspace.moroz@gmail.com` retains override visibility.
- [ ] STAFF role can still view but cannot trigger LIVE without
      `go-live.launch` capability.

## Build & types

- [ ] `npm run typecheck` exits 0.
- [ ] `npm run build` succeeds.
- [ ] No new migrations are pending; `npx prisma migrate status` is
      clean.
