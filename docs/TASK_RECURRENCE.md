# Task recurrence

## Storage

Two places hold recurrence state:

1. `kitchen_tasks.recurrence_rule` — the canonical rule string. Free-form so
   we can adopt RRULE without a migration (`FREQ=DAILY`,
   `FREQ=WEEKLY;BYDAY=MO`, …).
2. `kitchen_task_recurrences` — a 1:1 sidecar with `next_run_at` + `active`.
   Indexed on `(active, next_run_at)` so the future generator job can
   `WHERE active = true AND next_run_at <= now() ORDER BY next_run_at`.

When `createTask({ recurrenceRule })` runs we **always** seed both — the rule
on the task and a row in the recurrence table.

## Rule examples shipped with the built-in templates

| Cadence | Rule |
|---------|------|
| Daily opening | `FREQ=DAILY` |
| Daily closing | `FREQ=DAILY` |
| Weekly inventory | `FREQ=WEEKLY` |
| Weekly menu publish | `FREQ=WEEKLY` |
| Monthly supplier review | `FREQ=MONTHLY` |

## Generation

Instance generation (creating tomorrow's "Daily opening checklist" task) is
deliberately **not** running on every page load. The recurrence table is the
contract:

```sql
SELECT * FROM kitchen_task_recurrences WHERE active = true AND next_run_at <= now();
```

A scheduled job (cron, Inngest, Vercel Cron — anything) calls into a future
`generateRecurringInstances(userId)` service that:

1. Fetches the due rows.
2. Clones the source task with `dueAt = next_run_at`, fresh status `OPEN`, and
   a copy of the checklist (re-instantiating ids).
3. Bumps `next_run_at` per the rule.
4. Writes `RECURRENCE_GENERATED` events.

The schema, indexes, and `KitchenTaskEventType.RECURRENCE_GENERATED` are all
already in place — only the cron entry point is left.

## Why no auto-generate on read

Auto-generating on read would double-create tasks during request races and tie
business clock to the user's browser. Cron / job runner only.
