# Ops Vault Matrix — P0 Staging Proof (11 secrets)

**Policy:** `era17-p0-staging-proof-unblock-v1`  
**Canonical checklist:** [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)  
**Verify:** `npm run check-vault-readiness -- --write` → `artifacts/vault-readiness-report.json` + `.html`

---

## Status snapshot

| Field | Value |
|-------|-------|
| Required secrets | **11** |
| Blocking status | `awaiting_ops_credentials` until all present + child smokes PASS |
| Honesty rule | Missing secrets → **SKIPPED WITH REASON**, never fake PASS |

---

## Secret matrix

| # | Variable | Owner | Child smoke(s) | Where to set | Verify | Purpose |
|---|----------|-------|----------------|--------------|--------|---------|
| 1 | `E2E_STAGING_BASE_URL` | DevOps | SSO, staging workflows | GitHub secret + ops shell | `test -n "$E2E_STAGING_BASE_URL"` | Staging KitchenOS URL |
| 2 | `E2E_LOGIN_EMAIL` | DevOps | staging workflows | GitHub secret + ops shell | `test -n "$E2E_LOGIN_EMAIL"` | Dashboard login for E2E |
| 3 | `E2E_LOGIN_PASSWORD` | DevOps | staging workflows | GitHub secret + ops shell | `test -n "$E2E_LOGIN_PASSWORD"` | Dashboard password (alias `E2E_PASSWORD` in CI) |
| 4 | `SSO_STAGING_WORKSPACE_ID` | Security / CTO | SSO IdP | Ops vault + shell | `test -n "$SSO_STAGING_WORKSPACE_ID"` | Pilot workspace UUID |
| 5 | `SSO_STAGING_IDP_VENDOR` | Security / CTO | SSO IdP | Ops vault + shell | `test -n "$SSO_STAGING_IDP_VENDOR"` | `OKTA` or `ENTRA_ID` |
| 6 | `SSO_STAGING_ALLOWED_DOMAIN` | Security / CTO | SSO IdP | Ops vault + shell | `test -n "$SSO_STAGING_ALLOWED_DOMAIN"` | Allowed email domain |
| 7 | `SSO_STAGING_TEST_EMAIL` | Security / CTO | SSO IdP | Ops vault + shell | `test -n "$SSO_STAGING_TEST_EMAIL"` | SSO test user email |
| 8 | `SSO_STAGING_SUPABASE_PROVIDER_REF` | Security / CTO | SSO IdP | Ops vault + shell | `test -n "$SSO_STAGING_SUPABASE_PROVIDER_REF"` | Supabase SAML provider ref |
| 9 | `DATABASE_URL` | DevOps | channel live | Ops vault + GitHub secret | `test -n "$DATABASE_URL"` | Staging Postgres |
| 10 | `ENCRYPTION_KEY` | DevOps | channel live | Ops vault + GitHub secret | `test -n "$ENCRYPTION_KEY"` | Credential encryption key |
| 11 | `CHANNEL_SMOKE_OWNER_EMAIL` | Integration | channel live | Ops vault + GitHub secret | `test -n "$CHANNEL_SMOKE_OWNER_EMAIL"` | Owner email for Woo/Shopify smoke |

---

## Deep-dive docs

| Topic | Document |
|-------|----------|
| SSO (vars 4–8) | [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) |
| Staging E2E (vars 1–3) | [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) |
| Channel live (vars 9–11) | [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) |
| Step-by-step playbook | [`p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md) |

---

## Ops sequence

1. VP Operations signs [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)
2. DevOps creates vault tickets for all 11 secrets
3. `npm run check-vault-readiness` → all present
4. `npm run smoke:enterprise-sso-idp-staging`
5. `npm run smoke:staging-workflows-first-green`
6. `npm run smoke:woo-shopify-live`
7. `npm run smoke:p0-staging-proof-unblock` → `p0ProofStatus: proof_passed`
8. `npm run smoke:pilot-gono-go` → re-evaluate blockers

---

## ICP note

KitchenOS pilots span **all F&B formats**: full-service restaurants, bars, cafés, bakeries, catering, ghost kitchens, meal prep, and similar operator models. ICP qualification uses [`config/commercial/pilot-icp-prospect-draft.template.json`](../config/commercial/pilot-icp-prospect-draft.template.json) — not a single segment.
