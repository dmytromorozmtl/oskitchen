# Era 18 P0 Staging Proof — Ops Checklist

**Status:** canonical **Era 18 Cycle 1** ops vault checklist — **reconfirmed Era 19 Cycle 5** (2026-05-28)  
**Policy:** `era17-p0-staging-proof-unblock-v1` (`lib/commercial/p0-staging-proof-unblock-era17-policy.ts`)  
**Smoke:** `npm run smoke:p0-staging-proof-unblock`  
**Artifact:** `artifacts/p0-staging-proof-unblock-summary.json`  
**Date:** 2026-05-28

---

## Purpose

Configure the **11 prerequisite env vars** that block P0 staging proof. This checklist is the single ops entry point for Era 18 Workstream A Cycle 1–2. **Do not claim** SSO `pilot_ready`, GitHub staging first green, or live Woo/Shopify ops until `p0ProofStatus: proof_passed`.

**Honesty:** Missing credentials → child smokes **SKIPPED WITH REASON** (exit 0). Any child **FAILED** → aggregate **FAILED** (exit 1). No fake PASS.

---

## Current blocker snapshot (2026-05-28 — Era 19 Cycle 5 re-run)

| Field | Value |
|-------|-------|
| `p0ProofStatus` | `awaiting_ops_credentials` |
| `allMissingEnvVars` | 11 (see table below) |
| SSO child | `proof_skipped_missing_prerequisites` (6 vars) |
| Staging workflows child | `proof_skipped_missing_prerequisites` (3 vars) |
| Channel live child | `proof_skipped_missing_prerequisites` (3 vars) |
| Era 19 action | Ops must configure vault secrets — **no fake PASS** |

**Previous snapshot (Era 18 audit):**

Re-run after configuration:

```bash
npm run smoke:p0-staging-proof-unblock
```

Print this checklist from the repo:

```bash
npm run smoke:p0-staging-proof-unblock -- --checklist-only
```

---

## Prerequisite env var catalog (11)

Set in **ops vault** + local shell and/or **GitHub Actions secrets** (never commit values to git).

| # | Variable | Child smoke(s) | Where to set | Purpose |
|---|----------|----------------|--------------|---------|
| 1 | `E2E_STAGING_BASE_URL` | SSO, staging workflows | GitHub secret + local shell | Staging KitchenOS URL (e.g. `https://staging.kitchenos.app`) |
| 2 | `E2E_LOGIN_EMAIL` | staging workflows | GitHub secret + local shell | Dashboard login email for staging E2E |
| 3 | `E2E_LOGIN_PASSWORD` | staging workflows | GitHub secret + local shell | Dashboard login password (legacy alias `E2E_PASSWORD` in CI only) |
| 4 | `SSO_STAGING_WORKSPACE_ID` | SSO IdP | Ops vault + local shell | Pilot workspace UUID — tenant-bound SSO |
| 5 | `SSO_STAGING_IDP_VENDOR` | SSO IdP | Ops vault + local shell | `OKTA` or `ENTRA_ID` |
| 6 | `SSO_STAGING_ALLOWED_DOMAIN` | SSO IdP | Ops vault + local shell | Allowed email domain (e.g. `pilot.example.com`) |
| 7 | `SSO_STAGING_TEST_EMAIL` | SSO IdP | Ops vault + local shell | Staff test user in allowed domain |
| 8 | `SSO_STAGING_SUPABASE_PROVIDER_REF` | SSO IdP | Ops vault + local shell | Supabase Auth SAML provider reference |
| 9 | `DATABASE_URL` | channel live | Ops vault + local shell / GitHub secret | Staging Postgres connection for integration rows |
| 10 | `ENCRYPTION_KEY` | channel live | Ops vault + local shell / GitHub secret | App encryption key for connection credentials |
| 11 | `CHANNEL_SMOKE_OWNER_EMAIL` | channel live | Ops vault + local shell / GitHub secret | Workspace owner email for Woo/Shopify tenant selector |

**Shared var:** `E2E_STAGING_BASE_URL` counts once but is required by both SSO and staging-workflows children.

**Deep dives:**

- SSO (vars 4–8): [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)
- Staging workflows (vars 1–3): [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md)
- Channel live (vars 9–11): [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) § Era 17 channel live smoke

---

## Ops sequence (do in order)

### Step 1 — Staging base URL + dashboard login (3 vars)

1. Confirm staging deployment is reachable.
2. GitHub → **Settings → Secrets and variables → Actions** → set `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`.
3. Export the same three vars in your local ops shell (or `.env.staging` — never commit).
4. Verify: `curl -sf "$E2E_STAGING_BASE_URL/api/health"` returns 200.

### Step 2 — SSO IdP prerequisites (6 vars, includes shared base URL)

1. Provision Okta Developer **or** Entra test tenant per [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md).
2. Configure Supabase SAML provider on staging project; note provider ref.
3. Enable SSO pilot on pilot workspace (`ssoOidc` entitlement required).
4. Set `SSO_STAGING_WORKSPACE_ID`, `SSO_STAGING_IDP_VENDOR`, `SSO_STAGING_ALLOWED_DOMAIN`, `SSO_STAGING_TEST_EMAIL`, `SSO_STAGING_SUPABASE_PROVIDER_REF`.
5. Run child smoke: `npm run smoke:enterprise-sso-idp-staging` — expect wiring cert PASSED; IdP login still **SKIPPED** until Cycle 2 operator proof vars.

### Step 3 — Channel live prerequisites (3 vars)

1. Confirm staging `DATABASE_URL` points at staging Postgres (not production).
2. Set `ENCRYPTION_KEY` to the staging app encryption key.
3. Set `CHANNEL_SMOKE_OWNER_EMAIL` to a workspace owner with Woo and/or Shopify connection rows configured.
4. Run child smoke: `npm run smoke:woo-shopify-live` — expect **SKIPPED** until live shop credentials exist in DB.

### Step 4 — GitHub workflow first green (after Step 1 secrets)

1. **Actions → E2E Staging → Run workflow** → confirm `staging-e2e` job appears and completes green.
2. Record `GITHUB_E2E_STAGING_RUN_URL` + `GITHUB_E2E_STAGING_RUN_OUTCOME=PASSED`.
3. Optional: **Playwright KDS Staging**, **Woo Shopify Staging Smoke** — see [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md).
4. Run: `npm run smoke:staging-workflows-first-green` — target `firstGreenProofStatus: proof_passed` (≥2/3 workflows PASSED).

### Step 5 — P0 aggregate re-run

```bash
npm run smoke:p0-staging-proof-unblock
```

**Acceptance:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_passed`, `overall: PASSED`.

Then re-run pilot gate:

```bash
npm run smoke:pilot-gono-go
```

---

## Post-prerequisite operator proof (SSO Cycle 2 — not in the 11)

After Step 2 prerequisites, operator completes browser IdP login and sets:

| Variable | Purpose |
|----------|---------|
| `SSO_STAGING_OPERATOR_EMAIL` | Operator who completed IdP login |
| `SSO_STAGING_LOGIN_SCREENSHOT_PATH` | Local path to dashboard screenshot after SSO |
| `SSO_STAGING_AUDIT_EVENT_REF` | Audit export with `sso.login_success` |
| `SSO_STAGING_NEGATIVE_TEST_NOTE` | Wrong domain / workspace denial test note |

Policy: `era17-enterprise-sso-idp-login-proof-v1` — required for `loginProofStatus: proof_passed`.

---

## GitHub run URL recording (staging workflows — after Step 4)

| Variable | Workflow |
|----------|----------|
| `GITHUB_E2E_STAGING_RUN_URL` + `GITHUB_E2E_STAGING_RUN_OUTCOME` | `e2e-staging.yml` |
| `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME` | `playwright-kds-staging.yml` |
| `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME` | `woo-shopify-staging-smoke.yml` |

Outcome values: `PASSED`, `FAILED`, or `SKIPPED`.

---

## Forbidden claims until P0 PASS

- P0 staging proof passed without child artifacts
- SSO `pilot_ready` without IdP login artifact
- GitHub staging green without run URL
- Woo/Shopify live without channel smoke PASS
- Paid pilot GO without `smoke:pilot-gono-go` → GO

---

## Validation commands

```bash
npm run smoke:p0-staging-proof-unblock -- --checklist-only
npm run smoke:p0-staging-proof-unblock
npm run test:ci:p0-staging-proof-unblock-era17:cert
npm run test:ci:commercial-pilot-runbook:cert
```

---

## Related docs

- [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) — paid pilot GO/NO-GO
- [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) — staging workflow secrets
- [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) — IdP setup
- [`era18-global-leap-execution-map-2026-05-28.md`](./era18-global-leap-execution-map-2026-05-28.md) — Era 18 cycles
