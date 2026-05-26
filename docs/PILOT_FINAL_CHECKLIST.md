# KitchenOS Pilot — Final Checklist

**Last updated:** 19 May 2026

---

## Pre-Staging (Developer) — DONE

- [x] All static checks PASS (typecheck, lint, 604 tests, build, preflight)
- [x] Critical chains audited (`node scripts/ops/audit-pilot-critical-chains.mjs`)
- [x] Pilot-hot `loading.tsx` / `error.tsx` on 9 dashboard segments
- [x] POS refund idempotency (order `paymentStatus` + Stripe idempotency key)
- [x] Documentation updated (`PILOT_100_PERCENT_READY.md`, `PILOT_KNOWN_ISSUES.md`)
- [x] Ops redeploy guide: `docs/OPS_VERCEL_REDEPLOY.md`
- [x] `verify-staging.sh` detects `DEPLOYMENT_NOT_FOUND`

---

## Staging (Ops) — PENDING

**Start:** [PILOT_HANDOFF_FINAL.md](./PILOT_HANDOFF_FINAL.md)

- [ ] Vercel redeploy — see [OPS_VERCEL_REDEPLOY.md](./OPS_VERCEL_REDEPLOY.md)
- [ ] New staging URL obtained
- [ ] `.env.staging.local` updated: `NEXT_PUBLIC_APP_URL`, `STAGING_URL`
- [ ] `npm run verify:staging-env` → PASS (with Upstash on Vercel)
- [ ] `bash scripts/ops/deploy-staging.sh` → SUCCESS (or manual Vercel redeploy)
- [ ] `bash scripts/ops/pilot-go.sh` → GO (verify-staging + E2E HTTP)
- [ ] `GET /api/health` → HTTP 200 or 503 (not 404)

---

## E2E (QA) — PENDING (needs live URL)

- [ ] `export PLAYWRIGHT_BASE_URL=$STAGING_URL`
- [ ] `npm run test:e2e:pilot:http` → PASS
- [ ] `export E2E_PILOT_EMAIL=…` `export E2E_PILOT_PASSWORD=…`
- [ ] `npm run test:e2e:pilot` → PASS
- [ ] Manual golden path checklist → ALL PASS (`docs/PILOT_STAGING_RUNBOOK.md`)

---

## Load Test (Ops/QA)

- [ ] 10 concurrent operators → p95 &lt; 3s
- [ ] 0 errors (5xx)
- [ ] No degradation &gt;20%

---

## Go/No-Go (Management)

- [ ] CEO sign-off
- [ ] Sales sign-off (`docs/CAPABILITY_SIGNOFF_SALES.md` if present)
- [ ] Support team ready
- [ ] Monitoring configured (Sentry, Vercel, Upstash)

---

## Production (Ops)

- [ ] Production deploy from signed tag/branch
- [ ] Vercel Cron — 10 production paths only
- [ ] `ENABLE_EXPERIMENTAL_CRONS=false`
- [ ] `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`
- [ ] First 3 operators invited

---

## One command for Ops (after redeploy)

```bash
export STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app
bash scripts/ops/pilot-go.sh
```
