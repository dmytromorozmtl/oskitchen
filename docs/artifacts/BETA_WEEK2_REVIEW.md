# Beta Week 2 Review

Generated: 2026-05-17T18:56:10.321Z

## Daily ops trend

_No BETA_DAILY_OPS_*.json files — run `npm run beta:daily-ops` during Week 1._

## Staff template matrix (Phase D)

| Template | Workspace permissions |
|----------------|----------------------|
| OWNER | billing.manage, integrations.manage, orders.manage, packing.manage, production.manage, routes.manage, staff.manage, workspace.settings, workspace.view |
| MANAGER | integrations.manage, orders.manage, packing.manage, production.manage, routes.manage, staff.manage, workspace.view |
| KITCHEN_LEAD | packing.manage, production.manage, workspace.view |
| PREP_COOK | production.manage, workspace.view |
| LINE_COOK | production.manage, workspace.view |
| PACKER | packing.manage, workspace.view |
| DRIVER | routes.manage, workspace.view |
| CUSTOMER_SERVICE | orders.manage, workspace.view |
| CATERING_COORDINATOR | orders.manage, workspace.view |
| PURCHASING | production.manage, workspace.view |
| INVENTORY | production.manage, workspace.view |
| ACCOUNTING | workspace.settings, workspace.view |
| MARKETING | workspace.view |
| VIEWER | workspace.view |
| CUSTOM | workspace.view |

## Feedback summary

- Beta feedback rows (14d): 0
- App feedback rows (14d): 0

## Recommended template tuning (step 5)

Review pilot confusion and edit `lib/permissions/permission-matrix.ts`:

1. PACKER — confirm no billing/integrations
2. MANAGER — confirm integrations + staff.manage
3. VIEWER — read-only (workspace.view only)

Then: `npm run beta:tune-templates -- --diff` and `npm run verify:staff-parity`
