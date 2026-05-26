# Go-live plan

Route: `/dashboard/implementation/[projectId]/go-live`

The page captures the operational launch plan:

- **Date** — pulled from `ImplementationProject.targetGoLiveDate`.
- **Owner** — pulled from `ImplementationProject.assignedOwner`.
- **Support contacts** — captured in project notes.
- **Rollback plan** — explicit: Implementation Center does not touch
  live data, so rollback equals pausing newly connected channels and
  reverting any optional configuration changes in their own modules.

## Readiness panel

The same panel surfaces the latest readiness snapshot and lets the
operator:

- **Run readiness check** — calls `runReadinessAction`.
- **Mark live** — calls `markGoLiveAction`, which reruns readiness
  and blocks if any required check fails.

## Launch day checklist

Use the checklist tab under `GO_LIVE` phase items. Recommended items
for any business mode:

1. Confirm go-live date and owner.
2. Run go-live readiness check.
3. Walk the UAT scenarios that matter for the business mode.
4. Notify staff and support contacts.
5. Monitor the first hour of orders.
