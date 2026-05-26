# Playbook task generation

Tasks are generated explicitly via `generateTasksAction({ runId })`
— never automatically.

## Rules

1. Only `required` steps generate tasks.
2. Steps with `status = SKIPPED` are skipped.
3. Steps that already have a `taskId` are skipped (idempotent).
4. Every generated task carries:
   - `sourceType = "PLAYBOOK"`
   - `sourceId = playbookRunStepId`
   - `sourceLabel = "Playbook: <title>"`
5. `dueAt` is `run.dueAt + step.estimatedMinutes` (or `now` if
   `run.dueAt` is null).
6. Role assignment flows from `runStep.assignedRole ?? step.recommendedRole`.

## Preview

`previewTasksForRun(scope, runId)` (used by the future preview
modal) returns the list of tasks that *would* be created, with
`skipped: true` and a reason for any rows that won't.
