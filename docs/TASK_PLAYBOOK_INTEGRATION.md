# Task Playbook integration

Operations Playbooks generate tasks through the same Templates surface that
ships under `/dashboard/tasks/templates`. The built-in templates seed common
operational rituals; future Playbook bundles can chain several of them.

## How a playbook creates a task

```
applyBuiltInTemplateAction(formData)
  └─ createTask({
       sourceType: "PLAYBOOK",
       sourceLabel: "Template: Daily opening checklist",
       checklist:   <materialised from BUILT_IN_TASK_TEMPLATES>,
       recurrenceRule: "FREQ=DAILY" (when set on the template),
       ...
     })
```

`sourceType = PLAYBOOK` makes every generated task discoverable via:

- KPI tile **"From playbooks"** on the Today view
- `/dashboard/tasks/list?source=PLAYBOOK`
- Reports → "By source" panel

## Built-in template index

| Slug | Title | Type | Recurrence | Business modes |
|------|-------|------|------------|----------------|
| `daily-opening-checklist` | Daily opening checklist | ADMIN | DAILY | Restaurant / Café / Bar / Bakery / Meal prep / Ghost / Cloud / Multi-brand |
| `daily-closing-checklist` | Daily closing checklist | CLEAN | DAILY | Restaurant / Café / Bar / Bakery |
| `cleaning-checklist` | Deep clean checklist | CLEAN | — | All |
| `weekly-inventory-count` | Weekly inventory count | INVENTORY | WEEKLY | All |
| `supplier-price-review` | Monthly supplier price review | PURCHASING | MONTHLY | All |
| `menu-publish-reminder` | Weekly menu publish | ADMIN | WEEKLY | Meal prep / Catering / Bakery |
| `prep-batch-template` | Prep batch | PREP | — | All |
| `packing-wave` | Packing wave | PACK | — | All |
| `delivery-follow-up` | Delivery follow-up | FOLLOW_UP | — | All |
| `purchasing-shortage` | Purchasing shortage | PURCHASING | — | All |
| `catering-event-prep` | Catering event prep | CATERING | — | Catering |
| `bar-event-night` | Bar event night | BAR_PREP | — | Bar |
| `bakery-batch-day` | Bakery batch day | BAKERY_BATCH | — | Bakery |
| `quality-check` | Quality check | QUALITY_CHECK | — | All |

## Where to plug a richer Playbook

`lib/tasks/task-templates.ts → BUILT_IN_TASK_TEMPLATES` is intentionally a flat
list. A Playbook module can:

1. Read this list (read-only).
2. Issue several `createIntegrationFollowUpTask()` calls in sequence with
   `source: "PLAYBOOK"` and a shared `sourceId` (the playbook run uuid).
