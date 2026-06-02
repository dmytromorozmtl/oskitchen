# Migration deployment process

**Policy:** `migration-deployment-process-v1`  
**Status:** canonical Prisma migration flow — dev → verify → staging → production  
**Updated:** 2026-06-02  
**Parent:** [`staging-environment-checklist.md`](./staging-environment-checklist.md) · [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md)

Every schema change follows four phases. **Never** run `prisma migrate deploy` on production without staging PASS on the same migration folder and commit SHA.

**Honesty rule:** Unapplied migrations surface as runtime errors (`P2021` / missing table) or `MarketplaceDataUnavailable` via [`lib/prisma-migration-missing.ts`](../lib/prisma-migration-missing.ts) — not silent degradation.

---

## Flow overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1 CREATE   │ →  │  2 VERIFY   │ →  │ 3 STAGING   │ →  │  4 PROD     │
│ migrate dev │    │ CI + review │    │ deploy+smoke│    │ deploy+watch│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

| Phase | Owner | Exit criterion |
|-------|-------|----------------|
| 1 Create | Engineering | Migration SQL committed; `prisma generate` clean |
| 2 Verify | Engineering + Reviewer | Unit/CI PASS; migration reviewed |
| 3 Staging | Ops + Engineering | `migrate deploy` on staging DB; smokes PASS |
| 4 Production | Ops (with Eng on-call) | Backup + deploy; health OK; rollback plan ready |

---

## Phase 1 — Create

### 1.1 When to use `migrate dev` vs `db push`

| Tool | Use |
|------|-----|
| **`prisma migrate dev`** | **Default** — all committed schema changes |
| `prisma db push` | Local throwaway only — **not** for staging/prod |

```bash
# Preferred wrapper (loads .env.local safely)
npm run prisma:migrate:safe -- --name descriptive_snake_case
```

### 1.2 Naming convention

Folder name: `YYYYMMDDHHMMSS_short_description` (UTC timestamp + snake case).

Example: `prisma/migrations/20260602133000_marketplace_core/`

### 1.3 Author checklist

| # | Step | Done |
|---|------|:----:|
| 1.1 | Edit `prisma/schema.prisma` with minimal diff | ☐ |
| 1.2 | Generate migration — review **raw SQL** in `migration.sql` | ☐ |
| 1.3 | No destructive drops without explicit rollback plan | ☐ |
| 1.4 | Backfill data in migration or follow-up script if needed | ☐ |
| 1.5 | Run `npm run db:generate` | ☐ |
| 1.6 | Add/adjust unit tests for new models or queries | ☐ |
| 1.7 | Commit migration folder + schema in **same PR** | ☐ |

### 1.4 Forbidden in creation

- `prisma migrate dev` against production `DATABASE_URL`
- Editing applied migration SQL after merge (create a new migration instead)
- Relying on `db push` to “fix” staging drift

---

## Phase 2 — Verify

Run on the PR branch before merge to `main`.

### 2.1 Local verification

```bash
npm run db:generate
npx prisma migrate status          # pending = 0 after dev
npm run test:unit                  # or targeted service tests
npx tsc --noEmit
```

Optional fresh DB check:

```bash
npm run db:reset-dev               # local only — destroys local data
```

### 2.2 CI verification

| Check | Command / workflow | PASS |
|-------|-------------------|------|
| Typecheck | CI `tsc` job | 0 errors |
| Unit tests | CI vitest | 0 FAIL |
| Governance | `test:ci:governance-bundles` | PASS |
| Migration regression | `tests/unit/marketplace-migration-regression.test.ts` (when present) | PASS |

### 2.3 Code review gates

Reviewer confirms:

| # | Question | Blocker? |
|---|----------|:--------:|
| 2.1 | Is SQL idempotent-safe for re-run edge cases? | **Y** |
| 2.2 | Indexes added for new foreign keys / hot queries? | N |
| 2.3 | Tenant isolation (`userId` / `workspaceId`) preserved? | **Y** |
| 2.4 | Breaking API change documented in PR? | **Y** if yes |
| 2.5 | Down-migration or rollback script noted if destructive? | **Y** if destructive |

**Merge rule:** Phase 2 complete when CI green + approved review. Do not deploy to staging from unmerged branches unless explicit hotfix process.

---

## Phase 3 — Staging

Target: **separate** Supabase staging project ([`staging-environment-checklist.md`](./staging-environment-checklist.md) §4).

### 3.1 Pre-deploy

| # | Step | Owner | Done |
|---|------|-------|:----:|
| 3.1 | Confirm Vercel staging deploy includes migration commit SHA | Ops | ☐ |
| 3.2 | `DIRECT_URL` set for migration runner (not pooler-only) | Ops | ☐ |
| 3.3 | Supabase backup or note PITR timestamp | Ops | ☐ |
| 3.4 | Announce maintenance window if table locks expected | CS | ☐ |

### 3.2 Deploy migration

**Option A — full staging bootstrap (recommended for pilots):**

```bash
npm run staging:pilot:complete -- --dry-run
npm run staging:pilot:complete
```

Includes: `verify:staging-env` → `prisma migrate deploy` → workspace backfill → security tests.

**Option B — migration only:**

```bash
export DATABASE_URL="$STAGING_DIRECT_URL"
npm run prisma:migrate:deploy
# or: npm run db:deploy
npx prisma migrate status    # must show: Database schema is up to date
```

**Option C — workspace script:**

```bash
npm run workspace:staging:migrate
```

### 3.3 Post-deploy staging verification

| # | Check | Command / surface | PASS |
|---|-------|-------------------|------|
| 3.5 | Migration status clean | `npx prisma migrate status` | No pending |
| 3.6 | Health endpoint | `curl $E2E_STAGING_BASE_URL/api/health` | DB OK |
| 3.7 | Feature smoke | Pages that use new tables (e.g. `/dashboard/marketplace/catalog`) | No `MarketplaceDataUnavailable` |
| 3.8 | Regression tests | Targeted vitest for migration | PASS |
| 3.9 | Integration smokes | `npm run smoke:woo-shopify-live` if channel tables touched | PASS or SKIPPED with reason |

### 3.4 Staging sign-off

| Role | Sign | Date |
|------|------|------|
| Engineering | Migration verified on staging SHA ______ | |
| Ops | `migrate deploy` exit 0 logged | |

**Do not proceed to production** until staging sign-off row complete.

---

## Phase 4 — Production

### 4.1 Pre-deploy (production)

| # | Step | Owner | Blocker? |
|---|------|-------|:--------:|
| 4.1 | Staging phase 3 sign-off on **same commit SHA** | Engineering | **Y** |
| 4.2 | Supabase backup / PITR checkpoint recorded | Ops | **Y** |
| 4.3 | Deploy window communicated (if downtime possible) | CS | N |
| 4.4 | On-call engineer assigned | Ops | **Y** |
| 4.5 | Rollback steps written (see §4.4) | Engineering | **Y** |

### 4.2 Deploy migration (production)

**Order:** migrate **before** or **with** app deploy that depends on new schema — never deploy code first.

```bash
# Production DIRECT_URL from vault — never commit
export DATABASE_URL="$PRODUCTION_DIRECT_URL"
npm run prisma:migrate:deploy
npx prisma migrate status
```

Then trigger Vercel production deploy (or confirm `vercel.json` build already includes migration in release pipeline).

**Vercel note:** Migrations run **outside** Vercel build by default — use Supabase SQL editor or ops shell with `DIRECT_URL`. Do not embed prod credentials in build logs.

### 4.3 Post-deploy production verification

| # | Check | Timing | PASS |
|---|-------|--------|------|
| 4.6 | `GET /api/health` → database OK | T+0 | 200 |
| 4.7 | Sentry error rate stable | T+15 min | No migration-related spike |
| 4.8 | Critical user paths | T+30 min | Order hub, Today, affected feature |
| 4.9 | Cron jobs succeed | T+1 hr | No new 500s in Vercel cron logs |
| 4.10 | Webhook ingest | T+1 hr | Signature + process OK |

Record deploy in release notes ([`release-notes-process.md`](./release-notes-process.md) when published).

### 4.4 Rollback

| Scenario | Action |
|----------|--------|
| Migration failed mid-apply | Stop deploy; restore Supabase backup / PITR; do not deploy new app version |
| Migration applied but app broken | Roll back Vercel deployment to prior SHA; **do not** revert migration SQL manually unless Eng writes down migration |
| Additive migration (new tables only) | Roll back app; old app ignores new tables — usually safe |
| Destructive migration | Requires written down migration + backup restore — avoid in hot paths |

Forward-fix preferred: new migration to repair schema rather than editing history.

---

## Example — marketplace core migration

Migration: `prisma/migrations/20260602133000_marketplace_core/`

| Phase | Action |
|-------|--------|
| Create | Committed with marketplace schema + services |
| Verify | Marketplace unit tests + catalog page loads locally |
| Staging | `npm run staging:pilot:complete` or `prisma migrate deploy` on staging |
| Staging verify | `/dashboard/marketplace/catalog` loads products — not `MarketplaceDataUnavailable` |
| Production | Backup → `migrate deploy` → deploy app → health + catalog smoke |

---

## Quick reference commands

| Intent | Command |
|--------|---------|
| Create migration (local) | `npm run prisma:migrate:safe -- --name my_change` |
| Check pending | `npx prisma migrate status` |
| Deploy (any env) | `npm run prisma:migrate:deploy` |
| Staging full bootstrap | `npm run staging:pilot:complete` |
| Generate client | `npm run db:generate` |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Staging DB prerequisites |
| [`STAGING_PILOT_OPS_RUNBOOK.md`](./STAGING_PILOT_OPS_RUNBOOK.md) | Phase 2 database bootstrap |
| [`BACKUP_DISASTER_RECOVERY_PLAN.md`](./BACKUP_DISASTER_RECOVERY_PLAN.md) | Restore procedures |
| [`ENGINEERING_ONBOARDING.md`](./ENGINEERING_ONBOARDING.md) | Local dev setup |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Pilot step 3 staging gate |
