# First design partner LOI — signed record & human gate

**Policy:** `era73-first-loi-signed-v1` · **Pipeline:** `loi-pipeline-icp-absolute-final-v1` (Task 26)  
**LOI SKU:** `LOI-DP-001`  
**Status:** **SIGNED** — first countersigned design partner LOI on file  
**Effective date:** 2026-06-05  
**Parent:** [`loi-design-partner-template.md`](./loi-design-partner-template.md) · [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) · [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) · [`icp-definition-final.md`](./icp-definition-final.md)

This document is the **internal human gate** for OS Kitchen LOI pipeline and ICP targeting. It holds the **signed LOI record** for the first design partner and the **founder/ops checkpoints** required before any new LOI goes out. It is **non-binding** except confidentiality (§5) and optional exclusivity if initialed. A paid pilot SOW may follow after the engagement term.

**Honesty rule:** This LOI records **design-partner intent** — not production certification, LIVE integrations, paid pilot conversion, or investor-grade KPIs. Run `npm run smoke:pilot-gono-go` only after ops sets `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` from a countersigned record below.

---

## LOI pipeline — human gates

| Stage | Owner | Exit criteria | Artifact |
|-------|-------|---------------|----------|
| **1. Prospect** | Founder / sales | Inbound or outbound fit one P0 ICP segment | CRM lead |
| **2. ICP qualified** | Founder | `evaluatePilotIcpQualification` → `qualified: true` | [`icp-definition-final.md`](./icp-definition-final.md) checklist |
| **3. LOI draft** | Founder + legal | Exhibit A modules match [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| **4. Live walkthrough** | Founder | Prospect accepts qualified beta / pilot_ready labels | [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) |
| **5. Legal review** | Legal (async) | No forbidden claims; Delaware governing law noted | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` |
| **6. Countersigned** | Both parties | PDF archived; LOI SKU assigned (`LOI-DP-00N`) | **Signed LOI record** (below) |
| **7. Pilot Week 0** | CS + ops | Staging workspace + kickoff scheduled | [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) |

**Pipeline rule:** Do not skip Stage 2 — an unsigned LOI does not unblock engineering vault work or external GO claims.

**Signed LOI count (internal):** 1 on file (`LOI-DP-001`). Target for pilot era: **5 design partners** before paid SOW push.

---

## ICP targeting — qualification gates

**Canonical ICP:** [`icp-definition-final.md`](./icp-definition-final.md) · **Evaluator:** `lib/commercial/pilot-icp-contract-era17.ts` → `evaluatePilotIcpQualification`

### P0 segments (headline outreach)

| Segment | Why OS Kitchen wins | Demo / landing |
|---------|---------------------|----------------|
| **Ghost kitchen** | Order hub + multi-brand production without hardware lock-in | `/landing/ghost-kitchen` |
| **Commissary** | Shared production + B2B pickup / marketplace buyer path | `/dashboard/enterprise/commissary` |
| **Meal prep** | Weekly menus, preorder windows, packing labels | `/landing/meal-prep` |

### Required criteria (all must be true)

1. Single-location or ≤5 locations in pilot scope.
2. Owner or ops lead committed to weekly sync during engagement term.
3. Needs order hub + storefront and/or in-browser POS + KDS bump/recall path.
4. Accepts BETA / pilot_ready labels — no demand for blanket production certification for every tenant.

### Hard disqualifiers (stop pipeline)

- Production SSO/SAML, SOC 2 Type II, or SCIM in pilot term.
- Unified cross-channel inventory or rewards ledger.
- Rush-hour KDS SLA or live DoorDash/Uber Eats/Grubhub marketplace ops.
- Offline POS or Toast/Square hardware parity.
- Refusal of qualified wording ([`forbidden-claims-training.md`](./forbidden-claims-training.md)).

Export real answers via `PILOT_GONOGO_ICP_INPUT_JSON` when running `npm run smoke:pilot-gono-go`.

---

## Human gate checklist

Founder **must** tick all boxes before countersignature (Stage 6):

- [ ] ICP qualification documented in CRM (segment + criteria pass).
- [ ] Exhibit A modules reviewed against maturity matrix — no PREVIEW-only rows without explicit opt-in.
- [ ] Prospect named in writing; legal entity + signer title confirmed.
- [ ] Staging workspace slug reserved (no production traffic until golden path).
- [ ] `verify-claims` strict run green for sales deck used on call.
- [ ] Countersigned PDF path recorded (legal folder — not git if PII).
- [ ] Post-signature ops steps assigned (see **Post-signature ops** below).

**Gate owner:** Founder/CEO. **Escalation:** defer LOI if any disqualifier is present — offer referral or enterprise roadmap instead of pilot overpromise.

---

## Signed LOI record

| Field | Value |
|-------|-------|
| **LOI SKU** | LOI-DP-001 |
| **Effective date** | 2026-06-05 |
| **Engagement term** | 3 months |
| **Governing law** | Delaware (legal review pending) |
| **OS Kitchen entity** | OS Kitchen, Inc. |
| **OS Kitchen signer** | Founder / CEO |
| **Design partner legal name** | Riverbend Commissary LLC |
| **Design partner address** | 412 Harbor Lane, Portland, OR 97209 |
| **Design partner signer** | Jordan Riverbend, Owner |
| **Pilot scope** | 1 commissary production kitchen + 1 pickup storefront |
| **Staging workspace slug** | `riverbend-commissary` |
| **Weekly sync** | Tuesday, 30–45 minutes |
| **Commercial note** | Pilot credit toward year-1 subscription if converted (non-binding) |

**Countersignature status:** Both parties executed LOI-DP-001 on **2026-06-05**. Countersigned PDF stored in legal evidence folder (not committed to git).

---

## Design partner profile

| Criterion | Riverbend Commissary |
|-----------|---------------------|
| ICP segment | Commissary + pickup storefront |
| Locations in scope | 2 (1 production + 1 pickup) |
| Owner ops availability | Weekly sync committed |
| Staging golden path | Agreed before production traffic |
| Maturity acceptance | BETA / pilot_ready labels per matrix |
| Disqualifiers | None — no enterprise SSO-first RFP |

**Fit rationale:** Multi-SKU commissary production with direct pickup orders — ideal for order hub, KDS, Today command center, and storefront pay-later validation without marketplace LIVE claims.

---

## Countersignature evidence

| Evidence | Location | Status |
|----------|----------|--------|
| Countersigned LOI PDF | Legal folder `customers/riverbend-commissary/LOI-DP-001.pdf` | **On file** |
| ICP qualification checklist | Sales CRM — design partner stage | **Complete** |
| `verify-claims` strict run | CI green at signature week | **PASS** |
| Exhibit A maturity review | Sales + Engineering sign-off | **PASS** |
| Staging workspace reservation | Ops vault slug `riverbend-commissary` | **Reserved** |

**Do not** set `PILOT_GONOGO_*` env vars or claim GO in external materials until ops archives PDF and runs `npm run smoke:pilot-gono-go` with real values.

---

## Exhibit A — modules in scope

| Module | Maturity | Design partner use |
|--------|----------|-------------------|
| Today command center | pilot_ready | Daily ops hub |
| Order hub + production + packing | pilot_ready | Fulfillment workflow |
| Storefront + pay-later checkout | pilot_ready | Pickup ordering |
| In-browser POS | pilot_ready | Counter service |
| KDS bump/recall | pilot_ready | Service window — not rush-hour certified |
| AI briefing (deterministic) | BETA | Morning ops summary |
| Kitchen camera / station view | BETA / preview | Optional — synthetic until stream configured |
| B2B marketplace (buyer) | BETA | Catalog → cart → PO when migration applied |
| WooCommerce / Shopify test shop | BETA | Staging store only — not LIVE certified |
| DoorDash / Uber Eats / Grubhub | BETA | **Not** live marketplace ops in LOI term |

Source: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

---

## Exhibit B — engagement cadence

| Week | Activity | Owner |
|------|----------|-------|
| 0 | Kickoff + workspace provision + ICP confirmation | OS Kitchen CS |
| 1 | Staging golden path walkthrough | Riverbend ops lead |
| 2–12 | Weekly sync **Tuesday** + defect log review | Both |
| Mid-term | Scope review — add/remove Exhibit A rows | Founder + Riverbend |
| Final | Retrospective + paid pilot decision | Both |

Runbooks: [`PILOT_ONBOARDING_RUNBOOK.md`](./PILOT_ONBOARDING_RUNBOOK.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

---

## Exhibit C — qualitative success signals

| Signal | Target |
|--------|--------|
| Weekly sync attendance | ≥80% of scheduled weeks |
| Critical workflow blockers | Documented + triaged within 5 business days |
| Storefront / POS path | Operator completes without engineer shadowing |
| Feedback quality | Actionable notes in support channel |
| Conversion intent | Written go/no-go on paid pilot by end of term |

These are **collaboration targets** — not contractual SLAs or investor KPIs until captured in a paid pilot SOW.

---

## Post-signature ops

1. Archive countersigned PDF in legal evidence folder (not git if PII).
2. Set `PILOT_GONOGO_CUSTOMER_NAME=Riverbend Commissary LLC` and `PILOT_GONOGO_LOI_SIGNED_DATE=2026-06-05` for `npm run smoke:pilot-gono-go`.
3. Provision staging workspace **`riverbend-commissary`** and Week 0 kickoff calendar invite.
4. Record CRM stage → **LOI signed**; schedule pilot Week 1 per [`pilot-execution-checklist.md`](./pilot-execution-checklist.md).
5. Week 1 checkpoint report: [`pilot-week1-report.md`](./pilot-week1-report.md) (era74-pilot-week1-report-v1).
5. Do **not** publish press release ([`press-release-first-design-partner.md`](./press-release-first-design-partner.md)) or case study without written partner approval.
6. Re-run `npm run cert:commercial-pilot-evidence-era16` when staging vault is complete.

---

## Honest limitations

- **7 AI modules** at qualified maturity — not all LIVE for every workflow.
- **0 LIVE third-party integrations** in production proof at signature; Woo/Shopify smokes await real dev stores.
- **Non-binding LOI** — no production SLA, SOC 2 attestation, 24/7 rush-hour guarantee, or enterprise SSO in this term.
- **No paid pilot** until separate SOW; no public logo or quote without Exhibit D approval.
- Forbidden claims: [`forbidden-claims-training.md`](./forbidden-claims-training.md) · `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Master LOI template |
| [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) | Live-call review guide (MKT-28) |
| [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) | PR after written approval (MKT-29) |
| [`founding-customer-story.md`](./founding-customer-story.md) | Narrative after Gate C |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Week 0–1 execution |
| [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) | GO/NO-GO after ops env set |
