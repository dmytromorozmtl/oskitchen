# Workflow Automation & Alert Rules

## Existing primitives

- `AutomationRule`, `AutomationExecution`, `AutomationTrigger`, `AutomationAction` (Prisma).  
- Notification rules + logs (`NotificationRule`, `NotificationLog`).  
- Platform automations table UI (`/platform/automations`).

## This pass

- `services/automation/automation-rule-service.ts` — counts + lightweight listing.  
- `services/automation/automation-run-service.ts` — success/fail counts in rolling window.  
- `services/alerts/alert-rule-service.ts` — notification rule summaries.  
- `services/alerts/alert-delivery-service.ts` — **honest** email capability probe (Resend/SMTP env).  
- `lib/automation/automation-triggers.ts`, `lib/automation/automation-actions.ts` — label maps.  
- `lib/alerts/alert-severity.ts` — shared severity union.

## Rules (non-negotiable)

- No fake sends when provider missing.  
- Failed automations must surface in observability (`error-event-service` already includes automation failures).  
- Destructive actions require approvals (see RBAC doc).

## Next

- Central `automation-run` → `error_event` bridge for richer causality.  
- `/dashboard/notifications/rules` UX: show last failure + link to retry page.
