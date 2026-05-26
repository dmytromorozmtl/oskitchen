# Activity Timeline + Audit Logs — Final (MVP)

## Activity (customer + staff visible)

- **Service:** `services/activity/activity-service.ts`  
- **UI:** timeline components on orders and other entities (extend pattern per entity).

**Include:** lifecycle transitions, POS checkout, imports/webhooks (sanitized), notifications, staff comments.

## Audit (privileged)

- **Service:** `services/audit/audit-service.ts`  
- **Redaction:** `lib/audit/audit-redaction.ts` — strip secrets, tokens, auth headers, payment payloads, connection strings.

## Must-audit actions

Order status changes, POS checkout + payment recording, void/comp/refund placeholders, settings + permission + billing changes, support replies / internal notes, platform actions, impersonation, webhook replay, integration mutations, dangerous maintenance.

## UI rules

- Audit tab **off by default** for roles without permission.  
- Never render raw JSON that may contain PII/secrets — use structured, redacted views.
