# Workspace tenant migration plan

**Goal:** Move from **owner `userId`** as primary tenant key to **`workspaceId`** for multi-user workspaces.

**Do not run production migrations without owner sign-off.**

**Staging runbook:** [`WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`](./WORKSPACE_MIGRATION_RUNBOOK_STAGING.md)

## Phase 1 — Pilot-critical (schema in repo)

- [x] `Order` — optional `workspaceId` + indexes (`20260517120000_workspace_phase1_order_menu_product`)
- [x] `Menu` — optional `workspaceId`
- [x] `Product` — optional `workspaceId`
- [x] Query helpers — `lib/scope/workspace-resource-scope.ts`
- [x] Writes on create — orders (order-creation-service), menus/products actions
- [ ] **Staging:** `npm run workspace:backfill:phase1` + `workspace:backfill:status`

**Backfill:** `npm run workspace:backfill:phase1` (batches 500, 100ms pause)

**Query pattern:**

```typescript
const where = await orderListWhereForOwner(ownerUserId);
// OR sync: prismaOwnerScopeWhere({ userId, workspaceId }) from TenantActor
```

## Phase 2 — Beta expansion (schema in repo)

- [x] `IntegrationConnection` — `workspaceId` (`20260517140000_workspace_phase2_integration_webhook`)
- [x] `WebhookEvent` — `workspaceId`
- [x] Mutations scoped — `actions/integrations.ts`, API helpers, certification, health
- [ ] **Staging:** `npm run workspace:backfill:phase2`
- [ ] Dashboard pages grep — migrate remaining `findMany({ userId })` for connections

**Backfill:** `npm run workspace:backfill:phase2`

## Phase 3 — CRM (schema in repo)

- [x] `KitchenCustomer` — optional `workspaceId` + indexes (`20260517180000_workspace_phase3_kitchen_customer`)
- [x] `lib/scope/workspace-customer-scope.ts`
- [x] CRM services wired — `customer-service`, `customer-metrics-service`, analytics/reports/executive, import-center, order creation
- [ ] **Staging:** `npm run workspace:backfill:phase3` + `workspace:backfill:status`

**Backfill:** `npm run workspace:backfill:phase3`

## Phase 4 — Channel / Order Hub (schema in repo)

- [x] `ExternalOrder`, `ChannelConflict`, `ChannelSyncJob` — `workspaceId` (`20260517190000_workspace_phase4_channel_orders`)
- [x] `lib/scope/workspace-channel-scope.ts` + async `channelConflictWhereForOwner`
- [x] Order hub, sales channels UI, persist-external-order, sync jobs
- [ ] **Staging:** `npm run workspace:backfill:phase4`

**Backfill:** `npm run workspace:backfill:phase4`

## Phase 5 — External catalog (schema in repo)

- [x] `ExternalProduct.workspaceId` + batch index (`20260517200000_workspace_phase5_external_product`)
- [x] `externalProductListWhereForOwner` / `ById` in `workspace-channel-scope.ts`
- [x] Hot paths: persist-external-product, sales-channel-metrics, today, integrity, error-recovery, mapping page
- [ ] **Staging:** `npm run workspace:backfill:phase5`

**Backfill:** `npm run workspace:backfill:phase5`

## Phase 6 — Product mapping workbench (schema in repo)

- [x] `ProductMapping.workspaceId` + indexes (`20260517210000_workspace_phase6_product_mapping`)
- [x] `productMappingListWhereForOwner` / `ById` in `workspace-product-mapping-scope.ts`
- [x] Workbench service, matching index, go-live, implementation, sales-channels mapping preview
- [ ] **Staging:** `npm run workspace:backfill:phase6`

**Backfill:** `npm run workspace:backfill:phase6`

## Phase 7 — Recovery & mapping aliases (schema in repo)

- [x] `ErrorRecoveryItem` reads scoped (`workspace-error-recovery-scope.ts`); writes already set `workspaceId` on upsert
- [x] `ProductMappingAlias.workspaceId` + indexes (`20260517220000_workspace_phase7_recovery_alias`)
- [x] Webhook recovery list/count, observability rollup (`error-event-service`), alias index/create/list
- [ ] **Staging:** `npm run workspace:backfill:phase7`

**Backfill:** `npm run workspace:backfill:phase7` (also backfills `error_recovery_items` with NULL `workspace_id`)

## Phase 8 — Product catalog pilot paths (code in repo)

- [x] `productListWhereForOwnerAnd` helper on `workspace-resource-scope.ts`
- [x] Matching `loadCandidates`, order line pricing, go-live readiness, Today command center orders/products/menus/integrations
- [x] Unit test: `matching-service-catalog-scope.test.ts`
- [ ] **Staging:** no new migration — relies on Phase 1 product/menu backfill

## Phase 9 — Production, kitchen, POS, catalog UI (code in repo)

- [x] Production actions (`actions/production.ts`) — `productionTask` via `productListWhereForOwner`
- [x] Label/nutrition/storefront product actions — `productByIdWhereForOwner`
- [x] `generate-production.ts`, `kitchen-screen-service.ts`, `pos-session-service.ts`
- [x] Implementation readiness menu/product counts
- [x] Dashboard: products, production, go-live legacy checklist, menu-planner, meal-plans, costing, brands assignment, nutrition label item
- [x] CI guard: extended `validate-tenant-scope-pilot` scan roots for Phase 9 paths
- [ ] **Staging:** no new migration — relies on Phase 1 product/menu backfill

## Phase 10 — Cross-cutting ops, search, export, home (code in repo)

- [x] `costing-service`, `ingredient-demand/demand-service`, `import-export` (sync + streaming CSV)
- [x] `command-center-stats`, `global-search-service`, `lib/activation.ts`
- [x] `home-overview` — menus/products/orders/integrations/external catalog + production tasks
- [x] Enterprise public API `app/api/public/v1/products`
- [x] `demo-scenario-db-audit-service` — scoped menu/product/order/channel/mapping counts
- [x] CI guard: extended scan roots for Phase 10 paths
- [ ] **Staging:** no new migration — relies on Phases 1–7 backfills
- [ ] **Staging:** no new migration — relies on Phases 1–7 backfills

## Phase 11 — Nutrition scope, import/export jobs, pilot hardening (code in repo)

- [x] `command-center-stats` — profile counts via `product` workspace scope
- [x] `seed-e2e-pos-fixture` — scoped product query
- [x] `ImportJob` / `ExportJob` optional `workspaceId` (`20260517230000_workspace_phase11_import_export_jobs`)
- [x] `workspace-import-export-scope.ts` + import-center / export job writes
- [x] `demo-data` scoped deletes; tenant allowlist cleared
- [x] Pilot BETA banners (storefront, sales channels); nav hides enterprise implementation
- [x] `npm run workspace:backfill:phase11`
- [x] Go/no-go checklist: [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md)
- [ ] **Staging:** deploy migration + `workspace:backfill:phase11`
- [ ] **Follow-up:** RBAC Phase B; ProductionWorkItem workspace column; NOT NULL cutover

## Phase 12 — Printed labels + pilot readiness bundle (code in repo)

- [x] `lib/scope/workspace-printed-label-scope.ts` — scope via `product` / `order` / legacy owner rows
- [x] `command-center-stats`, print queue page, `label-print-queue` actions, go-live + demo audit counts
- [x] Unit tests: `workspace-printed-label-scope.test.ts`, extended nutrition scope test
- [x] `npm run verify:pilot-readiness` — local/CI code gate (`scripts/run-paid-pilot-readiness.sh`)
- [x] `npm run workspace:backfill:all` + `npm run workspace:staging:migrate` — staging ops one-liners
- [x] Manual golden path: [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md)
- [x] Nutrition dashboard pages use `dataUserId` (not session id) for stats
- [x] Pilot home/today/packing/menus/production use `dataUserId` + `findOwnerKitchenSettings`
- [x] CI: `validate:dashboard-owner-scope` (no session id on owner loaders)
- [x] Mass fix: dashboard owner loaders use `dataUserId` (`normalize:dashboard-owner-id`, 100+ pages)
- [ ] **Staging:** no new migration — verify print queue as staff user after backfill

## Helpers

| Module | Purpose |
|--------|---------|
| `lib/scope/require-tenant-actor.ts` | `userId`, `workspaceId`, `sessionUserId` |
| `lib/scope/workspace-resource-scope.ts` | Prisma `where` builders |
| `lib/scope/workspace-order-scope.ts` | Order-hub re-exports |
| `lib/scope/tenant-scope.ts` | `prismaOwnerScopeWhere`, `SERVICE_*_TAKE` |
| `scripts/workspace-migration-preflight.ts` | Pre-flight counts |
| `scripts/check-backfill-status.ts` | Post-backfill gate |
| `lib/scope/workspace-printed-label-scope.ts` | PrintedLabel via product/order FK |
| `scripts/run-paid-pilot-readiness.sh` | Code gate (`npm run verify:pilot-readiness`) |

## Indexes (applied in migrations)

```sql
-- orders_workspace_id_created_at_idx, orders_workspace_id_status_idx
-- menus_workspace_id_created_at_idx, products_workspace_id_created_at_idx
-- integration_connections_workspace_id_*, webhook_events_workspace_id_*
```

Keep existing `@@index([userId, createdAt])` until Phase 3 cutover.

## NPM scripts

```bash
npm run workspace:preflight          # counts + migrate status
npm run workspace:backfill:phase1 -- --dry-run
npm run workspace:backfill:phase1
npm run workspace:backfill:phase2
npm run workspace:backfill:phase3
npm run workspace:backfill:phase4
npm run workspace:backfill:phase5
npm run workspace:backfill:phase6
npm run workspace:backfill:phase7
npm run workspace:backfill:phase11
npm run workspace:backfill:status
```
