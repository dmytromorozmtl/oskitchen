# Reminder rules

## Default pack

`lib/notifications/reminder-rules.ts → REMINDER_RULE_DEFAULTS` ships 10
rules:

| Key | Trigger | Offset | Audience | Channel | Template |
|-----|---------|--------|----------|---------|----------|
| order_confirmation_immediate | ORDER_CONFIRMED | 0m | customer | email | order_confirmation |
| order_ready_immediate | ORDER_READY | 0m | customer | email | order_ready |
| pickup_reminder_120 | PICKUP_REMINDER | −120m | customer | email | pickup_reminder |
| delivery_reminder_45 | DELIVERY_REMINDER | −45m | customer | email | delivery_reminder |
| preorder_deadline_120 | PREORDER_DEADLINE | −120m | customer | email | preorder_deadline_reminder |
| weekly_menu_live | WEEKLY_MENU_LIVE | 0m | customer | email | weekly_menu_reminder |
| catering_quote_followup_2d | CATERING_QUOTE_FOLLOWUP | +2880m | customer | email | catering_quote_followup |
| meal_plan_cycle_3d | MEAL_PLAN_CYCLE_REMINDER | −4320m | customer | email | meal_plan_cycle_reminder |
| route_driver_30 | ROUTE_DRIVER_REMINDER | −30m | drivers | in-app | internal_task_overdue |
| packing_deadline_120 | PACKING_DEADLINE_REMINDER | −120m | kitchen leads | in-app | internal_task_overdue |

Offsets are minutes; negative values are *before* the trigger time,
positive values are *after*.

## Install / update

- `installDefaultRules(userId)` is idempotent — it skips existing keys.
- `updateRule(userId, id, patch)` patches `enabled` / `offsetMinutes` /
  `dedupeWindowMinutes` / `templateKey` / `audience`.

## Relationship with workspace settings

`KitchenSettings.notifyXxx` toggles remain the master on/off switch.
When a master toggle is off, the rule still exists but its sends short
to `SKIPPED` in the corresponding cron path. The Notification Center
links to `/dashboard/settings` for those master switches.
