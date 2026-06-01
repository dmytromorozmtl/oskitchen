# Enterprise SSO IdP Staging Smoke Plan

**Status:** canonical **Era 17 Cycle 1** ops plan — not production SSO delivery  
**Policy:** `era17-enterprise-sso-idp-staging-smoke-v1` (`lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy.ts`)  
**Summary module:** `lib/enterprise/enterprise-sso-idp-staging-smoke-summary.ts`  
**Marker:** `enterprise-sso-idp-staging-smoke`
**Extends:** `era16-enterprise-sso-r2-admin-v1` (**pilot_foundation**)  
**Smoke:** `npm run smoke:enterprise-sso-idp-staging`  
**Artifact:** `artifacts/enterprise-sso-idp-staging-smoke-summary.json`  
**Date:** 2026-05-28

---

## Purpose and honesty rules

1. **Cycle 1 delivers the plan and orchestrator** — it does **not** move SSO to `pilot_ready` or claim production SSO.
2. **Cycle 2 requires operator proof** — one successful IdP login → dashboard on staging with audit event `sso.login_success`.
3. **Cycle 3 gates `pilot_ready`** — only after Cycle 2 artifact exists (`era17-enterprise-sso-pilot-ready-v1`).
4. **One IdP per pilot workspace** — Okta, Microsoft Entra ID, or Auth0, not multiple simultaneously.

**Unsafe headline:** “Enterprise SSO included,” “SAML live today,” or “pilot_ready without staging artifact.”

---

## Supported pilot IdPs

| Vendor | `SSO_STAGING_IDP_VENDOR` | Notes |
|--------|--------------------------|-------|
| Okta | `OKTA` | Okta Developer Edition org recommended for staging |
| Microsoft Entra ID | `ENTRA_ID` | Azure AD / Entra test tenant; aliases `ENTRA`, `AZURE`, `MICROSOFT` accepted in smoke script |
| Auth0 | `AUTH0` | SAML addon on Auth0 app → Supabase SP; see `docs/auth0-supabase-saml-setup.md` |

OS Kitchen stores vendor as `SsoIdpVendor` enum (`OKTA` | `ENTRA_ID` | `AUTH0`) in `WorkspaceSsoSettings`.

---

## Environment variables

Set in local ops shell or GitHub Actions **secrets** (never commit values):

| Variable | Required | Purpose |
|----------|----------|---------|
| `E2E_STAGING_BASE_URL` | Yes | Staging OS Kitchen URL (e.g. `https://staging.kitchenos.app`) |
| `SSO_STAGING_WORKSPACE_ID` | Yes | Pilot workspace UUID — tenant-bound SSO |
| `SSO_STAGING_IDP_VENDOR` | Yes | `OKTA`, `ENTRA_ID`, or `AUTH0` |
| `SSO_STAGING_ALLOWED_DOMAIN` | Yes | Allowed email domain (e.g. `pilot.example.com`) |
| `SSO_STAGING_TEST_EMAIL` | Yes | Staff test user email in allowed domain |
| `SSO_STAGING_SUPABASE_PROVIDER_REF` | Yes | Supabase Auth SAML provider reference / UUID |
| `SSO_STAGING_BREAK_GLASS_OWNER_EMAIL` | Optional | Owner account for break-glass drill |
| `E2E_LOGIN_PASSWORD` | Optional | Owner password for break-glass (see `docs/GITHUB_E2E_STAGING_SECRETS.md`) |

### Cycle 2 operator proof env vars

After manual IdP login on staging, set these to record proof (never commit values):

| Variable | Required for proof | Purpose |
|----------|-------------------|---------|
| `SSO_STAGING_OPERATOR_EMAIL` | Yes | Operator who completed IdP login |
| `SSO_STAGING_LOGIN_SCREENSHOT_PATH` | Yes | Local path to dashboard screenshot after SSO login |
| `SSO_STAGING_AUDIT_EVENT_REF` | Yes | Audit export reference containing `sso.login_success` |
| `SSO_STAGING_NEGATIVE_TEST_NOTE` | Yes | At least one denial test (wrong domain / workspace / disabled SSO) |
| `SSO_STAGING_BREAK_GLASS_DRILL_NOTE` | Optional | Break-glass owner login drill outcome |

**Policy:** `era17-enterprise-sso-idp-login-proof-v1` — `loginProofStatus: proof_passed` only when all operator proof env vars validate.

**Legacy alias:** `E2E_PASSWORD` accepted for break-glass owner password in CI only.

---

## Okta test tenant setup

1. Create or use an **Okta Developer** org (free tier).
2. **Applications → Create App Integration → SAML 2.0**.
3. Configure SAML:
   - **Single sign-on URL:** Supabase Auth ACS URL from Supabase Dashboard → Authentication → SSO.
   - **Audience URI (SP Entity ID):** Supabase SAML entity ID.
   - **Name ID format:** EmailAddress.
   - **Application username:** Email.
4. Assign a test user with email `@SSO_STAGING_ALLOWED_DOMAIN`.
5. Download IdP metadata XML for Supabase SAML provider setup.
6. Record Okta app ID and test user email in ops vault (not git).

---

## Microsoft Entra ID test tenant setup

1. Use an **Entra ID test tenant** or dedicated app registration in a non-production directory.
2. **Enterprise applications → New application → Create your own (non-gallery)** — SAML.
3. Configure **Basic SAML Configuration** with Supabase ACS URL and entity ID.
4. **User Attributes & Claims:** map `emailaddress` → `user.mail` (or equivalent).
5. Assign test user with email in `SSO_STAGING_ALLOWED_DOMAIN`.
6. Download **Federation Metadata XML** for Supabase.
7. Record application object ID and test user in ops vault.

---

## Auth0 SAML IdP setup

Full walkthrough: **`docs/auth0-supabase-saml-setup.md`**.

1. Auth0 Dashboard → **Applications** → create **Regular Web Application**.
2. **Addons → SAML2 WEB APP** — set Supabase **Entity ID** (audience) and **ACS URL** (recipient).
3. Map email claim; use **emailAddress** name identifier format.
4. Download IdP metadata → upload to Supabase SAML provider.
5. Create test user with email `@SSO_STAGING_ALLOWED_DOMAIN`.
6. Set `SSO_STAGING_IDP_VENDOR=AUTH0` and workspace SSO pilot **IdP vendor → Auth0**.

---

## Supabase SAML configuration

1. Supabase project (staging) → **Authentication → SSO / SAML**.
2. **Add provider** — upload IdP metadata from Okta, Entra, or Auth0.
3. Note the **provider reference** → set `SSO_STAGING_SUPABASE_PROVIDER_REF`.
4. Confirm redirect URLs include staging OS Kitchen `/auth/callback`.
5. **Do not** enable SSO globally for all Supabase users — workspace gate remains in OS Kitchen (`PILOT_ACTIVE` + `ssoOidc` entitlement).

---

## OS Kitchen workspace SSO pilot wiring

1. Confirm workspace owner has **`ssoOidc`** entitlement (Enterprise plan or billing override).
2. **Settings → Security → SSO pilot:**
   - IdP vendor: Okta, Entra ID, or Auth0
   - Allowed email domains: match `SSO_STAGING_ALLOWED_DOMAIN`
   - Supabase provider ref: `SSO_STAGING_SUPABASE_PROVIDER_REF`
   - Break-glass owner enabled: **true** for pilot
3. **Activate** pilot → `PILOT_ACTIVE` (tenant-scoped only).
4. Staff: **`/login` → Sign in with SSO** with workspace UUID (`SSO_STAGING_WORKSPACE_ID`).
5. Callback: `/auth/callback?sso_workspace_id=<uuid>` — validated by `validateSsoCallbackSession`.

---

## Staging smoke checklist

Run locally or in ops session:

```bash
npm run smoke:enterprise-sso-r2-pilot          # wiring cert (Era 16)
npm run smoke:enterprise-sso-idp-staging       # Era 17 plan + prerequisites
```

| Step | Owner | Pass criteria |
|------|-------|---------------|
| Wiring cert | CI / local | `smoke:enterprise-sso-r2-pilot` exit 0 |
| Prerequisites | Ops | All `SSO_STAGING_*` env vars set |
| Staging health | Ops | `GET {E2E_STAGING_BASE_URL}/api/health` → 200 |
| IdP browser login | Operator | SSO login → dashboard; screenshot saved |
| Guarded mutation | Operator | One RBAC-guarded action succeeds under SSO session |
| Audit event | Operator | `sso.login_success` in audit log |
| Summary artifact | Ops | `artifacts/enterprise-sso-idp-staging-smoke-summary.json` updated |

Missing IdP credentials → smoke exits **0** with **SKIPPED WITH REASON** (honest skip).

---

## Break-glass access

| Scenario | Expected behavior |
|----------|-------------------|
| IdP outage | Owner uses email/password on `/login` when `breakGlassOwnerEnabled` is true |
| Misconfigured SAML | Fail closed — login error, no cross-tenant session |
| Audit | `sso.break_glass_used` when break-glass path is exercised (if wired) |

**Drill (Cycle 2):**

1. Set `SSO_STAGING_BREAK_GLASS_OWNER_EMAIL` + `E2E_LOGIN_PASSWORD`.
2. Simulate IdP unavailable (disable Okta app or Entra assignment).
3. Owner logs in via email/password → confirm dashboard access.
4. Re-enable IdP before negative tests.

---

## Tenant mapping and negative tests

Execute manually on staging after positive login proof:

| Test | Input | Expected |
|------|-------|----------|
| Wrong email domain | SSO user outside `allowedEmailDomains` | Deny; `sso.login_denied`; no session |
| Wrong workspace UUID | `/login` SSO with another tenant's UUID | Deny; no cross-tenant session |
| Disabled SSO | `PILOT_CONFIGURED` or `enabled=false` | Sign in with SSO unavailable |
| Missing provider ref | Cleared `supabaseSsoProviderRef` | Fail closed at initiation |
| No entitlement | Workspace without `ssoOidc` | Admin SSO settings blocked |

---

## Rollback procedure

1. **Settings → Security → SSO pilot → Deactivate** (return to `PILOT_CONFIGURED` or `DISABLED`).
2. Disable or remove Supabase SAML provider for pilot ref.
3. Confirm `/login` Sign in with SSO fails closed for workspace UUID.
4. Verify break-glass owner email/password still works when enabled.
5. Document rollback timestamp and operator in ops log.

Policy rollback steps: `ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ROLLBACK_STEPS` in era17 policy module.

---

## Cycle 2 evidence requirements

**Policy:** `era17-enterprise-sso-idp-login-proof-v1` — operator proof path; delivery remains **pilot_foundation**.

Before Cycle 3 qualified pilot gate (`era17-enterprise-sso-pilot-ready-v1`), collect:

1. **Screenshot** — SSO login landing on dashboard (staging URL visible); path in `SSO_STAGING_LOGIN_SCREENSHOT_PATH`.
2. **Smoke JSON** — `artifacts/enterprise-sso-idp-staging-smoke-summary.json` with `loginProofStatus: proof_passed` and `idp_browser_login` step **PASSED**.
3. **Audit export** — row with action `sso.login_success`; reference in `SSO_STAGING_AUDIT_EVENT_REF`.
4. **Negative test notes** — `SSO_STAGING_NEGATIVE_TEST_NOTE` (wrong-domain or wrong-workspace denial).

Run: `npm run smoke:enterprise-sso-idp-staging`

**When credentials missing:** artifact shows `loginProofStatus: proof_skipped_missing_prerequisites` and lists all missing `SSO_STAGING_*` / `E2E_STAGING_BASE_URL` vars — not fake success.

**Non-claims after Cycle 2:** still not production SSO for all tenants; not SOC2/SCIM; Cycle 3 gate required before qualified pilot-ready delivery status.

---

## Cycle 2 execution record (2026-05-28)

**Policy:** `era17-enterprise-sso-idp-login-proof-v1` — engineering complete; **awaiting_operator_proof**.

| Check | Result |
|-------|--------|
| Wiring cert (`smoke:enterprise-sso-r2-pilot`) | **PASSED** |
| IdP staging prerequisites | **SKIPPED WITH REASON** — 6 env vars unset locally |
| Staging health / login page | **SKIPPED** (prerequisites missing) |
| `idp_browser_login` | **SKIPPED** — no Okta/Entra + staging secrets in ops shell |
| Smoke overall | **SKIPPED** (wiring cert passed; login proof not attested) |
| Artifact | `artifacts/enterprise-sso-idp-staging-smoke-summary.json` → `loginProofStatus: proof_skipped_missing_prerequisites`; `overall: SKIPPED` |

**Missing locally:** `E2E_STAGING_BASE_URL`, `SSO_STAGING_WORKSPACE_ID`, `SSO_STAGING_IDP_VENDOR`, `SSO_STAGING_ALLOWED_DOMAIN`, `SSO_STAGING_TEST_EMAIL`, `SSO_STAGING_SUPABASE_PROVIDER_REF`.

**Ops unblock:** Configure vars per [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) → manual IdP login on staging → set operator proof env vars → re-run `npm run smoke:enterprise-sso-idp-staging`.

**No maturity promotion:** SSO remains **pilot_foundation** until gate summary shows `promotionAllowed: true` (`era17-enterprise-sso-pilot-ready-v1`).

**Cycle 3 gate (2026-05-28):** `era17-enterprise-sso-pilot-ready-v1` wired — run `npm run smoke:enterprise-sso-pilot-ready-gate` after Cycle 2 smoke; delivery stays **pilot_foundation** until `loginProofStatus: proof_passed`.

---

## Related docs

- [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md) — R2 architecture and acceptance criteria
- [`enterprise-sso-operator-runbook-era17.md`](./enterprise-sso-operator-runbook-era17.md) — qualified pilot support boundaries (`era17-enterprise-sso-operator-runbook-v1`)
- [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md) — staging URL and login secrets
- [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) — pilot GO/NO-GO and forbidden claims
- [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) — buyer FAQ (unchanged until `pilot_ready`)

**CI:** `npm run test:ci:enterprise-sso-idp-staging-era17:cert` (chained in `test:ci:enterprise-identity-roadmap:cert`).
