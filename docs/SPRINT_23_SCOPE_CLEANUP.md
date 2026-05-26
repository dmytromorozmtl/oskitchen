# Sprint 23 — workspace-only scope (post NOT NULL)

**Date:** 2026-05-24 · **Status:** ✅ complete

## Changes

- `buildOwnerScopedWhere` → `{ workspaceId }` when owner has a workspace (no legacy OR by default).
- `buildProductOwnerScopedWhere` → `{ workspaceId }` for products.
- Emergency rollback: `WORKSPACE_SCOPE_LEGACY_OR=1`.
- **12** unit test files updated (order, revenue, channel-import, printed-label, nutrition, analytics snapshot, phase14, with-workspace-scope, cross-tenant, etc.).
- `workspace-resource-scope.test.ts` — dedicated test for legacy OR **only** when env set.
- Beta preflight: removed legacy NULL order check.
- Post-backfill spot-check: `foreign` orders (wrong workspace) instead of `null_workspace`.

## Verify (green 2026-05-24)

```bash
npm run test:unit                    # 748 passed
npm run workspace:audit:services:strict   # 0 hits
```

## Next (Sprint 24)

Manual: [`SMOKE_POST_NOT_NULL_CHECKLIST.md`](SMOKE_POST_NOT_NULL_CHECKLIST.md)  
Roadmap: [`NEXT_STEPS_TO_100.md`](NEXT_STEPS_TO_100.md)
