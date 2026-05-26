# Staff ↔ Tasks integration

The `KitchenTask.assignedToId` foreign key (relation
`AssignedStaff`) was the original reason `StaffMember` existed and is
preserved unchanged.

## Surfacing

- **Staff detail / Tasks tab**: shows the most recent 30 kitchen tasks
  for the teammate plus their status, ordered by `createdAt desc`.
- **Staff KPIs**: `openTasks` counts `KitchenTask` rows in `OPEN` or
  `IN_PROGRESS` that have a staff member assigned.
- **Staff reports**: surfaces aggregate task counts per role
  via `_count.tasks` returned from `listStaff`.

## Audit

When staff are archived, their open tasks are **not** mutated (we
preserve historical assignment). Managers should reassign open tasks via
the existing `tasks` actions; the Staff module does not silently
re-assign or cancel tasks.

## Permission notes

Tasks remain governed by the existing `actions/kitchen-tasks` permission
checks; the Staff module only reads tasks.
