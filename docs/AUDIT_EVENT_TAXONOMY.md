# Audit Event Taxonomy

Categories are stored as uppercase strings on `AuditLog.category` (see `lib/audit/audit-types.ts`).

## Implemented examples

| Action | Category | Source | Where emitted |
| --- | --- | --- | --- |
| `SETTINGS_UPDATED` | SETTINGS | USER | `updateSettingsCenterSection` |
| `SETTINGS_BULK_UPDATED` | SETTINGS | USER | `updateSettingsCenterSections` |
| `ORDER_CREATED` | ORDERS | USER | `createOrderViaCenter` |
| `IMPORT_COMMITTED` | IMPORT_EXPORT | IMPORT | `commitImportJob` |
| `PRODUCT_MAPPING_APPROVED` | PRODUCT_MAPPING | USER | `approveMapping` |
| `ROLE_PERMISSION_CHANGED` | PERMISSIONS | USER | `upsertRoleAction` |
| `STAFF_INVITED` | STAFF | USER | `createStaffAction` |
| `STRIPE_WEBHOOK_RECEIVED` | BILLING | BILLING_PROVIDER | Stripe webhook route |
| `AUDIT_EXPORT_GENERATED` | IMPORT_EXPORT | USER | `exportAuditLogsSync` |

## Full category enum

`AUTH`, `SETTINGS`, `STAFF`, `PERMISSIONS`, `ORDERS`, `CUSTOMERS`, `MENUS`, `PRODUCTS`, `PRODUCT_MAPPING`, `SALES_CHANNELS`, `WEBHOOKS`, `PRODUCTION`, `PACKING`, `ROUTES`, `INVENTORY`, `PURCHASING`, `COSTING`, `CATERING`, `MEAL_PLANS`, `NOTIFICATIONS`, `BILLING`, `IMPORT_EXPORT`, `REPORTS`, `AI_COPILOT`, `AUTOMATIONS`, `GO_LIVE`, `IMPLEMENTATION`, `TRAINING`, `SECURITY`, `DEVELOPER`, `SYSTEM`.

Extend `lib/audit/audit-actions.ts` with canonical string constants as new events are added.
