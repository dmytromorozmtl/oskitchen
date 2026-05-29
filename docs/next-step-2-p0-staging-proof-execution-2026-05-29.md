# Next Step 2 — P0 Staging Proof Execution (post-vault)

**Date:** 2026-05-29  
**Prerequisite:** Step 1 vault readiness tooling complete (`npm run check-vault-readiness -- --write`)  
**Goal:** `p0ProofStatus: proof_passed` with real child smoke PASS — never SKIPPED-as-PASS  
**Audience:** DevOps, Security, Integration engineer, VP Operations

---

## Entry criteria (Step 2 starts when)

| Check | Command | Expected |
|-------|---------|----------|
| Vault report generated | `npm run check-vault-readiness -- --write` | `artifacts/vault-readiness-report.json` + `.html` |
| All 11 secrets present | `npm run ops:validate-p0-vault-env` | exit 0 |
| Staging health | `npm run ops:check-p0-staging-health` | PASS on `/api/health` |
| Day 0 orchestrator | `npm run ops:run-p0-vault-day0-orchestrator -- --write` | milestone ≥ `env_complete` |

If any secret missing — **stop**. Return to [`ops-vault-matrix.md`](./ops-vault-matrix.md).

---

## Execution sequence (strict order)

### 2.1 Staging login phase (3 vars)

**Vars:** `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`

```bash
npm run ops:check-p0-staging-health
npm run smoke:staging-workflows-first-green
```

**Acceptance:** `artifacts/staging-workflows-first-green-summary.json` → `firstGreenProofStatus: proof_passed` with GitHub run URLs.

**Rollback:** Verify GitHub Environment secrets; confirm staging URL has no trailing slash issues.

---

### 2.2 Database + channel phase (3 vars)

**Vars:** `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL`

```bash
npm run smoke:woo-shopify-live
```

**Acceptance:** `artifacts/channel-live-smoke-summary.json` → Woo **or** Shopify `proof_passed`; canonical order ID in artifact.

**Applies to all F&B pilots:** restaurants, bars, cafés, bakeries, catering — channel may be Woo, Shopify, or storefront-only with honest defer.

---

### 2.3 SSO IdP phase (6 vars)

**Vars:** `SSO_STAGING_*` (5) + shared `E2E_STAGING_BASE_URL`

```bash
npm run smoke:enterprise-sso-idp-staging
```

**Acceptance:** `artifacts/enterprise-sso-idp-staging-smoke-summary.json` → `loginProofStatus: proof_passed`.

**Note:** Required for enterprise SSO pilots; optional for non-SSO pilot if `PILOT_GONOGO_SSO_PILOT_REQUIRED` unset.

---

### 2.4 P0 orchestrator aggregation

```bash
npm run smoke:p0-staging-proof-unblock
npm run ops:validate-p0-staging-proof-integrity
npm run check-vault-readiness -- --write
```

**Acceptance:**

```json
{
  "p0ProofStatus": "proof_passed",
  "overall": "PASSED"
}
```

**Gate:** Do not proceed to Tier 2 until this is true.

---

## Product surfaces (auto-update after PASS)

When `proof_passed`, these surfaces hide ops vault blocker UI:

- Owner Daily Briefing hero (`P0OpsVaultPhasesPanel`)
- Integration Health P0 trust banner
- Launch Wizard today strip
- Platform commercial pilot ops status

---

## Step 3 preview (after P0 PASS)

| Task | Command | Owner |
|------|---------|-------|
| Tier 2 golden path | `npm run smoke:tier2-staging-golden-path` | QA + Integration |
| KDS Playwright | `npm run smoke:kds-staging-playwright` | QA |
| GO re-eval | `npm run smoke:pilot-gono-go` | Founder + COO |
| ICP real prospect | `npm run icp-qualification-check` | Sales |

Expected GO blockers after Step 2: ICP, LOI, customer only.

---

## Honesty guardrails

1. **Never** edit `artifacts/*.json` by hand to set `proof_passed`
2. **Never** commit SKIPPED artifacts as PASS
3. Child smoke FAILED → fix root cause, re-run — do not bypass
4. `vault-readiness-report.html` is for humans; JSON is CI source of truth

---

## RACI

| Phase | R | A |
|-------|---|---|
| Staging login | DevOps | VP Ops |
| Channel live | Integration | CTO |
| SSO IdP | Security | CTO |
| P0 aggregation | DevOps | CTO |
| Sign-off | VP Ops | Founder |
