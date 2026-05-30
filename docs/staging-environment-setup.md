# Staging Environment Setup

**Audience:** DevOps, VP Operations, Integration engineering  
**Policy:** `era17-p0-staging-proof-unblock-v1`  
**Related:** [`ops-vault-matrix.md`](./ops-vault-matrix.md) · [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) · [`vercel-env-vars.md`](./vercel-env-vars.md)

---

## Purpose

This guide walks through provisioning the **KitchenOS staging environment** so P0 proofs can run honestly:

- GitHub Actions staging workflows (`e2e-staging.yml`, `playwright-kds-staging.yml`, `woo-shopify-staging-smoke.yml`)
- Local ops smokes (`smoke:staging-workflows-first-green`, `smoke:p0-staging-proof-unblock`)
- Playwright E2E against a live staging URL

**Honesty rule:** Missing `E2E_STAGING_BASE_URL` or login credentials → workflows **omit** the staging job (`JOB_OMITTED_SECRETS_MISSING`), not a silent green pass.

---

## Prerequisites

| Role | Responsibility |
|------|----------------|
| **DevOps** | Vercel preview/staging deploy, Supabase staging project, GitHub Actions secrets |
| **VP Operations** | Sign [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md), track 11/11 vault secrets |
| **Integration engineer** | Woo/Shopify test stores, channel smoke tenant |

---

## Step 1 — Vercel staging deployment

### 1.1 Create or designate a staging project

1. Open [Vercel dashboard](https://vercel.com) → select the KitchenOS project (or create a dedicated **staging** project).
2. Connect the `main` branch (or a long-lived `staging` branch) for automatic preview deploys.
3. Record the deployment URL — this becomes `E2E_STAGING_BASE_URL`.

**Recommended URL patterns:**

| Pattern | Example | Notes |
|---------|---------|-------|
| Dedicated staging domain | `https://staging.kitchenos.app` | Best for stable E2E; configure DNS CNAME to Vercel |
| Vercel preview alias | `https://kitchenos-staging.vercel.app` | Stable alias on a preview deployment |
| Branch preview | `https://kitchenos-git-staging-*.vercel.app` | Acceptable for initial setup; update secrets if URL changes |

### 1.2 Configure Vercel environment variables (Preview / Staging)

Set variables for the **Preview** environment (or a dedicated **Staging** environment if using Vercel env scoping). See [`vercel-env-vars.md`](./vercel-env-vars.md) for the full list.

**Minimum for P0 Phase 1 (staging login):**

| Variable | Example / format | Required |
|----------|------------------|----------|
| `NEXT_PUBLIC_APP_URL` | Same as staging URL | Yes |
| `NEXT_PUBLIC_APP_ENV` | `staging` | Yes |
| `DATABASE_URL` | Supabase pooler URL (`:6543`, `pgbouncer=true`) | Yes (Phase 2+) |
| `DIRECT_URL` | Supabase direct URL (`:5432`) | Yes (migrations) |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` | Yes (Phase 2+) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes |
| `CRON_SECRET` | Random string | Yes |
| `STRIPE_SECRET_KEY` | `sk_test_*` only | Yes (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Test webhook secret | Yes |

Use **Stripe test mode** and a **separate Supabase staging project** — never point staging at production Postgres or live Stripe keys.

### 1.3 Deploy and verify health

```bash
# Replace with your staging URL
export E2E_STAGING_BASE_URL='https://staging.kitchenos.app'
curl -fsS "$E2E_STAGING_BASE_URL/api/health" | head -c 400
```

**Pass criteria:** HTTP 200 with a JSON health payload. If this fails, fix deploy/env before proceeding.

---

## Step 2 — Staging database provisioning

### 2.1 Create Supabase staging project

1. Supabase dashboard → **New project** (e.g. `kitchenos-staging`).
2. Copy **pooler** and **direct** connection strings into Vercel env vars (`DATABASE_URL`, `DIRECT_URL`).
3. Run migrations against staging:

```bash
export DATABASE_URL='postgresql://…'   # staging direct or pooler for migrate
npx prisma migrate deploy
```

### 2.2 Seed test workspace (optional but recommended)

Create at least one workspace with a known owner email for E2E login and channel smokes:

- Owner email → will map to `E2E_LOGIN_EMAIL` and optionally `CHANNEL_SMOKE_OWNER_EMAIL`
- Assign `orders.manage`, `integrations.read`, and dashboard permissions for the test user

Document the workspace UUID if needed for SSO smokes (`SSO_STAGING_WORKSPACE_ID`).

---

## Step 3 — Test user creation

### 3.1 Dashboard login user

Create a staff user on the staging workspace:

| Field | Maps to |
|-------|---------|
| Email | `E2E_LOGIN_EMAIL` |
| Password | `E2E_LOGIN_PASSWORD` |

**Requirements:**

- User can sign in at `{E2E_STAGING_BASE_URL}/login`
- User has permissions to access `/dashboard/today` and read-only navigation used by `e2e/dashboard-auth.spec.ts`
- Password stored in company secrets manager — **never commit to git**

### 3.2 Channel smoke owner (Phase 3)

If running Woo/Shopify live smokes, set `CHANNEL_SMOKE_OWNER_EMAIL` to the workspace owner email that owns the test Woo/Shopify connection rows in staging Postgres.

---

## Step 4 — GitHub Actions secrets configuration

Navigate: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

### Phase 1 — Staging login (unblocks E2E workflows)

| Secret | Value | Verify |
|--------|-------|--------|
| `E2E_STAGING_BASE_URL` | Staging URL from Step 1 | `curl -fsS "$URL/api/health"` |
| `E2E_LOGIN_EMAIL` | Test user email | User exists on staging |
| `E2E_LOGIN_PASSWORD` | Test user password | Manual login works |

**Legacy alias:** `E2E_PASSWORD` is accepted in CI as an alias for `E2E_LOGIN_PASSWORD`. Prefer the canonical name for new repos.

Deep dive: [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md)

### Phase 2–3 — Database + channel (unblocks Woo/Shopify smoke)

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Staging Postgres pooler URL |
| `ENCRYPTION_KEY` | Same value as Vercel staging deploy |
| `CHANNEL_SMOKE_OWNER_EMAIL` | Workspace owner for channel tenant |

### Phase 4 — SSO IdP (unblocks enterprise SSO smoke)

| Secret | Value |
|--------|-------|
| `SSO_STAGING_WORKSPACE_ID` | Pilot workspace UUID |
| `SSO_STAGING_IDP_VENDOR` | `OKTA` or `ENTRA_ID` |
| `SSO_STAGING_ALLOWED_DOMAIN` | Allowed email domain |
| `SSO_STAGING_TEST_EMAIL` | Staff user in allowed domain |
| `SSO_STAGING_SUPABASE_PROVIDER_REF` | Supabase Auth SAML provider ref |

Full matrix: [`ops-vault-matrix.md`](./ops-vault-matrix.md)

---

## Step 5 — Trigger first-green GitHub workflows

After Phase 1 secrets are set:

1. **Actions → E2E Staging** → **Run workflow** → confirm `staging-e2e` job **appears** and completes green.
2. **Actions → Playwright KDS Staging** → **Run workflow** → download `kds-realtime-e2e-staging-summary` artifact.
3. (Optional) **Actions → Woo Shopify Staging Smoke** → after Phase 2–3 secrets are set.

**Expected when secrets missing:** Job is **omitted** from the workflow run — this is **not** a pass.

### Record GitHub run evidence (Era 17+)

After manual workflow dispatch, export run URLs for local smokes:

```bash
export GITHUB_E2E_STAGING_RUN_URL='https://github.com/org/repo/actions/runs/…'
export GITHUB_E2E_STAGING_RUN_OUTCOME='PASSED'
export GITHUB_KDS_STAGING_RUN_URL='…'
export GITHUB_KDS_STAGING_RUN_OUTCOME='PASSED'
```

Target: **≥2/3** tracked workflows with `outcome: PASSED` for `firstGreenProofStatus: proof_passed`.

---

## Step 6 — Local verification

### 6.1 Vault readiness check

```bash
export E2E_STAGING_BASE_URL='https://staging.kitchenos.app'
export E2E_LOGIN_EMAIL='ops-test@example.com'
export E2E_LOGIN_PASSWORD='…'

npm run check-vault-readiness -- --write
cat artifacts/vault-readiness-report.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['presentCount'], '/', d['totalCount'], 'vaultReady=', d['vaultReady'])"
```

**Pass criteria:** `presentCount: 11`, `vaultReady: true` (after all 11 secrets configured).

### 6.2 Staging workflows first green

```bash
npm run smoke:staging-workflows-first-green
```

Review `artifacts/staging-workflows-first-green-summary.json`.

### 6.3 P0 staging proof unblock (all phases)

After all 11 env vars are set:

```bash
npm run smoke:p0-staging-proof-unblock
```

Review `artifacts/p0-staging-proof-unblock-summary.json` — target `p0ProofStatus: proof_passed`.

---

## Step 7 — Playwright local parity

```bash
export PLAYWRIGHT_BASE_URL="$E2E_STAGING_BASE_URL"
export E2E_LOGIN_EMAIL='ops-test@example.com'
export E2E_LOGIN_PASSWORD='…'

npx playwright test e2e/auth.setup.ts --project=setup
npx playwright test e2e/smoke.spec.ts e2e/dashboard-auth.spec.ts --project=chromium-authed
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Staging job missing in GitHub Actions | Secrets not set | Add `E2E_STAGING_*` secrets; re-run workflow |
| `GET /api/health` fails | Deploy failed or wrong URL | Check Vercel deploy logs; verify `NEXT_PUBLIC_APP_URL` |
| Login fails in Playwright | Wrong credentials or user missing | Re-create test user on staging; update secrets |
| `vaultReady: false` | Not all 11 vars exported | Run `npm run ops:validate-p0-vault-env` for missing list |
| Channel smoke SKIPPED | `DATABASE_URL` / `ENCRYPTION_KEY` missing | Complete Phase 2–3 in ops vault matrix |
| SSO smoke SKIPPED | `SSO_STAGING_*` vars missing | Complete Phase 4; see [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) |

---

## Verification checklist

- [ ] Staging URL serves `GET /api/health` → 200
- [ ] Vercel Preview/Staging env vars match [`vercel-env-vars.md`](./vercel-env-vars.md)
- [ ] Staging Supabase project migrated (`prisma migrate deploy`)
- [ ] Test dashboard user can log in manually
- [ ] GitHub secrets: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`
- [ ] `e2e-staging.yml` workflow_dispatch → job runs green
- [ ] `npm run check-vault-readiness -- --write` → `vaultReady: true` (11/11)
- [ ] `npm run smoke:p0-staging-proof-unblock` → `p0ProofStatus: proof_passed`

---

## Human gate

Steps 1–6 require **DevOps and VP Operations** action. The execution agent cannot provision Vercel projects, Supabase credentials, or GitHub secrets. Track progress in [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md).
