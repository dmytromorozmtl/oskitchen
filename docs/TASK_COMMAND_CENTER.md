# Task Command Center

`/dashboard/tasks` is the Operations Task Center. The page that was previously
just a quick-create form is now the **Today** view; the rest of the module
lives in sibling routes wired by the subnav.

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/tasks` | Today / standup view + KPIs + quick-create form |
| `/dashboard/tasks/new` | Full create form (assignment, role, recurrence, template) |
| `/dashboard/tasks/kanban` | 5-lane Kanban (To do / In progress / Blocked / Waiting / Done) |
| `/dashboard/tasks/list` | Filterable table (status, type, priority, source, search) |
| `/dashboard/tasks/calendar` | 14-day calendar grid |
| `/dashboard/tasks/my` | Mobile-first per-user view |
| `/dashboard/tasks/templates` | Built-in templates (opening, closing, prep, packing, catering, …) |
| `/dashboard/tasks/recurring` | Recurrence rule index |
| `/dashboard/tasks/reports` | 30-day KPIs + by-assignee + by-source |
| `/dashboard/tasks/settings` | Business-mode terminology + access summary |
| `/dashboard/tasks/[taskId]` | Detail page: description, checklist, comments, activity, assignment, schedule, priority |

## KPIs (overview tile row)

- Due today
- Overdue
- Blocked
- In progress
- Completed today
- Unassigned
- Urgent / critical
- From playbooks

Numbers come from `loadTaskOverviewKpis(userId)` in
`services/tasks/task-service.ts`.

## Header copy

`tasksTerminologyForMode(businessType)` returns `{ title, subtitle, defaultType }`
so each business mode gets its own header without forking the page:

- Restaurant → "Staff tasks"
- Café → "Prep & staff tasks"
- Bar → "Bar tasks"
- Bakery → "Batch & staff tasks"
- Catering → "Event tasks"
- Meal prep → "Prep & packing tasks"
- Ghost / cloud / multi-brand → "Operations tasks"
- Default / unset → "Staff tasks"

## Empty states

The Today view falls back to a business-mode-aware empty state that nudges the
user to either start with a manual task or apply a template:

> No tasks for today. Create a `prep` / `bar prep` / `batch` … task or apply a
> template.
