# OS Kitchen Pilot — Handoff Package

**Date:** 19 May 2026  
**Status:** **CODE 100% READY** — **AWAITING STAGING REDEPLOY**

---

## What this is

OS Kitchen is a B2B platform for food operators. **Application code, tests, docs, and ops scripts are complete.** Your job is to bring staging back online on Vercel, verify HTTP + E2E, then follow the Go/No-Go checklist.

**Do not contact engineering for:** env template layout, deploy commands, or verification scripts — everything is below.

---

## What you need (30–60 minutes)

### Step 1 — Redeploy staging (~5 min)

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → project **OS Kitchen** → **Deployments**
2. **Redeploy** the latest `main` or `pilot-18may` build (or push to trigger CI)
3. Copy the new preview URL (`https://….vercel.app`)

**Detailed steps:** [OPS_VERCEL_REDEPLOY.md](./OPS_VERCEL_REDEPLOY.md)

### Step 2 — Record the URL

```bash
cd /path/to/OS Kitchen
echo "STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app" > .staging-deploy-url
```

Update `.env.staging.local`:

```bash
NEXT_PUBLIC_APP_URL=https://YOUR-NEW-PREVIEW.vercel.app
```

### Step 3 — Verify staging is alive

```bash
export STAGING_URL=https://YOUR-NEW-PREVIEW.vercel.app
bash scripts/ops/verify-staging.sh
```

Expected: `STATUS: PASS` (warnings on storefront slug or degraded DB are OK if documented).

### Step 4 — Go/No-Go gate (HTTP + E2E smoke)

```bash
bash scripts/ops/pilot-go.sh
```

Or manually:

```bash
export PLAYWRIGHT_BASE_URL=$STAGING_URL
npm run test:e2e:pilot:http
```

---

## After staging is green

| Next | Document |
|------|----------|
| Full checklist (staging → production) | [PILOT_FINAL_CHECKLIST.md](./PILOT_FINAL_CHECKLIST.md) |
| Day-by-day calendar | [PILOT_LAUNCH_PLAN_18MAY.md](./PILOT_LAUNCH_PLAN_18MAY.md) |
| Deep deploy steps | [PILOT_STAGING_RUNBOOK.md](./PILOT_STAGING_RUNBOOK.md) |
| Daily monitoring | [PILOT_MONITORING_DASHBOARD.md](./PILOT_MONITORING_DASHBOARD.md) |
| What you can sell | [CAPABILITY_SIGNOFF_SALES.md](./CAPABILITY_SIGNOFF_SALES.md) |

---

## If something fails

| Symptom | Action |
|---------|--------|
| `DEPLOYMENT_NOT_FOUND` | [OPS_VERCEL_REDEPLOY.md](./OPS_VERCEL_REDEPLOY.md) |
| Missing env vars | Fill `.env.staging.local` from `.env.staging.template`; run `npm run verify:staging-env` |
| E2E `Invalid URL` | `export PLAYWRIGHT_BASE_URL=$STAGING_URL` |
| Known product limits | [PILOT_KNOWN_ISSUES.md](./PILOT_KNOWN_ISSUES.md) |

**Engineering escalation:** see contacts / Slack in [PILOT_HANDOFF_MESSAGE.md](./PILOT_HANDOFF_MESSAGE.md).

---

## Key documents (read order)

1. **This file** — start here  
2. [OPS_STAGING_QUICKSTART.md](./OPS_STAGING_QUICKSTART.md) — command cheat sheet  
3. [PILOT_FINAL_CHECKLIST.md](./PILOT_FINAL_CHECKLIST.md) — complete gates  
4. [PILOT_100_PERCENT_READY.md](./PILOT_100_PERCENT_READY.md) — engineering verification report  

---

## Engineering sign-off

| Item | Status |
|------|--------|
| Code + tests | **100% READY** (605 tests, build PASS) |
| Ops scripts | **READY** |
| Live staging | **OPS ACTION REQUIRED** |
| Paid operators | **After Go/No-Go** — earliest **23 May 2026** (see launch plan) |
