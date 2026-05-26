# Launch approvals

## Required approvals

The system requires five approvals before APPROVED is reachable:

1. **OPERATIONS** — operations lead signs off on day-of plan
2. **KITCHEN** — kitchen lead signs off on production
3. **FINANCE** — finance/accounting confirms billing + taxes
4. **INTEGRATIONS** — integration manager confirms channels healthy
5. **OWNERSHIP** — owner gives the final go

`SUPPORT` exists as an optional approval type but is not required.

## Recording an approval

A user with `go-live.approve` clicks the relevant button on the
Project page. The server action:

1. Validates the user's role (or owner / superadmin).
2. Upserts the `GoLiveApproval` row keyed by `(projectId, approvalType)`.
3. Writes an `APPROVAL_RECORDED` event.
4. Calls `refreshAutoValidation` so the project status, readiness, and
   risk recompute immediately.

## Gates

`validateLaunch` returns `canApprove = true` only if:

- `readiness.score >= 80`
- No `CRITICAL` blockers
- `approvalsCount >= approvalsRequired`

`transitionStatus` enforces this when moving to APPROVED or LIVE
unless `override=true` from a `go-live.unlock`-capable actor.

## Audit

Every approval has `approvedById`, `approvedAt`, optional `notes`, and
a corresponding `GoLiveProjectEvent` row. Approvals are immutable in
effect; upserting just re-stamps the timestamp and approver. The audit
log preserves the full history.
