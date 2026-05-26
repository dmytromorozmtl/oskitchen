# Tasks ready report

The simple `/dashboard/tasks` form has been promoted to a full **Operations
Task Center** without breaking any of the existing surface area.

## What changed

### Database (additive)

- Extended enums: `KitchenTaskType` (+15), `KitchenTaskStatus` (+3), `KitchenTaskPriority` (+2).
- New enums: `KitchenTaskSource`, `KitchenTaskEventType`.
- Extended `kitchen_tasks` with 16 columns (brand, location, source, role, time-tracking, checklist, recurrence, audit fields).
- New tables: `kitchen_task_comments`, `kitchen_task_events`, `kitchen_task_templates`, `kitchen_task_dependencies`, `kitchen_task_recurrences`.
- New indexes: `(user_id, status)`, `(assigned_to_id, status)`, `due_at`, `task_type`, `(source_type, source_id)`, `brand_id`, `location_id`.
- Migration: `prisma/migrations/20260511180000_tasks_operations_command_center/` — `db:deploy` succeeded.

### Code

- `lib/tasks/*` — pure helpers (`task-types`, `task-status`, `task-priority`, `task-checklist`, `task-templates`, `task-permissions`).
- `services/tasks/task-service.ts` — list / get / create / status / assign / priority / reschedule / comment / checklist / follow-up.
- `actions/kitchen-task.ts` — preserved legacy actions; added 9 new ones.
- `services/routes/route-service.ts → updateStopStatus()` — best-effort follow-up task creation when a stop fails.

### UI

- New layout + subnav (`/dashboard/tasks/*`).
- Pages: Today (`/`), New (`/new`), Kanban, List, Calendar, My, Templates, Recurring, Reports, Settings, Detail (`/[taskId]`).
- Small client components: `QuickStatusButton`, `ChecklistToggle`.

## Views added

| View | Route | Purpose |
|------|-------|---------|
| Today | `/dashboard/tasks` | KPI tiles, quick create, overdue panel, today panel |
| Full create | `/dashboard/tasks/new` | All fields + template picker |
| Kanban | `/dashboard/tasks/kanban` | 5 lanes, server-driven transitions |
| List | `/dashboard/tasks/list` | Filterable + searchable table |
| Calendar | `/dashboard/tasks/calendar` | 14-day grid |
| My tasks | `/dashboard/tasks/my` | Mobile-first per-user view |
| Templates | `/dashboard/tasks/templates` | Built-in template gallery, business-mode filtered |
| Recurring | `/dashboard/tasks/recurring` | Index of active recurrence rules |
| Reports | `/dashboard/tasks/reports` | 30-day KPIs + by-assignee + by-source |
| Settings | `/dashboard/tasks/settings` | Business mode + access summary |
| Detail | `/dashboard/tasks/[taskId]` | Description, checklist, comments, activity, sidebars |

## Task vocabulary

- **Statuses:** OPEN, TODO, IN_PROGRESS, BLOCKED, WAITING, DONE, CANCELLED. `OVERDUE` is derived from `dueAt + status`, never stored.
- **Priorities:** CRITICAL, URGENT, HIGH, NORMAL, MEDIUM, LOW.
- **Types:** PREP, COOK, PACK, CLEAN, DELIVERY, ADMIN, PURCHASING, INVENTORY, CUSTOMER, CATERING, EVENT, BAR_PREP, CAFE_PREP, BAKERY_BATCH, MAINTENANCE, TRAINING, IMPLEMENTATION, SUPPORT, FOLLOW_UP, QUALITY_CHECK, LABELING.
- **Sources:** MANUAL, PRODUCTION, PACKING, ROUTE, PLAYBOOK, ALERT, IMPLEMENTATION, STORE_FRONT, SALES_CHANNEL, PURCHASING, CUSTOMER, CATERING_QUOTE, CALENDAR_EVENT.

## Playbook integration

`createTask({ sourceType: PLAYBOOK, ... })` + `KitchenTaskEventType.RECURRENCE_GENERATED` + 14 seeded built-in templates cover the operations rituals (opening, closing, deep clean, inventory, menu publish, prep batch, packing wave, delivery follow-up, purchasing shortage, catering event prep, bar event night, bakery batch day, quality check).

## Production / Packing / Routes integration

- Routes: failed-delivery → automatic `sourceType=ROUTE` follow-up task (live).
- Public hook `createIntegrationFollowUpTask()` exported for any other module to call inline.
- Task detail "Open source" resolves via `hrefForTaskSource()` to the originating module.

## Recurrence

- Field `kitchen_tasks.recurrence_rule` + sidecar `kitchen_task_recurrences` with `next_run_at`.
- Generation cron is deliberately not wired (avoid double-creates on read). The query contract is documented in `docs/TASK_RECURRENCE.md`.

## Permissions

- Coarse buckets: owner / manager / staff / driver / packer / accountant / viewer.
- Superadmin override via `isSuperAdminEmail()` — preserved for `workspace.moroz@gmail.com`.
- Real RBAC will swap the actor-scope assembly only.

## Business modes supported

Restaurant · Café · Bar · Bakery · Catering · Meal Prep · Ghost / Cloud / Multi-brand · Other / default — each gets its own header copy and template visibility.

## Remaining limitations

1. **Drag-and-drop Kanban** — server-driven now; DnD overlay can hook into the existing `updateKitchenTaskStatusAction`.
2. **Recurrence cron** — schema + sidecar present, scheduled runner not wired.
3. **WorkspaceMember RBAC** — placeholder `task-permissions.ts`; will swap behind one helper.
4. **Bulk actions on list view** — single-row only today.
5. **Production / Packing / Purchasing / Alerts auto-task hooks** — only Routes is wired; other modules can call `createIntegrationFollowUpTask()` when they're ready.
6. **Calendar drag-to-reschedule** — needs only a small client overlay on top of `rescheduleTaskAction`.
7. **Per-task notifications** — `KitchenTaskEventType` is rich enough to drive them; wiring the notification module is the follow-up.

## Next recommendations

- Wire Production blocker + Packing missing-item to the integration helper.
- Add a Cron entry that calls a future `generateRecurringInstances(userId)`.
- Replace the coarse role string on `StaffMember` with `WorkspaceMember.role` + adjust `task-permissions.ts` only.
- Add bulk-update server action that loops `updateTaskStatus`.
- Add small DnD client on top of Kanban; calls existing server action.
