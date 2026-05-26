# Playbook runs

A run is one execution of a `Playbook`. It owns a copy of the
playbook's steps in `PlaybookRunStep` rows, so renaming or
reordering the underlying playbook never alters in-flight runs.

## Start

`startRunAction({ playbookId, brandId?, locationId?, dueAt?, title?, generateTasks? })`

- Creates a `PlaybookRun` with `status = RUNNING`.
- Creates a `PlaybookRunStep` for every step, with `status = NOT_STARTED`.
- Optionally generates tasks immediately (still gated by a user
  click — there is no auto-execution).

## Transitions

`transitionStepAction({ runStepId, status, runId, blockedReason?, notes? })`

Allowed transitions:

- `NOT_STARTED → IN_PROGRESS | COMPLETED | SKIPPED | BLOCKED`
- `IN_PROGRESS → COMPLETED | BLOCKED | SKIPPED`
- `BLOCKED → IN_PROGRESS | COMPLETED | SKIPPED`
- `COMPLETED`, `SKIPPED` are terminal.

The service recalculates the parent run's status automatically.

## Complete / cancel

`completeRunAction({ runId })` marks `status = COMPLETED` and stamps
`completedAt`. `cancelRunAction({ runId, reason? })` marks
`CANCELLED` and records the reason on the run + audit event.

## Audit

Every state change emits a `PlaybookEvent` row with `performedBy`
set to the actor email (or `"user"` as fallback). Read via the
Settings page.
