# Era 17 — Investor narrative one-pager v2

**Policy:** `era17-investor-narrative-onepager-v2-v1`  
**Status:** **template_only_awaiting_pilot_metrics** — no live KPI narrative until pilot baseline captured  
**Updated:** 2026-05-28  
**Audience:** founders, advisors, qualified investors (not public marketing)  
**Metrics gate:** [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) · **Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

Use this one-pager for **honest** investor conversations. It is **not** a substitute for paid pilot GO/NO-GO evidence, forbidden-claims enforcement, or captured pilot KPIs.

---

## Purpose and honest scope

KitchenOS is building a **qualified commercial pilot** path for small food operators: order hub, kitchen routing, POS software path, storefront, and channel integrations — with governance-backed maturity labels.

**Current investor posture (2026-05-28):**

- Commercial pack, ICP template, GO/NO-GO evaluator, and forbidden-claims gate are **wired**
- Paid pilot **NO-GO** until tiers, ICP, LOI, and staging evidence complete
- Pilot metrics baseline **SKIPPED** — no week-2 KPI snapshot yet
- **Do not** present template traction placeholders as verified metrics

Legacy narrative docs (`INVESTOR_NARRATIVE.md`, `investor/kitchenos-investor-readiness-pack.md`) are **non-canonical** for Era 17 pilot claims — use this doc + maturity matrix instead.

---

## What we can claim today

| Claim | Evidence | Limitation |
|-------|----------|------------|
| Governed commercial pilot path | `era17-pilot-gono-go-v1`, `era17-pilot-forbidden-claims-enforcement-v1` | Decision **NO-GO** locally — no signed LOI |
| Feature maturity honesty | `feature-maturity-matrix.md`, `verify-claims` strict | No production SSO / SOC2 / unified inventory |
| Kitchen + order spine depth | POS money-path cert, KDS staging smoke cert | KDS **not** rush-hour certified |
| Channel integration foundation | Woo/Shopify wiring + playbooks | Live smoke **SKIPPED** — credentials unset |
| Enterprise SSO pilot foundation | SSO IdP staging smoke plan + wiring cert | **pilot_foundation** — no IdP login proof |
| Webhook + API security depth | webhook security matrix, per-route API scopes | No full replay monitoring ops SLA |

---

## Metrics narrative gate

Investor materials may cite **operational KPIs** only when:

1. `artifacts/pilot-metrics-baseline-summary.json` → **`overall: PASSED`**
2. `baselineProofStatus: proof_captured` (all six KPIs)
3. Customer reference + pilot week recorded in artifact
4. `npm run smoke:investor-narrative-onepager` → **`narrativeProofStatus: proof_ready_with_metrics`**

Until then: use qualitative pilot readiness language only — **template_only_awaiting_pilot_metrics**.

```bash
npm run smoke:pilot-metrics-baseline   # must reach overall PASSED first
npm run smoke:investor-narrative-onepager
```

---

## Safe investor wording

**Allowed now (qualitative):**

- "Qualified commercial pilot infrastructure with honest GO/NO-GO and claims governance"
- "Kitchen + order hub spine with staging smoke wiring — ops proof in progress"
- "Selective competitor gaps acknowledged — no Toast/Square hardware parity claim"

**Allowed only after metrics gate:**

- Orders/day, checkout success %, KDS bump rate, support tickets, operator feedback score

**Not allowed:**

- Fabricated traction, vanity MRR, or template KPIs presented as live
- "Production enterprise SSO" or "SOC 2 Type II"
- "Unified inventory across channels" or "unified rewards ledger"
- "Rush-hour KDS certified" or "live Uber/DoorDash marketplace ops"

---

## Forbidden claims

Enforced by `era17-pilot-forbidden-claims-enforcement-v1` + marketing claims strict mode:

- Production SSO, SOC2 Type II, SCIM
- Unified inventory / unified rewards
- Offline POS / Toast hardware parity
- Rush-hour KDS, live marketplace integrations
- Public API production SLA
- Live pilot KPIs without `proof_captured` baseline

---

## Evidence paths

### Pre-investor deck review

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
npm run smoke:pilot-forbidden-claims-enforcement
npm run smoke:pilot-gono-go
npm run smoke:investor-narrative-onepager
```

### After first paid pilot week-2

```bash
# Set PILOT_METRICS_* env vars or PILOT_METRICS_SNAPSHOT_JSON — real data only
npm run smoke:pilot-metrics-baseline
npm run smoke:investor-narrative-onepager
```

Review: `artifacts/investor-narrative-onepager-summary.json`

---

## Sign-off checklist

| Step | Owner | Status |
|------|-------|--------|
| Forbidden-claims smoke PASS on release branch | GTM + eng | ☐ |
| GO/NO-GO artifact reviewed (expect NO-GO pre-LOI) | Founder | ☐ |
| No template KPIs in deck | Founder | ☐ |
| Competitor gaps section uses honest matrix | Product | ☐ |
| Pilot metrics baseline overall PASSED (when citing KPIs) | Ops | ☐ |
| `smoke:investor-narrative-onepager` narrativeProofStatus reviewed | Founder | ☐ |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) | KPI capture gate |
| [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) | Honest competitor framing (`era17-competitor-feature-gap-matrix-refresh-v1`) |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Pilot execution |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Buyer-facing honesty |
