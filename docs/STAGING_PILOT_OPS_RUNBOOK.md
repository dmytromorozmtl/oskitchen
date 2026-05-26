# Staging & paid pilot — ops runbook (100% checklist)

**Owner:** Ops + Tech Lead  
**Prerequisites:** Supabase staging DB, Vercel staging env, Upstash, Resend, Stripe test keys

---

## Phase 0 — Code (repository)

```bash
npm ci   # includes devDependencies (vitest, tsx) — scripts set NPM_CONFIG_PRODUCTION=false
npm run verify:pilot-readiness
```

Expected: all steps OK (583+ unit tests, tenant guards, optional build).

---

## Phase 1 — Environment secrets (Vercel staging)

Copy [`.env.staging.example`](../.env.staging.example) → Vercel **Staging** environment.

| Variable | Required | Notes |
|----------|:--------:|-------|
| `DATABASE_URL` / `DIRECT_URL` | Yes | Pooler + direct for migrations |
| `RATE_LIMIT_ADAPTER=upstash` | Yes | |
| `UPSTASH_*` | Yes | |
| `CRON_SECRET` | Yes | |
| `ENCRYPTION_KEY` | Yes | |
| `SUPABASE_*` | Yes | |
| `STRIPE_*` (test) | Yes | |
| `RESEND_*` | Recommended | |
| `NEXT_PUBLIC_NAV_RELEASE_PROFILE` | Optional | `pilot` |

Generate missing crypto secrets (does **not** create Upstash — add those manually):

```bash
npm run staging:secrets:generate
```

Validate locally (overlay: `.env` → `.env.local` → `.env.staging.local`):

```bash
npm run verify:staging-env              # full gate (Upstash required)
npm run verify:staging-env:local        # DB + CRON + ENCRYPTION only (local pilot)
npm run vercel:staging-checklist        # print [x]/[ ] without values
```

---

## Phase 2 — Database (one command)

```bash
# After backup (full Vercel-like gate):
npm run staging:pilot:complete

# Local DB against Supabase + generated secrets (Upstash optional):
npm run staging:pilot:local
```

This runs:

1. Code readiness (`verify:pilot-readiness`, skip build if `SKIP_BUILD=1` inside)
2. `verify:staging-env`
3. `workspace:preflight`
4. `provision-orphan-workspaces` (owners with data but no Workspace row)
5. `prisma migrate deploy`
6. Backfill phases 1–7 + 11
7. Staff scope + security tests
8. Webhook table check

**Dry-run first:**

```bash
npm run staging:pilot:complete -- --dry-run
```

**Report:** `docs/generated/STAGING_PILOT_RUN_REPORT.md`

Manual steps (alternative):

```bash
npm run workspace:provision:orphans
npm run workspace:staging:migrate
npm run workspace:backfill:status   # must exit 0
```

---

## Phase 3 — Deploy staging app

1. Push branch / merge to deploy branch  
2. Vercel staging deploy green (`npm run build`)  
3. Confirm `NEXT_PUBLIC_APP_URL` matches deployed URL  

---

## Phase 4 — Automated smoke (optional)

**HTTP (no browser):**

```bash
export SMOKE_BASE_URL=https://staging.yourdomain.com
export CRON_SECRET=...   # same as Vercel
npm run smoke:golden-path-http
```

**Playwright pilot bundle:**

```bash
export E2E_STAGING_BASE_URL=https://staging.yourdomain.com
export E2E_LOGIN_EMAIL=...
export E2E_LOGIN_PASSWORD=...
npm run test:e2e:pilot
npm run smoke:woo-shopify   # if test shops configured
```

GitHub: **Closed Beta Gate** (workflow_dispatch).

---

## Phase 5 — Manual golden path

[`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md) (~45–60 min, owner + staff).

**Staff parity:** invite staff with `orders.view`, then verify Order Hub / Today / Packing match owner.

```bash
npm run verify:staff-scope
npm run verify:staff-parity -- --owner-email=owner@example.com
```

---

## Phase 6 — Sign-off

Update [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) — Staging + Prod columns.

| Role | GO / NO-GO |
|------|------------|
| Tech Lead | |
| Ops | |
| Product | |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `menus: N NULL` after backfill | `npm run workspace:provision:orphans` then `npm run workspace:backfill:phase1` |
| `Prisma migrate: UNAVAILABLE` | Set `DIRECT_URL`; use `node node_modules/prisma/build/index.js migrate deploy` |
| Staff sees empty dashboard | Ensure pages use `dataUserId` (CI: `validate:dashboard-owner-scope`) |
| Build: `findOwnerKitchenSettings` | Import from `@/lib/scope/owner-kitchen-settings` |
