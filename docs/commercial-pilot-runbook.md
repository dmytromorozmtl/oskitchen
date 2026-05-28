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
4. **Inventory** — POS-only depletion (`era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`); storefront orders do not deplete stock in pilot.
5. **Rewards** — Dual ledger (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`, `era10-cross-channel-rewards-recert-v1`, `era14-cross-channel-rewards-recert-v1`); gift/loyalty codes are not interchangeable across POS and storefront; POS kitchen-ledger checkout certified; unified E2E `deferred_locked` — see `docs/cross-channel-rewards-honesty-checklist.md`.

**Unsafe pilot headline:** “Production-certified,” “enterprise SSO,” “unified inventory,” or “Toast-class KDS at rush hour.”

### Enterprise SSO pilot (optional — Era 16)

**Policy:** `era16-enterprise-sso-r2-admin-v1` — **pilot_admin_wiring** only; delivery **pilot_foundation**.

1. Confirm workspace owner has **`ssoOidc`** entitlement (Enterprise plan or override).
2. Configure Supabase SAML provider; then **Settings → Security → SSO pilot**.
3. Staff use **`/login` → Sign in with SSO** with workspace UUID (activated pilots only).
4. Run `npm run smoke:enterprise-sso-r2-pilot` for CI cert wiring — not live IdP attestation.

### Woo/Shopify live channel smoke (optional — Era 16)

**Policy:** `era16-channel-live-smoke-v1` — **Era 16 channel live Woo/Shopify smoke (2026-05-28)** — **not in default CI**; **not** full marketplace live ops.

1. Run `npm run test:ci:channel-golden-path:cert` (synthetic path).
2. Set `DATABASE_URL`, `ENCRYPTION_KEY`, and `CHANNEL_SMOKE_OWNER_EMAIL` (or connection id).
3. Run `npm run smoke:woo-shopify-live` — review `artifacts/channel-live-smoke-summary.json`.
4. Missing credentials → **SKIPPED WITH REASON** (exit 0). Live cert failure → **FAILED** (exit 1).
5. Optional: GitHub **Woo Shopify Staging Smoke** workflow (`workflow_dispatch`).

---

## Tier 0 — Engineering release gate (CI)

Run on the release commit **before** inviting operators to staging:

```bash
npm run test:ci:governance-bundles
npm run test:ci:scorecard:cert
npm run validate:production-crons
npm run validate:cron-inventory
```

Record: commit SHA, date, PASS/FAIL. If governance bundles fail, **do not** start operator Tier 2.

---

## Tier 1 — Staging environment readiness

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
npm run audit:marketing-claims
npm run verify:staging-env
bash scripts/ops/pilot-preflight.sh
```

| Check | Pass criteria |
|-------|----------------|
| Marketing claims | `MARKETING_CLAIMS_STRICT=1 verify-claims` + `audit:marketing-claims` — live copy scan (`era7-marketing-claims-governance-v1`); pilot preflight enforces strict mode (`era8-pilot-preflight-claims-strict-v1`); registry (`era8-claims-registry-v1`; no `needs-evidence` rows) |
| Staging env | `verify:staging-env` exit 0 |
| Workspace scope | `npm run workspace:backfill:status` exit 0 (if migration pilot) |
| Nav honesty | Preview/placeholder routes show badges (`era4-page-maturity-sweep-v1`) |
| Cron surface | `pilot-preflight.sh` PASS — `ENABLE_EXPERIMENTAL_CRONS` not `true`; 16 production crons only (`era9-cron-surface-recert-v1`, `era14-cron-surface-recert-v1`; `npm run smoke:cron-surface`) |
| Staging E2E wiring | `npm run smoke:staging-workflows-first-green` — review `artifacts/staging-workflows-first-green-summary.json` (`era16-staging-workflows-first-green-v1`); GitHub first green PASS is separate ops step in `docs/GITHUB_E2E_STAGING_SECRETS.md` |

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
