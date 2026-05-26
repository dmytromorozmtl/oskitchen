# System playbooks (shipped)

These 7 templates are seeded per-workspace by
`ensureSystemPlaybooks(scope)` and refreshed on every visit to
`/dashboard/playbooks`. They live in `lib/playbooks/playbook-templates.ts`.

| Slug | Type | Business modes | Trigger |
|------|------|----------------|---------|
| `restaurant-daily-prep` | `DAILY_OPERATIONS` | RESTAURANT | DAILY |
| `meal-prep-weekly-cycle` | `WEEKLY_CYCLE` | MEAL_PREP | WEEKLY |
| `catering-event-workflow` | `EVENT_WORKFLOW` | CATERING | EVENT_DATE |
| `bakery-preorder-day` | `PREORDER_WORKFLOW` | BAKERY | MENU_CUTOFF |
| `cafe-morning-setup` | `OPENING_CHECKLIST` | CAFE | DAILY |
| `bar-event-night` | `EVENT_WORKFLOW` | BAR | EVENT_DATE |
| `ghost-kitchen-rush` | `SERVICE_SHIFT` | GHOST_KITCHEN, CLOUD_KITCHEN, MULTI_BRAND | ORDER_VOLUME |

System templates are flagged `systemTemplate = true` and never
deleted by `archivePlaybook` (the action guards against this).
Each row is still per-workspace, so a workspace can override its
own copy without affecting other workspaces.

The legacy reference list in `lib/operations-playbooks.ts` is
**kept intact** for backward compatibility (e.g. landing pages).
