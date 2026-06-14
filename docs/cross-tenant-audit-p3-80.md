# Cross-tenant service scope audit (P3-80)

**Policy:** `cross-tenant-audit-p3-80-v1`  
**Status:** **DONE** — 88% → 100% workspaceId coverage in services/  
**Updated:** 2026-06-16

Gap closure: eliminate raw `where: { userId` patterns in tenant-scoped services; use owner scope helpers from `lib/scope/workspace-resource-scope.ts`.

## Coverage

| Metric | Before | After |
|--------|--------|-------|
| Unscoped service hits | 57 | **0** |
| Coverage | ~88% | **100%** |

## Scope helpers

All tenant data reads/writes in `services/` must use helpers such as:

- `resolveOwnerScopedWhere` / `*ListWhereForOwner`
- `integrationConnectionByProviderWhereForOwner`
- `kitchenCustomerListWhereForOwner` (CRM)

## Verify

```bash
npm run check:cross-tenant-audit-p3-80
npx tsx scripts/audit-service-userid-scope.ts
```

## Artifact

`artifacts/cross-tenant-audit-p3-80.json`
