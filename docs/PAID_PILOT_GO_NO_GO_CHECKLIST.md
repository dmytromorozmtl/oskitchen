# Paid pilot & closed beta — go / no-go checklist

**Owner:** Tech Lead + Ops  
**Last updated:** 2026-05-17 (Phases 1–12 code in repo)  
**Companion docs:** [`WORKSPACE_MIGRATION_PLAN.md`](./WORKSPACE_MIGRATION_PLAN.md), [`WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`](./WORKSPACE_MIGRATION_RUNBOOK_STAGING.md), [`audit1712may.md`](./audit1712may.md)

## Code completion status (repository)

| Area | Status | Evidence |
|------|--------|----------|
| Workspace Phases 1–12 | **Done** | Migrations, scope helpers, pilot paths |
| Unit tests | **583+ passed** | `npm test` |
| Tenant pilot guard | **0 violations** | `validate:tenant-scope-pilot` (380 files) |
| Dashboard owner scope guard | **0 violations** | `validate:dashboard-owner-scope` (492 files) |
| Pilot readiness bundle | **Done** | `npm run verify:pilot-readiness` |
| Staging DB backfill | **Done (Supabase)** | `npm run staging:pilot:db` → `docs/generated/STAGING_PILOT_RUN_REPORT.md` |
| Staging env secrets | **Tooling ready** | `npm run staging:secrets:generate` → Upstash in Vercel → `npm run verify:staging-env` |
| HTTP golden path smoke | **Tooling ready** | `npm run smoke:golden-path-http` (needs `SMOKE_BASE_URL`) |
| Manual golden path | **Pending** | [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md) |

**Staging one-liner (after backup):** `npm run staging:pilot:complete` — full ops gate ([`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md))  
**Local DB pilot:** `npm run staging:pilot:db`  
**100% automated gate + report:** `npm run pilot:100-gate` → [`PILOT_100_PERCENT_RUNBOOK.md`](./PILOT_100_PERCENT_RUNBOOK.md)

## How to use

| Column | Meaning |
|--------|---------|
| **Code** | Merged in repository |
| **Staging** | Verified on staging environment |
| **Prod** | Verified on production (paid pilot tenant) |
| **Gate** | Blocks go-live if incomplete |

Mark: `[ ]` open · `[x]` done · `[~]` in progress · `[-]` N/A

---

## P0 — Release & CI (gates)

| ID | Task | Gate | Code | Staging | Prod | Command / evidence |
|----|------|:----:|:----:|:-------:|:----:|-------------------|
| P0-01 | `npm run build` passes (ESLint cron → `_experiments` exempt) | **Y** | [x] | [ ] | [ ] | `npm run build` |
| P0-02 | CI on `main` green: typecheck, test, lint, build | **Y** | [x] | [ ] | [ ] | `.github/workflows/ci.yml` |
| P0-03 | Tenant scope pilot guard in CI | **Y** | [x] | [ ] | [ ] | `npm run validate:tenant-scope-pilot` |
| P0-04 | Marketing vs capability matrix | **Y** | [x] | [ ] | [ ] | `npm run verify-claims` |
| P0-05 | Production cron manifest valid | **Y** | [x] | [ ] | [ ] | `npx tsx scripts/validate-production-crons.ts` |

**Notes:** Cron routes may import `@/services/storefront/_experiments/*`; ESLint allows this only under `app/api/cron/**` (`eslint.config.mjs`).

---

## P0 — Workspace migration (ops)

| ID | Task | Gate | Code | Staging | Prod | Command / evidence |
|----|------|:----:|:----:|:-------:|:----:|-------------------|
| P0-10 | Deploy migrations phases 1–11 | **Y** | [x] | [ ] | [ ] | `npx prisma migrate deploy` |
| P0-11 | Preflight counts | **Y** | [x] | [ ] | [ ] | `npm run workspace:preflight` |
| P0-12 | Backfill phase 1 (orders, menus, products) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase1` |
| P0-13 | Backfill phase 2 (integrations, webhooks) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase2` |
| P0-14 | Backfill phase 3 (kitchen customers) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase3` |
| P0-15 | Backfill phase 4 (channel orders) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase4` |
| P0-16 | Backfill phase 5 (external products) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase5` |
| P0-17 | Backfill phase 6 (product mappings) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase6` |
| P0-18 | Backfill phase 7 (recovery, aliases) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase7` |
| P0-19 | Backfill phase 11 (import/export jobs) | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:phase11` |
| P0-20 | Post-backfill status = all OK | **Y** | [x] | [ ] | [ ] | `npm run workspace:backfill:status` |
| P0-21 | Staff order scope parity | **Y** | [x] | [ ] | [ ] | `npm run verify:staff-scope` + `verify:staff-parity` |

**Dry-run first:** append `-- --dry-run` to any `workspace:backfill:phase*` script.

---

## P0 — Staging smoke

| ID | Task | Gate | Code | Staging | Prod | Command / evidence |
|----|------|:----:|:----:|:-------:|:----:|-------------------|
| P0-30 | E2E pilot bundle | **Y** | [x] | [ ] | [ ] | `npm run test:e2e:pilot` (secrets required) |
| P0-31 | Woo/Shopify certification | **Y** | [x] | [ ] | [ ] | `npm run smoke:woo-shopify` or certification runner |
| P0-32 | Staging env gate | **Y** | [x] | [ ] | [ ] | `npm run verify:staging-env` |
| P0-33 | Webhook async readiness | **Y** | [x] | [ ] | [ ] | `npm run verify:staging-webhook-async` |
| P0-34 | Manual golden path | **Y** | [x] | [ ] | [ ] | [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md) — owner + staff + negative checks |
| P0-35 | Closed beta workflow | **Y** | [x] | [ ] | [ ] | GitHub Actions → **Closed Beta Gate** (dispatch) |

---

## P0 — Security & production config

| ID | Task | Gate | Code | Staging | Prod | Command / evidence |
|----|------|:----:|:----:|:-------:|:----:|-------------------|
| P0-40 | Upstash rate limits (`RATE_LIMIT_ADAPTER=upstash`) | **Y** | [x] | [ ] | [ ] | `verify:staging-env` Upstash ping |
| P0-41 | `CRON_SECRET` set; experimental crons gated | **Y** | [x] | [ ] | [ ] | `docs/CRON_INVENTORY.md`, `ENABLE_EXPERIMENTAL_CRONS` |
| P0-42 | IDOR inventory P0 routes closed | **Y** | [x] | [ ] | [ ] | [`IDOR_MUTATION_INVENTORY.md`](./IDOR_MUTATION_INVENTORY.md) §2–3 |
| P0-43 | Webhook HMAC + Stripe signature tests | **Y** | [x] | [ ] | [ ] | `npm run test:security` |

---

## P0 — Product honesty & navigation

| ID | Task | Gate | Code | Staging | Prod | Evidence |
|----|------|:----:|:----:|:-------:|:----:|----------|
| P0-50 | BETA banners: sales channels, storefront | **Y** | [x] | [ ] | [ ] | `PilotBetaSurfaceBanner` on key pages |
| P0-51 | Capability matrix on integrations | **Y** | [x] | [ ] | [ ] | Shopify/Woo pages + sales channels |
| P0-52 | Do **not** sell: SMS, offline POS, Uber/DoorDash prod, Stripe Terminal | **Y** | [x] | [ ] | [ ] | `lib/capabilities/capability-matrix.ts` |
| P0-53 | Pilot nav hides growth / developer / experiments / enterprise | **Y** | [x] | [ ] | [ ] | `lib/navigation/release-navigation.ts` + `module-release-service` profile `pilot` |

---

## P1 — Tenant & code quality (Phase 11)

| ID | Task | Gate | Code | Staging | Prod | Notes |
|----|------|:----:|:----:|:-------:|:----:|-------|
| P1-01 | Nutrition stats scoped via product + printed labels | **N** | [x] | [ ] | [ ] | `command-center-stats.ts`, pages use `dataUserId`, `workspace-printed-label-scope.ts` |
| P1-02 | E2E POS seed scoped products | **N** | [x] | [ ] | [ ] | `seed-e2e-pos-fixture.ts` |
| P1-03 | Import/export jobs `workspaceId` + scope | **N** | [x] | [ ] | [ ] | Phase 11 migration + `workspace-import-export-scope.ts` |
| P1-04 | Tenant allowlist empty | **N** | [x] | [ ] | [ ] | `config/tenant-scope-pilot-allowlist.json` |
| P1-05 | Demo reset uses scoped deletes | **N** | [x] | [ ] | [ ] | `demo-data.ts` |
| P1-06 | Unit test: nutrition + printed label scope | **N** | [x] | [ ] | [ ] | `nutrition-command-center-scope.test.ts`, `workspace-printed-label-scope.test.ts` |
| P1-07 | RBAC Phase B (unified matrix) | **N** | [ ] | [ ] | [ ] | `RBAC_MIGRATION_PLAN.md` — post-pilot |
| P1-08 | ProductionWorkItem `workspaceId` decision | **N** | [-] | [ ] | [ ] | **Deferred:** `userId` + `dataUserId` staff pattern sufficient for pilot |
| P1-09 | Expand CI scan to more dashboard roots | **N** | [x] | [ ] | [ ] | `validate-tenant-scope-pilot` — nutrition-labels, label-print-queue |
| P1-10 | `verify:pilot-readiness` code bundle | **N** | [x] | [ ] | [ ] | `npm run verify:pilot-readiness` |

---

## P1 — Tests

| ID | Task | Code | Notes |
|----|------|:----:|-------|
| P1-20 | Default CI: platform-access-denial E2E | [x] | `ci.yml` |
| P1-21 | Optional CI: storefront smoke on PR | [ ] | Enable when `E2E_STOREFRONT_SLUG` available |
| P1-22 | Security bundle in closed-beta gate | [x] | `closed-beta-gate.yml` |

---

## P2 — Post-pilot (not blocking paid pilot)

| Area | Items |
|------|--------|
| Performance | Report/executive pagination; Order Hub profiling |
| Import/export | Background worker for large CSV |
| Crons | Archive experimental routes (`CONFIRM_CRON_ARCHIVE=1`) |
| Integrations | Per-tenant production certification |
| Public launch | Hide experiment scaffold; SSO; API key scopes |
| Docs | Refresh `audit1712may.md` scorecard after staging sign-off |

---

## Go / no-go decision

**GO for paid pilot** when all **P0** rows with **Gate = Y** are `[x]` in **Staging** (and Prod for the paying tenant’s environment).

**NO-GO** if any of:

- `workspace:backfill:status` reports PENDING on scoped tables  
- `npm run build` or CI fails on release commit  
- Upstash / `CRON_SECRET` missing on production-like env  
- Marketing claims contradict `verify-claims`  
- Manual golden path fails on staging  

**Sign-off:**

| Role | Name | Date | GO / NO-GO |
|------|------|------|------------|
| Tech Lead | | | |
| Ops | | | |
| Product | | | |

---

## Quick command block (staging)

```bash
npm ci
npm run verify:pilot-readiness   # code gate; uses DATABASE_URL when set

# Staging DB (or step-by-step):
DATABASE_URL=... npm run workspace:staging:migrate
# Dry-run first:
DATABASE_URL=... npm run workspace:staging:migrate -- --dry-run

# Manual phases (alternative):
npm run workspace:preflight
npx prisma migrate deploy
npm run workspace:backfill:all
npm run workspace:backfill:status
npm run verify:staging-env
npm run verify:staging-webhook-async
npm run verify:staff-scope
npm run verify:staff-parity
npm run test:e2e:pilot
```
