# Rollback planning

## Why

If launch day goes wrong, operators need a predefined plan — not a
group chat improvising. The `GoLiveRollbackPlan` model stores those
plans as structured JSON so they are printable, auditable, and
assignable.

## Seeded defaults

When a project is created, `rollbackPlansForLaunchMode` seeds these:

1. **Disable storefront orders** — pause checkout, notify customers,
   log impact.
2. **Disable channel intake** — stop a misbehaving channel + drain its
   queue.
3. **Revert menu changes** — restore from a recent export and
   republish.
4. **Pause production** — halt new orders + reassign queue.

`PILOT` mode seeds the first three; all other modes (`SOFT`, `FULL`,
`PHASED`) seed all four.

## Custom plans

`createRollbackPlanAction` accepts a free-text title, trigger
condition, and a multi-line steps blob. Each line becomes a step with
ascending `order`. Custom plans can be edited or deactivated later.

## Triggering rollback

`transitionLaunchStatusAction` with `target="ROLLBACK_MODE"`:

- Requires `go-live.rollback` capability.
- Sets `status = ROLLBACK_MODE` and stamps `lockedAt`.
- Writes a `STATUS_TRANSITION` audit event.

## Permissions

| Capability | Roles |
|-----------|-------|
| `go-live.rollback` | admin, manager, operations_lead, superadmin |

The full step list is rendered on the project page so the team can
print or screenshot the plan.
