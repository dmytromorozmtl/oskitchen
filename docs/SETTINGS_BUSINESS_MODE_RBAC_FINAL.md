# Settings, business mode, RBAC — Final

## Settings sections (information architecture)

Workspace · Business mode · Operations · Orders · POS · Production · Packing · Delivery · Storefront · Branding · Notifications · Integrations · Billing · Staff & permissions · Security · AI · Backups · Developer · Advanced

## Business modes

Meal prep, café, bakery, restaurant, bar, catering, ghost kitchen, commissary, multi-brand, manual-only — each mode adjusts **defaults and copy**, not security boundaries.

## RBAC roles (platform + tenant)

Tenant: `OWNER`, `ADMIN`, `MANAGER`, `CASHIER`, `KITCHEN_LEAD`, `PREP_COOK`, `PACKER`, `DRIVER`, `CUSTOMER_SERVICE`, `CATERING_COORDINATOR`, `PURCHASING`, `ACCOUNTANT`, `VIEWER`.

Platform: `PLATFORM_FOUNDER`, `PLATFORM_SUPERADMIN`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT_ADMIN`, `PLATFORM_BILLING_ADMIN`, `PLATFORM_DEVELOPER_ADMIN`, `PLATFORM_READONLY_AUDITOR`.

## Rules

- **Server-side enforcement** is authoritative; UI mirrors capabilities.  
- **Sensitive actions** — permission + confirmation + audit.  
- **Permission changes** — audited.  
- **Clients never access `/platform`.**  
- **Founder access** — preserve `workspace.moroz@gmail.com` full founder/superadmin access.
