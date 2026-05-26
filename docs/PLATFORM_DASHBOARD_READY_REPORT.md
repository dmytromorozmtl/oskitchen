# Platform dashboard — ready report

## Summary

The `/platform/*` area is now structured as an **internal operations shell** with RBAC-aware navigation, a richer **command center** dashboard, **cross-tenant support** (inbox, queue, escalations, ticket detail with customer + internal replies), **workspace detail** entry point, **global search**, **feature flag listing**, and **platform-scoped audit** viewing. Stubs exist for billing, jobs, growth, and incidents so navigation matches the target IA without faking data.

## Access model

- **Clients** use `/dashboard/*`.
- **Operators** use `/platform/*` gated by `PlatformUserRole` or founder email (`requirePlatformAccess`).
- Fine actions use `assertPlatformPermission`.

## What changed (high level)

| Area | Change |
|------|--------|
| Layout | Env badge, role summary, search shortcut, grouped nav from permissions |
| Dashboard | `getPlatformDashboardSnapshot` + multi-section command center |
| Support | Ticket detail, replies, notes, status, assign + audited actions |
| Workspaces | Detail route + list links |
| Search | `/platform/search?q=` |
| Audit | Filtered platform tail |
| Tools | Permission-gated |
| Docs | Audit, architecture, RBAC, support, security, QA, this report |

## Limitations (explicit)

- No new Prisma tables for incidents, health snapshots, or separate platform action log — **`AuditLog` + existing models** carry state.
- Billing/revenue/MRR UI is honest placeholder until Stripe analytics are wired.
- Assignment UX is UUID-based.
- Workspace configuration mutations (plan, modules, locks) not yet exposed as buttons.

## Next recommendations

1. Staff picker + notification hooks on customer reply.
2. Workspace detail tabs with entitlement override forms (reason modal + audit).
3. Webhook DLQ viewer and safe replay pipeline with worker idempotency keys.
4. E2E tests from `docs/PLATFORM_QA_CHECKLIST.md`.
