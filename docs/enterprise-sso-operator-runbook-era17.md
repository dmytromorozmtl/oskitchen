# Enterprise SSO — Qualified Pilot Operator Runbook (Era 17)

**Policy:** `era17-enterprise-sso-operator-runbook-v1`  
**Proof status:** `operator_runbook_ready` (doc + cert)  
**SSO delivery:** **pilot_foundation** — NOT `pilot_ready` until Cycle 2 IdP login artifact + Cycle 3 gate  
**Parent:** [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) · [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md)

Support can run a **qualified SSO pilot** using this runbook. It does **not** authorize production SSO claims for all tenants.

---

## Purpose and honest scope

This runbook covers **one pilot workspace** with:

- `ssoOidc` entitlement (Enterprise plan or billing override)
- Okta **or** Microsoft Entra ID test/staging tenant
- Supabase SAML provider reference wired in KitchenOS admin
- `PILOT_ACTIVE` tenant-scoped SSO pilot

**Out of scope:** SCIM provisioning, SOC2 Type II, production SAML for every customer, cross-tenant SSO without workspace UUID.

```bash
npm run smoke:enterprise-sso-operator-runbook
npm run smoke:enterprise-sso-idp-staging
npm run test:ci:enterprise-sso-idp-staging-era17:cert
```

---

## Break-glass process

| Scenario | Action | Expected |
|----------|--------|----------|
| IdP outage | Owner uses email/password on `/login` when `breakGlassOwnerEnabled` is true | Dashboard access; audit `sso.break_glass_used` if wired |
| Misconfigured SAML | Do not bypass — fix IdP metadata or Supabase provider | Fail closed; no cross-tenant session |
| Locked out owner | Platform support uses documented break-glass owner only — no password reset bypass of tenant isolation | Owner regains access; SSO remains disabled until fixed |

**Drill (optional, staging):**

1. Set `SSO_STAGING_BREAK_GLASS_OWNER_EMAIL` + `E2E_LOGIN_PASSWORD`.
2. Disable Okta app or Entra assignment temporarily.
3. Owner logs in via email/password → confirm dashboard.
4. Re-enable IdP before negative tests.

---

## Rollback procedure

Execute in order if SSO pilot must be disabled:

1. **Settings → Security → SSO pilot → Deactivate** (PILOT_CONFIGURED or DISABLED).
2. Disable or remove Supabase SAML provider for pilot ref.
3. Confirm /login Sign in with SSO fails closed for workspace UUID.
4. Verify break-glass owner email/password when breakGlassOwnerEnabled.
5. Document rollback timestamp and operator in ops log.

Policy steps: `ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS` in `lib/enterprise/enterprise-sso-operator-runbook-era17-policy.ts`.

---

## Support boundaries

| In scope | Out of scope |
|----------|--------------|
| One pilot workspace + one IdP vendor | Multi-tenant SSO for all customers |
| Okta/Entra **test** tenant setup guidance | Production IdP SLA or 24/7 SSO on-call |
| Break-glass when configured | Password reset that bypasses RBAC |
| IdP metadata / ACS URL troubleshooting | Custom SAML attribute mapping beyond email |
| Honest `pilot_foundation` buyer language | `pilot_ready` or production SSO sales claims |

Escalate to engineering when: callback errors persist after IdP metadata refresh, cross-tenant session suspected, or audit events missing for login attempts.

---

## Entitlement handling

| Check | Where | Fail closed? |
|-------|-------|--------------|
| `ssoOidc` plan feature | Billing / entitlements | Admin SSO settings blocked without entitlement |
| `WorkspaceSsoSettings.enabled` | Settings → Security → SSO pilot | Sign in with SSO hidden or disabled |
| `PILOT_ACTIVE` status | SSO pilot activation | SSO login unavailable |
| `allowedEmailDomains` | Workspace SSO settings | Users outside domain denied at callback |
| `supabaseSsoProviderRef` | Workspace SSO settings | Initiation fails without provider ref |

**Never** enable SSO globally in Supabase for all users — workspace gate remains in KitchenOS.

---

## Owner and admin responsibilities

**Workspace owner:**

- Approve IdP test tenant and allowed email domain list
- Maintain break-glass owner account separately from IdP-only users
- Authorize pilot activation and rollback
- Provide written pilot agreement scope (no production SSO claim)

**KitchenOS support (qualified pilot):**

- Verify env vars and smoke artifacts before citing SSO in contract
- Run `smoke:enterprise-sso-idp-staging` after IdP changes
- Capture screenshot + audit ref on successful Cycle 2 login
- Run negative tests (wrong domain, wrong workspace) and record notes

**Engineering:**

- Maintain callback guard (`validateSsoCallbackSession`) and tenant isolation tests — see `era17-enterprise-sso-tenant-mapping-v1`
- Do not promote to `pilot_ready` without `loginProofStatus: proof_passed`

---

## Common failure modes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Sign in with SSO missing | No entitlement or pilot not active | Enable `ssoOidc`; activate pilot |
| SAML error at IdP | ACS URL / entity ID mismatch | Reconcile Supabase ↔ IdP metadata |
| Login succeeds but no dashboard | Wrong workspace UUID on `/login` | Use correct `SSO_STAGING_WORKSPACE_ID` |
| Email outside domain denied | Expected — domain guard | Add domain to allowlist or use correct test user |
| Infinite redirect loop | Callback URL not allowlisted | Add staging URL to Supabase redirect list |
| Break-glass fails | `breakGlassOwnerEnabled` false or wrong password | Enable in SSO pilot settings; reset owner password |

---

## Audit event expectations

| Event | When | Support action |
|-------|------|----------------|
| `sso.login_success` | Successful IdP login → session | Required for Cycle 2 proof; export ref in artifact |
| `sso.login_denied` | Wrong domain, workspace, or disabled SSO | Required for negative test note |
| `sso.break_glass_used` | Owner email/password during IdP outage | Document in ops log if drill executed |

Audit export permission: `audit.export` for sensitive detail review — see audit center RBAC docs.

---

## Customer-facing limitations

**Safe to say (qualified pilot):**

- "SSO pilot available for **one workspace** with Okta or Entra ID test tenant"
- "Break-glass owner login when configured"
- "Delivery status **pilot_foundation** — staging proof required before broader rollout"

**Do not say:**

- "Enterprise SSO included" (implies all tenants)
- "SAML live today" without staging artifact
- "Same as Okta/Entra production SSO for your whole org"
- SOC2 Type II, SCIM, or production SSO SLA

Procurement language: [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) § SSO.

---

## Forbidden claims

Enforced via `era17-pilot-forbidden-claims-enforcement-v1` and claims registry:

- Production SSO for all tenants
- `pilot_ready` without IdP login artifact
- SOC2 Type II or SCIM provisioning
- Enterprise SSO in all plans without entitlement check
- SAML live without `artifacts/enterprise-sso-idp-staging-smoke-summary.json` proof

---

## Validation

```bash
npm run smoke:enterprise-sso-operator-runbook
npm run smoke:enterprise-sso-idp-staging
npm run test:ci:enterprise-sso-r2-pilot-era16:cert
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

**Artifact:** `artifacts/enterprise-sso-operator-runbook-summary.json` (`ssoOperatorProofStatus: operator_runbook_ready`).

---

## Related docs

| Doc | Use |
|-----|-----|
| [`enterprise-sso-idp-staging-smoke-plan.md`](./enterprise-sso-idp-staging-smoke-plan.md) | Cycle 1–2 ops plan + env vars |
| [`enterprise-sso-r2-pilot-design.md`](./enterprise-sso-r2-pilot-design.md) | Architecture + cycle ledger |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Buyer FAQ honesty |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Paid pilot gates |
