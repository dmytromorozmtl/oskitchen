# Ops Vault Matrix — VP Operations (11 secrets)

**Audience:** VP Operations, DevOps, Security / CTO, Integration engineering  
**Policy:** `era17-p0-staging-proof-unblock-v1`  
**Canonical checklist:** [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)  
**Playbook:** [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)

---

## Status snapshot

| Field | Value |
|-------|-------|
| Required secrets | **11** |
| Current readiness | Run `npm run check-vault-readiness -- --write` → `artifacts/vault-readiness-report.json` |
| Blocking status | `awaiting_ops_credentials` until **11/11 present** and child smokes **PASS** |
| Honesty rule | Missing secrets → **SKIPPED WITH REASON**, never fake PASS |

**VP Ops gate:** Sign [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md), assign owners below, then track each row to `present: true`.

---

## Where secrets live

| Surface | Use for |
|---------|---------|
| **GitHub Actions → Settings → Secrets and variables → Actions** | CI smokes (`e2e-staging.yml`, `woo-shopify-staging-smoke.yml`, etc.) |
| **Vercel / staging deploy env** | Runtime staging app (`DATABASE_URL`, `ENCRYPTION_KEY`) |
| **Local ops shell** (`.env.local` or exported vars) | `npm run smoke:*` and `npm run ops:validate-p0-vault-env` |
| **Company secrets manager** (1Password / Vault) | Source of truth — never commit values to git |

---

## Global verification (after configuration)

```bash
# Per-variable shell check (no secret values printed)
npm run ops:validate-p0-vault-env          # human-readable missing list
npm run ops:validate-p0-vault-env -- --json
npm run check-vault-readiness -- --write   # artifacts/vault-readiness-report.json + .html
```

**Pass criteria:** `presentCount: 11`, `vaultReady: true` in `artifacts/vault-readiness-report.json`.

---

## Secret 1 — `E2E_STAGING_BASE_URL`

| | |
|---|---|
| **Owner** | DevOps |
| **Phase** | 1 — Staging login |
| **Child smokes** | `smoke:enterprise-sso-idp-staging`, `smoke:staging-workflows-first-green` |

**Where to get it**

- Vercel **staging** deployment URL for OS Kitchen (e.g. `https://staging.kitchenos.app` or your preview hostname).
- Must serve `GET /api/health` → HTTP 200.

**Where to set it**

1. GitHub → **Settings → Secrets and variables → Actions** → New repository secret `E2E_STAGING_BASE_URL`
2. Export in local ops shell before smokes: `export E2E_STAGING_BASE_URL='https://…'`

**How to verify**

```bash
test -n "$E2E_STAGING_BASE_URL" && curl -fsS "$E2E_STAGING_BASE_URL/api/health" | head -c 200
```

Deep dive: [`staging-environment-setup.md`](./staging-environment-setup.md) (full provisioning) · [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) (GitHub secrets only)

---

## Secret 2 — `E2E_LOGIN_EMAIL`

| | |
|---|---|
| **Owner** | DevOps |
| **Phase** | 1 — Staging login |
| **Child smokes** | `smoke:staging-workflows-first-green` |

**Where to get it**

- Email of a **real staging workspace user** with dashboard access (owner or manager).
- User must exist in Supabase Auth for the staging project and belong to a workspace on staging.

**Where to set it**

1. GitHub Actions secret `E2E_LOGIN_EMAIL`
2. Local ops shell: `export E2E_LOGIN_EMAIL='owner@example.com'`

**How to verify**

```bash
test -n "$E2E_LOGIN_EMAIL"
# Manual: log in at $E2E_STAGING_BASE_URL/login with this email + E2E_LOGIN_PASSWORD
```

Deep dive: [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md)

---

## Secret 3 — `E2E_LOGIN_PASSWORD`

| | |
|---|---|
| **Owner** | DevOps |
| **Phase** | 1 — Staging login |
| **Child smokes** | `smoke:staging-workflows-first-green` |

**Where to get it**

- Password for the `E2E_LOGIN_EMAIL` account (set in Supabase Auth or via invite flow).
- **Legacy CI alias:** `E2E_PASSWORD` — accepted in GitHub workflows only; prefer `E2E_LOGIN_PASSWORD` for new repos.

**Where to set it**

1. GitHub Actions secret `E2E_LOGIN_PASSWORD` (not `E2E_PASSWORD` for new setup)
2. Local ops shell: `export E2E_LOGIN_PASSWORD='…'`

**How to verify**

```bash
test -n "$E2E_LOGIN_PASSWORD"
npm run smoke:staging-workflows-first-green   # exits 0; check artifact for SKIPPED vs PASSED
```

Deep dive: [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md)

---

## Secret 4 — `SSO_STAGING_WORKSPACE_ID`

| | |
|---|---|
| **Owner** | Security / CTO |
| **Phase** | 4 — SSO IdP |
| **Child smokes** | `smoke:enterprise-sso-idp-staging` |

**Where to get it**

- UUID of the **pilot workspace** on staging Postgres (`Workspace.id`).
- Query (with staging `DATABASE_URL`): `SELECT id, name FROM "Workspace" WHERE … LIMIT 5;`
- Or copy from OS Kitchen admin / platform ops for the designated SSO pilot tenant.

**Where to set it**

1. Company secrets manager + local ops shell
2. Optional: GitHub Actions secret for CI SSO smoke

**How to verify**

```bash
test -n "$SSO_STAGING_WORKSPACE_ID"
# UUID format: 8-4-4-4-12 hex with dashes
echo "$SSO_STAGING_WORKSPACE_ID" | grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
```

Deep dive: [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

---

## Secret 5 — `SSO_STAGING_IDP_VENDOR`

| | |
|---|---|
| **Owner** | Security / CTO |
| **Phase** | 4 — SSO IdP |
| **Child smokes** | `smoke:enterprise-sso-idp-staging` |

**Where to get it**

- IdP vendor for this pilot: **`OKTA`** or **`ENTRA_ID`** (one per workspace).
- Must match `WorkspaceSsoSettings` vendor enum in OS Kitchen staging.

**Where to set it**

1. Ops vault + local ops shell
2. Optional: GitHub Actions secret

**How to verify**

```bash
test -n "$SSO_STAGING_IDP_VENDOR"
# Must be OKTA or ENTRA_ID (aliases ENTRA, AZURE accepted in smoke script only)
```

Deep dive: [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

---

## Secret 6 — `SSO_STAGING_ALLOWED_DOMAIN`

| | |
|---|---|
| **Owner** | Security / CTO |
| **Phase** | 4 — SSO IdP |
| **Child smokes** | `smoke:enterprise-sso-idp-staging` |

**Where to get it**

- Email domain allowed for SSO test users (e.g. `pilot.example.com`).
- Must match **Settings → Security → SSO pilot → Allowed domains** on staging workspace.

**Where to set it**

1. Ops vault + local ops shell

**How to verify**

```bash
test -n "$SSO_STAGING_ALLOWED_DOMAIN"
# No @ prefix — domain only, e.g. pilot.example.com
```

Deep dive: [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

---

## Secret 7 — `SSO_STAGING_TEST_EMAIL`

| | |
|---|---|
| **Owner** | Security / CTO |
| **Phase** | 4 — SSO IdP |
| **Child smokes** | `smoke:enterprise-sso-idp-staging` |

**Where to get it**

- Staff test user email in the **allowed domain** (provisioned in Okta or Entra ID).
- User must be assignable to the SAML app and exist as OS Kitchen staff on the pilot workspace.

**Where to set it**

1. Ops vault + local ops shell

**How to verify**

```bash
test -n "$SSO_STAGING_TEST_EMAIL"
# Email must end with @$SSO_STAGING_ALLOWED_DOMAIN
```

Deep dive: [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

---

## Secret 8 — `SSO_STAGING_SUPABASE_PROVIDER_REF`

| | |
|---|---|
| **Owner** | Security / CTO |
| **Phase** | 4 — SSO IdP |
| **Child smokes** | `smoke:enterprise-sso-idp-staging` |

**Where to get it**

- Supabase staging project → **Authentication → SSO / SAML** → provider reference / UUID after uploading IdP metadata.
- Must match **Supabase provider ref** in OS Kitchen workspace SSO pilot settings.

**Where to set it**

1. Ops vault + local ops shell

**How to verify**

```bash
test -n "$SSO_STAGING_SUPABASE_PROVIDER_REF"
npm run smoke:enterprise-sso-idp-staging   # check artifacts/enterprise-sso-idp-staging-smoke-summary.json
```

Deep dive: [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)

---

## Secret 9 — `DATABASE_URL`

| | |
|---|---|
| **Owner** | DevOps |
| **Phase** | 2 — Database + encryption |
| **Child smokes** | `smoke:woo-shopify-live` |

**Where to get it**

- Supabase **staging** project → **Settings → Database** → **Transaction pooler** connection string (`:6543`, `pgbouncer=true`).
- Format: `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&…`
- Also set `DIRECT_URL` (session pooler `:5432`) on Vercel for migrations — not counted in the 11, but required for deploy.

**Where to set it**

1. Vercel staging environment variables
2. GitHub Actions secret (for `woo-shopify-staging-smoke.yml`)
3. Local ops shell for smokes

**How to verify**

```bash
test -n "$DATABASE_URL"
npm run check:database-connectivity    # optional connectivity probe
npm run smoke:woo-shopify-live         # Woo/Shopify live step no longer SKIPPED for DB
```

Deep dive: [`SUPABASE_POOLER_SETUP.md`](./SUPABASE_POOLER_SETUP.md), [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

---

## Secret 10 — `ENCRYPTION_KEY`

| | |
|---|---|
| **Owner** | DevOps |
| **Phase** | 2 — Database + encryption |
| **Child smokes** | `smoke:woo-shopify-live` |

**Where to get it**

- Generate a **new 32-byte key** for staging (never reuse production):
  ```bash
  openssl rand -base64 32
  ```
- Store in company secrets manager. Required for AES-256-GCM integration credential encryption (`lib/crypto.ts`).

**Where to set it**

1. Vercel staging environment (same value as local/GitHub for smoke parity)
2. GitHub Actions secret
3. Local ops shell

**How to verify**

```bash
test -n "$ENCRYPTION_KEY"
# Staging app can save integration credentials without crypto errors in logs
```

Deep dive: [`CHANNEL_CREDENTIAL_SECURITY.md`](./CHANNEL_CREDENTIAL_SECURITY.md), [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)

---

## Secret 11 — `CHANNEL_SMOKE_OWNER_EMAIL`

| | |
|---|---|
| **Owner** | Integration engineer |
| **Phase** | 3 — Channel tenant |
| **Child smokes** | `smoke:woo-shopify-live` |

**Where to get it**

- Email of the **workspace owner** on staging that has (or will have) a WooCommerce or Shopify test connection configured.
- Alternative: `CHANNEL_SMOKE_CONNECTION_ID` (connection UUID) — not part of the 11-count matrix but accepted by smoke script if email is unset.

**Where to set it**

1. Ops vault + GitHub Actions secret
2. Local ops shell

**How to verify**

```bash
test -n "$CHANNEL_SMOKE_OWNER_EMAIL"
npm run smoke:woo-shopify-live   # review artifacts/channel-live-smoke-summary.json
```

Deep dive: [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md), [`WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md`](./WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md)

---

## Phase summary

| Phase | Secrets | Doc |
|-------|---------|-----|
| 1 — Staging login | `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` | [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) |
| 2 — Database + encryption | `DATABASE_URL`, `ENCRYPTION_KEY` | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) |
| 3 — Channel tenant | `CHANNEL_SMOKE_OWNER_EMAIL` | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) |
| 4 — SSO IdP | `SSO_STAGING_WORKSPACE_ID`, `SSO_STAGING_IDP_VENDOR`, `SSO_STAGING_ALLOWED_DOMAIN`, `SSO_STAGING_TEST_EMAIL`, `SSO_STAGING_SUPABASE_PROVIDER_REF` | [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) |

---

## Ops sequence (after 11/11)

1. VP Operations signs [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)
2. `npm run check-vault-readiness -- --write` → `presentCount: 11`
3. `npm run smoke:enterprise-sso-idp-staging`
4. `npm run smoke:staging-workflows-first-green`
5. `npm run smoke:woo-shopify-live`
6. `npm run smoke:p0-staging-proof-unblock` → `p0ProofStatus: proof_passed`
7. `npm run smoke:pilot-gono-go` → re-evaluate GO blockers

**Honesty:** Until child smokes return real PASS artifacts, `pilotExecutableScore` stays blocked and GO remains **NO-GO**.

---

## Quick reference table

| # | Variable | Owner | Verify command |
|---|----------|-------|----------------|
| 1 | `E2E_STAGING_BASE_URL` | DevOps | `test -n "$E2E_STAGING_BASE_URL"` |
| 2 | `E2E_LOGIN_EMAIL` | DevOps | `test -n "$E2E_LOGIN_EMAIL"` |
| 3 | `E2E_LOGIN_PASSWORD` | DevOps | `test -n "$E2E_LOGIN_PASSWORD"` |
| 4 | `SSO_STAGING_WORKSPACE_ID` | Security / CTO | `test -n "$SSO_STAGING_WORKSPACE_ID"` |
| 5 | `SSO_STAGING_IDP_VENDOR` | Security / CTO | `test -n "$SSO_STAGING_IDP_VENDOR"` |
| 6 | `SSO_STAGING_ALLOWED_DOMAIN` | Security / CTO | `test -n "$SSO_STAGING_ALLOWED_DOMAIN"` |
| 7 | `SSO_STAGING_TEST_EMAIL` | Security / CTO | `test -n "$SSO_STAGING_TEST_EMAIL"` |
| 8 | `SSO_STAGING_SUPABASE_PROVIDER_REF` | Security / CTO | `test -n "$SSO_STAGING_SUPABASE_PROVIDER_REF"` |
| 9 | `DATABASE_URL` | DevOps | `test -n "$DATABASE_URL"` |
| 10 | `ENCRYPTION_KEY` | DevOps | `test -n "$ENCRYPTION_KEY"` |
| 11 | `CHANNEL_SMOKE_OWNER_EMAIL` | Integration | `test -n "$CHANNEL_SMOKE_OWNER_EMAIL"` |
