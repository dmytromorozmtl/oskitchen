# Staff Template Tuning Guide

Generated: 2026-05-17T18:42:24.925Z

## Current templates → workspace permissions

| Role | Capabilities | Workspace keys |
|------|--------------|----------------|
| OWNER | orders:read, orders:write, orders:cancel, pos:operate, pos:close_shift, production:run, packing:verify, routes:assign, inventory:read, inventory:write, staff:manage, billing:manage, integrations:manage, exports:sensitive, platform:impersonation | billing.manage, integrations.manage, orders.manage, packing.manage, production.manage, routes.manage, staff.manage, workspace.settings, workspace.view |
| MANAGER | orders:read, orders:write, pos:operate, production:run, packing:verify, routes:assign, inventory:read, inventory:write, staff:manage, integrations:manage | integrations.manage, orders.manage, packing.manage, production.manage, routes.manage, staff.manage, workspace.view |
| KITCHEN_LEAD | orders:read, production:run, packing:verify, inventory:read | packing.manage, production.manage, workspace.view |
| PREP_COOK | orders:read, production:run | production.manage, workspace.view |
| LINE_COOK | orders:read, production:run | production.manage, workspace.view |
| PACKER | orders:read, packing:verify | packing.manage, workspace.view |
| DRIVER | orders:read, routes:assign | routes.manage, workspace.view |
| CUSTOMER_SERVICE | orders:read, orders:write | orders.manage, workspace.view |
| CATERING_COORDINATOR | orders:read, orders:write | orders.manage, workspace.view |
| PURCHASING | orders:read, inventory:read, inventory:write | production.manage, workspace.view |
| INVENTORY | inventory:read, inventory:write | production.manage, workspace.view |
| ACCOUNTING | orders:read, exports:sensitive | workspace.settings, workspace.view |
| MARKETING | orders:read | workspace.view |
| VIEWER | orders:read, inventory:read | workspace.view |
| CUSTOM | orders:read | workspace.view |
## Common pilot adjustments

```diff
// Example: allow PACKER to read orders but not write
// KITCHEN_LEAD: add CAPABILITY.ordersWrite if leads need status changes
```


## Verification after edit

```bash
npm test -- tests/unit/staff-template-workspace-permissions.test.ts
npm run verify:staff-parity -- --owner-email=OWNER@EMAIL
npm run test:security
```
