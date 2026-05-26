# Platform Admin + Support Inbox — Final (MVP)

## Access model

- **`/platform/*` is internal-only.** Enforcement must be **server-side** (middleware / layout loaders / server actions), not sidebar hiding.  
- **Platform roles ≠ workspace roles.**  
- **`workspace.moroz@gmail.com`:** keep `PLATFORM_FOUNDER` superadmin access in seed/policy.  
- **Dangerous actions:** confirmation + reason + audit row (impersonation, webhook replay, destructive fixes).

## Surfaces

| Area | Route | Notes |
|------|-------|-------|
| Dashboard | `/platform/dashboard` | Tenant counts, risk flags |
| Workspaces | `/platform/workspaces`, `[id]` | Includes POS diagnostics counts |
| Support | `/platform/support`, `[ticketId]` | Queue + threading |
| Integrations / webhooks | `/platform/integrations`, `/platform/webhooks` | Operational, not customer-facing |
| Audit | `/platform/audit` | Redaction mandatory |
| Tools | `/platform/tools` | Highest sensitivity |

## Customer support (workspace)

- `/dashboard/support` — customer-visible tickets; must not expose platform internals.

## P1

- SLA timers + escalation rules (optional automation).  
- Link tickets to orders / POS transactions / imports in UI with typed relations.
