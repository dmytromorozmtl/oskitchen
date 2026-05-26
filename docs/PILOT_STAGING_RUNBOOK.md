# Paid pilot — staging deployment runbook

**Audience:** Ops / Infra  
**Code baseline:** `main` (post 18 May 2026 pilot hardening)  
**Companion:** `docs/PILOT_READINESS_18MAY.md`, `docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md`, `docs/PILOT_KNOWN_ISSUES.md`

---

## One-command deploy (19 May 2026 ops pack)

```bash
cp .env.staging.template .env.staging   # fill all REQUIRED keys
npm run verify:staging-env
bash scripts/ops/deploy-staging.sh      # or step-by-step below
bash scripts/ops/verify-staging.sh      # after STAGING_URL is live
npm run test:e2e:pilot:http             # unauthenticated HTTP smoke
```

| Script | Purpose |
|--------|---------|
| `scripts/ops/deploy-staging.sh` | preflight → migrate → backfill status → vercel deploy → verify |
| `scripts/ops/verify-staging.sh` | Detects `DEPLOYMENT_NOT_FOUND`, then health/auth/cron gates |
| `docs/OPS_VERCEL_REDEPLOY.md` | Fix 404 staging URL (expired Vercel preview) |
| `scripts/ops/setup-vercel-env.sh` | wrapper → `npm run vercel:staging-push` |
| `node scripts/ops/audit-pilot-critical-chains.mjs` | static page→action→service chain audit |

---

## Pre-flight checklist (before deploy)

- [ ] Node **22.x** installed (`node -v`)
- [ ] `npm ci` completes without errors
- [ ] `bash scripts/ops/pilot-preflight.sh` → **PILOT PREFLIGHT: PASS**
- [ ] `.env.staging` from `.env.staging.template` / Vercel env: all required variables from section 2
- [ ] `ENABLE_EXPERIMENTAL_CRONS` is **unset** (not `true`)
- [ ] `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` for pilot tenants
- [ ] DBA sign-off received before `workspace:backfill:all`

---

## 1. Checkout and install

```bash
git clone <repo> kitchenos && cd kitchenos
git checkout main   # or release tag signed by TL
npm ci              # Node 22.x only (see package.json engines)
```

**Verify:** `node -v` → `v22.x`

---

## 2. Environment (`.env.staging` or Vercel project env)

| Variable | Required | Notes |
|----------|:--------:|-------|
| `DATABASE_URL` | Yes | Pooled Supabase URL |
| `DIRECT_URL` | Yes | Direct connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key only |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server only** — never `NEXT_PUBLIC_*` |
| `CRON_SECRET` | Yes | Bearer for `/api/cron/*` (production tier) |
| `STRIPE_SECRET_KEY` | Yes | If storefront checkout enabled |
| `STRIPE_WEBHOOK_SECRET` | Yes | Storefront + billing webhooks |
| `RESEND_API_KEY` | Optional | Transactional email |
| `RATE_LIMIT_ADAPTER` | **Yes (pilot)** | Set `upstash` |
| `UPSTASH_REDIS_REST_URL` | With upstash | From Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | With upstash | From Upstash console |
| `NEXT_PUBLIC_NAV_RELEASE_PROFILE` | **Yes** | `pilot` |
| `NEXT_PUBLIC_APP_URL` | Yes | Staging URL (CSRF origin checks) |
| `ENABLE_EXPERIMENTAL_CRONS` | **Must be unset** | Experimental crons return 404 in prod |
| `SENTRY_DSN` | Recommended | Error + experimental cron warnings |

**Do not set:** `ENABLE_EXPERIMENTAL_CRONS=true` on staging pilot unless explicitly running a research drill.

---

## 3. Database

```bash
npx prisma migrate deploy
npm run workspace:preflight          # read-only counts
npm run workspace:backfill:all       # after DBA sign-off only
npm run workspace:backfill:status    # exit 0 when complete
```

**Verify:** `workspace:backfill:status` prints all phases OK.

---

## 4. Code gate (local or CI runner)

```bash
bash scripts/ops/pilot-preflight.sh
```

**Verify:** final line `PILOT PREFLIGHT: PASS`

---

## 5. Vercel deploy

1. Push env to Vercel project (staging).
2. Sync production crons only:

   ```bash
   npm run vercel:crons:production
   ```

   Confirm `vercel.json` lists **10** paths from `services/cron/production-manifest.ts`.

3. Deploy / redeploy preview or production target.
4. **Verify health:** `curl -sf https://<staging-host>/api/health`

---

## 6. Post-deploy smoke

```bash
export PLAYWRIGHT_BASE_URL=https://<staging-host>
npm run test:e2e:pilot    # requires E2E_PILOT_* secrets
npm run smoke:golden-path-http   # optional HTTP-only path
```

Manual: `docs/PILOT_GOLDEN_PATH_CHECKLIST.md` (Signup → Order → Production → Packing).

---

## 7. Monitoring

| Cron | Schedule (manifest) | Alert if |
|------|---------------------|----------|
| `webhook-jobs` | `*/5 * * * *` | No success 15m |
| `storefront-edge-sync` | `*/2 * * * *` | DLQ growth |
| `storefront-cart-recovery` | `*/30 * * * *` | Error rate > 5% |
| `reminders` | `0 14 * * *` | Daily miss |

See `docs/CRON_INVENTORY.md` § Pilot Production Cron List.

---

## Rollback

If staging shows critical errors:

1. Stop or roll back the Vercel deployment (previous successful deployment).
2. If a migration must be reversed: `npx prisma migrate resolve --rolled-back <migration_name>` — **only with DBA approval**.
3. Confirm `ENABLE_EXPERIMENTAL_CRONS` remains unset.
4. Post in `#incidents` with timeline and affected operators.

---

## Health checks after deploy

- [ ] `GET /api/health` → **200**
- [ ] `GET /login` → **200**
- [ ] `POST /api/cron/webhook-jobs` with `Authorization: Bearer $CRON_SECRET` → **200** (or empty queue OK)
- [ ] Vercel Cron dashboard lists **only 10** paths from `services/cron/production-manifest.ts`
- [ ] Sentry: no spike in 5xx in first 30 minutes
