# Settings + RBAC — Final (MVP)

## Goal

Settings is the **control center** for workspace + operations; permissions are **consistent** between UI and server.

## Workspace roles (target set)

OWNER, ADMIN, MANAGER, CASHIER, KITCHEN_LEAD, PREP_COOK, PACKER, DRIVER, CUSTOMER_SERVICE, CATERING_COORDINATOR, PURCHASING, ACCOUNTANT, VIEWER — see `lib/permissions/roles.ts` / `docs/SETTINGS_PERMISSIONS.md` for actual enum parity with DB.

## Platform roles (separate)

PLATFORM_FOUNDER, PLATFORM_SUPERADMIN, PLATFORM_ADMIN, PLATFORM_SUPPORT_ADMIN, PLATFORM_BILLING_ADMIN, PLATFORM_DEVELOPER_ADMIN, PLATFORM_READONLY_AUDITOR — `lib/platform/platform-roles.ts`.

## Rules

| Role | Constraint |
|------|------------|
| Cashier | POS + limited orders; **no** billing admin |
| Kitchen | Production views; minimize PII/financials |
| Driver | Routes + stops; no unrelated CRM |
| Accountant | Billing/reports as configured |
| Viewer | Read-only |

## Implementation pointers

- `lib/permissions/permissions.ts`, `guards.ts`  
- `services/permissions/permission-service.ts`  
- **Every new server action:** assert permission before mutation; log audit on role changes.

## Settings IA (target sections)

Workspace, Business mode, Operations, Orders, POS, Production, Packing, Delivery, Storefront, Branding, Notifications, Integrations, Billing, Staff & permissions, Security, AI, Backups, Developer, Advanced — group existing pages under these headings in `app/dashboard/settings` layout.
