# Investor Narrative Hold

**Status:** **HOLD** — no active fundraising narrative with KPIs  
**Decision date:** 2026-06-01  
**Audience:** Founder, advisors, board observers  
**Canonical metrics doc (when unlocked):** [`investor-narrative-onepager-era17.md`](./investor-narrative-onepager-era17.md)  
**Pilot gate:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`pilot-week1-checklist.md`](./pilot-week1-checklist.md)

---

## Executive decision

| Question | Answer |
|----------|--------|
| Are we fundraising with a KPI deck today? | **No — HOLD** |
| Can we share product vision with investors? | **Yes — qualitative only**, under NDA |
| Can we cite orders/day, MRR, or case studies? | **No** — no verified pilot baseline |
| Can we claim governance 100 = market ready? | **No** — engineering governance ≠ commercial proof |
| When does HOLD lift? | See **Revisit triggers** below |

**One-line:** Build and prove the first paid pilot before any investor narrative that includes operational metrics, customer logos, or Series A positioning.

---

## Why HOLD (June 2026)

| Signal | State | Investor implication |
|--------|-------|-------------------|
| Vault P0 secrets | **0/11** | Staging proof not executable |
| Pilot GO/NO-GO | **NO-GO** | `artifacts/pilot-gono-go-summary.json` |
| Signed LOI / paid pilot | **None** | No design-partner revenue story |
| Pilot metrics baseline | **SKIPPED** | No week-2 KPI artifact |
| Live channel smoke | **SKIPPED** | Woo/Shopify not proven |
| SSO IdP staging | **SKIPPED** | No enterprise login proof |
| Customer case study | **None published** | [`case-study-template.md`](./case-study-template.md) internal only |
| Pen test report | **Not scheduled** | [`pen-test-vendor-selection.md`](./pen-test-vendor-selection.md) |
| Competitor parity | **Honest gaps** | No Toast/Square leapfrog claim |

**Governance score (100/100)** measures policy wiring and cert chains — **not** product-market proof. Do not map it to investor traction slides.

---

## What is ON HOLD

| Material | Action | Until |
|----------|--------|-------|
| Investor deck v3 with KPIs | **Do not send** | Metrics gate PASS |
| `INVESTOR_UPDATE_TEMPLATE.md` with numbers | **Template only** | First paid pilot week 4 |
| Series A / partner expansion orchestrator narrative | **Defer** | Post-pilot Month 3 steering |
| Public “customer count” or MRR | **Forbidden** | Verified billing + DPA |
| LinkedIn fundraising posts with traction | **Forbidden** | Case study + metrics gate |
| Advisor intro blasts with “production-ready platform” | **Forbidden** | P0 staging proof PASS |
| Demo storytelling **investor mode** exaggeration | **Qualitative cap** | [`DEMO_STORYTELLING_INVESTOR_MODE.md`](./DEMO_STORYTELLING_INVESTOR_MODE.md) rules |

---

## What is ALLOWED during HOLD

| Activity | Safe framing |
|----------|--------------|
| Advisor 1:1s (NDA) | Problem, wedge, ICP, architecture depth, honest maturity matrix |
| Design-partner conversations | Paid pilot SOW path — not “we’re raising now” |
| Product demo (`/demo`, ICP landings) | Interactive demo + BETA labels |
| Technical diligence (security overview) | RBAC, webhook matrix, tenant model — **no SOC2 cert claim** |
| Shopify / Woo partner conversations | Integration Health BETA — not live proof |
| Internal cap table / runway planning | Founder-only — not external narrative |

**Safe sentence:** *“We’re executing a governed commercial pilot path — investor KPI narrative stays on hold until we capture verified operator metrics from a signed pilot.”*

---

## Documents hierarchy

| Doc | Role during HOLD |
|-----|------------------|
| **This doc** | **Authoritative HOLD decision** |
| [`investor-narrative-onepager-era17.md`](./investor-narrative-onepager-era17.md) | Template — **do not export** until metrics gate |
| [`INVESTOR_NARRATIVE.md`](./INVESTOR_NARRATIVE.md) | Legacy bullets — **non-canonical** for claims |
| [`INVESTOR_UPDATE_TEMPLATE.md`](./INVESTOR_UPDATE_TEMPLATE.md) | Blank structure only |
| [`case-study-template.md`](./case-study-template.md) | Internal scaffold — no publish |
| [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) | Sales — not investor proof pack |

---

## Revisit triggers (HOLD → CONDITIONAL)

All required before changing status to **CONDITIONAL GO** (pre-read investor meetings with draft metrics):

1. **Vault 11/11** + `npm run ops:run-p0-staging-proof-execution -- --execute --write` → PASS  
2. **Pilot GO/NO-GO** → `GO` or signed **CONDITIONAL** with LOI on file  
3. **Week 1 checklist** complete — [`pilot-week1-checklist.md`](./pilot-week1-checklist.md)  
4. **`smoke:pilot-metrics-baseline`** → `overall: PASSED` (orders/day, bump time, health score)  
5. **Customer case study permission** — named or anonymized signed  
6. **`smoke:investor-narrative-onepager`** → `narrativeProofStatus: proof_ready_with_metrics`  
7. **`smoke:pilot-forbidden-claims-enforcement`** → PASS on draft deck copy  

**Target revisit:** First paid pilot Day 28 retrospective or Q3 2026 steering — whichever comes first with LOI signed.

---

## HOLD → ACTIVE fundraising (full lift)

Additional gates beyond CONDITIONAL:

| Gate | Evidence |
|------|----------|
| ≥ 1 paid pilot | Signed SOW + invoice or Stripe subscription |
| 60-day pilot retention | Operator still active; no critical churn event |
| Case study publishable | [`case-study-template.md`](./case-study-template.md) sign-off complete |
| Pen test scheduled or complete | [`pen-test-vendor-selection.md`](./pen-test-vendor-selection.md) |
| ARR / MRR from product | Not template placeholders — finance export |
| 2+ reference calls | Customer-approved |

**Do not start Series A process** until ACTIVE checklist majority complete.

---

## Forbidden investor claims (enforced)

Via `npm run smoke:pilot-forbidden-claims-enforcement` and `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`:

| Claim | Status |
|-------|--------|
| Verified traction / KPIs without baseline artifact | **Forbidden** |
| “Production enterprise SSO” | **Forbidden** |
| “SOC 2 certified” | **Forbidden** |
| “Unified inventory / rewards across channels” | **Forbidden** |
| “Rush-hour KDS certified” | **Forbidden** |
| “Live marketplace ops” (Uber/DoorDash) | **Forbidden** |
| “Pen tested” | **Forbidden** until report |
| Governance 100 = investor-ready | **Forbidden** |
| Era25 orchestrator / Series A theater as progress | **Forbidden** |

---

## What we tell investors who ask now

**Short email response (copy-safe):**

> Thanks for your interest in OS Kitchen. We’re focused on our first governed commercial pilots for meal-prep and ghost-kitchen operators. Our investor narrative with operational KPIs is intentionally on hold until we complete staging proof and capture verified pilot metrics — we’re happy to share product architecture and honest capability maturity under NDA, but we’re not circulating a traction deck at this stage.

**If they press for metrics:** Offer pilot design-partner conversation or wait for revisit triggers — **never** template placeholders from [`INVESTOR_NARRATIVE.md`](./INVESTOR_NARRATIVE.md).

---

## Relationship to other holds

| Hold | Doc | Interaction |
|------|-----|-------------|
| Pilot commercial | GO/NO-GO artifact | Parent gate — investor HOLD inherits NO-GO |
| Woo Subs bridge | [`woocommerce-subscriptions-decision.md`](./woocommerce-subscriptions-decision.md) | No recurring commerce parity in deck |
| Native mobile | [`native-mobile-defer-rfc.md`](./native-mobile-defer-rfc.md) | Defer “mobile app shipped” narrative |
| npm script theater | [`npm-script-trim-rfc.md`](./npm-script-trim-rfc.md) | Do not cite orchestrator count as velocity |

---

## Decision log

| Date | Decision | Approver |
|------|----------|----------|
| 2026-05-28 | Era17 one-pager template_only_awaiting_pilot_metrics | GTM policy |
| 2026-06-01 | **Formal investor narrative HOLD** until pilot metrics + GO | 30-action executor / Founder |

---

## Commands (when revisiting)

```bash
npm run smoke:pilot-gono-go
npm run smoke:pilot-metrics-baseline
npm run smoke:investor-narrative-onepager
npm run smoke:pilot-forbidden-claims-enforcement
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## References

- Metrics one-pager (locked): [`investor-narrative-onepager-era17.md`](./investor-narrative-onepager-era17.md)
- Pilot metrics: [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md)
- June audit: [`fullreport1june.md`](./fullreport1june.md) § Investor / GTM
- Vault blocker: [`vault-one-pager.md`](./vault-one-pager.md)
