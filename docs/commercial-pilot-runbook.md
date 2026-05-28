# KitchenOS Commercial Pilot Runbook

**Status:** canonical operator + engineering onboarding for paid pilots  
**Policy:** `era7-commercial-pilot-runbooks-v1` (`lib/commercial/commercial-pilot-runbook-policy.ts`)  
**Maturity source of truth:** [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)  
**Updated:** 2026-05-28 (Era 16 Cycle 9 — commercial pilot evidence pack)

Use this runbook for **paid pilot GO/NO-GO** and operator onboarding. It aligns sales promises with certified CI and honest matrix maturity — not with dated `docs/PILOT_*` audit files.

---

## Purpose and honesty rules

1. **Matrix wins** — If this runbook and the feature maturity matrix disagree, the matrix + policy IDs win.
2. **Certified vs manual** — Tier 0–1 are automatable checks; Tier 2–3 require human sign-off on staging.
3. **No false enterprise claims** — SSO/SCIM/SOC2 remain roadmap-only (`era13-enterprise-identity-recert-v1`, `era15-enterprise-procurement-recert-v1`, `era16-enterprise-sso-r2-pilot-v1`, `era16-enterprise-sso-r2-schema-v1`, `era16-enterprise-sso-r2-runtime-v1`, `era16-enterprise-sso-r2-admin-v1`; R2 **`supabase_saml_sso`** path **schema_ready** / **pilot_foundation** / **pilot_admin_wiring**; gated login for activated pilots only — not production SSO for all tenants).
4. **Inventory** — POS-only depletion (`era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`, `era17-pos-only-inventory-lock-v1`, `era17-pilot-inventory-messaging-v1`); storefront hook **deferred_locked**; storefront orders do not deplete stock in pilot.
5. **Rewards** — Dual ledger (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`, `era10-cross-channel-rewards-recert-v1`, `era14-cross-channel-rewards-recert-v1`); gift/loyalty codes are not interchangeable across POS and storefront; POS kitchen-ledger checkout certified; unified E2E `deferred_locked` — see `docs/cross-channel-rewards-honesty-checklist.md`.

**Unsafe pilot headline:** “Production-certified,” “enterprise SSO,” “unified inventory,” or “Toast-class KDS at rush hour.”

### Enterprise SSO pilot (optional — Era 16)

**Policy:** `era16-enterprise-sso-r2-admin-v1` — **pilot_admin_wiring** only; delivery **pilot_foundation**.

1. Confirm workspace owner has **`ssoOidc`** entitlement (Enterprise plan or override).
2. Configure Supabase SAML provider; then **Settings → Security → SSO pilot**.
3. Staff use **`/login` → Sign in with SSO** with workspace UUID (activated pilots only).
4. Run `npm run smoke:enterprise-sso-r2-pilot` for CI cert wiring — not live IdP attestation.

### Enterprise SSO IdP staging smoke (optional — Era 17)

**Policy:** `era17-enterprise-sso-idp-staging-smoke-v1` — **plan_ready**; delivery remains **pilot_foundation** until Cycle 2 IdP login proof.

1. Read `docs/enterprise-sso-idp-staging-smoke-plan.md` — Okta or Entra test tenant + Supabase SAML setup.
2. Set `E2E_STAGING_BASE_URL`, `SSO_STAGING_WORKSPACE_ID`, `SSO_STAGING_IDP_VENDOR`, `SSO_STAGING_ALLOWED_DOMAIN`, `SSO_STAGING_TEST_EMAIL`, `SSO_STAGING_SUPABASE_PROVIDER_REF` in ops vault (never git).
3. Run `npm run smoke:enterprise-sso-idp-staging` — review `artifacts/enterprise-sso-idp-staging-smoke-summary.json`.
4. Missing IdP credentials → **SKIPPED WITH REASON** (exit 0). Wiring cert failure → **FAILED** (exit 1).
5. Cycle 2: operator completes browser SSO login → dashboard; capture screenshot + audit `sso.login_success`.
6. Do **not** claim qualified pilot-ready SSO or production SSO until Cycle 3 gate with Cycle 2 `proof_passed` artifact.

**Cycle 2 status (2026-05-28):** `era17-enterprise-sso-idp-login-proof-v1` — **awaiting_operator_proof**; smoke re-run → wiring cert **PASSED**; IdP login **SKIPPED WITH REASON** (6 prerequisite env vars unset); artifact `overall: SKIPPED`. Re-run after ops configures Okta/Entra + staging secrets + operator proof env vars.

**Cycle 2 operator proof env vars:** `SSO_STAGING_OPERATOR_EMAIL`, `SSO_STAGING_LOGIN_SCREENSHOT_PATH`, `SSO_STAGING_AUDIT_EVENT_REF`, `SSO_STAGING_NEGATIVE_TEST_NOTE` — see `era17-enterprise-sso-idp-login-proof-v1`.

### Staging workflows first green (Era 17 P0 #2)

**Policy:** `era17-staging-workflows-first-green-v1` — **awaiting_github_first_green**; extends `era16-staging-workflows-first-green-v1`.

1. Configure GitHub secrets: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` (see `docs/GITHUB_E2E_STAGING_SECRETS.md`).
2. `workflow_dispatch` on `e2e-staging.yml`, `playwright-kds-staging.yml`, and optionally `woo-shopify-staging-smoke.yml`.
3. Record `GITHUB_*_RUN_URL` + `GITHUB_*_RUN_OUTCOME` (`PASSED`|`FAILED`|`SKIPPED`) after each run.
4. Run `npm run smoke:staging-workflows-first-green` — review `artifacts/staging-workflows-first-green-summary.json` (`firstGreenProofStatus`, `githubPassedCount`).
5. **proof_passed** requires **≥2/3** workflows with GitHub `PASSED` — wiring cert alone is insufficient.

**Execution status (2026-05-28):** smoke re-run → wiring cert **PASSED**; GitHub first green **SKIPPED WITH REASON** (3 prerequisite env vars unset; `overall: SKIPPED`; 0/3 GitHub runs recorded). Re-run after ops configures secrets and records `GITHUB_*_RUN_URL` + outcomes.

### Woo/Shopify live channel smoke (optional — Era 16 + Era 17)

**Era 16 channel live Woo/Shopify smoke (2026-05-28)** — superseded by Era 17 Woo proof path below; Era 16 policy `era16-channel-live-smoke-v1` remains chained in cert.

**Policy:** `era16-channel-live-smoke-v1`, **`era17-channel-live-smoke-woo-v1`**, **`era17-channel-live-smoke-shopify-v1`** — **not in default CI**; **not** full marketplace live ops.

1. Run `npm run test:ci:channel-golden-path:cert` (synthetic path).
2. Set `DATABASE_URL`, `ENCRYPTION_KEY`, and `CHANNEL_SMOKE_OWNER_EMAIL` (or `CHANNEL_SMOKE_CONNECTION_ID`).
3. Run `npm run smoke:woo-shopify-live` — review `artifacts/channel-live-smoke-summary.json` (`wooLiveProofStatus`, `shopifyLiveProofStatus`, `missingEnvVars[]`).
4. Missing credentials → **SKIPPED WITH REASON** (exit 0). Live cert failure → **FAILED** (exit 1).
5. Woo live uses `--provider woocommerce`; Shopify live uses `--provider shopify`.
6. Optional: GitHub **Woo Shopify Staging Smoke** workflow (`workflow_dispatch`).

### Era 17 channel live Woo smoke (2026-05-28)

**Policy:** `era17-channel-live-smoke-woo-v1` — **awaiting_live_credentials** until staging Woo connection configured. Summary step id: `woo_live_certification`.

**Execution status (2026-05-28):** smoke re-run → synthetic golden-path cert **PASSED**; Woo live **SKIPPED WITH REASON** (`overall: SKIPPED`; `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` unset). Re-run after ops configures staging Woo connection.

### Era 17 channel live Shopify smoke (2026-05-28)

**Policy:** `era17-channel-live-smoke-shopify-v1` — **awaiting_live_credentials** until staging Shopify connection configured. Summary step id: `shopify_live_certification`.

**Execution status (2026-05-28):** smoke re-run → synthetic golden-path cert **PASSED**; Shopify live **SKIPPED WITH REASON** (`overall: SKIPPED`; same prerequisite env vars as Woo). Re-run after ops configures staging Shopify connection.

### Era 17 channel GitHub workflow first green (2026-05-28)

**Policy:** `era17-channel-github-workflow-first-green-v1` — **awaiting_github_first_green** until `woo-shopify-staging-smoke.yml` workflow_dispatch PASS is recorded.

1. Configure GitHub secrets: `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` (see `docs/GITHUB_E2E_STAGING_SECRETS.md`).
2. Actions → **Woo Shopify Staging Smoke** → Run workflow (`workflow_dispatch`).
3. Record `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME` (`PASSED` | `FAILED` | `SKIPPED`).
4. Run `npm run smoke:channel-github-workflow-first-green` — review `artifacts/channel-github-workflow-first-green-summary.json`.
5. Missing secrets or GitHub run → **SKIPPED WITH REASON** (exit 0). GitHub FAILED → **FAILED** (exit 1).
6. Do **not** claim channel live ops proven without GitHub `proof_passed` artifact.

### Era 17 channel pilot playbook (2026-05-28)

**Policy:** `era17-channel-pilot-playbook-v1` — **operator_ready** one-page Woo/Shopify guide for qualified pilots.

1. Use [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) for owner/operator **qualified test shop** setup (~30–45 min per channel).
2. Links smoke commands, sign-off checklist, forbidden marketplace claims, and rollback steps.
3. Does **not** substitute live smoke PASS or GitHub workflow evidence — documents honest SKIPPED WITH REASON.
4. Full GO/NO-GO: `npm run cert:commercial-pilot-evidence-era16`.

### Era 17 pilot ICP + contract template (2026-05-28)

**Policy:** `era17-pilot-icp-contract-v1` — **template_ready** for sales/legal; not a signed agreement.

1. Use [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) — **qualified pilot customer profile**, disqualifiers, allowed/forbidden claims.
2. Default **pilot duration** 90 days (30–180 qualified window); define **success metrics** in Exhibit C.
3. Run ICP qualification (`lib/commercial/pilot-icp-contract-era17.ts`) before contract draft.
4. Set `icpQualified: false` in evidence pack → **NO-GO** blocker.
5. Pre-signature checklist includes `verify-claims` strict + Tier 0 PASS.

### Era 17 pilot Tier 0/1 preflight (2026-05-28)

**Policy:** `era17-pilot-tier-preflight-v1` — **awaiting_tier_preflight_pass** on release branch; not paid pilot GO.

1. Run **`npm run smoke:pilot-tier-preflight`** on the release commit (includes full `test:ci:governance-bundles`).
2. Review **`artifacts/pilot-tier-preflight-summary.json`** — `tier0ProofStatus`, `tier1ProofStatus`, `overall`.
3. Local dev may use `--skip-governance-bundles` or `--skip-staging-env` — **SKIPPED WITH REASON**; do not treat as paid pilot GO.
4. Tier 0 FAIL blocks operator Tier 2; Tier 1 staging-env skip is acceptable locally when secrets absent.
5. Cert wiring: `test:ci:pilot-tier-preflight-era17:cert` chained in `test:ci:commercial-pilot-runbook:cert`.

**Execution status (2026-05-28):** local smoke (`--skip-governance-bundles --skip-staging-env`) → Tier 1 claims **PASSED**; Tier 0 **FAILED** (`test:ci:scorecard:cert` exit 1); `overall: FAILED`. Not paid pilot GO until full release-branch run passes all Tier 0 steps.

### Era 17 pilot operator golden path (2026-05-28)

**Policy:** `era17-pilot-operator-golden-path-v1` — **awaiting_operator_execution**; Tier 2 manual staging checklist.

1. Use [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md) — 45–60 min owner + staff phases.
2. Run **`npm run smoke:pilot-operator-golden-path`** after checklist; review **`artifacts/pilot-operator-golden-path-summary.json`**.
3. Set `PILOT_GOLDEN_PATH_<PHASE>_MANUAL=PASSED|FAILED` per completed phase; staging URL + operator email required.
4. CI wiring runs `smoke:channel-golden-path` + `smoke:kds-staging` (POS money-path cert optional via `--with-pos-ci`).
5. **`phaseProofStatus: proof_passed`** required before Tier 3 money-path smoke or paid pilot GO.

### Era 17 pilot GO/NO-GO evaluator (2026-05-28)

**Policy:** `era17-pilot-gono-go-v1` — **awaiting_customer_execution**; aggregates Era 17 evidence into one decision.

1. Run **`npm run smoke:pilot-gono-go`** after Tier 0/1 + Tier 2 artifacts exist **and** `artifacts/pilot-forbidden-claims-enforcement-summary.json` is fresh.
2. Review **`artifacts/pilot-gono-go-summary.json`** — `decision`, `blockers`, `customerExecutionStatus`, `evidenceGates` (includes forbidden-claims enforcement).
3. Set `PILOT_GONOGO_ICP_INPUT_JSON` from prospect qualification; default empty → **NOT QUALIFIED** → **NO-GO**.
4. Record `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` only when real LOI signed — **never fake customer execution**.
5. **NO-GO is expected** until tiers pass, forbidden-claims enforcement passes, ICP qualifies, role checklists complete, and customer LOI recorded.

**Execution status (2026-05-28):** smoke re-run → **decision: NO-GO** (`customerExecutionStatus: skipped_missing_customer`). Tier preflight `overall: FAILED` locally; Tier 2 golden path incomplete; ICP not qualified; forbidden-claims gate wired into GO/NO-GO evaluator; no LOI. Artifact: `artifacts/pilot-gono-go-summary.json`. **Do not treat as paid pilot GO.**

### Era 17 pilot forbidden-claims enforcement (2026-05-28)

**Policy:** `era17-pilot-forbidden-claims-enforcement-v1` — **awaiting_forbidden_claims_enforcement_pass**; pre-sales claims gate.

1. Run **`npm run smoke:pilot-forbidden-claims-enforcement`** on release branch before pilot contract signature.
2. Review **`artifacts/pilot-forbidden-claims-enforcement-summary.json`** — `claimsEnforcementProofStatus`.
3. Requires `MARKETING_CLAIMS_STRICT=1 verify-claims` PASS + `audit:marketing-claims` PASS + claims/procurement cert chain PASS.
4. **FAIL blocks paid pilot sales** until GTM copy, claims registry, or procurement pack is corrected.
5. Chain into Tier 1 preflight and ICP pre-signature checklist (`pilot-icp-contract-template-era17.md`).

**Execution status (2026-05-28):** local smoke re-run on current HEAD → **overall: PASSED** (`claimsEnforcementProofStatus: proof_passed`). Strict verify-claims, registry audit, and procurement cert chain green. Wired into **`era17-pilot-gono-go-v1`** evidence gates — GO/NO-GO blocks when artifact missing or not `proof_passed`. Re-run on **release branch** before each pilot contract signature.

### Era 17 KDS staging Playwright proof (2026-05-28)

**Policy:** `era17-kds-staging-playwright-proof-v1` — **awaiting_github_kds_playwright_pass**; GitHub evidence for Tier E Playwright.

1. Configure GitHub secrets: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`.
2. `workflow_dispatch` on **`playwright-kds-staging.yml`** → record `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED|FAILED|SKIPPED`.
3. Run **`npm run smoke:kds-staging-playwright`** → review **`artifacts/kds-staging-playwright-proof-summary.json`** (`playwrightProofStatus`).
4. **Do not claim rush-hour KDS or default-CI Playwright** — qualified staging pilot only.

**Execution status (2026-05-28):** smoke re-run → **overall: SKIPPED** (`playwrightProofStatus: proof_skipped_missing_prerequisites`; wiring cert PASSED). Missing: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`, `GITHUB_KDS_STAGING_RUN_URL`, `GITHUB_KDS_STAGING_RUN_OUTCOME`. Artifact: `artifacts/kds-staging-playwright-proof-summary.json`. **Do not claim GitHub Playwright PASS or rush-hour KDS.**

### Era 17 KDS qualified sales one-pager (2026-05-28)

**Policy:** `era17-kds-qualified-sales-onepager-v1` — **sales_onepager_ready**; sales-safe KDS pilot wording for qualified contracts.

1. Use **`docs/kds-qualified-sales-onepager-era17.md`** — allowed/forbidden claims, evidence paths, sign-off checklist.
2. Safe wording: daily-service bump/recall — **qualified pilot path**; **not rush-hour certified**.
3. Engineering: `npm run test:ci:kds-staging-smoke:cert` + `npm run smoke:kds-staging`.
4. Staging: optional `playwright-kds-staging.yml` + `smoke:kds-staging-playwright` — SKIPPED WITH REASON without secrets.
5. Pre-signature: `npm run smoke:pilot-forbidden-claims-enforcement` must PASS.

**Enforcement:** `test:ci:kds-qualified-sales-onepager-era17:cert` (chained in `test:ci:kds-staging-smoke:cert`)

---

## Era 17 POS-only inventory lock recert (2026-05-28)

**Policy:** `era17-pos-only-inventory-lock-v1` — **pos_only_lock_recertified**; storefront depletion hook remains **deferred_locked**.

1. POS checkout only: `services/pos/pos-checkout-service.ts` → `recordPendingInventoryImpactsForPosOrder`.
2. Non-depleting scan: storefront, manual, public API, Woo/Shopify webhook handlers — no depletion imports.
3. Run **`npm run smoke:pos-only-inventory-lock`** → review **`artifacts/pos-only-inventory-lock-summary.json`** (`lockProofStatus`).
4. Do **not** claim unified cross-channel inventory depletion in pilot contracts.

**Enforcement:** `test:ci:pos-only-inventory-lock-era17:cert` (chained in `test:ci:inventory-depletion:cert`)

**Operator doc:** `docs/pos-only-inventory-lock-era17.md`

---

## Era 17 pilot inventory messaging (2026-05-28)

**Policy:** `era17-pilot-inventory-messaging-v1` — **pilot_inventory_messaging_ready**; sales training for POS-only depletion.

1. Use **`docs/pilot-inventory-messaging-era17.md`** — safe/forbidden phrases, demo script, objection handling.
2. POS depletes; storefront/API/Woo/Shopify do **not** — storefront hook **deferred_locked**.
3. Run **`npm run smoke:pilot-inventory-messaging`** before pilot contract signature.
4. Chain with **`npm run smoke:pilot-forbidden-claims-enforcement`** — no unified inventory claims.
5. Optional attestation: `PILOT_INVENTORY_MESSAGING_ATTESTATION_EMAIL`.

**Enforcement:** `test:ci:pilot-inventory-messaging-era17:cert` (chained in `test:ci:inventory-depletion:cert`)

---

## Era 17 costing pilot spot check (2026-05-28)

**Policy:** `era17-costing-pilot-spotcheck-v1` — **pilot_menu_margin_spotcheck_documented**; recipe → margin report math for pilot menu.

1. Configure pilot menu items with active recipes + ingredient costs on staging.
2. Run **Recalculate costing** (`reports.read.financial` required).
3. Open **`/dashboard/reports/margin_report`** — spot-check food cost % and margin % formulas (`costing-pilot-menu-spotcheck-math`, `marginReportRowConsistent`).
4. Operator doc: **`docs/costing-pilot-spotcheck-era17.md`**
5. Run **`npm run smoke:costing-pilot-spotcheck`** → **`artifacts/costing-pilot-spotcheck-summary.json`**
6. **Forbidden:** accountant-certified food cost, Lightspeed costing parity.

**Enforcement:** `test:ci:costing-pilot-spotcheck-era17:cert` (chained in `test:ci:rbac-wave3`)

---

## Era 17 nav maturity sweep (2026-05-28)

**Policy:** `era17-nav-maturity-sweep-v1` — **nav_maturity_sweep_recertified**; Era 17 preview route classification + focused nav honesty recert.

1. **New preview routes:** SSO pilot settings, POS inventory impacts, costing theft alerts, holiday packages, 7shifts sync.
2. **Focused nav:** `findNavPageMaturityHonestyGaps()` must return **zero** gaps (`page-maturity-honesty`, `PageMaturityRouteNotice`).
3. Run **`npm run smoke:nav-maturity-sweep-era17`** → **`artifacts/nav-maturity-sweep-era17-summary.json`**
4. **Forbidden:** hiding preview badges or promoting preview routes to live in sales copy.

**Enforcement:** `test:ci:nav-maturity-sweep-era17:cert` (chained in `test:ci:page-maturity-sweep:cert`)

---

## Era 17 channel pilot setup wizard (2026-05-28)

**Policy:** `era17-channel-pilot-setup-wizard-v1` — **pilot_setup_wizard_ready**; 5-step in-app wizard on Woo/Shopify integration pages.

1. **Surfaces:** Dashboard → Integrations → WooCommerce or Shopify — `ChannelPilotSetupWizard` with progress tracker.
2. **Steps:** save credentials → test connection → configure webhooks → verify webhook → run certification (`evaluateChannelPilotSetupProgress`).
3. Operator doc: **`docs/channel-pilot-setup-wizard-era17.md`**
4. Run **`npm run smoke:channel-pilot-setup-wizard`** → **`artifacts/channel-pilot-setup-wizard-summary.json`**
5. **Forbidden:** one-click marketplace connect; production-certified Woo/Shopify for all tenants.

**Enforcement:** `test:ci:channel-pilot-setup-wizard-era17:cert` (chained in `test:ci:channel-pilot-playbook-era17:cert`)

## Era 17 permission denied UX consistency (2026-05-28)

**Policy:** `era17-permission-denied-ux-v1` — **permission_denied_ux_consistent**; standardized RBAC denial cards on POS/KDS pilot surfaces.

1. **Surfaces:** POS terminal, POS hub, POS layout, KDS — `PermissionDeniedSurfaceCard` + `resolvePermissionDeniedSurface` + `permission-denied-card` test id.
2. **Copy:** includes missing permission key (e.g. `pos.access`, `kitchen.view`) — ask owner for role update.
3. Operator doc: **`docs/permission-denied-ux-era17.md`**
4. Run **`npm run smoke:permission-denied-ux`** → **`artifacts/permission-denied-ux-summary.json`**
5. **Forbidden:** treating RBAC denial as product bug; claiming hardware POS permission UX parity.

**Enforcement:** `test:ci:permission-denied-ux-era17:cert` (chained in `test:ci:pos-tablet-ux-era17:cert`)

### Era 17 operational sign-off staging proof (2026-05-28)

**Policy:** `era17-operational-signoff-staging-proof-v1` — **awaiting_staging_operator_signoff**; real staging URL + operator identity for KDS + production calendar.

1. Set `OPERATIONAL_SIGNOFF_STAGING_URL` + `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL`.
2. Run **`npm run smoke:operational-signoff-staging`** → review **`artifacts/operational-signoff-staging-proof-summary.json`** (`stagingProofStatus`).
3. Complete manual KDS + production calendar checklists on staging.
4. Re-run with `OPERATIONAL_SIGNOFF_KDS_MANUAL=passed` and `OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL=passed` when checklists complete.
5. **Do not claim rush-hour or full production SLO certification.**

**Execution status (2026-05-28):** local smoke → wiring cert **PASSED**; staging proof **SKIPPED WITH REASON** (`stagingProofStatus: proof_skipped_missing_prerequisites`). Missing: `OPERATIONAL_SIGNOFF_STAGING_URL`, `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL`.

### Era 17 production calendar operator drill (2026-05-28)

**Policy:** `era17-production-calendar-operator-drill-v1` — **awaiting_staging_operator_drill**; staging manual checklist execution path.

1. Set `PRODUCTION_CALENDAR_DRILL_STAGING_URL` + `PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL`.
2. Run **`npm run smoke:production-calendar-drill`** → review **`artifacts/production-calendar-operator-drill-summary.json`** (`drillProofStatus`).
3. Complete manual checklist in [`production-calendar-operator-checklist.md`](./production-calendar-operator-checklist.md) on staging.
4. Re-run with `PRODUCTION_CALENDAR_DRILL_MANUAL=passed` when all seven steps pass.
5. **Do not claim rush-hour or drag-and-drop production calendar certification.**

**Execution status (2026-05-28):** smoke re-run → **overall: SKIPPED** (`drillProofStatus: proof_skipped_missing_prerequisites`; wiring cert PASSED). Missing: `PRODUCTION_CALENDAR_DRILL_STAGING_URL`, `PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL`. Artifact: `artifacts/production-calendar-operator-drill-summary.json`. **Do not claim staging operator drill PASS without manual attestation.**

### Era 17 pilot metrics baseline (2026-05-28)

**Policy:** `era17-pilot-metrics-baseline-v1` — **awaiting_baseline_capture**; real KPI snapshot only after pilot week-2 data.

1. Use [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) — orders/day, checkout success, KDS bump, support tickets, operator feedback.
2. Run **`npm run smoke:pilot-metrics-baseline`** — review **`artifacts/pilot-metrics-baseline-summary.json`** (`baselineProofStatus`).
3. Pre-pilot: `--template-only` → all metrics **SKIPPED WITH REASON** (honest).
4. Do **not** cite template targets or partial snapshots in investor materials — Era 41 requires `overall: PASSED` / `proof_captured` only.

**Execution status (2026-05-28):** smoke re-run → **overall: SKIPPED** (`baselineProofStatus: proof_skipped_missing_pilot_data`; no pilot week-2 snapshot). Artifact: `artifacts/pilot-metrics-baseline-summary.json`. **Do not cite partial metrics in investor narrative.**

**Policy:** `era17-pilot-rollback-drill-v1` — **awaiting_rollback_drill_execution**; exercise rollback plan once.

1. Use [`pilot-rollback-drill-era17.md`](./pilot-rollback-drill-era17.md) — six steps aligned with Era 16 evidence pack.
2. Run **`npm run smoke:pilot-rollback-drill`** — review **`artifacts/pilot-rollback-drill-summary.json`** (`rollbackProofStatus`).
3. Tabletop or staging via `PILOT_ROLLBACK_DRILL_MODE`; set `PILOT_ROLLBACK_STEP_<N>_STATUS=PASSED|FAILED` per step.
4. Capture retrospective via `PILOT_RETROSPECTIVE_OUTCOME` + `PILOT_RETROSPECTIVE_LESSONS`.
5. Pre-drill: `--template-only` → **SKIPPED WITH REASON** (honest).

---

## Tier 0 — Engineering release gate (CI)

Run on the release commit **before** inviting operators to staging:

```bash
npm run smoke:pilot-tier-preflight
# or individually:
npm run test:ci:governance-bundles
npm run test:ci:scorecard:cert
npm run validate:production-crons
npm run validate:cron-inventory
```

Record: commit SHA, date, PASS/FAIL in `artifacts/pilot-tier-preflight-summary.json`. If governance bundles fail, **do not** start operator Tier 2.

---

## Tier 1 — Staging environment readiness

```bash
npm run smoke:pilot-tier-preflight -- --tier1-only
# or individually:
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
npm run audit:marketing-claims
npm run verify:staging-env
npm run test:ci:pilot-preflight-claims:cert
bash scripts/ops/pilot-preflight.sh
```

| Check | Pass criteria |
|-------|----------------|
| Marketing claims | `MARKETING_CLAIMS_STRICT=1 verify-claims` + `audit:marketing-claims` — live copy scan (`era7-marketing-claims-governance-v1`); pilot preflight enforces strict mode (`era8-pilot-preflight-claims-strict-v1`); registry `config/marketing/claims-registry.json` (`era8-claims-registry-v1`; no `needs-evidence` rows) |
| Staging env | `verify:staging-env` exit 0 |
| Workspace scope | `npm run workspace:backfill:status` exit 0 (if migration pilot) |
| Nav honesty | Preview/placeholder routes show badges (`era4-page-maturity-sweep-v1`) |
| Cron surface | `pilot-preflight.sh` PASS — `ENABLE_EXPERIMENTAL_CRONS` not `true`; 16 production crons only (`era9-cron-surface-recert-v1`, `era14-cron-surface-recert-v1`; `npm run smoke:cron-surface`) |
| Staging E2E wiring | `npm run smoke:staging-workflows-first-green` — review `artifacts/staging-workflows-first-green-summary.json` (`era16-staging-workflows-first-green-v1`, `era17-staging-workflows-first-green-v1`); record `GITHUB_*_RUN_URL` + outcome after workflow_dispatch — see `docs/GITHUB_E2E_STAGING_SECRETS.md` |

---

## Tier 2 — Operator golden path (manual)

**Duration:** ~45–60 minutes (owner + staff). **Environment:** staging first.

| Phase | Owner actions | Staff actions | Matrix families |
|-------|---------------|---------------|-----------------|
| Onboarding | Sign in, kitchen settings, menu + products | Accept invite | Auth, catalog |
| Orders | Manual order → production → packing | Order hub scoped to workspace | Order spine, kitchen |
| Storefront | Publish menu, test checkout | — | Storefront (`beta` / qualified) |
| Integrations | Woo **or** Shopify test shop only | — | Integrations (`era4-channel-golden-path-v1`, `era14-channel-golden-path-recert-v1`); `npm run smoke:channel-golden-path`; staging `npm run smoke:woo-shopify` (`era12-channel-golden-path-smoke-v1`, not in default CI) |
| POS | Open POS terminal, checkout test sale | RBAC deny spot check | POS (`beta`), inventory POS-only |
| KDS | Kitchen display bump/recall | — | KDS (`era15-kds-staging-smoke-recert-v1`; `npm run smoke:kds-staging`; no rush-hour claim) |

**Sign-off template:** environment URL, date, owner email, PASS/FAIL per phase, notes on permission denials or missing badges.

**Era 17 orchestrator:** `npm run smoke:pilot-operator-golden-path` → `artifacts/pilot-operator-golden-path-summary.json` (`era17-pilot-operator-golden-path-v1`).

Supplementary (non-canonical) detail: [`PILOT_GOLDEN_PATH_CHECKLIST.md`](./PILOT_GOLDEN_PATH_CHECKLIST.md).

---

## Tier 3 — Money-path smoke

Optional focused CI on staging DB (or rely on Tier 0 if same commit):

```bash
npm run test:ci:storefront-money-path:cert
npm run test:ci:pos-money-path:cert
```

POS browser E2E may be **SKIPPED** without secrets — check `pos-browser-e2e-summary` artifact; do not claim browser E2E passed if skipped (`era5-pos-e2e-secrets-accept-v1`).

Storefront Stripe live-card E2E may be **SKIPPED** without `STRIPE_SECRET_KEY` — check `storefront-stripe-e2e-summary` artifact; pay-later E2E still certifies tier-2 (`era7-storefront-stripe-secrets-accept-v1`).

---

## Maturity matrix alignment

Before promising a capability in a pilot contract:

1. Open [`feature-maturity-matrix.md`](./feature-maturity-matrix.md).
2. Confirm maturity column (`live`, `beta`, `pilot_ready`, `preview`, `placeholder`).
3. Confirm marketing/sales claim column — use **qualified** wording only.
4. Cross-check policy IDs in the Notes column (inventory, rewards, KDS, integrations).

Runbook tiers map to matrix **certified** rows when Tier 0 money-path / governance certs cover the feature.

---

## Deprecated pilot doc family

**Do not** use these as primary truth (historical / dated):

- `docs/PILOT_*.md`, `docs/generated/PILOT_*`
- `docs/pilot-program.md` (marketing — verify against matrix)

**Use instead:** this runbook + feature maturity matrix + [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) for security questionnaires.

---

## What we do not claim in pilots

- SOC 2 Type II, ISO, or FedRAMP attestation
- Production SSO/SCIM for tenant staff
- Storefront/API/integration inventory depletion
- Unified gift card or loyalty balance across channels
- Rush-hour or multi-station KDS certification
- Live DoorDash/Uber Eats marketplace integrations

**Enforcement:** `npm run test:ci:commercial-pilot-runbook:cert`

---

## Era 16 webhook security matrix (2026-05-28)

**Policy:** `era16-webhook-security-matrix-v1` — `lib/security/webhook-security-matrix.ts`

1. Run `npm run test:ci:webhook-security-era16:cert` — matrix matches **46 webhook routes** on disk.
2. Run `npm run cert:webhook-security-era16` — writes `artifacts/webhook-security-matrix-summary.json`.
3. Review P0 commerce routes: Stripe, WooCommerce, Shopify (**signature validation** + **replay protection** required).
4. P1 delivery routes (Resend, Uber Eats, Uber Direct) have documented next actions.
5. Experimental/regulatory bearer routes are P3 — not production commerce claims.
6. Do **not** claim centralized replay monitoring ops until hardening cycles complete.

**Enforcement:** `test:ci:webhook-security-era16:cert` (in `test:security`)

---

## Era 16 webhook replay hardening (2026-05-28)

**Policy:** `era16-webhook-replay-hardening-v1` — `lib/webhooks/webhook-ingress-replay-guard.ts`

1. `WebhookIngressDedupe` (`webhook_ingress_dedupe`) table provides **ingress dedupe** for platform routes without connection tenant scope.
2. `/api/webhooks/uber-direct` — bearer auth + ingress dedupe; still returns **503 placeholder**.
3. `/api/webhooks/slack/experiment-interactive` — signature verify + `trigger_id` dedupe; duplicate replays return `{ ok: true, duplicate: true }`.
4. Run `npm run test:ci:webhook-replay-hardening-era16:cert`.
5. Do **not** claim centralized replay monitoring ops or live Uber Direct marketplace delivery.

**Enforcement:** `test:ci:webhook-replay-hardening-era16:cert` (chained in webhook security cert)

---

---

---

---

## Era 17 POS receipt / shift spot check (2026-05-28)

**Policy:** `era17-pos-receipt-shift-spotcheck-v1` — **closeout_math_spotcheck_documented**; shift variance + receipt total consistency via `pos-shift-closeout-math`.

1. **Closeout** — `expectedCash = opening + sum(CASH COMPLETED)`; `variance = closing - expected`.
2. **Receipt** — `subtotal - discount + tax ≈ total`; line totals ≈ subtotal (`receiptTotalsConsistent` in `pos-shift-closeout-math`).
3. Card/placeholder sales **excluded** from cash closeout sum.
4. Operator doc: **`docs/pos-receipt-shift-spotcheck-era17.md`**
5. Run **`npm run smoke:pos-receipt-shift-spotcheck`** → **`artifacts/pos-receipt-shift-spotcheck-summary.json`**
6. **Forbidden:** automated variance approval, hardware drawer certification.

**Enforcement:** `test:ci:pos-receipt-shift-spotcheck-era17:cert` (chained in `test:ci:pos-money-path:cert`)

---

## Era 17 POS software-only operator runbook (2026-05-28)

**Policy:** `era17-pos-operator-runbook-v1` — **operator_runbook_ready**; daily golden path for web-first POS via `pos-operator-runbook-summary`.

1. **Golden path** — open shift → cash sale → transaction/receipt verify → close shift with variance review.
2. **Permissions** — `pos.access`, `pos.checkout`, `pos.shift.open`/`close`, `pos.refund`, `pos.void` (see operator doc table).
3. **Companion docs** — tablet UX runbook + manager discount guide linked from main runbook.
4. Run **`npm run smoke:pos-operator-runbook`** → review **`artifacts/pos-operator-runbook-summary.json`** (`posOperatorProofStatus`).
5. Missing `POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL` → **SKIPPED WITH REASON** (awaiting_operator_golden_path_execution).
6. **Forbidden:** hardware POS certification, offline POS, rush-hour throughput, Toast/Square parity.

**Enforcement:** `test:ci:pos-operator-runbook-era17:cert` (chained in `test:ci:pos-money-path:cert`)

**Operator doc:** `docs/pos-software-only-operator-runbook-era17.md`

---

## Era 17 POS manager discount depth (2026-05-28)

**Policy:** `era17-pos-manager-discount-v1` — **discount_guard_depth_enforced**; action-layer RBAC via `pos-discount-guard` for explicit discounts and COMPED checkout.

1. **Explicit discount** — `discountAmount > 0` requires **`pos.discount.apply`** at checkout action (`pos.checkout.discount` audit operation).
2. **COMPED mode** — requires **`pos.discount.apply`** even when discount amount is zero.
3. **Standard checkout** — cash/card with zero discount needs only **`pos.checkout`**.
4. **Gift card / loyalty** — stack at service layer; do not bypass action gate for explicit discounts.
5. Operator guide: **`docs/pos-manager-discount-operator-guide-era17.md`** — manager discount UI still deferred.
6. **Forbidden:** manager discount UI shipped, hardware POS certification, Toast override parity.

**Enforcement:** `test:ci:pos-manager-discount-era17:cert` (chained in `test:ci:pos-money-path:cert`)

---

## Era 17 POS tablet UX polish (2026-05-28)

**Policy:** `era17-pos-tablet-ux-v1` — **tablet_ux_polished**; touch-first terminal UX without new browser E2E policy.

1. **Touch targets** — cart +/- and tab actions use `posTouchCompactClass` / `posTouchButtonClass` (44–48px floor).
2. **Checkout status** — success (green), error (red), info (neutral) via `data-testid="pos-checkout-status"`.
3. **Permission denied** — terminal, POS hub, and KDS use **`PermissionDeniedSurfaceCard`** (`era17-permission-denied-ux-v1`) when `pos.access` or `kitchen.view` is missing — includes permission key in copy.
4. **Tap-to-pay errors** — surfaced in checkout status region (not console-only).
5. Operator guide: **`docs/pos-tablet-ux-operator-runbook-era17.md`** — software-only; no hardware/offline claim.
6. Run **`npm run smoke:pos-tablet-ux`** → review **`artifacts/pos-tablet-ux-summary.json`**.

**Enforcement:** `test:ci:pos-tablet-ux-era17:cert` (chained in `test:ci:pos-money-path:cert`)

---

## Era 17 public API per-route scope enforcement (2026-05-28)

**Policy:** `era17-public-api-per-route-scope-v1` — **per_route_scope_enforced**; all eight Public API v1 routes require documented scopes via `guardPublicApiV1Resource`.

1. Route mapping: `lib/api-public/public-api-v1-route-scopes.ts` — high-risk writes first (`orders:write`, `webhooks:receive`, recipes POST `menus:read`).
2. API keys store optional `scopes_json`; null grants all documented scopes for backward compatibility.
3. Missing scope returns **403** `{ error: "Forbidden", requiredScope: "..." }` before rate limit or handler logic.
4. Run **`npm run smoke:public-api-per-route-scope`** → review **`artifacts/public-api-per-route-scope-summary.json`**.
5. Do **not** claim production SLA, full scope admin UI, or unlimited rate limits.

**Enforcement:** `test:ci:public-api-per-route-scope-era17:cert` (chained in `test:ci:public-api-v1:cert`)

---

## Era 17 public POST abuse review (2026-05-28)

**Policy:** `era17-public-post-abuse-v1` — **p1_public_post_guards_expanded**; rate limits on high-risk public POST routes via `public-post-abuse-matrix`.

1. **Experiment auto-conclude** — approve/reject email links use `storefront_experiment_api` rate limit on GET+POST.
2. **Orchestrator approve** — POST now rate limited (GET already guarded).
3. **IoT temperature ingest** — bearer secret + `iot_ingest` per IP/device bucket (`enforceIngestRateLimit`).
4. **Billing portal** — `billing_portal` limit on `/api/billing/portal` and legacy `/api/billing-portal`.
5. Matrix: **`lib/security/public-post-abuse-matrix.ts`** · operator doc: **`docs/public-post-abuse-review-era17.md`**
6. **Forbidden:** DDoS immunity, WAF parity, global webhook rate limiting.

**Enforcement:** `test:ci:public-post-abuse-era17:cert` (chained in `test:ci:public-post-fail-closed`)

---

## Era 17 commerce webhook incident drill (2026-05-28)

**Policy:** `era17-commerce-webhook-drill-v1` — **awaiting_commerce_webhook_drill_execution**; operator checklist for Stripe / Woo / Shopify webhook incidents.

1. Six-step drill: triage → secret alignment → URL/tenant mapping → replay containment → invalid signature test → recovery.
2. Provider routes: `/api/webhooks/stripe`, `/api/webhooks/woocommerce`, `/api/webhooks/shopify/orders`.
3. Record with env vars `COMMERCE_WEBHOOK_DRILL_STEP_<N>_STATUS` + `COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL`.
4. Run **`npm run smoke:commerce-webhook-drill`** → review **`artifacts/commerce-webhook-drill-summary.json`** (`commerceWebhookProofStatus`).
5. Do **not** claim centralized replay monitoring ops or zero incident risk.

**Enforcement:** `test:ci:commerce-webhook-drill-era17:cert` (chained in `test:ci:webhook-security-era16:cert`)

**Operator doc:** `docs/commerce-webhook-incident-drill-era17.md`

---

## Era 17 partner webhook integration docs (2026-05-28)

**Policy:** `era17-partner-webhook-docs-v1` — **partner_webhook_docs_ready**; partner-facing inbound commerce webhook contract + outbound event taxonomy.

1. Inbound routes: Stripe `/api/webhooks/stripe`, Woo `/api/webhooks/woocommerce?cid=`, Shopify `/api/webhooks/shopify/orders`.
2. Eight-item partner checklist in `lib/developer/partner-webhook-pack.ts` — signature, tenant mapping, idempotency, honesty gate.
3. Optional attestation: `PARTNER_WEBHOOK_ATTESTATION_EMAIL` + `npm run smoke:partner-webhook-docs`.
4. Review **`artifacts/partner-webhook-docs-summary.json`** — `partnerWebhookProofStatus`.
5. Do **not** claim production webhook SLA, guaranteed delivery, or full outbound subscription platform.

**Enforcement:** `test:ci:partner-webhook-docs-era17:cert` (chained in `test:ci:webhook-security-era16:cert`)

**Partner doc:** `docs/partner-webhook-integration-era17.md`

---

## Era 17 webhook replay P1 expansion (2026-05-28)

**Policy:** `era17-webhook-replay-p1-expansion-v1` — **p1_ingress_dedupe_expanded**; extends Era 16 guard to matrix P1 delivery routes.

1. `/api/webhooks/resend` — signature verify + **ingress dedupe** (`WEBHOOK_INGRESS_ROUTE_KEYS.RESEND`) + existing `notificationEvent` providerEventId idempotency; duplicate replays return `{ ok: true, duplicate: true }`.
2. `/api/webhooks/uber-eats/orders` — **webhook_event_store** duplicate short-circuit (cert-tested; marketplace remains placeholder).
3. Run **`npm run smoke:webhook-replay-p1-expansion`** → review **`artifacts/webhook-replay-p1-expansion-summary.json`**.
4. Do **not** claim full replay monitoring ops or live Uber Eats marketplace delivery.

**Enforcement:** `test:ci:webhook-replay-p1-expansion-era17:cert` (chained in `test:ci:webhook-security-era16:cert`)

---

## Era 16 mutation registry linter (2026-05-28)

**Policy:** `era16-mutation-registry-linter-v1` — `lib/permissions/mutation-registry-linter.ts`

1. Run `npm run test:ci:mutation-registry-linter-era16:cert` — static scan of `actions/` passes with zero violations.
2. Run `npm run cert:mutation-registry-linter-era16` — writes `artifacts/mutation-registry-linter-summary.json`.
3. New sensitive server actions (Prisma writes / `$transaction`) must use `requireMutationPermission`, a domain actor helper from `domain-mutation-registry.ts`, a documented allowlist marker, or an approved public/platform guard.
4. Allowlist entries require rationale in `mutation-registry-linter-era16-policy.ts`.
5. Do **not** treat this linter as a substitute for `test:ci:rbac-wave4` action RBAC tests.

**Enforcement:** `test:ci:mutation-registry-linter-era16:cert` (in `test:security`)

---

## Pilot GO/NO-GO decision (Era 16)

**Era 16 commercial pilot evidence pack (2026-05-28)**

**Policy:** `era16-commercial-pilot-evidence-pack-v1` — `lib/commercial/commercial-pilot-evidence-pack.ts`

Use this section for a **single-page paid pilot decision** — founders, sales, and operators should not need to read deprecated `docs/PILOT_*` files.

### Decision flow

1. **Tier 0** — Engineering CI (`test:ci:governance-bundles`, scorecard, cron validation) → **PASS required**
2. **Tier 1** — Staging readiness (claims strict, env, pilot preflight) → **PASS required**
3. **Tier 2** — Operator golden path on staging → **PASS required**
4. **Tier 3** — Money-path smoke (optional but recommended) → **PASS or documented skip**
5. **Role checklists** — Complete owner, manager, cashier, kitchen, support_admin sections below
6. **Contract review** — No forbidden claims (see below)
7. Run `npm run cert:commercial-pilot-evidence-era16` → `artifacts/commercial-pilot-evidence-pack-summary.json`
8. **Era 17:** Run `npm run smoke:pilot-gono-go` → `artifacts/pilot-gono-go-summary.json` (`era17-pilot-gono-go-v1`)

| Outcome | Meaning |
|---------|---------|
| **GO** | All blockers cleared; pilot may start on staging/production per contract |
| **CONDITIONAL** | Blockers cleared but warnings (missing SHA, Tier 3 skip) — document before GO |
| **NO-GO** | Tier failure, incomplete role checklist, or forbidden claims in contract |

**Enforcement:** `test:ci:commercial-pilot-evidence-era16:cert` (chained in `test:ci:commercial-pilot-runbook:cert`)

---

## Role checklist — owner

**Duration:** ~45 min · **Environment:** staging first

| ID | Task | Verify | GO blocker? |
|----|------|--------|:-----------:|
| owner-auth | Sign in, onboarding, invite manager | Staff invite accepted | **Y** |
| owner-catalog | Menu + products + kitchen settings | Visible in order creation / storefront | **Y** |
| owner-storefront | Publish menu; pay-later checkout test | Order in hub; Tier 3 or manual PASS | **Y** |
| owner-integrations | Woo **or** Shopify test shop (optional) | Golden path cert; live smoke SKIPPED/FAILED documented | N |
| owner-billing | Plan/entitlements match contract | Billing page matches contract | **Y** |
| owner-matrix | Review [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Promised features are `live` / `pilot_ready` / `beta` with qualified wording | **Y** |

---

## Role checklist — manager

**Duration:** ~30 min

| ID | Task | Verify | GO blocker? |
|----|------|--------|:-----------:|
| manager-orders | Manual order → production → packing | Status transitions; workspace scope | **Y** |
| manager-rbac | Ops access; no owner billing | Deny on billing.manage | **Y** |
| manager-production | Production board / calendar one prep day | `smoke:production-calendar` or manual PASS | N |
| manager-reports | Reports allowed for manager | Export denied without grants | N |

---

## Role checklist — cashier

**Duration:** ~20 min

| ID | Task | Verify | GO blocker? |
|----|------|--------|:-----------:|
| cashier-pos-open | Open register + shift; cash checkout | Receipt; POS-only inventory depletion | **Y** |
| cashier-rbac-deny | No settings/billing/integrations | Nav hidden or permission denied | **Y** |
| cashier-refund | Manager refund/void spot check | Manager permission + audit | N |

---

## Role checklist — kitchen

**Duration:** ~20 min

| ID | Task | Verify | GO blocker? |
|----|------|--------|:-----------:|
| kitchen-kds | Bump/recall on KDS daily service | `smoke:kds-staging` or manual sign-off | N |
| kitchen-scope | Kitchen/production modules only | kitchen.view / kitchen.bump; no billing | **Y** |
| kitchen-inventory-truth | Storefront orders do **not** deplete POS inventory | Operator briefed on POS-only policy | **Y** |

---

## Role checklist — support and platform admin

**Duration:** ~15 min (internal)

| ID | Task | Verify | GO blocker? |
|----|------|--------|:-----------:|
| support-impersonation | Impersonation with MFA only | Audit log; no founder-email bypass | **Y** |
| support-tickets | Pilot tenant in support tooling | Test ticket; workspace scope | N |
| support-claims | Contract vs forbidden claims | `MARKETING_CLAIMS_STRICT=1 verify-claims` PASS | **Y** |
| support-webhooks | Commerce webhook posture | `test:ci:webhook-security-era16:cert` PASS | N |

---

## Allowed pilot features

Safe to include in a **qualified** pilot contract when Tier 0–2 pass:

| Feature | Maturity | Qualified sales wording |
|---------|----------|-------------------------|
| Email/password auth + staff invites | `live` | Standard workspace auth |
| Manual orders, order hub, production, packing | `pilot_ready` | Core order-to-fulfillment |
| Storefront publish + pay-later checkout | `pilot_ready` | Online ordering — qualified checkout |
| POS cash checkout (software) | `beta` | In-browser POS — no hardware/offline cert |
| KDS bump/recall | qualified | Operational smoke — not rush-hour certified |
| Production calendar / board | `pilot_ready` | Prep scheduling — qualified depth |
| Woo/Shopify test shop | qualified | Golden path — not full marketplace live ops |
| Inventory | qualified | **POS-only depletion** — explain policy |
| Gift cards / loyalty | qualified | **Dual ledger** — not unified cross-channel |
| SSO (optional) | preview | Pilot wiring only — activated tenants; not production SSO for all |

Matrix source of truth: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md).

---

## Forbidden pilot claims and support boundaries

### Do not put in contracts or sales decks

- Production certified for all tenants
- Enterprise SSO included for all staff
- SOC 2 Type II compliant
- Unified cross-channel inventory depletion
- Rush-hour KDS certified
- Live DoorDash / Uber Eats marketplace integrations

### Support boundaries

| Area | In scope | Out of scope |
|------|----------|--------------|
| Config | Workspace setup, catalog, storefront, test-shop integrations | Custom dev, marketplace live ops, hardware POS |
| Security | RBAC guidance, audit export, webhook review | SOC 2 attestation, pen tests, custom IdP prod cutover without plan |
| Data | Tenant export per contract; rollback help | Cross-tenant access except audited impersonation |
| Hours | Business-hours per contract SLA | 24/7 rush-hour KDS/marketplace on-call unless contracted |

Procurement detail: [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md).

---

## Rollback plan

Execute if pilot must pause or terminate:

1. **Disable storefront** — publish off / blackout window (owner + support)
2. **Pause integrations** — revoke Woo/Shopify webhooks and API keys (owner)
3. **Clear in-flight ops** — complete or cancel open production/packing (manager)
4. **Export evidence** — audit log + order snapshot if contract requires (support)
5. **Lock staff access** — disable invites; owner read-only wind-down (owner)
6. **Record** — rollback date, reason, commit SHA in pilot tracker (support)

**Era 17 drill:** `npm run smoke:pilot-rollback-drill` → `artifacts/pilot-rollback-drill-summary.json` (`era17-pilot-rollback-drill-v1`).

---

## Issue escalation

| Severity | Examples | Target | Owner |
|----------|----------|--------|-------|
| **P0** | Cross-tenant data leak; payment webhook down; auth bypass | 1h ack; same-day mitigation | Platform on-call + founder |
| **P1** | All order creation blocked; checkout failure spike; KDS down in service | 4 business hours ack | Support lead + engineering |
| **P2** | Single-module UX bug; report formatting; non-blocking sync delay | Next business day triage | Support queue |

---

## Era 16 operational sign-off (2026-05-28)

**Policy:** `era16-operational-signoff-v1` — `lib/operations/operational-signoff-summary.ts`

1. Run `npm run smoke:operational-signoff-era16` — chains KDS + production calendar CI smokes; writes `artifacts/operational-signoff-summary.json`.
2. CI wiring: `npm run test:ci:operational-signoff-era16:cert` (in `test:ci:kds-staging-smoke:cert`).
3. Set `OPERATIONAL_SIGNOFF_STAGING_URL` + `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL` for manual staging sign-off template fields.
4. Complete manual tiers in [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) and [`production-calendar-operator-checklist.md`](./production-calendar-operator-checklist.md).
5. Do **not** claim rush-hour KDS or production calendar certification.

**Enforcement:** `test:ci:operational-signoff-era16:cert`

---

## Related canonical docs

| Doc | Use |
|-----|-----|
| [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) | KDS Tier A–D smoke |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Security / procurement FAQ |
| [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) | Release ops |
| [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) | CI tier reference |
