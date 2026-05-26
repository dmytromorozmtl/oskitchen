# Task Calendar view

Path: `/dashboard/tasks/calendar`

## What it shows

A 14-day grid (today → +13) bucketed by date. Each cell lists tasks whose
`due_at` falls on that day. Empty cells get a quiet "No tasks." line; populated
ones link to `/dashboard/tasks/[taskId]`.

## Filters / scope

- Tasks with no `due_at` are intentionally hidden (use Today / List for those).
- `CANCELLED` is filtered out at query time; `DONE` is included so you can see
  the work that closed each day.

## Drag-to-reschedule

The reschedule action (`rescheduleTaskAction`) already exists and is wired into
the task detail page. A future drag-and-drop overlay just has to call the same
action with `taskId` + `dueAt`.

## Cross-module surface

The original `/dashboard/calendar` page already queries `kitchenTask` with
`{ status: { notIn: ["DONE", "CANCELLED"] } }`. That continues to work
unchanged — the new statuses `BLOCKED` / `WAITING` / `TODO` are all "active" so
they show up there too without code changes.
