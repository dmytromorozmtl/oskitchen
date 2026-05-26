# Task architecture

## Data model

```
KitchenTask                       (extended additively)
├─ KitchenTaskComment            collaboration thread
├─ KitchenTaskEvent              audit log (CREATED, ASSIGNED, ...)
├─ KitchenTaskRecurrence (1:1)   FREQ=DAILY / WEEKLY / MONTHLY
├─ KitchenTaskDependency (m:n)   "do X before Y"
└─ KitchenTaskTemplate           reusable definitions per workspace
```

### Enums

| Enum | Existing values | Added |
|------|-----------------|-------|
| `KitchenTaskType` | PREP, COOK, PACK, CLEAN, DELIVERY, ADMIN | PURCHASING, INVENTORY, CUSTOMER, CATERING, EVENT, BAR_PREP, CAFE_PREP, BAKERY_BATCH, MAINTENANCE, TRAINING, IMPLEMENTATION, SUPPORT, FOLLOW_UP, QUALITY_CHECK, LABELING |
| `KitchenTaskStatus` | OPEN, IN_PROGRESS, DONE, CANCELLED | TODO, BLOCKED, WAITING. `OVERDUE` is **derived** — never stored. |
| `KitchenTaskPriority` | LOW, MEDIUM, HIGH, URGENT | NORMAL, CRITICAL |
| `KitchenTaskSource` *(new)* | — | MANUAL, PRODUCTION, PACKING, ROUTE, PLAYBOOK, ALERT, IMPLEMENTATION, STORE_FRONT, SALES_CHANNEL, PURCHASING, CUSTOMER, CATERING_QUOTE, CALENDAR_EVENT |
| `KitchenTaskEventType` *(new)* | — | CREATED, UPDATED, ASSIGNED, ROLE_ASSIGNED, STARTED, COMPLETED, BLOCKED, UNBLOCKED, RESCHEDULED, CANCELLED, PRIORITY_CHANGED, STATUS_CHANGED, CHECKLIST_ITEM_COMPLETED, CHECKLIST_ITEM_UNCHECKED, COMMENT_ADDED, TEMPLATE_APPLIED, RECURRENCE_GENERATED, DEPENDENCY_ADDED, DEPENDENCY_REMOVED |

### New columns on `kitchen_tasks`

`brand_id`, `location_id`, `source_type` (default `MANUAL`), `source_id`, `source_label`, `assigned_role`, `started_at`, `completed_at`, `completed_by_id`, `blocked_reason`, `estimated_minutes`, `actual_minutes`, `checklist_json`, `tags_json`, `metadata_json`, `recurrence_rule`, `created_by_id`.

### Indexes

`(user_id, status)`, `(assigned_to_id, status)`, `due_at`, `task_type`, `(source_type, source_id)`, `brand_id`, `location_id`, plus the original `status` index — all additive, none drop.

## Layers

```
app/dashboard/tasks/*          ← UI (RSC + small client components)
   └─ uses
actions/kitchen-task.ts        ← server actions (legacy + new)
   └─ delegates to
services/tasks/task-service.ts ← business logic (createTask, updateTaskStatus, …)
   └─ uses
lib/tasks/*                    ← pure helpers (no DB)
```

- **lib** never imports prisma → safe for client components.
- **services** is the only place that writes to `kitchen_tasks`, `kitchen_task_events`, etc.
- **actions** are thin wrappers + redirects + `revalidatePath` calls.

## Why a derived OVERDUE

The legacy calendar query is `status: { notIn: ["DONE", "CANCELLED"] }`. Storing
`OVERDUE` as a status would have broken it. Instead `effectiveStatus()` in
`lib/tasks/task-status.ts` derives the badge — the stored status remains one of
the writeable enum values.

## Side-effect integration entry points

- `services/routes/route-service.ts → updateStopStatus()` now creates a
  follow-up task with `sourceType=ROUTE` whenever a stop transitions to
  `FAILED`. Best-effort: a task-creation failure does not roll back the route
  update.
- `actions/kitchen-task.ts → createIntegrationFollowUpTask()` is exported for
  Packing / Production / Alerts / Sales Channels to call inline once they need
  the same pattern.
