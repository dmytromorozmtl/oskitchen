# KitchenOS Commercial Pilot Runbook

**Status:** canonical operator + engineering onboarding for paid pilots  
**Policy:** `era7-commercial-pilot-runbooks-v1` (`lib/commercial/commercial-pilot-runbook-policy.ts`)  
**Maturity source of truth:** [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)  
**Updated:** 2026-05-27 (Era 7 Cycle 1)

Use this runbook for **paid pilot GO/NO-GO** and operator onboarding. It aligns sales promises with certified CI and honest matrix maturity — not with dated `docs/PILOT_*` audit files.

---

## Purpose and honesty rules

1. **Matrix wins** — If this runbook and the feature maturity matrix disagree, the matrix + policy IDs win.
2. **Certified vs manual** — Tier 0–1 are automatable checks; Tier 2–3 require human sign-off on staging.
3. **No false enterprise claims** — SSO/SCIM/SOC2 remain roadmap-only (`era6-enterprise-identity-roadmap-v1`).
4. **Inventory** — POS-only depletion (`era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`); storefront orders do not deplete stock in pilot.
5. **Rewards** — Dual ledger (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`, `era10-cross-channel-rewards-recert-v1`); gift/loyalty codes are not interchangeable across POS and storefront; POS kitchen-ledger checkout certified; no unified cross-channel E2E.

**Unsafe pilot headline:** “Production-certified,” “enterprise SSO,” “unified inventory,” or “Toast-class KDS at rush hour.”

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
| Cron surface | `pilot-preflight.sh` PASS — `ENABLE_EXPERIMENTAL_CRONS` not `true`; 16 production crons only (`era9-cron-surface-recert-v1`) |

---

## Tier 2 — Operator golden path (manual)

**Duration:** ~45–60 minutes (owner + staff). **Environment:** staging first.

| Phase | Owner actions | Staff actions | Matrix families |
|-------|---------------|---------------|-----------------|
| Onboarding | Sign in, kitchen settings, menu + products | Accept invite | Auth, catalog |
| Orders | Manual order → production → packing | Order hub scoped to workspace | Order spine, kitchen |
| Storefront | Publish menu, test checkout | — | Storefront (`beta` / qualified) |
| Integrations | Woo **or** Shopify test shop only | — | Integrations (`era4-channel-golden-path-v1`) |
| POS | Open POS terminal, checkout test sale | RBAC deny spot check | POS (`beta`), inventory POS-only |
| KDS | Kitchen display bump/recall | — | KDS (`era4-kds-staging-smoke-v1`, `era6-kds-realtime-smoke-v1`) |

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

## Related canonical docs

| Doc | Use |
|-----|-----|
| [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) | KDS Tier A–D smoke |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Security / procurement FAQ |
| [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) | Release ops |
| [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) | CI tier reference |
