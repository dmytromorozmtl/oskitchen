# Tasks QA checklist

## Backwards compatibility

- [x] Existing quick-create form on `/dashboard/tasks` still works.
- [x] `createKitchenTaskFormAction` exported with the same signature.
- [x] `updateKitchenTaskStatusFormAction` exported with the same signature.
- [x] Existing rows in `kitchen_tasks` are readable (additive migration only).
- [x] `app/dashboard/calendar` query unchanged.
- [x] `app/dashboard/reports/enterprise` group-by-status query unchanged.
- [x] `app/dashboard/executive` "completed tasks" count unchanged.

## New surface

- [ ] `/dashboard/tasks` Today view renders KPIs.
- [ ] Quick task create still creates a row.
- [ ] `/dashboard/tasks/new` full create works (assignee, role, priority, due, estimated, recurrence, tags, template).
- [ ] Apply built-in template materialises the checklist with unique ids.
- [ ] `/dashboard/tasks/kanban` lane transitions persist + write events.
- [ ] `/dashboard/tasks/list` filters by status / type / priority / source / search.
- [ ] `/dashboard/tasks/list?status=OVERDUE` returns past-due not-done tasks.
- [ ] `/dashboard/tasks/calendar` shows next 14 days.
- [ ] `/dashboard/tasks/my` shows tasks for the signed-in staff/role/creator.
- [ ] `/dashboard/tasks/templates` lists templates filtered by business mode.
- [ ] `/dashboard/tasks/recurring` lists active recurrences.
- [ ] `/dashboard/tasks/reports` shows 30-day completion rate and breakdowns.
- [ ] `/dashboard/tasks/settings` reflects business mode + superadmin override.
- [ ] `/dashboard/tasks/[taskId]` detail page renders all panels.
- [ ] Reschedule, reassign, change priority, comment, toggle checklist all persist + write events.

## Cross-module integration

- [ ] Routes: marking a stop FAILED creates a task with `sourceType=ROUTE`.
- [ ] Source link on the task detail opens the route ("Open source" button).
- [ ] Manual transactions: failing to create the follow-up task does not roll back the stop status.

## Status / priority guardrails

- [ ] `canTransitionStatus(DONE, BLOCKED)` returns `false` and the action surfaces an error.
- [ ] Going `IN_PROGRESS → DONE` stamps `completed_at` and computes `actual_minutes`.
- [ ] Re-opening a DONE task to OPEN clears `completed_at`.
- [ ] `OVERDUE` badge shows for past-due not-done tasks without changing the stored status.

## Build

- [x] `npm run typecheck` passes.
- [ ] `npm run build` passes.
