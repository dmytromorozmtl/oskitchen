# SSO IdP smoke test plan

**Version:** 1.0 · **June 2026**  
**Policy:** `era17-enterprise-sso-idp-staging-smoke-v1`  
**Delivery status:** `pilot_foundation` — not production SSO for all tenants  
**Detailed ops runbook:** [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md)  
**LIVE gate parent:** [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) · G1 smoke

This document is the **test plan** — scenarios, commands, pass/fail criteria, and artifacts. IdP tenant setup (Okta / Entra / Auth0) lives in the ops plan above.

---

## Executive summary

| Layer | What runs | Pass when |
|-------|-----------|-----------|
| **L0 — Policy unit** | Vitest policy + summary modules | CI green; delivery stays `pilot_foundation` |
| **L1 — Wiring cert** | `smoke:enterprise-sso-r2-pilot` | Schema, admin UI, callback routes wired |
| **L2 — Staging prerequisites** | `smoke:enterprise-sso-idp-staging` | Env vars valid; staging `/api/health` + `/login` reachable |
| **L3 — Operator login proof** | Same smoke + operator env vars | `loginProofStatus: proof_passed` |
| **L4 — Pilot ready gate** | `smoke:enterprise-sso-pilot-ready-gate` | Cycle 2 artifact exists; `promotionAllowed: true` |

**Honesty rule:** Missing vault secrets → **SKIPPED WITH REASON** (exit 0), not fake PASS. Only L3 `proof_passed` counts for enterprise pilot claims.

---

## Scope

### In scope

- Workspace-scoped SAML SSO via Supabase Auth (`WorkspaceSsoSettings`)
- IdP vendors: **Okta**, **Microsoft Entra ID**, **Auth0**
- Login flow: `/login` → Sign in with SSO → `/auth/callback?sso_workspace_id=<uuid>`
- Break-glass owner email/password when enabled
- Tenant isolation (wrong workspace / wrong domain denial)
- Audit events: `sso.login_success`, `sso.login_denied`

### Out of scope (do not claim in smoke PASS)

- SCIM / directory sync
- Multi-IdP per workspace
- Production SSO for all tenants
- SOC2 Type II attestation
- Playwright full browser IdP automation (Task 35 — future `e2e/sso-idp-smoke.spec.ts`)

---

## Test inventory

### Automated (CI — always on)

| Test suite | Command | Validates |
|------------|---------|-----------|
| IdP staging policy | `npm run test:ci:enterprise-sso-idp-staging-era17` | Policy id, 3 IdP vendors, `pilot_foundation` |
| IdP staging cert | `npm run test:ci:enterprise-sso-idp-staging-era17:cert` | Runbook steps, env var docs, artifact path |
| Identity roadmap cert | `npm run test:ci:enterprise-identity-roadmap:cert` | Chained SSO + identity certs |
| P0 staging policy gate | `npm run test:ci:p0-staging-proof-unblock-era17` | P0 bundle policy (includes SSO vars) |

**Key unit files:**

- `tests/unit/enterprise-sso-idp-staging-smoke-era17-policy.test.ts`
- `tests/unit/enterprise-sso-idp-staging-smoke-summary.test.ts`
- `tests/unit/enterprise-sso-idp-login-proof-era17-policy.test.ts`
- `tests/unit/enterprise-sso-idp-staging-smoke-era17-cert-live.test.ts`
- `tests/unit/workspace-sso-login-initiate.test.ts`
- `tests/unit/workspace-sso-callback-service.test.ts` (via workspace-sso tests)

### Smoke orchestrators (ops / staging)

| Script | npm command | Purpose |
|--------|-------------|---------|
| R2 wiring cert | `npm run smoke:enterprise-sso-r2-pilot` | Era 16 admin + schema wiring |
| IdP staging smoke | `npm run smoke:enterprise-sso-idp-staging` | L1–L3 orchestrator |
| Operator runbook | `npm run smoke:enterprise-sso-operator-runbook` | Support boundary checks |
| Pilot ready gate | `npm run smoke:enterprise-sso-pilot-ready-gate` | L4 promotion gate |
| P0 bundle | `npm run smoke:p0-staging-proof-unblock` | Aggregate P0 (includes SSO when secrets set) |

**Orchestrator:** `scripts/smoke-enterprise-sso-idp-staging-era17.ts`  
**Artifact:** `artifacts/enterprise-sso-idp-staging-smoke-summary.json`

### Manual (operator — required for L3)

| ID | Scenario | Steps | Pass criteria |
|----|----------|-------|---------------|
| M1 | Positive IdP login | `/login` → SSO with workspace UUID → IdP auth | Dashboard visible; screenshot saved |
| M2 | RBAC mutation | One guarded action (e.g. settings save) under SSO session | 200 / success toast |
| M3 | Audit trail | Export audit log | Row with `sso.login_success` |
| M4 | Wrong domain | SSO user outside `allowedEmailDomains` | Deny; no session |
| M5 | Wrong workspace | SSO with another tenant's UUID | Deny; no cross-tenant session |
| M6 | Disabled SSO | `PILOT_CONFIGURED` or `enabled=false` | SSO button unavailable |
| M7 | Break-glass drill | Disable IdP; owner email/password login | Dashboard access when `breakGlassOwnerEnabled` |

---

## Environment variables

### L2 prerequisites (required before staging checks)

| Variable | Example | Purpose |
|----------|---------|---------|
| `E2E_STAGING_BASE_URL` | `https://staging.kitchenos.app` | Staging deploy URL |
| `SSO_STAGING_WORKSPACE_ID` | UUID | Pilot workspace |
| `SSO_STAGING_IDP_VENDOR` | `OKTA` \| `ENTRA_ID` \| `AUTH0` | IdP vendor |
| `SSO_STAGING_ALLOWED_DOMAIN` | `pilot.example.com` | Email domain gate |
| `SSO_STAGING_TEST_EMAIL` | `ops@pilot.example.com` | Test staff user |
| `SSO_STAGING_SUPABASE_PROVIDER_REF` | Supabase SAML provider UUID | Provider binding |

Set in GitHub Actions secrets per [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md). Never commit values.

### L3 operator proof (after manual M1–M7)

| Variable | Purpose |
|----------|---------|
| `SSO_STAGING_OPERATOR_EMAIL` | Operator who completed IdP login |
| `SSO_STAGING_LOGIN_SCREENSHOT_PATH` | Local path to post-login dashboard screenshot |
| `SSO_STAGING_AUDIT_EVENT_REF` | Audit export reference for `sso.login_success` |
| `SSO_STAGING_NEGATIVE_TEST_NOTE` | M4 or M5 denial outcome |
| `SSO_STAGING_BREAK_GLASS_DRILL_NOTE` | Optional M7 outcome |
| `SSO_STAGING_BREAK_GLASS_OWNER_EMAIL` | Break-glass owner email |
| `E2E_LOGIN_PASSWORD` | Owner password for break-glass drill |

---

## Execution workflow

### Quick start (local / ops shell)

```bash
# L0 — unit gate (no secrets)
npm run test:ci:enterprise-sso-idp-staging-era17

# L1 — wiring cert
npm run smoke:enterprise-sso-r2-pilot

# L2 + L3 — staging smoke (SKIPPED if secrets missing)
npm run smoke:enterprise-sso-idp-staging

# Print runbook only
npm run smoke:enterprise-sso-idp-staging -- --checklist-only

# L4 — after L3 proof_passed
npm run smoke:enterprise-sso-pilot-ready-gate
```

### Full cert chain (release gate)

```bash
npm run test:ci:enterprise-sso-idp-staging-era17:cert
```

Runs `cert:enterprise-sso-idp-staging-era17` + cert-live unit tests.

### P0 staging bundle (CI nightly + manual)

```bash
# Requires all 11 P0 vault secrets (6 SSO + staging login + DB + channel)
npm run ops:validate-p0-vault-env
npm run smoke:p0-staging-proof-unblock
```

Workflow: `.github/workflows/p0-staging-smokes.yml` (schedule `0 7 * * *` + `workflow_dispatch`).

---

## Pass / fail criteria

### Summary artifact fields

File: `artifacts/enterprise-sso-idp-staging-smoke-summary.json`

| Field | PASS value | Meaning |
|-------|------------|---------|
| `overall` | `PASSED` | Wiring + prerequisites + operator proof |
| `overall` | `SKIPPED` | Missing secrets — honest skip |
| `overall` | `FAILED` | Real failure — fix before retry |
| `wiringCertPassed` | `true` | L1 complete |
| `idpStagingPrerequisitesMet` | `true` | All 6 `SSO_STAGING_*` + staging URL set |
| `loginProofStatus` | `proof_passed` | **L3 complete** — qualifies for pilot-ready gate |
| `loginProofStatus` | `proof_skipped_missing_prerequisites` | Configure vault secrets |
| `loginProofStatus` | `proof_skipped_missing_operator_evidence` | Run M1–M3; set operator env vars |
| `loginProofStatus` | `proof_failed` | Evidence invalid — re-run manual tests |

### Step IDs in artifact `steps[]`

| Step id | Label | Automated? |
|---------|-------|:----------:|
| `wiring_cert` | Era 16 R2 pilot wiring | Yes |
| `idp_prerequisites` | Staging env vars | Yes |
| `staging_health` | GET `/api/health` | Yes (when URL set) |
| `login_page_reachable` | GET `/login` | Yes (when URL set) |
| `idp_browser_login` | Operator IdP login proof | Manual + env validation |

---

## IdP vendor test matrix

| Vendor | `SSO_STAGING_IDP_VENDOR` | Setup doc section |
|--------|--------------------------|-------------------|
| Okta Developer | `OKTA` | [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) § Okta |
| Microsoft Entra ID | `ENTRA_ID` | Same doc § Entra (aliases `ENTRA`, `AZURE`, `MICROSOFT` in smoke script) |
| Auth0 SAML | `AUTH0` | Same doc + [`auth0-supabase-saml-setup.md`](./auth0-supabase-saml-setup.md) |

**One IdP per pilot workspace** — do not run concurrent Okta + Entra smokes on the same workspace.

---

## Code paths under test

| Surface | Path |
|---------|------|
| SSO admin UI | `/dashboard/settings/security/sso` |
| Login entry | `components/auth/sso-login-entry.tsx` |
| Callback validation | `lib/enterprise/workspace-sso-callback-service.ts` |
| Login initiate | `lib/enterprise/workspace-sso-login-initiate.ts` |
| Admin service | `lib/enterprise/workspace-sso-admin-service.ts` |
| Prisma model | `WorkspaceSsoSettings` · `SsoIdpVendor` enum |

---

## CI integration map

| Workflow | SSO coverage |
|----------|--------------|
| `.github/workflows/ci.yml` | Policy unit tests in enterprise identity jobs |
| `.github/workflows/p0-staging-smokes.yml` | Live smokes when 11 vault secrets configured |
| `npm run test:ci:p0-staging-smokes:policy` | Records step outcome + skip reason |

**June 2026 status:** L0–L1 pass in CI; L3 blocked on ops credentials (`proof_skipped_missing_prerequisites` locally).

---

## Failure triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `proof_skipped_missing_prerequisites` | Vault secrets unset | Configure per staging checklist |
| `staging_health` FAILED | Staging deploy down | Fix deploy; check Vercel |
| `login_page_reachable` FAILED | DNS / auth middleware | Verify `E2E_STAGING_BASE_URL` |
| `proof_skipped_missing_operator_evidence` | M1 done but env vars not set | Set `SSO_STAGING_OPERATOR_*` |
| Screenshot path invalid | File not on disk | Save screenshot; set absolute path |
| SAML callback error | Supabase provider mismatch | Re-upload IdP metadata |
| Cross-tenant session | Bug — **P0** | Open incident; do not promote |

---

## Rollback verification (post-smoke)

After any failed pilot or rollback drill:

1. Deactivate SSO pilot in admin UI → `DISABLED` or `PILOT_CONFIGURED`
2. Confirm `/login` SSO fails closed for workspace UUID
3. Re-run `npm run smoke:enterprise-sso-idp-staging` → expect skip or deny paths
4. Document in ops log per rollback steps in era17 policy module

---

## Sales-safe language

| Status | Approved wording |
|--------|------------------|
| L0–L1 only | "SSO pilot foundation wired — staging proof pending" |
| L3 `proof_passed` | "Enterprise SSO validated on staging for qualified pilot workspace" |
| **Never** | "SSO included for all customers" · "SAML live in production" · "SOC2-ready SSO" |

Until L4 gate: reference [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) buyer FAQ.

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) | IdP tenant setup, Supabase SAML, cycles 1–3 |
| [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md) | R2 architecture |
| [`enterprise-sso-operator-runbook-era17.md`](./enterprise-sso-operator-runbook-era17.md) | Support boundaries |
| [`staging-environment-checklist.md`](./staging-environment-checklist.md) | Vault + SSL |
| [`observability-setup.md`](./observability-setup.md) | Sentry tags for auth failures |
| Task 35 | `e2e/sso-idp-smoke.spec.ts` — browser automation (future) |
| Task 57 | `beta-to-live-roadmap.md` — SSO enterprise track |
