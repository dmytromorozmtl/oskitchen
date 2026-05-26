# Task Kanban

Path: `/dashboard/tasks/kanban`

## Lanes

Defined by `KANBAN_LANES` in `lib/tasks/task-status.ts`:

1. **To do** — `OPEN`
2. **In progress** — `IN_PROGRESS`
3. **Blocked** — `BLOCKED`
4. **Waiting** — `WAITING`
5. **Done** — `DONE`

Each card shows priority, type, assignee, and an overdue flag when
`effectiveStatus(status, dueAt)` returns `OVERDUE`. Buttons on each card invoke
the existing `updateKitchenTaskStatusAction` server action, so transitions are
gated by `canTransitionStatus` and recorded in `KitchenTaskEvent`.

## Why no drag handler yet

True drag-and-drop is a follow-up: the lanes ship server-driven so the same
status changes work without JS. The transition matrix lives in
`lib/tasks/task-status.ts → FORWARD`; once the drag library lands, it calls the
same action.

## Status transition matrix

| From → To | OPEN | IN_PROGRESS | BLOCKED | WAITING | DONE | CANCELLED |
|-----------|:----:|:-----------:|:-------:|:-------:|:----:|:---------:|
| OPEN | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| TODO | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| IN_PROGRESS | ✓ | – | ✓ | ✓ | ✓ | ✓ |
| BLOCKED | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| WAITING | ✓ | ✓ | ✓ | – | ✓ | ✓ |
| DONE | ✓ (reopen) | ✓ | – | – | – | – |
| CANCELLED | ✓ | – | – | – | – | – |

`updateTaskStatus` automatically:

- sets `started_at` the first time a task hits `IN_PROGRESS`
- sets `completed_at` + computes `actual_minutes` when it hits `DONE`
- writes a row in `kitchen_task_events` for every transition
