# KitchenOS — Ops Runtime Verification Report

**Role:** Lead DevOps / SRE  
**Date:** 19 May 2026  
**Scope:** Phases 1–8 (staging → production pilot)  
**Code baseline:** READY_FOR_PILOT (static gates PASS)

---

## 1. STATUS SUMMARY

| Item | Value |
|------|--------|
| Phases completed | **Phase 1 partial** (1.1 local, 1.2 env audit, 1.3 DB checks) |
| Stopped at | **Phase 1.6 — Health checks FAIL** |
| Overall status | **IN_PROGRESS** · **NO-GO** for paid pilot |
| Blocker class | **Staging deploy does not exist on Vercel** |

---

## 2. PHASE RESULTS

### Phase 1 — Staging deploy (Day 1)

#### 1.1 — Local prep ✅

| Step | Result | Evidence |
|------|--------|----------|
| Node 22 | **PASS** | v22.22.3 |
| `npm ci` | **PASS** | (prior session; deps present) |
| `pilot-preflight.sh` | **PASS** | `PILOT PREFLIGHT: PASS` (SKIP_BUILD=1) |
| Git clone `pilot-18may` | **SKIP** | Workspace has **no `.git`** — use canonical repo |

#### 1.2 — Environment (`.env.staging.local`) ⚠️

Audited **set/unset only** (no secret values logged):

| Variable | Status |
|----------|--------|
| DATABASE_URL, DIRECT_URL | SET |
| Supabase (URL, anon, service role) | SET |
| CRON_SECRET, STRIPE_*, ENCRYPTION_KEY | SET |
| NEXT_PUBLIC_APP_URL | SET → `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app` |
| ENABLE_EXPERIMENTAL_CRONS | OK (not `true`) |
| **NEXT_PUBLIC_NAV_RELEASE_PROFILE** | **UNSET** (need `pilot`) |
| **UPSTASH_REDIS_REST_URL / TOKEN** | **UNSET** |
| RATE_LIMIT_ADAPTER | `memory` in shell after source (see note) |
| SENTRY_DSN | UNSET |

`npm run verify:staging-env` → **FAIL**

- Missing Upstash credentials  
- Reports `RATE_LIMIT_ADAPTER` not `upstash` (script strict mode; local file may differ from Vercel)

**Runbook correction:** use `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (not `UPSTASH_REDIS_URL` from generic prompt).

#### 1.3 — Database ✅ (against staging credentials in `.env.staging.local`)

| Command | Result |
|---------|--------|
| `workspace:backfill:status` | **PASS** — all tracked tables OK, 0 NULL `workspace_id` |
| `workspace:preflight` | **PASS** — backfill complete, 3 workspaces |

`npx prisma migrate status` when run without explicit staging load used default `.env` — **re-run on Vercel/CI with staging env** before deploy sign-off.

#### 1.4 — Vercel deploy ❌ **BLOCKER**

- `vercel` CLI not verified in agent PATH  
- **No live deployment** at configured staging URL  

#### 1.5 — Vercel Cron (repo config only) ✅

`vercel.json` contains **exactly 10** production cron paths (matches manifest).

**Runtime verification** requires live Vercel project + dashboard review.

#### 1.6 — Health checks ❌ **STOP**

Probed: `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app`

| Endpoint | Expected | Actual |
|----------|----------|--------|
| `/api/health` | 200 JSON | **404** `DEPLOYMENT_NOT_FOUND` |
| `/login` | 200 | **404** |
| `/s/test-store/menu` | 200/404 | **404** |
| `/api/cron/webhook-jobs` (no auth) | 401 | **404** |
| `/api/cron/martian-orbital-dtn-relay-sync` | 404 | **404** (cannot distinguish gate vs missing deploy) |

`npm run pilot:deploy:gate -- --url=…` → **No live deploy** (wrote `docs/generated/PILOT_DEPLOY_VERCEL_CHECKLIST.md`).

Also probed production alias `https://xn---production-xijza32a.vercel.app` → **404** on health/login.

---

### Phases 2–8 — NOT EXECUTED (blocked)

| Phase | Status | Reason |
|-------|--------|--------|
| 2 E2E + golden path | **NOT RUN** | No staging URL; `E2E_PILOT_*` / `PLAYWRIGHT_BASE_URL` not set |
| 3 Load test | **NOT RUN** | No live app |
| 4 Monitoring | **NOT RUN** | Requires deployed app + dashboards |
| 5 Go/No-Go | **NO-GO** | Deploy + E2E + load + sign-offs missing |
| 6 Production | **NOT RUN** | Gated on Phase 5 |
| 7 First week | **NOT RUN** | — |
| 8 Retro | **NOT RUN** | — |

---

## 3. BLOCKERS

| ID | Blocker | Owner | ETA guidance |
|----|---------|-------|----------------|
| **B1** | Staging Vercel deployment missing / URL stale | **Ops** | Same day — redeploy preview; update `NEXT_PUBLIC_APP_URL` |
| **B2** | Upstash not configured on staging | **Ops** | Same day — console.upstash.com → Vercel env |
| **B3** | `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` unset | **Ops** | Same day — Vercel env |
| **B4** | E2E secrets not configured | **Ops/QA** | After B1 — `PLAYWRIGHT_BASE_URL`, `E2E_PILOT_EMAIL/PASSWORD` |
| **B5** | Manual golden path + CEO/Sales sign-off | **Product/CEO** | After B1–B4 green |

---

## 4. NEXT STEPS (ordered)

1. **Ops:** Redeploy staging from `main` / `pilot-18may` in Vercel; confirm new preview URL.  
2. **Ops:** Push env via `npm run vercel:staging-push` (or dashboard): Upstash, `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`, `SENTRY_DSN`.  
3. **Ops:** `npm run verify:staging-env` → must PASS.  
4. **Ops:** Re-run health checks + `npm run pilot:deploy:gate -- --url=<new-url>`.  
5. **QA:** `PLAYWRIGHT_BASE_URL=<url> npm run test:e2e:pilot` + manual `docs/PILOT_GOLDEN_PATH_CHECKLIST.md`.  
6. **Ops:** Load smoke (10 concurrent) per launch plan.  
7. **All:** Go/No-Go meeting — only if table in Phase 5 is green.

---

## 5. RECOMMENDATION

**Do not launch paid pilot operators.** Code is ready; **runtime platform is not.**

Staging must show **200 on `/api/health`**, **401 on unauthenticated cron**, and **E2E + golden path PASS** before moving the launch date (earliest production invite: **after** green re-run of Phases 1–5, likely **≥2 business days** after deploy fix).

---

## Appendix — Commands to re-run after deploy fix

```bash
export STAGING_URL="https://<new-preview>.vercel.app"
curl -sf "$STAGING_URL/api/health" | jq .
curl -s -o /dev/null -w "%{http_code}\n" "$STAGING_URL/login"
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $CRON_SECRET" "$STAGING_URL/api/cron/webhook-jobs"

set -a && source .env.staging.local && set +a
npm run verify:staging-env
npm run workspace:backfill:status
npm run pilot:deploy:gate -- --url="$STAGING_URL"

export PLAYWRIGHT_BASE_URL="$STAGING_URL"
export E2E_PILOT_EMAIL=...
export E2E_PILOT_PASSWORD=...
npm run test:e2e:pilot
```

*Signed: Lead DevOps / SRE (automated verification pass), 19 May 2026*
