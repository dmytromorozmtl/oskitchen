# Action drafts

The copilot **never** writes to operational tables silently. The only
way for a copilot suggestion to take effect is:

1. A `CopilotActionDraft` row exists in `NEEDS_APPROVAL` status.
2. A user with `copilot.actions.approve` (owner / manager / admin)
   marks it `APPROVED`.
3. The same role hits **Execute now**, which runs
   `executeApprovedAction` server-side.

Only `EXECUTED` produces an operational side effect.

## Action types

| `actionType` | What it would do once executed | Side-effect today |
|--------------|--------------------------------|-------------------|
| `create_task` | Create a `KitchenTask` row | ✅ creates the task (status OPEN, taskType ADMIN) |
| `create_follow_up` | Create a CRM customer follow-up | recorded only — handle in CRM |
| `create_purchasing_reminder` | Draft a purchasing reminder | recorded only |
| `draft_production_note` | Add a production-board note | recorded only |
| `draft_customer_follow_up_note` | Draft outreach text | recorded only |
| `draft_catering_quote_follow_up` | Draft a catering follow-up | recorded only |
| `draft_route_issue_task` | Draft a route-issue task | recorded only |
| `suggest_menu_adjustment` | Suggest 86'ing an item | recorded only |
| `suggest_ingredient_demand_run` | Re-run ingredient demand | recorded only |
| `suggest_report_export` | Export a report from the Reports center | recorded only |

"Recorded only" means the draft becomes `EXECUTED` for audit
purposes, but the side effect must be performed by the human in the
relevant module. This is a deliberate guard-rail — we never expand the
side-effect surface area without an explicit product decision.

## Payload shape

Each tool definition (`lib/ai/copilot-tools.ts`) declares its
`payloadShape` and an `example`. The Action Drafts form accepts free
JSON for the payload; the action service validates the surrounding
metadata and stores the JSON as-is.

## Status transitions

```
NEEDS_APPROVAL → APPROVED → EXECUTED
       │             │
       └─► REJECTED  └─► CANCELLED
```

Every transition writes a `CopilotAuditEvent` (`action_draft_*`).

## Who can do what

| Role | Draft | Approve | Execute |
|------|:---:|:---:|:---:|
| Owner / superadmin | ✅ | ✅ | ✅ |
| Manager / Admin | ✅ | ✅ | ✅ |
| Kitchen lead / Sales | ✅ | ❌ | ❌ |
| Other staff | ❌ | ❌ | ❌ |
