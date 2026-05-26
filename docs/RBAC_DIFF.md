# RBAC diff — legacy vs workspace (17 May 2026)

KitchenOS intentionally runs **two permission systems** until POS migrates to workspace roles.

| System | Import | `hasPermission` signature |
|--------|--------|---------------------------|
| Legacy dashboard / POS | `@/lib/permissions/legacy` | `hasLegacyPermission(role, key)` |
| Workspace matrix | `@/lib/permissions/index` or `guards` + `permissions` | `hasPermission(grantedSet, key)` |

**Do not** `export *` from `lib/permissions.ts` into workspace index — signatures collide.

## Keys only in legacy (`lib/permissions/legacy.ts`)

- `view_dashboard`, `manage_menus`, `manage_products`, `manage_inventory`, `manage_customers`, `manage_reports`, `view_analytics`, `view_developer`, `manage_partner_clients`, `pos_access`, `pos_comp`

## Keys only in workspace (`lib/permissions/permissions.ts`)

- `workspace.view`, `workspace.settings`, `orders.manage`, `production.manage`, `packing.manage`, `routes.manage`, `billing.manage`, `integrations.manage`, `staff.manage`, `growth.view`

## Semantic mapping (Phase B bridge)

| Legacy | Workspace |
|--------|-----------|
| `manage_orders` | `orders.manage` |
| `manage_customers` | `customers.manage` |
| `manage_production` | `production.manage` |
| `manage_packing` | `packing.manage` |
| `manage_integrations` | `integrations.manage` |
| `manage_settings` | `workspace.settings` |
| `manage_billing` | `billing.manage` |
| `manage_team` | `staff.manage` |

Implemented in `lib/permissions/mutation-access.ts` (`LEGACY_FALLBACK`).

## Enforcement status

| Module | Workspace + legacy fallback |
|--------|----------------------------|
| `actions/settings-center.ts` | Yes (`settings-access.ts`) |
| `actions/orders.ts` | Yes (`orders.manage`) |
| `actions/production.ts` | Yes (`production.manage`) |
| `actions/packing.ts` | Yes (`packing.manage`) |
| `actions/integrations.ts` | Yes (`integrations.manage`) |
| `actions/customers.ts` | Yes (`customers.manage`) |
| `actions/delivery-route.ts` | Yes (`routes.manage`) |
| `actions/meal-plans.ts` | Yes (`orders.manage`) |
| POS checkout / void / refund | Legacy `pos_comp` only |

## ESLint

`@/lib/permissions` (root shim) and `@/services/storefront/_experiments/*` are restricted — use explicit paths.
