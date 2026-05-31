# OS Kitchen Commercial Pilot → Market Readiness Map

**Date:** 2026-05-28  
**HEAD:** `064af17` @ `main`  
**Artifacts:** `artifacts/pilot-gono-go-summary.json`, `artifacts/p0-staging-proof-unblock-summary.json`, `artifacts/channel-live-smoke-summary.json`, `artifacts/enterprise-sso-idp-staging-smoke-summary.json`  
**Runbook:** `docs/commercial-pilot-runbook.md`  
**Companion:** `docs/full-wow-product-breakthrough-audit-2026-05-28.md`

---

## Executive Commercial Verdict

OS Kitchen has **best-in-class pilot governance** and **zero executed paid pilots**. Commercial readiness improved slightly (+1) from Era 18 honest ops panels (platform GO/NO-GO, blocked launch bridge, go-live pilot strips) but **market readiness remains blocked on ops credentials and customer record**.

| Score | Value | Notes |
|-------|------:|-------|
| Commercial pilot readiness | **69/100** | Governance strong; execution absent |
| Market readiness | **62/100** | No revenue, no case study, no live proof |
| GO/NO-GO @ audit | **NO-GO** | 6 blockers in artifact |
| P0 staging @ audit | **SKIPPED** | `awaiting_ops_credentials` — 11 env vars |

---

## Pilot Area Readiness Table

| Pilot Area | Current State | Blocker | Fix | Owner | Priority |
|------------|---------------|---------|-----|-------|----------|
| GO/NO-GO evaluator | Wired, honest | NO-GO locally | P0 PASS + customer | GTM + Ops | **P0** |
| Tier 0 engineering gate | **FAIL** | `tier0ProofStatus=proof_failed` | Fix preflight blockers | DevOps | **P0** |
| Tier 1 staging readiness | **PASS** | — | Sustain | DevOps | sustain |
| Tier 2 golden path | **SKIPPED** | No staging attestation | 45–60 min checklist | Ops | **P0** |
| P0 staging proof | **SKIPPED** | 11 missing env vars | Ops vault secrets | DevOps | **P0** |
| SSO IdP login | **SKIPPED** | 6 SSO staging vars | Okta/Entra test tenant | Security | **P0** |
| GitHub staging workflows | **SKIPPED** | E2E staging URL + login | workflow_dispatch green | DevOps | **P0** |
| Woo live smoke | **SKIPPED** | DB + encryption + owner email | Staging channel creds | Integrations | **P0** |
| Shopify live smoke | **SKIPPED** | Same | Same | Integrations | **P0** |
| Forbidden claims gate | **PASS** | — | Sustain pre-contract | GTM | sustain |
| ICP qualification | **Not qualified** | No prospect profile | Qualify real prospect | Founder | **P0** |
| LOI / contract | **Missing** | No customer on record | Signed qualified pilot agreement | Founder | **P0** |
| Customer execution | **skipped_missing_customer** | — | Kickoff | Founder | **P0** |
| Pilot metrics baseline | Template | Not PASSED | Capture Week 1 KPIs | Ops | P1 |
| Rollback drill | Template | Not executed | Tabletop with pilot | Ops | P1 |
| Case study | Internal draft | No customer approval | Post-pilot | GTM | P1 |
| Investor one-pager | Template | No KPIs | v3 after metrics | Founder | P1 |
| Staging URL in evidence | **Not recorded** | Ops | Document in pack | DevOps | P1 |
| Operator training | Runbooks exist | Not pilot-validated | Train first cohort | Ops | P1 |
| Support model | Platform support wired | Scale untested | Define pilot boundaries | Support | P1 |
| Pricing / packaging | Hypothesis only | Not in product | Publish pilot SKU | Finance | P1 |
| Enterprise SSO in contract | Optional gate | IdP proof | Only if `PILOT_GONOGO_SSO_PILOT_REQUIRED=1` | Security | P1 |

---

## P0 Missing Environment Variables (Ops Checklist)

From `artifacts/p0-staging-proof-unblock-summary.json`:

1. `E2E_STAGING_BASE_URL`  
2. `SSO_STAGING_WORKSPACE_ID`  
3. `SSO_STAGING_IDP_VENDOR`  
4. `SSO_STAGING_ALLOWED_DOMAIN`  
5. `SSO_STAGING_TEST_EMAIL`  
6. `SSO_STAGING_SUPABASE_PROVIDER_REF`  
7. `E2E_LOGIN_EMAIL`  
8. `E2E_LOGIN_PASSWORD`  
9. `DATABASE_URL`  
10. `ENCRYPTION_KEY`  
11. `CHANNEL_SMOKE_OWNER_EMAIL`  

**Validation:** `npm run smoke:p0-staging-proof-unblock` → target `p0ProofStatus: proof_passed`.

---

## Safest First ICP

**Profile:** Single-location or ≤5 units; owner or ops lead engaged for weekly check-ins; needs **kitchen + order hub + storefront and/or in-browser POS**; accepts **beta / pilot_ready** labels from feature matrix; Woo **or** Shopify (not both required day 1); **does not require** SSO, marketplace live ops, unified inventory, hardware, or rush-hour KDS claims.

**Disqualifiers:** Enterprise SSO mandatory day 1; unified loyalty across POS+SF; marketplace aggregator ops; offline POS; multi-brand franchise rollout; accountant requiring certified QB live sync.

---

## Best Pilot Package (Qualified Contract)

| Module | Maturity | Qualified claim |
|--------|----------|-----------------|
| Order hub + manual orders | pilot_ready | Yes |
| Storefront checkout | pilot_ready | Yes (tier-2 CI) |
| POS software checkout | beta | Yes (no hardware/offline) |
| KDS bump/recall | pilot_ready | Yes (no rush-hour) |
| Production board/calendar | pilot_ready | Qualified |
| Packing verification | pilot_ready | Qualified |
| Woo **or** Shopify | pilot_ready | Yes after **live smoke PASS** |
| CRM profiles/segments | pilot_ready | Qualified |
| Billing | pilot_ready | Yes |
| Go-live checklist | beta | Yes with gates |

**Excluded unless proven:** SSO production, unified inventory/rewards, DoorDash/Uber live, Public API SLA, hardware terminal.

---

## Pilot Pricing Model (Hypothesis)

- **Pilot fee:** $500–2,500/mo (90-day term)  
- **Implementation block:** $2,000–8,000 one-time (channel setup, menu, training)  
- **Success criteria in contract:** orders/day, checkout success rate, KDS bump latency, weekly operator sign-off, integration health green  
- **Conversion:** pilot → standard tier at day 90 with documented KPI baseline  

---

## Onboarding Plan (30/60/90)

### Days 1–30 (Foundation)
- Week 1: GO/NO-GO → GO, workspace template, menu import, storefront publish  
- Week 2: POS registers + cashier training, KDS stations, production calendar  
- Week 3: Woo/Shopify live connection + product mapping  
- Week 4: Tier 2 golden path sign-off, metrics baseline capture  

### Days 31–60 (Stabilization)
- Weekly check-ins, stuck-order SLA, shift closeout review  
- Integration health monitoring, rollback drill tabletop  
- Pilot metrics artifact `overall: PASSED` target  

### Days 61–90 (Expansion / Conversion)
- Optional modules: catering, CRM campaigns (preview), labor scheduling  
- Case study draft + customer approval  
- Investor one-pager v3 with real KPIs  
- Renewal / expansion conversation  

---

## Success Metrics

| Metric | Baseline target | Source |
|--------|-----------------|--------|
| Orders per day | Contract-specific | order hub |
| Storefront checkout success | >98% | Stripe + order creation |
| POS checkout success | >99% | POS audit |
| KDS median bump time | <15 min qualified | KDS metrics |
| Integration webhook failure rate | <1% | webhook queue |
| Operator weekly sign-off | 100% weeks | golden path checklist |
| Support tickets P0 | 0 unresolved >24h | support inbox |
| Pilot GO/NO-GO re-eval | GO sustained | smoke artifact |

---

## Support Boundaries (Pilot)

**In scope:** Order hub, storefront, POS software, KDS, production, packing, one commerce channel, go-live checklist, billing, documented integrations.

**Out of scope / escalation:** Hardware terminals, offline mode, marketplace aggregators, SSO unless IdP artifact PASS, unified inventory/rewards, custom API SLA, rush-hour SLO guarantees.

**Rollback:** `docs/commercial-pilot-runbook.md` rollback section + `smoke:pilot-rollback-drill` execution before kickoff.

---

## Workflow Readiness (Commercial Lens)

| Workflow | Market-ready? | Sales claim? |
|----------|---------------|--------------|
| Paid pilot GO/NO-GO | **No** (NO-GO) | Internal only |
| Staging release | **No** | No |
| SSO enterprise deal | **No** | Qualified pilot_foundation only |
| Woo/Shopify omnichannel | **Partial** | Synthetic yes; live needs PASS |
| Software POS pilot | **Yes** qualified | Yes with beta label |
| Ghost kitchen bundle | **Partial** | After KDS drill PASS |
| Franchise multi-loc | **No** | Defer |

---

## Path to Market Readiness (+10 Points Each)

1. **P0 staging PASS** → commercial 69 → ~74  
2. **First paid pilot + LOI** → ~79  
3. **Live channel smoke PASS** → integrations narrative → ~82  
4. **Pilot metrics baseline PASSED** → investor/case study → ~85  
5. **SSO pilot_ready** → enterprise wedge → ~88  
6. **Owner Daily Briefing WOW** → competitor UX story → ~90 market  

---

## Recommended Immediate Action

Configure ops vault secrets → `npm run smoke:p0-staging-proof-unblock` → remediate failures → Tier 2 golden path on staging → qualify ICP prospect → signed LOI → `npm run smoke:pilot-gono-go` → **GO** → kickoff with honest qualified contract.

**Do not:** Commit SKIPPED artifacts as PASS; promote maturity labels; sell unified inventory/rewards/SSO production.
