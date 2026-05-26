# Support architecture

## Layers

1. **Prisma** — `SupportTicket` (extended), `SupportTicketComment`, `SupportTicketEvent`, `SupportSlaPolicy`, `SupportSavedView`, `SupportMacro`.
2. **`lib/support`** — categories, statuses, priorities, SLA defaults, redaction, **permissions** (`canUseFullSupportInbox`, `canViewSupportTicket`, `userWorkspaceIds`).
3. **`services/support`** — `ticket-service` (create + visibility), `sla-service`, `escalation-service`, `support-service` (KPI snapshot), `support-notification-service`, `support-search-service`, `support-analytics-service`.
4. **Actions** — `actions/support-tickets.ts` (assign, status, comment, escalate, dashboard submit); `actions/external.ts` delegates public submit to `createSupportTicket`.
5. **UI** — `SupportCenterClient`, `SupportTicketDetailClient`, routes under `app/dashboard/support/**`.

## Data flow (create)

Client/form → `submitDashboardSupportTicketForm` / `submitSupportTicket` → `createSupportTicket` → SLA due date → optional `SupportTicketEvent` → optional Resend + `notifyGrowthInbound`.

## Triage gate

Platform roles: `SUPER_ADMIN`, `PLATFORM_ADMIN`, `SUPPORT_ADMIN`, `IMPLEMENTATION_ADMIN`, plus founder bypass.
