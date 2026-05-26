# Storefront release day runbook

**Audience:** Engineering + Ops  
**Time:** 3–5 hours (first time); ~90 min per repeat release  
**Prerequisites:** Staging deploy green; prod Vercel project access; GitHub admin

> **Master checklist:** [`docs/STOREFRONT_RELEASE_EXECUTION.md`](../STOREFRONT_RELEASE_EXECUTION.md)  
> **Vercel secrets table:** [`docs/STOREFRONT_VERCEL_SECRETS_MATRIX.md`](../STOREFRONT_VERCEL_SECRETS_MATRIX.md)

---

## 0. Preflight (local, 10 min)

```bash
cp .env.storefront.production.example .env.production.local
# fill from 1Password — never commit
set -a && source .env.production.local && set +a

npm run storefront:release-preflight
# → docs/artifacts/storefront-preflight-latest.md
# → docs/artifacts/storefront-env-report-latest.md
```

Expected: `check-env:storefront` critical OK; `npm test` green; `vercel.json` shows **6** crons.

---

## 1. Vercel production secrets (A2)

| Variable | Vercel scope | Notes |
|----------|--------------|-------|
| `DATABASE_URL` | Production | Transaction pooler `:6543` + `pgbouncer=true` |
| `DIRECT_URL` | Production | Session pooler `:5432` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://…` no trailing `/` |
| `STOREFRONT_MIDDLEWARE_SECRET` | Production | `openssl rand -base64 32` |
| `CRON_SECRET` | Production | `openssl rand -base64 32` |
| `AUTH_SECRET` | Production | Same as dashboard auth |
| `RESEND_*` | Production | If email enabled |

**Verify:** Vercel → Deployments → latest → Functions logs: no mass `401` on `/api/cron/*`.

```bash
npm run check-env:storefront
# Stripe path:
STOREFRONT_CHECK_STRIPE=1 npm run check-env:storefront
```

**Launch tab:** `/dashboard/storefront/launch` → **Production & ops readiness** should show critical OK on prod after deploy.

---

## 2. Stripe decision (A3)

1. Read `docs/STOREFRONT_STRIPE_LAUNCH_DECISION.md`
2. Sign [`docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](../artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md) (Option A recommended)
3. Apply in **Ordering** tab to match decision

| Option | Ordering settings | Vercel extras |
|--------|-------------------|---------------|
| A | Pay later only ✓, Online payments ✗ | No Stripe keys |
| B | Online payments ✓, Pay later only ✗ | Stripe keys + webhook |

---

## 3. Staging smoke + QA artifact (A1)

```bash
export STOREFRONT_SMOKE_BASE_URL=https://<staging-host>
export STOREFRONT_SMOKE_SLUG=<published-slug>
export STOREFRONT_STRIPE_OPTION=A   # or B
npm run storefront:qa-artifact
```

Output: `docs/artifacts/storefront-qa-release-<date>.md` (HTTP smoke + manual checklist)

**Manual (15 min):** complete remaining rows in artifact:
- Pay-later checkout E2E
- Promo / blackout / honeypot (see `docs/STOREFRONT_QA_CHECKLIST.md`)

Attach artifact to release PR; Product + Eng sign-off table at bottom.

---

## 4. GitHub branch protection (B1 setup)

```bash
# Requires gh auth login + admin on repo
npm run github:storefront-gates
```

Or manually: **Settings → Branches → main → Require status checks:**
- `quality` (CI workflow)
- `Storefront staging gate` / `gate`
- `storefront-e2e` (Playwright storefront) — when `PLAYWRIGHT_BASE_URL` is set

Repo variables (Settings → Secrets and variables → Actions → Variables):
- `PLAYWRIGHT_BASE_URL` = staging URL
- `E2E_STOREFRONT_SLUG` or secret `E2E_STORE_SLUG`
- Optional: `STOREFRONT_CHECK_STRIPE=1` for gate env check

---

## 5. Deploy production (A4)

**Production Vercel project** must use repo `vercel.json` with **6 crons** (already on `main`):

```bash
jq '.crons | length' vercel.json   # expect 6
```

**Staging Vercel project** (separate): before deploy restore full crons:

```bash
npm run vercel:crons:staging
git commit -am "chore: staging cron profile"   # only on staging branch/project
```

Deploy order:
1. `prisma migrate deploy` (Vercel build or manual)
2. Promote staging → production or merge `main`
3. Post-deploy:

```bash
export STOREFRONT_SMOKE_BASE_URL=https://<prod>
export STOREFRONT_SMOKE_SLUG=<slug>
npm run storefront:post-deploy
```

**Rollback:** Dashboard → Storefront → disable **Enabled** → public 404 immediately.

---

## 6. Post-release (24h)

- [ ] Order Hub: test order visible
- [ ] Cron logs: 6 jobs succeeding
- [ ] No Stripe webhook errors (if Option B)
- [ ] `docs/runbooks/STOREFRONT_OUTAGE_RUNBOOK.md` bookmarked

---

## Week 1 → see `docs/STOREFRONT_WEEK1_HARDENING.md`

## Weeks 2–4 → see `docs/STOREFRONT_PHASE_C_ROADMAP.md`
