# Platform Admin Polish (Final)

## Targets

- `/platform/dashboard`, `/platform/workspaces`, `/platform/support`, `/platform/integrations`, `/platform/webhooks`, `/platform/audit`, `/platform/tools`.

## Already strong

- Dark chrome, permission gating, impersonation + support session banners.

## Enhancements (previous + adjacent passes)

- Observability surfaces (`/platform/health`, `/platform/errors`, `/platform/jobs`) for internal reliability storytelling.

## Still recommended

- Workspace quick-view drawer + ticket reply composer with **internal notes** separated from customer-visible replies (audit each send).

## Rules

- `/platform` never linked to non-platform users (`dashboard-shell` ownerExtras only with bypass).  
- Dangerous actions: confirmations + reasons + audit events (existing patterns — extend per feature).
