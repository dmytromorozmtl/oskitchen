# GitHub secrets — E2E Staging workflow

Workflow: `.github/workflows/e2e-staging.yml` (daily 06:00 UTC + manual).

**Policy:** `era12-e2e-staging-secrets-align-v1` (`lib/ci/e2e-staging-secrets-era12-policy.ts`) — Playwright and `e2e/auth.setup.ts` use **`E2E_LOGIN_PASSWORD`**; workflows map GitHub secrets to that env name. Legacy secret name **`E2E_PASSWORD`** is accepted as an alias in CI only.

## Required repository secrets

| Secret | Example | Purpose |
|--------|---------|---------|
| `E2E_STAGING_BASE_URL` | `https://staging.kitchenos.app` | Playwright `PLAYWRIGHT_BASE_URL` |
| `E2E_LOGIN_EMAIL` | `workspace.moroz@gmail.com` | Dashboard login |
| `E2E_LOGIN_PASSWORD` | *(app password)* | Dashboard login (canonical) |

**Legacy alias:** `E2E_PASSWORD` — if your repo still uses this secret name, workflows accept it and map to `E2E_LOGIN_PASSWORD` in the job env. Prefer renaming to `E2E_LOGIN_PASSWORD` for parity with POS/KDS staging workflows.

## Optional repository variable

| Variable | Default | Purpose |
|----------|---------|---------|
| `E2E_STOREFRONT_SLUG` | `hello` | Runs `e2e/storefront.spec.ts` |

## Setup steps

1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each row above (use `E2E_LOGIN_PASSWORD`, not `E2E_PASSWORD`, for new repos)
3. **Variables** tab → add `E2E_STOREFRONT_SLUG` if not `hello`
4. **Actions** → **E2E Staging** → **Run workflow** → confirm green (job skipped entirely when secrets missing — not a silent pass)

## First-run ops (Era 13 + Era 15 recert)

**Policies:** `era13-staging-workflows-first-run-ops-v1`, `era15-staging-workflows-first-run-recert-v1` (`lib/ci/staging-workflows-first-run-era13-policy.ts`, `lib/ci/staging-workflows-first-run-era15-policy.ts`)  
**Smoke:** `npm run smoke:staging-workflows` (CI cert wiring — does not run GitHub Actions)

| Outcome | Meaning |
|---------|---------|
| `JOB_OMITTED_SECRETS_MISSING` | Required E2E secrets unset — the staging job **does not appear** in the workflow run (not a green pass) |
| `PASSED` | Job ran; all steps succeeded |
| `FAILED` | Job ran; at least one step failed |
| `SKIPPED WITH REASON` | KDS only — see `kds-realtime-e2e-staging-summary` artifact (`playwright-kds-staging.yml`) |

**Optional workflows (not in `ci.yml`):**

| Workflow | Job | Schedule / trigger |
|----------|-----|-------------------|
| `e2e-staging.yml` | `staging-e2e` | Daily 06:00 UTC + manual |
| `playwright-kds-staging.yml` | `kds-realtime-staging` | Weekly Monday 07:00 UTC + manual |
| `closed-beta-gate.yml` | `staging-smoke` | Manual after `security-bundle` |

**First green run checklist:**

1. Set `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` (or legacy `E2E_PASSWORD`) in GitHub Actions secrets.
2. **E2E Staging** → Run workflow → confirm `staging-e2e` job appears and completes green.
3. **Playwright KDS Staging** → Run workflow → confirm `kds-realtime-staging` + download `kds-realtime-e2e-staging-summary`.
4. **Closed Beta Gate** → Run workflow → `security-bundle` always; `staging-smoke` only when E2E secrets are set.

Cert: `npm run test:ci:staging-workflows-first-run-era13:cert` + `test:ci:staging-workflows-first-run-era15:cert` (chained in `test:ci:e2e-staging-secrets-era12:cert`).

## Era 15 staging workflows recert (2026-05-27)

**Policy:** `era15-staging-workflows-first-run-recert-v1` — re-validates optional workflow gates after Era 14/15 honesty cycles. **Does not** add staging Playwright to default `ci.yml`.

| Outcome | Still means |
|---------|----------------|
| `JOB_OMITTED_SECRETS_MISSING` | Secrets unset — staging job **absent** (not green) |
| `PASSED` / `FAILED` / `SKIPPED WITH REASON` | Job ran with explicit result (KDS summary artifact) |

**Ops:** Run `npm run smoke:staging-workflows` before telling buyers staging browser E2E is certified.

## Era 16 staging workflows first green evidence (2026-05-28)

**Policy:** `era16-staging-workflows-first-green-v1` (`lib/ci/staging-workflows-first-green-era16-policy.ts`, `lib/ci/staging-workflows-first-green-summary.ts`)  
**Smoke:** `npm run smoke:staging-workflows-first-green` — runs wiring cert (`smoke:staging-workflows`) + optional `GET /api/health` when `E2E_STAGING_BASE_URL` + login secrets are set locally  
**Artifact:** `artifacts/staging-workflows-first-green-summary.json` (`PASSED` / `FAILED` / `SKIPPED WITH REASON` per step); marker `staging-workflows-first-green`

| Step | Local smoke | GitHub Actions |
|------|-------------|----------------|
| Wiring cert | `smoke:staging-workflows` | N/A (repo cert only) |
| Staging secrets | Env check | `JOB_OMITTED_SECRETS_MISSING` when unset |
| Staging health | Optional `GET …/api/health` | N/A |
| First green recorded | **SKIPPED** — operator must run workflows | E2E Staging / KDS Staging / optional Woo Shopify Staging Smoke |

**Optional workflows in first-green registry:** `e2e-staging.yml`, `playwright-kds-staging.yml`, `closed-beta-gate.yml` (`staging-smoke`), `woo-shopify-staging-smoke.yml`.

Cert: `npm run test:ci:staging-workflows-first-green-era16:cert` (chained in `test:ci:e2e-staging-secrets-era12:cert`).

**Honest scope:** Does **not** claim staging E2E is green without a real GitHub workflow PASS. Does **not** add staging jobs to default `ci.yml`.

## Era 17 staging workflows first green (2026-05-28)

**Policy:** `era17-staging-workflows-first-green-v1` (`lib/ci/staging-workflows-first-green-era17-policy.ts`)  
**Marker:** `awaiting_github_first_green`  
**Smoke:** `npm run smoke:staging-workflows-first-green` — Era 17 orchestrator with explicit missing-env list + GitHub run URL recording  
**Artifact:** `artifacts/staging-workflows-first-green-summary.json` — adds `firstGreenProofStatus`, `missingEnvVars[]`, `githubRuns[]`, `githubPassedCount`

### Prerequisite env vars (local or GitHub secrets)

| Variable | Purpose |
|----------|---------|
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL |
| `E2E_LOGIN_EMAIL` | Dashboard login email |
| `E2E_LOGIN_PASSWORD` | Dashboard login password (legacy alias `E2E_PASSWORD`) |

### Operator GitHub evidence env vars (after workflow_dispatch)

| Variable | Workflow |
|----------|----------|
| `GITHUB_E2E_STAGING_RUN_URL` + `GITHUB_E2E_STAGING_RUN_OUTCOME` | `e2e-staging.yml` |
| `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME` | `playwright-kds-staging.yml` |
| `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME` | `woo-shopify-staging-smoke.yml` |

Outcome values: `PASSED`, `FAILED`, or `SKIPPED`.

**Era 17 commercial target:** `firstGreenProofStatus: proof_passed` when **≥2** of 3 workflows have `outcome: PASSED`. Missing secrets → `proof_skipped_missing_prerequisites` with full env list — not fake green.

Cert: `npm run test:ci:staging-workflows-first-green-era17:cert` (chained in `test:ci:e2e-staging-secrets-era12:cert`).

### Cycle execution record (2026-05-28)

**Policy:** `era17-staging-workflows-first-green-v1` — engineering complete; **awaiting_github_first_green**.

| Check | Result |
|-------|--------|
| Wiring cert (`smoke:staging-workflows`) | **PASSED** |
| Staging E2E secrets | **SKIPPED WITH REASON** — 3 env vars unset locally |
| Staging health | **SKIPPED** (prerequisites missing) |
| GitHub run evidence (E2E / KDS / Woo-Shopify) | **SKIPPED** — no `GITHUB_*_RUN_URL` recorded |
| Artifact | `artifacts/staging-workflows-first-green-summary.json` → `firstGreenProofStatus: proof_skipped_missing_prerequisites`; `githubPassedCount: 0/3` |

**Missing locally:** `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`.

**Ops unblock:** Configure GitHub Actions secrets → `workflow_dispatch` on `e2e-staging.yml` + at least one other tracked workflow → set `GITHUB_*_RUN_URL` + `GITHUB_*_RUN_OUTCOME` → re-run `npm run smoke:staging-workflows-first-green`. Target: **≥2/3** workflows `PASSED`.

**No false claim:** Staging E2E is **not** certified green without real GitHub workflow PASS URLs.

## Era 17 KDS staging Playwright proof (2026-05-28)

**Policy:** `era17-kds-staging-playwright-proof-v1` (`lib/kitchen/kds-staging-playwright-proof-era17-policy.ts`)  
**Marker:** `awaiting_github_kds_playwright_pass`  
**Workflow:** `.github/workflows/playwright-kds-staging.yml`  
**Smoke:** `npm run smoke:kds-staging-playwright`  
**Artifact:** `artifacts/kds-staging-playwright-proof-summary.json`

### Operator GitHub evidence env vars

| Variable | Workflow |
|----------|----------|
| `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME` | `playwright-kds-staging.yml` |

Cert: `npm run test:ci:kds-staging-playwright-proof-era17:cert` (chained in `test:ci:kds-staging-smoke:cert`).

### Cycle execution record (2026-05-28)

| Check | Result |
|-------|--------|
| Wiring cert (`smoke:kds-staging`) | **PASSED** |
| Staging E2E secrets | **SKIPPED WITH REASON** — 3 env vars unset locally |
| Staging health | **SKIPPED** (prerequisites missing) |
| GitHub KDS run evidence | **SKIPPED** — no `GITHUB_KDS_STAGING_RUN_URL` recorded |
| Artifact | `artifacts/kds-staging-playwright-proof-summary.json` → `playwrightProofStatus: proof_skipped_missing_prerequisites` |

**Ops unblock:** Configure GitHub Actions secrets → `workflow_dispatch` on `playwright-kds-staging.yml` → set `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED` → re-run `npm run smoke:kds-staging-playwright`.

**No false claim:** KDS Playwright is **not** pilot-browser-certified without real GitHub workflow PASS URL.

## Era 17 channel GitHub workflow first green (2026-05-28)

**Policy:** `era17-channel-github-workflow-first-green-v1` (`lib/integrations/channel-github-workflow-first-green-era17-policy.ts`)  
**Marker:** `awaiting_github_first_green`  
**Workflow:** `.github/workflows/woo-shopify-staging-smoke.yml`  
**Smoke:** `npm run smoke:channel-github-workflow-first-green`  
**Artifact:** `artifacts/channel-github-workflow-first-green-summary.json`

### GitHub Actions secrets (woo-shopify-staging-smoke.yml)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Staging database with Woo/Shopify connection rows |
| `ENCRYPTION_KEY` | Credential decryption |
| `CHANNEL_SMOKE_OWNER_EMAIL` | Tenant owner email (or use workflow `owner_email` input) |
| `CHANNEL_SMOKE_CONNECTION_ID` | Optional connection UUID override |

### Operator GitHub evidence env vars

| Variable | Workflow |
|----------|----------|
| `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME` | `woo-shopify-staging-smoke.yml` |

**proof_passed** requires `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME=PASSED` with run URL — wiring cert alone is insufficient.

Cert: `npm run test:ci:channel-github-workflow-first-green-era17:cert` (chained in `test:ci:channel-golden-path:cert`).

## Era 17 enterprise SSO IdP staging login proof (2026-05-28)

**Policies:** `era17-enterprise-sso-idp-staging-smoke-v1`, `era17-enterprise-sso-idp-login-proof-v1`  
**Marker:** `awaiting_operator_proof` — delivery remains **pilot_foundation**  
**Smoke:** `npm run smoke:enterprise-sso-idp-staging`  
**Artifact:** `artifacts/enterprise-sso-idp-staging-smoke-summary.json` (`loginProofStatus`: `proof_passed` | `proof_skipped_missing_prerequisites`)  
**Ops doc:** [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

### Prerequisite env vars (local ops shell — never commit)

| Variable | Purpose |
|----------|---------|
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL |
| `SSO_STAGING_WORKSPACE_ID` | Pilot workspace UUID |
| `SSO_STAGING_IDP_VENDOR` | `OKTA` or `ENTRA_ID` |
| `SSO_STAGING_ALLOWED_DOMAIN` | Allowed email domain |
| `SSO_STAGING_TEST_EMAIL` | Staff test user in allowed domain |
| `SSO_STAGING_SUPABASE_PROVIDER_REF` | Supabase Auth SAML provider ref |

### Operator proof env vars (after manual IdP login on staging)

| Variable | Purpose |
|----------|---------|
| `SSO_STAGING_OPERATOR_EMAIL` | Operator who completed SSO login |
| `SSO_STAGING_LOGIN_SCREENSHOT_PATH` | Local path to dashboard screenshot |
| `SSO_STAGING_AUDIT_EVENT_REF` | Audit export ref containing `sso.login_success` |
| `SSO_STAGING_NEGATIVE_TEST_NOTE` | Wrong-domain or wrong-workspace denial note |
| `SSO_STAGING_BREAK_GLASS_DRILL_NOTE` | Optional break-glass drill outcome |

**Honest skip:** When any prerequisite var is unset, smoke exits **0** with **SKIPPED WITH REASON** and lists missing vars — not fake IdP login success.

**proof_passed** requires manual browser SSO login + all operator proof env vars + screenshot file exists.

Cert: `npm run test:ci:enterprise-sso-idp-staging-era17:cert` (chained in `test:ci:enterprise-identity-roadmap:cert`).

## Workflow steps (Era 12 Cycle 4)

When secrets are set, the job runs in order:

1. `e2e/auth.setup.ts` (`--project=setup`) — writes `e2e/.auth/user.json`
2. Unauthenticated: `platform-access-denial` + `e2e/smoke.spec.ts` (`chromium`)
3. Authenticated: `e2e/dashboard-auth.spec.ts` (`chromium-authed`) — read-only dashboard navigation smoke
4. Optional: `e2e/storefront.spec.ts` when `E2E_STOREFRONT_SLUG` variable is set

**Policy:** `era12-e2e-staging-auth-wiring-v1` — does **not** run POS checkout E2E or remediation IDOR specs (those stay in `closed-beta-gate.yml`).

## Local parity

```bash
export PLAYWRIGHT_BASE_URL=https://your-staging-url
export E2E_LOGIN_EMAIL=you@example.com
export E2E_LOGIN_PASSWORD=secret
npx playwright test tests/e2e/platform-access-denial.spec.ts e2e/smoke.spec.ts --project=chromium
```

## Staging smoke (no browser)

```bash
npm run smoke:staging
```

Uses `.env.staging` — never commit passwords.

## KDS Realtime staging workflow (Era 13 Cycle 2)

Workflow: `.github/workflows/playwright-kds-staging.yml` (weekly Monday 07:00 UTC + manual).

Uses the same secret names as E2E Staging (`era13-kds-staging-workflow-secrets-align-v1`). Additionally requires `ENABLE_KDS_V1_CERTIFIED=true` in the job and optional `NEXT_PUBLIC_SUPABASE_*` for Realtime.

Artifact on completion: `kds-realtime-e2e-staging-summary` (`PASSED` / `SKIPPED` / `FAILED`).

## CI certification

- `npm run test:ci:e2e-staging-secrets-era12` + `test:ci:e2e-staging-secrets-era12:cert` (includes era13/era15 first-run certs + `test:ci:staging-workflows-first-green-era16:cert`)
- `npm run test:ci:staging-workflows-first-green-era16` + `test:ci:staging-workflows-first-green-era16:cert`
- `npm run test:ci:staging-workflows-first-run-era13` + `test:ci:staging-workflows-first-run-era13:cert`
- `npm run test:ci:e2e-staging-auth-era12` + `test:ci:e2e-staging-auth-era12:cert` (wired in `test:ci:governance-bundles:partition-platform`)
- `npm run test:ci:kds-staging-workflow-secrets-era13:cert` (chained in `test:ci:kds-realtime-e2e-staging-era11:cert`)
