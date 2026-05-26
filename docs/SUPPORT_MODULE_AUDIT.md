# Support module audit

**Date:** 2026-05-13 · **Scope:** `/dashboard/support`, Prisma `SupportTicket*`, actions, notifications, audit linkage.

## Summary

The support surface evolved from a single form + flat `support_tickets` rows into a **Support & Issue Resolution Center** with KPIs, scoped inbox, ticket detail, SLA fields, comments/events, SLA policy + macro tables, and optional email confirmation (real sends only when configured). Existing tickets are preserved; new columns default safely.

## Findings

| Area | Current behavior | Limitation | Operational risk | Recommended solution | Priority |
|------|------------------|--------------|-------------------|----------------------|----------|
| Route `/dashboard/support` | Rich center + tabs; triage tabs gated | No drag queue / keyboard shortcuts | Medium at high volume | Add shortcuts + saved views UX | P2 |
| Ticket storage | Extended `support_tickets` + comments/events | No attachment upload pipeline | Medium | Add size-limited uploads + virus scan | P1 |
| Permissions | Row-level: triage OR submitter/email OR workspace membership | Partners not auto-scoped to client tickets here | Medium | Link `partnerAccountId` + partner portal filters | P1 |
| Email | `trySendTicketCreatedConfirmation` + growth inbound | No multi-recipient routing rules | Low | Configurable routing table | P2 |
| Audit | Detail page shows workspace audit slice | Not deep-linked to entity ids | Low | Entity filter + export | P2 |
| SLA | DB policies + `slaDueAt` | Calendar/business hours approximate | Medium | Business-hours engine + holidays | P2 |
| Escalation | Notify founder inbox + ticket `ESCALATED` | No PagerDuty integration | Medium | Webhook connector | P3 |
| KB | `/dashboard/support/kb` scaffold | No CMS | Low | MD/MDX or headless CMS | P2 |
| Security | Internal comments hidden from non-triage | Staff vs user distinction basic | Medium | Staff auth model on comments | P1 |
| Superadmin | `workspace.moroz@gmail.com` via `isSuperAdminUser` in triage gate | None | Low | Keep documented | P0 |

## Positive controls

- **No fake email:** outbound skipped when provider missing.  
- **No secrets in diagnostics:** `redactSupportJson` on browser payload.  
- **Legacy tickets:** migration maps `OPEN` → `IN_PROGRESS`, `WAITING` → `WAITING_ON_CUSTOMER`.
