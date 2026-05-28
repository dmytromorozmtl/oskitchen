# Era 20 — First Paid Pilot Package

**Policy:** `era20-first-paid-pilot-package-v1`  
**Status:** `pilot_package_ready_awaiting_p0_and_customer` — **not** GO, **not** signed LOI  
**HEAD baseline:** `7b17ffa` @ `main`  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · **ICP template:** [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) · **P0 ops:** [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md)

Use this package to explain, scope, and contract a **first paid pilot**. Era 19 WOW pillars (Owner Daily Briefing, Launch Wizard, Integration Health) are **onboarding tools** — they do not replace P0 proof or customer evidence.

---

## P0 proof gate (honest — Era 20 Cycle 1)

| Field | Current value (2026-05-28) |
|-------|---------------------------|
| `p0ProofStatus` | `awaiting_ops_credentials` |
| Missing env vars | **11** (see P0 checklist) |
| `smoke:pilot-gono-go` | **NO-GO** expected |
| Fake PASS | **Forbidden** |

**Do not** offer paid pilot production traffic until `artifacts/p0-staging-proof-unblock-summary.json` shows `p0ProofStatus: proof_passed`.

---

## Ideal ICP by segment

| Segment | Best fit | Typical modules | Disqualifiers |
|---------|----------|-----------------|---------------|
| **Café / bakery** | Owner-operator; storefront + light POS | SF checkout, POS software, optional KDS | Rush-hour SLO; marketplace live |
| **Ghost kitchen** | Delivery-first; kitchen + packing | Order hub, KDS, packing, optional Woo/Shopify | Unified inventory; offline POS |
| **Meal prep / commissary** | Production + packing + SF | Production calendar, packing, SF | Enterprise SSO day 1 |
| **Catering / events** | Quotes + order hub | Order hub, catering (beta qualified) | Full marketing automation |
| **Small fast casual** | POS + KDS + hub | POS, KDS, order hub | Table service production parity |

**Universal ICP criteria** (required): see [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md).

Engineering helper: `ERA20_PILOT_SEGMENT_PROFILES` in `lib/commercial/era20-first-paid-pilot-package.ts`.

---

## Included pilot modules

| Module | Maturity | Qualified claim |
|--------|----------|-----------------|
| Order hub + manual orders | pilot_ready | Yes |
| Storefront checkout | pilot_ready (tier-2 CI) | Yes |
| In-browser POS | beta (tier-2b) | Yes — no hardware/offline |
| KDS bump/recall | pilot_ready | Yes — no rush-hour |
| Production board + calendar | pilot_ready | Qualified |
| Packing + verification | pilot_ready | Qualified |
| CRM profiles/segments | pilot_ready | Qualified |
| Billing | pilot_ready | Yes |
| Owner Daily Briefing | beta (Era 19) | Demo + pilot ops — not market cert |
| Launch Wizard | beta (Era 19) | Primary onboarding path |
| Integration Health Center | beta (Era 19) | Honest SKIPPED/FAILED states |
| Go-live checklist | beta | With pilot gates |

**Optional after P0 PASS:** Woo **or** Shopify test shop (live smoke artifact required before “live channel” claim).

---

## Excluded modules (pilot SOW)

- Production SSO / SAML for all staff (unqualified)
- SOC 2 / SCIM
- Unified cross-channel inventory depletion
- Unified rewards / gift cross-channel ledger
- DoorDash / Uber Eats / Grubhub **live** marketplace ops
- POS hardware certification / offline queue
- Rush-hour KDS SLO
- Public API production SLA
- Campaigns / Klaviyo-class automation (preview)
- Food safety HACCP depth (preview)

---

## Support boundaries

**In scope:** Order hub, storefront, POS software, KDS, production, packing, one commerce channel (post live PASS), go-live/wizard, Integration Health, billing, documented integrations, platform support per runbook.

**Out of scope:** Hardware terminals, offline mode, marketplace aggregators, SSO unless IdP artifact PASS, unified inventory/rewards, custom API SLA, rush-hour guarantees, 24/7 enterprise SSO SLA.

**Escalation:** Use [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) evidence pack — P0/P1/P2 tiers.

---

## Onboarding checklist (Launch Wizard — primary path)

1. Owner signs in → lands on **Today** (briefing) or **Launch Wizard** (`/dashboard/launch-wizard`).
2. Complete wizard steps: workspace profile → menu → storefront → POS first use → KDS/production → channel (optional) → commercial blockers review.
3. Review **Integration Health** — confirm SKIPPED states documented; no fake green.
4. Run **go-live** validation — resolve HIGH blockers shown in wizard/go-live.
5. Complete **Tier 2 operator golden path** on staging (`smoke:pilot-operator-golden-path` when credentialed).
6. Week 1: capture `pilot-metrics-baseline-summary`.

Routes: `ERA20_PILOT_ONBOARDING_ROUTES` in `lib/commercial/era20-first-paid-pilot-package.ts`.

---

## Launch checklist

- [ ] `smoke:p0-staging-proof-unblock` → `proof_passed`
- [ ] `smoke:pilot-gono-go` → GO or CONDITIONAL GO with documented warnings
- [ ] Forbidden claims scan before contract (`MARKETING_CLAIMS_STRICT=1 npm run verify-claims`)
- [ ] Menu + products imported
- [ ] Storefront published (tier-2 path validated)
- [ ] POS register + shift open tested
- [ ] KDS stations configured; bump/recall signed off
- [ ] Production calendar today view reviewed
- [ ] Packing QC checklist reviewed
- [ ] Woo **or** Shopify connected (if contracted) — live smoke PASS
- [ ] Staff invites + role training (owner, manager, cashier, kitchen)

---

## Training checklist

| Role | Duration | Topics |
|------|----------|--------|
| Owner | 45 min | Today briefing, Launch Wizard, Integration Health, go-live |
| Manager | 30 min | Order hub stuck orders, shift variance, KDS backlog |
| Cashier | 20 min | POS speed mode, shift open/close |
| Kitchen | 20 min | KDS priority lane, bump/recall |
| Packer | 15 min | Packing QC checklist, verify console |

---

## Support checklist (KitchenOS)

- [ ] Pilot workspace ID recorded
- [ ] Support boundaries doc shared with customer
- [ ] Escalation contacts defined
- [ ] Weekly check-in calendar (Weeks 1–12)
- [ ] Integration Health reviewed weekly
- [ ] Rollback drill tabletop scheduled (Week 2–4)

---

## Success metrics (90-day pilot)

| Metric | Target (contract-specific) | Source |
|--------|---------------------------|--------|
| Orders per day | Agreed baseline Week 2 vs Week 8 | Order hub |
| Storefront checkout success | >98% pay-later path | Orders + Stripe |
| POS checkout success | >99% software path | POS audits |
| KDS operational sign-off | Manual weekly | KDS smoke checklist |
| Integration webhook failure rate | <1% | Webhook queue |
| Operator weekly sign-off | 100% weeks | Golden path |
| Support P0 unresolved | 0 >24h | Support inbox |
| GO/NO-GO sustained | GO after kickoff | `pilot-gono-go-summary.json` |

Artifact: `npm run smoke:pilot-metrics-baseline` (Week 1+).

---

## Pricing hypothesis (not in-product billing SKU yet)

| Line item | Range (USD) | Notes |
|-----------|------------|-------|
| Pilot platform fee | $500–2,500 / mo × 90 days | Qualified beta features only |
| Implementation | $2,000–8,000 one-time | Menu, channel, training |
| Optional SSO pilot add-on | Custom | Only after IdP staging PASS |
| Conversion | Standard tier at day 90 | Requires KPI baseline PASSED |

---

## LOI / contract language

Use [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) clauses. **Template only** until legal review and signature.

Required attachments to SOW:

1. Feature maturity matrix excerpt (included/excluded rows)
2. P0 proof artifact status (or explicit SKIPPED WITH REASON pre-kickoff)
3. Support boundaries (this doc § Support)
4. Rollback summary (runbook + `smoke:pilot-rollback-drill`)

---

## Forbidden claims

Never in pilot contract or deck:

- Production certified for all tenants
- Enterprise SSO for all staff
- SOC 2 Type II / SCIM
- Unified inventory or unified loyalty
- Rush-hour KDS certified
- Live marketplace ops (DoorDash/Uber/Grubhub)
- Public API SLA
- Hardware/offline Toast/Square parity

Enforcement: `npm run smoke:pilot-forbidden-claims-enforcement` + `verify-claims`.

---

## Rollback process

1. Freeze new orders (storefront unpublish / POS register close).
2. Export orders + audit CSV (owner permission).
3. Disconnect Woo/Shopify webhooks (if connected).
4. Document incident in support ticket + `pilot-rollback-drill-summary`.
5. Customer comms template in commercial pilot runbook.

---

## Prospect placeholder rules (Era 20)

Track sales pipeline **without** faking a paid customer:

```bash
export PILOT_GONOGO_PROSPECT_NAME="Acme Commissary (prospect)"
# Do NOT set PILOT_GONOGO_CUSTOMER_NAME until LOI signed
npm run smoke:pilot-gono-go
```

| Env var | Satisfies customer gate? |
|---------|-------------------------|
| `PILOT_GONOGO_PROSPECT_NAME` | **No** — warning only |
| `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` | **Yes** (when both set) |

Artifact fields: `prospectExecutionStatus`, `prospectName` in `artifacts/pilot-gono-go-summary.json`.

---

## Pre-signature checklist

- [ ] ICP qualified (`PILOT_GONOGO_ICP_INPUT_JSON` or manual review)
- [ ] Forbidden claims scan PASS
- [ ] P0 proof PASS **or** customer accepts documented SKIPPED pre-kickoff (not recommended for paid)
- [ ] Pilot scope attachment signed
- [ ] Support boundaries acknowledged
- [ ] No excluded modules promised
- [ ] LOI signed → set customer env vars → re-run GO/NO-GO

---

*Era 20 Cycle 1 — Workstream C. Next: Workstream A when ops vault configured.*
