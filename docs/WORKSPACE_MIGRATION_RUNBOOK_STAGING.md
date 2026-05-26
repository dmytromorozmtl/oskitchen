# Workspace migration — staging runbook (PR-B)

**Owner:** Engineering + DBA  
**Goal:** `workspaceId` populated on Phase 1–2 tables; queries use `workspace-resource-scope` helpers.  
**Do not run on production without written sign-off.**

---

## 1. Prerequisites

| Item | Command / check |
|------|-----------------|
| Staging `DATABASE_URL` | `.env.staging` or Vercel env |
| Migrations in repo | `prisma/migrations/20260517120000_workspace_phase1_order_menu_product/` |
| | `prisma/migrations/20260517140000_workspace_phase2_integration_webhook/` |
| | `prisma/migrations/20260517180000_workspace_phase3_kitchen_customer/` |
| | `prisma/migrations/20260517190000_workspace_phase4_channel_orders/` |
| | Phases 5–7: external products, mappings, recovery (`202605171*`) |
| | Phase 11: import/export jobs (`20260517230000_workspace_phase11_import_export_jobs`) |
| App build green | `npm run verify:pilot-readiness` (or `typecheck && build`) |
| Preflight | `npm run workspace:preflight` |

---

## 2. Ordered execution (staging)

### Step A — Backup

1. Supabase / RDS snapshot or `pg_dump` schema + data for tenant tables.
2. Record migration version: `npx prisma migrate status`.

### Step B — Apply schema (additive only)

```bash
npx prisma migrate deploy
npx prisma validate
```

Expected: no destructive DDL; columns `workspace_id` nullable on orders, menus, products, integration_connections, webhook_events, kitchen_customers.

### Step C — Dry-run backfill

```bash
npm run workspace:backfill:phase1 -- --dry-run
npm run workspace:backfill:phase2 -- --dry-run
npm run workspace:backfill:phase3 -- --dry-run
npm run workspace:backfill:phase4 -- --dry-run
npm run workspace:backfill:phase5 -- --dry-run
npm run workspace:backfill:phase6 -- --dry-run
npm run workspace:backfill:phase7 -- --dry-run
npm run workspace:backfill:phase11 -- --dry-run
```

Review counts per workspace in output.

### Step D — Live backfill

```bash
# All phases in order + status check:
npm run workspace:backfill:all

# Or one-shot (preflight + migrate + backfill + staff verify):
DATABASE_URL=... npm run workspace:staging:migrate
```

Scripts refuse `NODE_ENV=production` unless `--allow-production` is explicitly passed.

### Step E — Verify

```bash
npm run workspace:backfill:status
npm run workspace:preflight
npm run verify:staff-scope
npm run test:security
```

Exit code `0` on `check-backfill-status` and `workspace:preflight`.

### Step F — Smoke (manual)

1. Staff user opens Order Hub — sees owner orders.
2. Owner creates menu + product — rows have `workspace_id` set (new writes).
3. WooCommerce connection save + disconnect — scoped by workspace.
4. Create order — `orders.workspace_id` populated.
5. Nutrition print queue — staff sees owner jobs; label stats match catalog scope.
6. Complete [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md).

---

## 3. Code paths updated (Phases 1–12)

| Layer | Change |
|-------|--------|
| `lib/scope/workspace-resource-scope.ts` | Canonical `buildOwnerScopedWhere` + per-model helpers |
| `lib/scope/workspace-order-scope.ts` | Re-exports for order-hub |
| `actions/integrations.ts` | Scoped find/delete |
| `actions/menus.ts` / `actions/products.ts` | Scoped reads + `workspaceId` on create |
| `actions/integration-health.ts` / `channel-certification.ts` | Scoped connection fetch |
| `lib/integrations/api-helpers.ts` | API connection owner check |
| `app/dashboard/sales-channels/page.tsx` | Scoped connection list |

**Pilot paths (Phases 9–12):** Orders, channels, CRM, catalog, production, search, import/export jobs, nutrition labels + print queue. Non-pilot modules (locations-only reports, training) remain on `userId` until post-pilot burn-down.

---

## 4. Rollback

| Scenario | Action |
|----------|--------|
| Backfill wrong workspace | Restore DB snapshot; do not delete columns |
| App regression | Revert deploy; columns nullable — legacy `userId` queries still work |
| Partial backfill | Re-run backfill scripts (idempotent on `workspaceId IS NULL`) |

---

## 5. Production promotion checklist

- [ ] Staging sign-off on preflight (`readyForBackfill: true`)
- [ ] DBA approves `docs/templates/DBA_APPROVAL_REQUEST.md`
- [ ] Maintenance window communicated
- [ ] `npx prisma migrate deploy` on production
- [ ] Backfill with monitoring (batch logs)
- [ ] `check-backfill-status` exit 0
- [ ] 24h error rate / IDOR tests clean

---

## 6. Query pattern reference

```typescript
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const where = await orderListWhereForOwner(ownerUserId);
await prisma.order.findMany({ where });
```

For components with `TenantActor`:

```typescript
import { prismaOwnerScopeWhere } from "@/lib/scope/tenant-scope";

const where = prismaOwnerScopeWhere({ userId: actor.userId, workspaceId: actor.workspaceId });
```

---

*See also `docs/WORKSPACE_MIGRATION_PLAN.md`, `docs/IDOR_MUTATION_INVENTORY.md`.*
