# Production schema drift — prevention and fix

**Task:** DEV-04  
**Status:** Ops runbook — human gate for production `DATABASE_URL`  
**Incident:** 2026-06-03 — `/dashboard/today` 500 when `kitchen_settings.demo_expires_at` existed in Prisma schema but not in production DB (fixed in app via compat layer @ `27cf00f7`; column still requires migrate/repair on prod).

**Canonical flow:** [migration-deployment-process.md](./migration-deployment-process.md)

---

## 1. What is schema drift?

| Symptom | Cause | User impact |
|---------|-------|-------------|
| RSC 500 on dashboard pages | Prisma selects column missing in DB | Today, layout, demo banner fail |
| `P2021` / table does not exist | Migration folder not deployed | Marketplace, POS modules unavailable |
| `MarketplaceDataUnavailable` UI | Detected via `lib/prisma-migration-missing.ts` | Honest degraded state |

**Rule:** Every merge to `main` that adds/changes `prisma/schema.prisma` must reach production via `prisma migrate deploy` on the **same commit SHA** before or during app deploy.

---

## 2. Known drift case: `demo_expires_at`

| Layer | Path | Purpose |
|-------|------|---------|
| Prisma schema | `prisma/schema.prisma` — `KitchenSettings.demoExpiresAt` | Source of truth |
| Migration | Latest migration adding column (check `prisma/migrations/`) | Proper fix |
| Repair SQL | `prisma/sql/ensure-kitchen-demo-expires-column.sql` | Idempotent `ADD COLUMN IF NOT EXISTS` |
| Repair script | `npm run db:repair-kitchen-demo` | Ops one-liner |
| Legacy repair | `scripts/db-repair-kitchen-demo-expires.ts` | Same column via `$executeRawUnsafe` |
| Runtime compat | `lib/prisma-kitchen-settings-demo-column-compat.ts` | Omits column from queries until DB caught up — **not a substitute for migrate** |

---

## 3. Fix production now (emergency)

**Prerequisites:** Production `DATABASE_URL` (session pooler OK), backup confirmed, Eng on-call.

### Option A — Full migrate deploy (preferred)

```bash
# Load production env locally (never commit .env)
# docs/ENVIRONMENT_VARIABLES.md — use pooler URL from Vercel

npm run prisma:migrate:deploy
# Equivalent: bash scripts/prisma-env-safe.sh && npx prisma migrate deploy
```

Verify:

```bash
npx prisma migrate status
# Expected: "Database schema is up to date!"
```

### Option B — Column-only repair (when single column lags)

```bash
npm run db:repair-kitchen-demo
```

Or run SQL directly:

```sql
ALTER TABLE "kitchen_settings"
ADD COLUMN IF NOT EXISTS "demo_expires_at" TIMESTAMPTZ;
```

### Post-fix verification

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://os-kitchen.com/api/health
# Expect 200

# Authenticated smoke: /dashboard/today loads without RSC error (manual or E2E)
```

---

## 4. Prevention — deploy checklist (every production release)

| # | Step | Owner | Pass |
|---|------|-------|:----:|
| 1 | Staging `prisma migrate deploy` on same migration folders as `main` | Ops | ☐ |
| 2 | Staging smokes PASS (`p0-staging-smokes`, marketplace E2E) | QA | ☐ |
| 3 | Production DB backup snapshot | Ops | ☐ |
| 4 | Production `npm run prisma:migrate:deploy` **before** or **with** Vercel deploy | Ops | ☐ |
| 5 | `npx prisma migrate status` → up to date | Ops | ☐ |
| 6 | `/api/health` → `database.ok: true` | Ops | ☐ |
| 7 | Spot-check `/dashboard/today` after deploy | Eng | ☐ |

See [migration-deployment-process.md § Phase 4](./migration-deployment-process.md) for rollback plan.

---

## 5. CI drift check (recommended gate)

Add to PR / pre-deploy (manual today; wire in CI when `DATABASE_URL` staging secret available):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Pending migrations = drift risk if app deploys first
npx prisma migrate status --schema prisma/schema.prisma 2>&1 | tee /tmp/migrate-status.txt

if grep -q "following migration.* have not yet been applied" /tmp/migrate-status.txt; then
  echo "FAIL: Pending migrations — run prisma migrate deploy on staging before merge/deploy"
  exit 1
fi

# Optional: compare migration history count
PENDING=$(npx prisma migrate status --json 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(len(d.get('migrations', {}).get('pending', [])))
except Exception:
    print(-1)
" 2>/dev/null || echo "-1")

if [ "$PENDING" != "0" ] && [ "$PENDING" != "-1" ]; then
  echo "FAIL: $PENDING pending migration(s)"
  exit 1
fi

echo "PASS: No pending migrations against target DATABASE_URL"
```

**Where CI already runs migrate deploy:**

- `.github/workflows/e2e-remote-smoke.yml` — `npx prisma migrate deploy` on staging E2E DB (line ~156)

**Gap:** Production migrate is **not** automated in Vercel build by default ([CI_STOREFRONT_HARDENING.md](./CI_STOREFRONT_HARDENING.md)) — intentional; ops runs deploy explicitly.

---

## 6. Vercel / build integration options

| Approach | Pros | Cons |
|----------|------|------|
| **Manual migrate before deploy** (current) | Safe, reviewed | Human can forget → drift |
| `prisma migrate deploy` in Vercel `buildCommand` | Automatic | Longer builds; needs prod URL in build env |
| Supabase migration on release webhook | Decoupled | Extra tooling |

**Recommendation:** Keep manual migrate for production until staging P0 PASS; then add `npm run prisma:migrate:deploy` to release runbook step immediately before `vercel --prod`.

---

## 7. Acceptance criteria (DEV-04 done)

- [x] Runbook documented (`docs/prod-schema-drift-fix.md`)
- [ ] Production `migrate deploy` executed after next schema change
- [ ] `demo_expires_at` column present in production (verify via `information_schema.columns`)
- [ ] CI drift script added to release checklist or workflow (human follow-up)

---

## Related

- [migration-deployment-process.md](./migration-deployment-process.md)
- [staging-environment-checklist.md](./staging-environment-checklist.md)
- [STOREFRONT_PRISMA_DEPLOYMENT_NOTES.md](./STOREFRONT_PRISMA_DEPLOYMENT_NOTES.md)
- [vendor-seeding-execution.md](./vendor-seeding-execution.md) — marketplace migration gate
