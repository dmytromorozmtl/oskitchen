# KitchenOS — CTO Fixes Applied (post-audit 17–18 May 2026)

**Date:** 18 May 2026 (delta on 17 May baseline)  
**Source audit:** `docs/audit1712may.md` (ops update § Paid pilot 18 May)  
**Goal:** Unblock CI/CD, isolate experimental cron blast radius, tighten pilot navigation, begin tenancy hardening — without broad refactors.

---

## Executive summary

| Phase | Status | Outcome |
|-------|--------|---------|
| **0 — CI/CD reanimation** | **Done** | `npm run build` **PASS**; ESLint cron override; CI typecheck + prisma validate + blocking `verify-claims` |
| **1 — Cron isolation** | **Done (runtime)** | Production manifest + `runCronRoute` 404 in prod; `dna-audit-trail-archive` removed from `vercel.json` |
| **2 — Tenancy (PR-B)** | **Done (code)** | `workspace-resource-scope.ts`; staging runbook + backfill scripts |
| **2b — Tenancy (PR-C)** | **In progress** | Analytics/reports/CRM/Today scoped; integrations dashboard; pilot E2E scaffold |
| **3 — Performance** | **Partial** | Executive dashboard order queries capped (`SERVICE_AGGREGATION_TAKE`) |
| **4 — Nav / platform hide** | **Done** | Pilot hidden prefixes; platform tools founder-only |

**Deferred intentionally (hide before amputate):** Physically deleting/archiving ~120 experimental `app/api/cron/*` route files — routes remain but return **404 in production** without `ENABLE_EXPERIMENTAL_CRONS=true`. Compliance/novelty crons are not moved to `scripts/` yet (no product dependency on them when gated).

---

## Phase 0 — CI/CD (P0)

### Changes

1. **`eslint.config.mjs`**
   - Global rule: still **forbids** `@/services/storefront/_experiments/*` outside cron.
   - Override `app/api/cron/**/*.ts`: **allows** `_experiments` imports; **forbids** `@/components/*` and `@/app/**`.
   - **18 May:** `services/**` forbid identifier `dataUserId` (tenant regression guard); `actions/**` may use `requireTenantActor().dataUserId`.

2. **`.github/workflows/ci.yml`**
   - Added `npx prisma validate` after typecheck.
   - `npm run verify-claims` is now **blocking** (removed `continue-on-error: true`).
   - Typecheck already runs before build.

### Verification

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (warnings only in experiment libs) |
| `npm run build` | **PASS** |
| `npm test` | PASS (544 tests after new specs) |

---

## Phase 1 — Cron isolation (P0)

### New files

- **`services/cron/production-manifest.ts`**
  - `ALLOWED_PRODUCTION_CRON_SLUGS` (10 slugs)
  - `ALLOWED_PRODUCTION_CRON_PATHS`
  - `cronSlugFromPathname`, `isAllowedProductionCronSlug`, `isExperimentalCronSlug`
  - **18 May:** re-exports `listExperimentalCronPathsOnDisk`, `EXPERIMENTAL_CRON_PATHS()` from `cron-route-inventory.ts`

**Production allowlist:**

- `webhook-jobs`
- `reminders`
- `storefront-domain-recheck`
- `storefront-cart-recovery`
- `storefront-theme-publish`
- `storefront-team-invite-reminders`
- `storefront-webhook-retention`
- `storefront-invite-audit-retention`
- `storefront-ga4-parity`
- `storefront-edge-sync`

### `lib/api/run-cron.ts`

- In **`NODE_ENV=production`** without `ENABLE_EXPERIMENTAL_CRONS=true`, non-allowlisted crons → **HTTP 404**.
- Production tier: `verifyCronSecret` only.
- Experimental tier: `verifyExperimentalCron` + Sentry tag `risk:experimental_cron` + `Strict-Transport-Security` on response.

### `vercel.json`

- Removed scheduled job: `/api/cron/dna-audit-trail-archive` (not on production allowlist).

### Tests

- `tests/unit/cron-production-manifest.test.ts`
- `tests/unit/run-cron-production-gate.test.ts`

### Ops follow-up (not code)

- Run `npm run vercel:crons:production` / staging sync so Vercel only schedules allowlisted paths.
- Rotate `CRON_SECRET` if experimental crons were ever hit in prod.

---

## Phase 2 — Tenancy / workspace migration (PR-B)

### Schema (migrations in repo — deploy on staging only)

- `20260517120000_workspace_phase1_order_menu_product` — `workspace_id` on Order, Menu, Product
- `20260517140000_workspace_phase2_integration_webhook` — IntegrationConnection, WebhookEvent

### `lib/scope/workspace-resource-scope.ts` (canonical)

- `buildOwnerScopedWhere(ownerUserId, workspaceId)` — OR: `{ workspaceId } | { userId, workspaceId: null }`
- Per-model helpers: `order*`, `menu*`, `product*`, `integrationConnection*`
- `lib/scope/workspace-order-scope.ts` re-exports order helpers

### Application wiring

| Area | Files |
|------|--------|
| Orders | `order-lifecycle-service`, `order-blocker-service`, `order-creation-service` (writes) |
| Menus / products | `actions/menus.ts`, `actions/products.ts` — scoped reads + `workspaceId` on create/duplicate |
| Integrations | `actions/integrations.ts`, `lib/integrations/api-helpers.ts`, health + certification actions |
| Dashboard | `sales-channels/*`, `integration-health/page.tsx`, `sales-channel-metrics.ts` |

### Ops / scripts

| Script | Purpose |
|--------|---------|
| `npm run workspace:preflight` | NULL counts + migrate status |
| `npm run workspace:backfill:phase1` | Orders, menus, products |
| `npm run workspace:backfill:phase2` | IntegrationConnection, WebhookEvent |
| `npm run workspace:backfill:status` | Exit 1 if backfill incomplete |

Production guard: backfill scripts exit on `NODE_ENV=production` unless `--allow-production`.

**Runbook:** `docs/WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`

### Tests

- `tests/unit/workspace-resource-scope.test.ts`
- `tests/unit/workspace-order-scope.test.ts` (updated OR shape)

### Staging checklist (not run by agent)

1. `npx prisma migrate deploy` on staging DB
2. `npm run workspace:backfill:phase1` / `phase2`
3. `npm run workspace:preflight` → `readyForBackfill: true`
4. Manual smoke: staff order hub, menu create, Woo connect/disconnect

## Phase 2b — PR-C tenancy hot paths (17 May 2026)

### `lib/scope/cached-workspace-resource-scope.ts`

Per-request React `cache()` for:

- `getCachedOrderListWhere`
- `getCachedMenuListWhere`
- `getCachedIntegrationConnectionListWhere`
- `getCachedWebhookEventListWhere`

`cached-workspace-order-scope.ts` re-exports order helpers for backward compatibility.

### Wired (workspace-aware reads/writes)

| Area | Files |
|------|--------|
| Order mutations | `actions/orders.ts` — active menu scope, `workspaceId` on manual create |
| Packing queue | `services/packing/generate-packing-queue.ts` |
| Location assign | `services/locations/location-service.ts` (ORDER, MENU) |
| Location UI | `app/dashboard/locations/assignment/page.tsx` |
| Order creation service | `services/orders/order-creation-service.ts` |
| Integration pages | Woo/Shopify/Uber*, health, settings, sales-channels detail, product-mapping health |
| Webhooks UI | `integration-health`, `integrations/health`, `sales-channels/health` |
| Handoff | `app/dashboard/implementation/handoff/page.tsx` |

### PR-E — Pilot journey E2E (17 May 2026)

**Specs**

- `tests/e2e/pilot-journey.spec.ts` — owner: today, orders, order hub, production, packing, sales channels, import center, quick order
- `tests/e2e/pilot-journey-staff.spec.ts` — staff orders/hub + platform denial

**Auth setup**

- `e2e/pilot-auth.setup.ts` → `e2e/.auth/pilot-owner.json`
- `e2e/pilot-staff-auth.setup.ts` → `e2e/.auth/pilot-staff.json`

**Playwright projects:** `pilot-journey`, `pilot-staff` (when env complete)

**Scripts:** `npm run test:e2e:pilot` (`check-e2e-pilot-env.mjs` + `run-e2e-pilot.mjs`)

**CI:** `.github/workflows/e2e-pilot.yml` (06:30 UTC + manual; skips without secrets)

**Docs:** `docs/E2E_PILOT_JOURNEY.md`

### PR-C slice 2 — Analytics / CRM / Today (17 May 2026)

**`lib/analytics/revenue-metrics.ts`**

- `whereOrdersInWindow` — workspace-aware via `buildOwnerScopedWhere`
- `whereOrdersInWindowForOwner` — async (reports, executive, analytics)
- `whereOrdersForOwnerAnd` — CRM, Today, forecast

**Services wired**

| Service | Change |
|---------|--------|
| `report-service.ts` | All order-based reports use `whereOrdersInWindowForOwner` |
| `executive-dashboard-service.ts` | Period order aggregates scoped |
| `analytics-service.ts` | Executive, orders, customer tabs |
| `forecast-service.ts`, `reporting-service.ts` | Revenue forecast + CSV export |
| `customer-service.ts`, `customer-metrics-service.ts` | Order lists + metrics recompute |
| `today-operational-signals.ts` | Due today, delivery gaps, webhooks |
| `beta-ops/kitchen-preflight-service.ts` | Order/menu/integration counts |
| `settings-health-service.ts` | Integration connection count |
| `location-service.ts` | Unassigned menu/order counts, orders-today groupBy |
| `go-live-service.ts` | Readiness order + integration counts |

**Tests:** `tests/unit/revenue-metrics-workspace-scope.test.ts`

### PR-C slice 3 — Channels / import center (17 May 2026)

**`lib/scope/channel-import-scope.ts`**

- `channelImportBatchListWhereForOwner` / `ById` / `RelationWhere` — workspace OR on batches
- `channelConflictWhereForOwner` — owner `userId` (conflicts table)

**Wired**

| Area | Files |
|------|--------|
| Channel actions | `actions/channel-command-center.ts` — batches, records, rollback orders, simulation `workspaceId` |
| Import center | `import-center-service.ts` — product/menu scoped commit + rollback |
| Webhooks | `webhook-event-store.ts` — `workspaceId` on create; Shopify/Woo handlers pass `conn.workspaceId` |
| Webhook processor | `shopify-webhook-processor.ts` — scoped connection reload |
| Dashboard | `sales-channels/staging`, `imports/[batchId]` (staff via `dataUserId`), `reliability` |
| Order hub | `order-hub-service.ts` — conflict counts |

**Tests:** `tests/unit/channel-import-scope.test.ts`

### PR-C final — CI guards + pilot path fixes (17 May 2026)

**`npm run validate:tenant-scope-pilot`** — fails CI if hot-path files use raw `userId: dataUserId` on Order/Menu/Product/Integration/Webhook/Batch without scope helpers. Allowlist: `config/tenant-scope-pilot-allowlist.json`.

**`npm run validate:cron-inventory`** — 10 production routes on disk; experimental count cap (`CRON_EXPERIMENTAL_MAX=200`, currently ~121).

**`services/cron/cron-route-inventory.ts`** — disk inventory + partition.

**Additional wiring:** `actions/implementation.ts`, `order-blocker-service`, orders/new/quick pages, sales-channels webhooks overview.

### PR-D — Cron inventory + archive tooling (17 May 2026)

**Phase 1 (done):** `validate:cron-inventory`, `cron-route-inventory.ts`, production 404 gate.

**Phase 2 (tooling — ops executes move):**

- `services/cron/cron-archive.ts` — move/restore + manifest
- `npm run cron:archive:experimental` (dry-run) / `--execute` + `CONFIRM_CRON_ARCHIVE=1`
- `npm run cron:restore:archived`, `npm run cron:archive:status`
- Manifest: `config/cron-archive-manifest.json`
- Runbook: `docs/CRON_ARCHIVE_RUNBOOK.md`
- Preflight: `npm run preflight:staging-pilot` (read-only ops checklist)

**Ops gate:** bulk archive only after 2 weeks zero prod 404s on experimental crons (~121 routes).

### PR-F — CRM workspace scope (Phase 3, 17 May 2026)

**Schema:** `KitchenCustomer.workspaceId` — migration `20260517180000_workspace_phase3_kitchen_customer`

**Scope:** `lib/scope/workspace-customer-scope.ts` — list/byId/email helpers (OR legacy + workspace rows)

**Wired:** `customer-service`, `customer-metrics-service`, `analytics-service`, `report-service`, `executive-dashboard-service`, `go-live-service`, `import-center-service`, `order-creation-service`, `orders/new`, `actions/implementation` (CRM import/merge)

**Backfill:** `npm run workspace:backfill:phase3` — `check-backfill-status` includes `kitchen_customers`

**Tests:** `tests/unit/workspace-customer-scope.test.ts`

**CI:** `kitchenCustomer` added to `validate:tenant-scope-pilot` scoped models

### PR-G — Channel workspace scope (Phase 4, 17 May 2026)

**Schema:** `ExternalOrder`, `ChannelConflict`, `ChannelSyncJob` — migration `20260517190000_workspace_phase4_channel_orders`

**Scope:** `lib/scope/workspace-channel-scope.ts`; `channelConflictWhereForOwner` now async + workspace OR

**Wired:** order-hub (+ exact counts), order lifecycle/detail/blockers, sales-channel metrics, persist-external-order, sync-orchestrator, channel-command-center, reliability/conflicts/sync-jobs/product-mapping dashboards

**Backfill:** `npm run workspace:backfill:phase4`

### Backlog

- Execute bulk cron archive on disk (`CONFIRM_CRON_ARCHIVE=1`)
- Staging backfill phases 1–4 (`workspace:backfill:*`)

---

## Phase 3 — Performance (P1, partial)

### `services/executive/executive-dashboard-service.ts`

- Current/previous period `order.findMany` use `take: SERVICE_AGGREGATION_TAKE` (2000).
- **18 May:** `productionBatch`, `packingBatch`, `deliveryStop`, `cateringQuote`, `mealPlan`, `profitabilityLine` queries capped.

### `services/reports/report-service.ts`

- Per-report runners already use `take: MAX_EXPORT_ROWS` (5000).
- **18 May:** `buildExecutiveSummary` parallel queries capped; `listSavedReports` default `take: 100`.

### `lib/scope/with-workspace-scope.ts` (**new**)

- `withWorkspaceScope` / `withOwnerWorkspaceAnd` — AND-merge `buildOwnerScopedWhere` into service `where` clauses.

### Not done in this pass

- Materialized views / SQL aggregates for executive KPIs at 10k+ row scale
- Query timeouts around `Promise.all` (rely on Prisma/DB pool limits for now)

---

## Phase 4 — Navigation & platform hide

### `lib/navigation/release-navigation.ts` (pilot profile)

Added hidden prefixes:

- `/dashboard/growth`
- `/dashboard/workspace/experiments`
- `/dashboard/beta-applications`

(Developer/executive/etc. were already hidden.)

Set `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` in production for paid pilot.

### `lib/platform/platform-navigation.ts`

- `/platform/tools` → `founderOnly: true`
- `filterNavForPermissions(..., { isFounder })` in `app/platform/layout.tsx`

---

## Files touched (summary)

| File | Change |
|------|--------|
| `eslint.config.mjs` | Cron ESLint override |
| `.github/workflows/ci.yml` | Prisma validate, blocking verify-claims |
| `services/cron/production-manifest.ts` | **new** |
| `lib/api/run-cron.ts` | Production gate + observability |
| `vercel.json` | Remove non-production cron schedule |
| `lib/scope/require-tenant-actor.ts` | workspaceId on actor |
| `lib/scope/tenant-scope.ts` | take constants + owner scope helper |
| `lib/scope/cached-tenant.ts` | getTenantWorkspaceId |
| `lib/navigation/release-navigation.ts` | pilot hide list |
| `lib/platform/platform-navigation.ts` | founderOnly tools |
| `app/platform/layout.tsx` | pass isFounder to nav filter |
| `services/executive/executive-dashboard-service.ts` | query take cap |
| `docs/CRON_INVENTORY.md` | manifest reference |
| `tests/unit/*` | new/updated tests |

---

## Post-deploy checklist (operations)

- [ ] Enable Upstash rate limiter in production (`RATE_LIMIT_ADAPTER=upstash`).
- [ ] Configure Vercel Cron **only** from `services/cron/production-manifest.ts` (`ALLOWED_PRODUCTION_CRON_PATHS`). Disable all experimental schedules in the Vercel UI.
- [ ] Run E2E on staging: Signup → Onboarding → Storefront → Order → Production → Packing → Pickup (add/enable Playwright job in CI when secrets ready).
- [ ] Create **Capability Sign-off** for sales from `lib/capabilities/capability-matrix.ts` (no SMS, no offline POS, no Uber/DoorDash production, Woo/Shopify beta only).
- [ ] Request infra cost estimate: Vercel (cron + serverless), Upstash, Supabase pool — **forecast for 100 paid operators**.
- [ ] Set `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` on production pilot tenants.
- [ ] Confirm `ENABLE_EXPERIMENTAL_CRONS` is **unset** in production.
- [ ] Execute `WORKSPACE_MIGRATION_PLAN.md` Phase 1 on staging after DBA sign-off.

---

## Stage 2 — PR-A + tenancy slice (17 May 2026, continued)

### PR-A — Vercel cron single source (**Done**)

- `PRODUCTION_CRON_SCHEDULES` + `buildProductionCronEntries()` in `production-manifest.ts`
- `scripts/sync-vercel-crons.ts` — production profile generated from manifest; writes `config/vercel/crons-production.json`
- `scripts/validate-production-crons.ts` + `npm run validate:production-crons`
- CI step: **Validate production cron manifest**
- `vercel.json` synced to **10** production crons (added `storefront-cart-recovery`, `storefront-theme-publish`)

### PR-C slice — Order scope hardening (**Partial**)

- `workspace-order-scope.ts` — `OR: [{ workspaceId }, { userId, workspaceId: null }]` during migration
- `order-lifecycle-service.ts`, `order-blocker-service.ts` — use `orderByIdWhereForOwner`

### Sales sign-off doc (**Done**)

- `docs/CAPABILITY_SIGNOFF_SALES.md`

### Still open (next stage)

- **PR-B ops:** Staging `migrate deploy` + `workspace:backfill:*` (DBA sign-off)
- **PR-C:** CRM, reports/analytics services
- **PR-D:** Execute bulk cron archive when ops ready (`cron:archive:experimental --execute`)
- ~~**PR-E:** Pilot journey E2E~~ **Done (code)** — add GitHub secrets on staging

---

## Recommended next PRs (sequenced)

1. ~~**PR-A:** Vercel cron sync~~ **Done**
2. ~~**PR-B:** Workspace schema + scope helpers~~ **Done (code)** — run staging backfill
3. **PR-C:** Remaining services (CRM, reports) — **in progress**
4. **PR-D:** Run `cron:archive:experimental --execute` after 2 weeks zero prod 404s (tooling ready).
5. ~~**PR-E:** Pilot journey E2E~~ **Done** — configure `E2E_PILOT_*` secrets + run staging backfill.

---

---

## 18 May 2026 — Session delta (phases 0–3 baseline)

| Item | Status |
|------|--------|
| `EXPERIMENTAL_CRON_PATHS()` + `listExperimentalCronPathsOnDisk` | **Done** |
| `lib/scope/with-workspace-scope.ts` | **Done** |
| ESLint `dataUserId` ban in `services/**` only | **Done** |
| Executive + report aggregation `take` caps | **Done** |

---

## Phase A–D Completion Report (18 May 2026 — ops handoff pass)

### Phase A — Consistency verification

| Check | Result |
|-------|--------|
| ESLint `_experiments` cron override | **OK** — no conflict with global ban |
| ESLint `dataUserId` | **Fixed** — scoped to `services/**`; `lib/auth`, `lib/supabase`, `lib/scope` exempt |
| `runCronRoute` 404 before auth | **OK** — experimental blocked before `verifyCronSecret` |
| `withWorkspaceScope` + `workspaceId: null` | **OK** — uses `buildOwnerScopedWhere` |
| Performance caps | **OK** — aggregation only |

### Phase B — Audit gaps closed

| Item | File(s) |
|------|---------|
| DSR manual export API | `app/api/internal/dsr/export/route.ts`, `services/dsr/user-data-export-service.ts` |
| CSRF origin guard | `lib/security/mutation-origin-guard.ts` |
| Analytics query caps | `services/analytics/analytics-service.ts` |
| Pilot direct-URL banner | `components/dashboard/pilot-release-route-notice.tsx`, `app/dashboard/layout.tsx` |
| Supplier list cap | `services/inventory/supplier-service.ts` |

### Phase C — Security (static)

- No hardcoded Stripe `sk-` in application source (grep excl. `node_modules`)
- Rate limit defaults to `memory` when Upstash unset (`lib/rate-limit/rate-limit-env.ts`)
- IDOR: hot paths use `*WhereForOwner` / `requireTenantActor` (no changes required in this pass)

### Phase D — Ops artifacts

| Artifact | Path |
|----------|------|
| Staging runbook | `docs/PILOT_STAGING_RUNBOOK.md` |
| Readiness report | `docs/PILOT_READINESS_18MAY.md` |
| Preflight script | `scripts/ops/pilot-preflight.sh` |
| Cron monitoring table | `docs/CRON_INVENTORY.md` |
| Sales sign-off | `docs/CAPABILITY_SIGNOFF_SALES.md` (existing) |

### Tests added

- `tests/unit/user-data-export-service.test.ts`
- (prior) `with-workspace-scope`, `cron-production-manifest`, `run-cron-production-gate`

**Note:** Canonical audit: `docs/audit1712may.md`

---

## Phase F–L Completion Report (18 May 2026 — final handoff)

### Phase F — Deep verification

- All 19 files from sessions 2–3 reviewed; **no regressions** requiring rollback.
- **Note:** Checklist mentioned `buildWorkspaceScopedWhere` — implementation uses `buildOwnerScopedWhere` only (correct).
- **Note:** `PilotReleaseRouteNotice` uses `navReleaseProfile`, not `featureName` (generic banner by design).
- Critical paths: `actions/pos.ts` → `requireTenantActor` intact; middleware unchanged.

### Phase G — Micro gaps

- `.env.example`: documented `ENABLE_EXPERIMENTAL_CRONS` danger flag; pilot `RATE_LIMIT_ADAPTER` note.
- Tests: `mutation-origin-guard.test.ts`, `pilot-critical-paths-registry.test.ts` (maps critical paths → test files).
- Navigation: `module-release-service.ts` + `release-navigation.ts` + layout banner verified.

### Phase H — Static analysis (executed)

| Command | Result |
|---------|--------|
| `npm ci` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (warnings in experiments) |
| `npm test` | 604 pass, 1 skip |
| `npm run build` | PASS |

### Phase I–K — Docs

- `PILOT_KNOWN_ISSUES.md`, `PILOT_MONITORING_DASHBOARD.md`, `PILOT_EXECUTIVE_SUMMARY_18MAY.md`
- `CHANGELOG.md`, `PILOT_PR_DESCRIPTION.md`
- `PILOT_STAGING_RUNBOOK.md` — pre-flight, health checks
- `PILOT_READINESS_18MAY.md` → **READY_FOR_PILOT**

*End of report.*
