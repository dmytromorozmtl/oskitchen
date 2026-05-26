# Platform admin + support — Finalization

## Platform modules

Dashboard, workspaces, users, organizations, support, integrations, webhooks, automations, audit, tools, demo.

## Required behaviors

- **Workspace rollups** — integration health, billing posture, incident counts (as available).  
- **Support inbox** — SLA/priority/status; replies; **internal notes never visible to tenant**.  
- **Impersonation** (if enabled) — reason, time limit, audit trail.  
- **Dangerous actions** — confirmation modals + permission + audit.  
- **Webhook diagnostics** — sanitized previews; safe replay with audit.

## Customer support (tenant-facing)

- Customer creates ticket; sees own thread only.  
- Links to workspace/order/POS transaction/import job when present.

## Security

- All `/platform` routes gated independently from tenant dashboard.  
- Rate-limit and monitor privileged actions.
