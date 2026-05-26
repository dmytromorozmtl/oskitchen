# KitchenOS Pilot Launch Plan — 18 May 2026

**Code baseline:** post–18 May hardening (Phases U–Z verified 18 May 2026)  
**Go/No-Go owner:** Release Commander + CEO  
**Companion:** `docs/PILOT_FINAL_SIGNOFF_18MAY.md`, `docs/PILOT_STAGING_RUNBOOK.md`

**Static gate evidence (19 May final):** `npm ci` · typecheck · lint · **605** tests · build · `pilot-preflight.sh` — all **PASS** on Node 22.22.3.

**Ops handoff:** `docs/PILOT_HANDOFF_FINAL.md` · Go/No-Go: `bash scripts/ops/pilot-go.sh`

---

## Pre-Launch (Staging)

### Day 0 — Ops unblock (19 May 2026)

| Owner | Task |
|-------|------|
| Ops | Read `docs/PILOT_HANDOFF_FINAL.md` |
| Ops | Redeploy Vercel → `docs/OPS_VERCEL_REDEPLOY.md` |
| Ops | `bash scripts/ops/verify-staging.sh` then `bash scripts/ops/pilot-go.sh` |
| QA | `npm run test:e2e:pilot` (after `E2E_PILOT_*` set) |

### Day 1 — Tuesday 20 May 2026 (delayed until staging URL live)

| Owner | Task | Verify |
|-------|------|--------|
| Ops | Deploy staging per `docs/PILOT_STAGING_RUNBOOK.md` §1–5 | `curl -sf https://<staging>/api/health` → 200 |
| Ops | `npx prisma migrate deploy` | exit 0 |
| Ops | `npm run workspace:preflight` | counts printed; DBA sign-off before backfill |
| Ops | `RATE_LIMIT_ADAPTER=upstash` + Upstash env | preflight no Upstash placeholder warnings |
| QA | `PLAYWRIGHT_BASE_URL=<staging> npm run test:e2e:pilot` | all pass |
| QA | Manual golden path: signup → order → production → packing | checklist in `docs/PILOT_GOLDEN_PATH_CHECKLIST.md` |

### Day 2 — Tuesday 20 May 2026

| Owner | Task | Verify |
|-------|------|--------|
| Ops | `npm run workspace:backfill:all` (after DBA OK) | `npm run workspace:backfill:status` → exit 0 |
| Ops | `npm run vercel:crons:production` → deploy | `vercel.json` has **10** cron paths |
| QA | Load smoke: 10 concurrent dashboard sessions (manual or k6) | p95 &lt; 3s on Today/orders; no 5xx |
| Support | Staging drill: POS sale, storefront Stripe test mode, refund, webhook retry UI | runbook notes filed |

### Day 3 — Wednesday 21 May 2026

| Owner | Task | Verify |
|-------|------|--------|
| Sales | Sign `docs/CAPABILITY_SIGNOFF_SALES.md` | signed PDF in drive |
| CEO | Sign-off on pilot scope & support SLA | email to `#launch-pilot` |
| All | Go/No-Go meeting | criteria below |

---

## Launch (Production)

### Day 4 — Friday 23 May 2026 (earliest first paid operator — after Day 0 green)

| Owner | Task | Verify |
|-------|------|--------|
| Ops | Production deploy (canary: single region / low traffic 1h) | Sentry error rate baseline |
| Ops | `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` for pilot tenants | hidden routes show banner only |
| Ops | Confirm `ENABLE_EXPERIMENTAL_CRONS` unset | experimental cron → 404 |
| Support | Enable pilot support channel | playbook linked |
| Onboarding | Invite **first 3** operators (white-glove) | onboarding checklist complete each |

### Day 5–7 — First week

| Owner | Task |
|-------|------|
| Ops + Eng | Daily: `docs/PILOT_MONITORING_DASHBOARD.md` checklist |
| CS | Daily touchpoint with each pilot operator |
| Eng | Friday retro: expand pilot or hold |

---

## Go/No-Go criteria

Pilot **does not** launch if any of:

- ❌ Any `test:e2e:pilot` failure on staging
- ❌ Load smoke shows &gt;20% degradation vs baseline at ~10 operators
- ❌ Payment drill fails (Stripe checkout + webhook → paid order state)
- ❌ Security issue: cross-tenant data visible in QA
- ❌ `workspace:backfill:status` not OK when DBA required it
- ❌ Vercel schedules experimental crons in production UI

---

## Rollback (production)

1. Revert Vercel deployment to previous release tag.
2. Do **not** roll back DB migrations without DBA.
3. Disable new operator invites; communicate via status page if needed.

See `docs/PILOT_STAGING_RUNBOOK.md` rollback section.
