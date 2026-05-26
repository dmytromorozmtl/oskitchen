# RBAC final architecture

## Workspace roles (target set)

OWNER, ADMIN, MANAGER, KITCHEN_LEAD, PREP_COOK, PACKER, DRIVER, CUSTOMER_SERVICE, CATERING_COORDINATOR, PURCHASING, ACCOUNTANT, VIEWER — map to existing staff role strings gradually (`lib/ai/copilot-permissions.ts` shows current role slugs in use).

## Platform roles

PLATFORM_FOUNDER, PLATFORM_SUPERADMIN, PLATFORM_ADMIN, PLATFORM_SUPPORT_ADMIN, PLATFORM_BILLING_ADMIN, PLATFORM_DEVELOPER_ADMIN, PLATFORM_READONLY_AUDITOR — align with `platform-permissions` matrix.

## Enforcement

- **Server first** — UI mirrors capabilities but never is the source of truth.

## Priority

**P0** for driver/packer data minimization; **P1** for full matrix.
