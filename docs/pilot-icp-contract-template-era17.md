# Era 17 — Paid pilot ICP + contract template

**Policy:** `era17-pilot-icp-contract-v1`  
**Status:** template ready for sales/legal review — **not** a signed customer agreement  
**Updated:** 2026-05-28  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · **GO/NO-GO:** [`era16-commercial-pilot-evidence-pack-v1`](./commercial-pilot-runbook.md#pilot-gono-go-decision-era-16)

Use this template before offering a **paid pilot**. Matrix maturity wins over marketing copy. Do not fake customer execution or claim features without evidence.

---

## Qualified pilot customer profile (ICP)

| Criterion | Required |
|-----------|:--------:|
| Single-location or small multi-unit (≤5 locations in pilot scope) | **Y** |
| Owner or ops lead engaged in onboarding + weekly check-ins | **Y** |
| Needs kitchen/order hub + storefront and/or in-browser POS software path | **Y** |
| Accepts **qualified** beta / `pilot_ready` labels per [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | **Y** |
| Optional Woo or Shopify **test shop** (not full marketplace live ops) | N |
| Willing to complete staging golden path before production traffic | **Y** |

**Ideal fit:** owner-operator commissary, ghost kitchen, or small chain piloting order-to-fulfillment + online ordering + software POS — not enterprise SSO-first RFPs without qualification.

---

## Disqualifiers

Do **not** proceed to paid pilot contract when the prospect requires any of:

- Production SSO / SAML for all staff (unqualified)
- SOC 2 Type II attestation or SCIM in pilot term
- Unified cross-channel inventory depletion or unified rewards ledger
- Rush-hour KDS SLA or live DoorDash/Uber Eats / Grubhub marketplace ops
- Offline POS or Toast/Square hardware certification parity
- Public API production SLA or unlimited partner throughput
- Refusal of qualified wording (“production certified for all tenants” demanded)

Engineering check: `evaluatePilotIcpQualification` in `lib/commercial/pilot-icp-contract-era17.ts`.

---

## Allowed contract claims

Use **qualified** wording only — cross-check matrix Notes column:

| Capability | Safe pilot wording |
|------------|-------------------|
| Auth + staff invites | Standard workspace auth |
| Order hub, production, packing | Core order-to-fulfillment — `pilot_ready` |
| Storefront + pay-later checkout | Online ordering — qualified checkout |
| In-browser POS | Software POS — no hardware/offline cert |
| KDS bump/recall | Operational smoke — **not** rush-hour certified |
| Production calendar | Prep scheduling — qualified depth |
| Woo/Shopify | **Test shop** golden path — not full marketplace live ops |
| Inventory | **POS-only depletion** — explain policy (`era17-pilot-inventory-messaging-v1`, [`pilot-inventory-messaging-era17.md`](./pilot-inventory-messaging-era17.md)) |
| Costing / margin | **Qualified beta** — recipe costing + margin report (`era17-costing-pilot-spotcheck-v1`, [`costing-pilot-spotcheck-era17.md`](./costing-pilot-spotcheck-era17.md)) |
| Gift cards / loyalty | **Dual ledger** — not unified cross-channel |
| SSO (optional add-on) | Pilot wiring only — activated tenants; not production SSO for all |

Channel detail: [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md).

---

## Forbidden contract claims

**Never** include in pilot SOW, order form, or sales deck:

- Production certified for all tenants
- Enterprise SSO included for all staff
- SOC 2 Type II compliant
- Unified cross-channel inventory depletion
- Rush-hour KDS certified
- Live DoorDash / Uber Eats marketplace integrations
- Public API production SLA

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before signature.

---

## Support boundaries

| In scope | Out of scope |
|----------|--------------|
| Workspace setup, catalog, storefront, test-shop integrations | Custom marketplace / plugin dev |
| RBAC guidance, audit export, webhook review | SOC 2 attestation, pen tests, prod IdP cutover without plan |
| Tenant export per contract; rollback assistance | Cross-tenant access except audited impersonation |
| Business-hours support per pilot agreement | 24/7 rush-hour KDS/marketplace on-call unless contracted |

Procurement FAQ: [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md).

---

## Rollback summary

If pilot pauses or terminates (reference in contract appendix):

1. Disable storefront publish / blackout window  
2. Revoke Woo/Shopify webhooks and API keys  
3. Complete or cancel in-flight production/packing  
4. Export audit/order snapshot if contract requires  
5. Lock staff invites; owner read-only wind-down  
6. Record date, reason, commit SHA in pilot tracker  

Full steps: [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md#rollback-plan). Drill: [`pilot-rollback-drill-era17.md`](./pilot-rollback-drill-era17.md) (`era17-pilot-rollback-drill-v1`).

---

## Pilot duration and success metrics

**Default duration:** 90 days (qualified window: 30–180 days).

| Metric | Measurement | Target (example — customize per SOW) |
|--------|-------------|--------------------------------------|
| Orders/day | Hub + storefront + POS combined | Baseline week 2; review week 8 |
| Storefront checkout success | Pay-later path completion | ≥95% on staging; document production |
| POS cash checkout | Tier-2b path without blocker defects | Manual sign-off |
| KDS operations | Bump/recall during service window | Manual sign-off — no rush-hour claim |
| Support load | Tickets/week + first response time | Track trend |
| Operator feedback | 1–5 score midpoint + close | ≥4 average or documented remediation |
| GO/NO-GO artifact | `npm run cert:commercial-pilot-evidence-era16` + `npm run smoke:pilot-gono-go` | GO or CONDITIONAL with documented warnings — **NO-GO expected** until tiers + ICP + LOI (see `artifacts/pilot-gono-go-summary.json`) |
| Metrics baseline | `npm run smoke:pilot-metrics-baseline` (`era17-pilot-metrics-baseline-v1`) after week 2 | Track trend; not investor claim until captured |

---

## Contract clause boilerplate

> **Pilot scope.** Customer receives access to KitchenOS modules listed in Exhibit A. Capabilities are provided at maturity levels documented in KitchenOS Feature Maturity Matrix as of the pilot start date. “Pilot” means qualified evaluation — not production certification for all tenants.
>
> **Qualified limitations.** Customer acknowledges POS is in-browser software without offline or hardware certification; inventory depletion applies to POS sales only unless explicitly unlocked in writing; gift/loyalty ledgers are not unified across channels; SSO (if included) is pilot wiring for activated workspace only.
>
> **Support.** Support hours and channels per Exhibit B. KitchenOS does not provide 24/7 rush-hour or marketplace live-ops on-call unless separately contracted.
>
> **Success criteria.** Parties agree success metrics in Exhibit C. Failure to meet metrics triggers review — not automatic SLA credits unless stated.
>
> **Termination / rollback.** Either party may terminate per notice in Exhibit D. KitchenOS will assist with rollback steps in commercial pilot runbook within reasonable business hours.
>
> **Claims.** Customer marketing may not represent KitchenOS capabilities beyond qualified pilot scope. Forbidden claims list in Exhibit E.

*Legal must review before use — template only.*

---

## Pre-signature checklist

| ID | Task | Owner | Blocker? |
|----|------|-------|:--------:|
| icp-fit | ICP criteria met; no disqualifiers | Sales | **Y** |
| icp-matrix | Each Exhibit A feature matches matrix maturity | Sales + Engineering | **Y** |
| icp-claims | `verify-claims` strict PASS (`npm run smoke:pilot-forbidden-claims-enforcement`; `era17-pilot-forbidden-claims-enforcement-v1`) | Engineering | **Y** |
| icp-tier0 | Tier 0 governance bundles PASS on release SHA (`npm run smoke:pilot-tier-preflight`; `era17-pilot-tier-preflight-v1`) | Engineering | **Y** |
| icp-contract | No forbidden claims in draft | Legal | **Y** |
| icp-support | Exhibit B boundaries signed | Legal | **Y** |
| icp-metrics | Exhibit C metrics defined | Customer success | **Y** |
| icp-rollback | Exhibit D rollback referenced | Ops | **Y** |
| icp-gono-go | Evidence pack GO/NO-GO recorded (`npm run smoke:pilot-gono-go`; `era17-pilot-gono-go-v1`) | Founder | **Y** |

After signature: execute Tier 2 golden path → [`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md) (`era17-pilot-operator-golden-path-v1`) + `npm run smoke:pilot-operator-golden-path`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Tier 0–3 gates + role checklists |
| [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) | Woo/Shopify pilot setup |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Security questionnaire |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Maturity source of truth |
