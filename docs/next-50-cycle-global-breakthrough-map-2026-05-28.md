# Next 50-Cycle Global Breakthrough Map — Era 19

**Date:** 2026-05-28  
**Baseline HEAD:** `064af17` @ `main`  
**Theme:** **BREAKTHROUGH — proof-first paid pilot + Owner Daily Briefing WOW pillar**  
**Supersedes:** `docs/era18-global-leap-execution-map-2026-05-28.md` for Era 19+ sequencing  
**Principle:** No more focus-strip-only cycles unless they serve Briefing or Launch Wizard

---

## Band Overview

| Band | Cycles | Theme |
|------|--------|-------|
| A | 1–6 | P0 proof and staging PASS |
| B | 7–12 | Paid pilot GO and kickoff |
| C | 13–18 | Owner UX breakthrough (WOW pillar) |
| D | 19–24 | POS commercial depth |
| E | 25–29 | KDS / production superiority |
| F | 30–33 | Integration proof and health center |
| G | 34–37 | Inventory / costing depth (honest) |
| H | 38–40 | CRM / customer value |
| I | 41–43 | Labor / staff operations |
| J | 44–45 | Enterprise trust (SSO pilot_ready) |
| K | 46–47 | API / partner ecosystem |
| L | 48 | Monetization / packaging |
| M | 49 | Investor / GTM proof |
| N | 50 | Technical scale handoff |

---

## Detailed Cycle Map

### A. P0 Proof and Paid Pilot Foundation (Cycles 1–6)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 1 | Ops vault complete | Document + configure 11 P0 env vars | Checklist complete in vault | `--checklist-only` | Unblocks all proof | Secret leak |
| 2 | P0 orchestrator PASS | Run full P0 smoke | `p0ProofStatus: proof_passed` | `smoke:p0-staging-proof-unblock` | Release confidence | Partial PASS |
| 3 | Tier 0 green | Fix tier0 preflight failures | `tier0ProofStatus=proof_passed` | `smoke:pilot-tier-preflight` | Pilot gate | CI flake |
| 4 | SSO IdP login PASS | Okta/Entra staging login | `loginProofStatus: proof_passed` | `smoke:enterprise-sso-idp-staging` | Enterprise wedge | Misconfig |
| 5 | Channel live PASS | Woo **or** Shopify live smoke | Step PASSED in artifact | `smoke:woo-shopify-live` | Omnichannel proof | Credential rot |
| 6 | GitHub staging green | e2e-staging workflow PASS URL recorded | URL in `staging-workflows-first-green-summary.json` | `smoke:staging-workflows-first-green` | CI trust | Flake |

### B. Paid Pilot Execution (Cycles 7–12)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 7 | Tier 2 golden path | 45–60 min staging checklist | Operator sign-off | `smoke:pilot-operator-golden-path` | Operator ready | — |
| 8 | ICP qualification | Real prospect profile | `icpQualified: true` | GO/NO-GO evaluator | Support load | Bad fit |
| 9 | Forbidden claims scan | Pre-contract branch | `claimsEnforcementProofStatus=proof_passed` | smoke forbidden claims | Legal safety | Mis-sale |
| 10 | LOI signed | Qualified pilot contract | Customer in artifact | manual + GO/NO-GO | Revenue | Over-promise |
| 11 | GO/NO-GO GO | Re-run evaluator | `decision: GO` | `smoke:pilot-gono-go` | Commercial unlock | False GO |
| 12 | Pilot kickoff | Week 1 onboarding executed | Kickoff checklist signed | runbook § ops | Learning | Support overload |

### C. Operator UX Breakthrough — WOW Pillar (Cycles 13–18)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 13 | Briefing aggregator service | Read orders, KDS, integrations, go-live, pilot status | Service + unit tests | unit tests | **WOW demo** | Performance |
| 14 | Owner Daily Briefing panel | Today page hero replacement/evolution | Owner sees 1-screen priorities | manual + a11y | Sales WOW | Scope creep |
| 15 | Briefing deep links | Each tile → existing focus surfaces | Click-through works | nav tests | Speed | — |
| 16 | Launch Wizard shell | 5-step wizard: menu, SF, POS, KDS, channel | New workspace TTV <60 min guided | E2E checklist | Pilot friction ↓ | — |
| 17 | Pilot Setup Wizard | GO/NO-GO status inline | Wizard shows honest NO-GO/GO | unit tests | Trust | — |
| 18 | Manager alert feed v1 | Variance + stuck order + webhook fail tiles | Alerts on briefing | unit tests | Ops speed | Alert noise |

### D. POS Commercial Depth (Cycles 19–24)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 19 | Cashier speed mode | Minimal chrome layout flag | Toggle on terminal | manual tablet | Square gap ↓ | — |
| 20 | Closeout wizard | Single-flow shift close | ≤5 clicks close | manual | Manager time ↓ | — |
| 21 | Table service beta | Floor plan MVP + table open | Server can open table → kitchen | E2E + RBAC | TouchBistro gap ↓ | Scope |
| 22 | Split check MVP | Basic split on table checks | Split without bypass | tests | FOH depth | — |
| 23 | POS pilot feedback | Capture first pilot cashier notes | Issues triaged | retro doc | UX proof | — |
| 24 | Receipt branding polish | Template + reprint | Spot check pass | existing tests | Polish | — |

**Constraint:** tier-2b sustain; no new browser E2E policy.

### E. KDS / Production Superiority (Cycles 25–29)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 25 | KDS Playwright PASS | GitHub workflow green | URL in artifact | `smoke:kds-staging-playwright` | KDS proof | Flake |
| 26 | Smart KDS priority | Allergen + overdue scoring column | Expo column sorted | unit tests | **WOW kitchen** | Wrong priority |
| 27 | Production drill PASS | Operator calendar drill on staging | Drill signed | `smoke:operational-signoff-era16` | Catering ICP | — |
| 28 | Calendar ↔ KDS hints | Today items link to KDS tickets | Cross-link works | manual | Ops continuity | — |
| 29 | Prep batch suggestions v1 | Rule-based batch hints from calendar | Suggestions visible | unit tests | WOW prep | Over-promise AI |

### F. Integration Proof and Health Center (Cycles 30–33)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 30 | Second channel live PASS | Woo **and** Shopify if not both in C5 | Both steps PASSED or honest single | live smoke | Strong claim | — |
| 31 | Integration Health Center page | Single hub replacing scattered dashboards | One page all channels | manual | UX ↓ friction | — |
| 32 | Remediation cards | Inline fix steps from smoke failures | Cards match artifact reasons | unit tests | **WOW ops** | — |
| 33 | Commerce webhook drill exec | Tabletop executed | Drill signed | `smoke:commerce-webhook-drill` | Incident ready | — |

### G. Inventory / Costing Depth — Honest (Cycles 34–37)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 34 | Pilot inventory messaging sustain | POS-only banners on SF pages | No unified claim | cert tests | Legal safety | — |
| 35 | Costing spot-check drill | Accountant menu review | Drill signed | costing smoke | Finance trust | — |
| 36 | Low-stock → briefing tile | Alerts on owner briefing | Tile fires on threshold | unit tests | Ops WOW | Noise |
| 37 | PO receiving polish | Receiving workflow depth | RBAC + audit | tests | Ops depth | — |

**Locked unless era unlock:** storefront depletion hook.

### H. CRM / Customer Value (Cycles 38–40)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 38 | Segment templates | 5 restaurant segment presets | One-click segment create | unit tests | Marketer speed | — |
| 39 | Order-attributed CRM tile | Briefing shows top customers today | Tile on briefing | unit tests | Revenue insight | PII |
| 40 | Winback stub | Consent-aware draft action list | No auto-send without consent | tests | WOW marketing | Spam |

**Locked:** unified loyalty ledger.

### I. Labor / Staff (Cycles 41–43)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 41 | Schedule → briefing tile | Today's labor coverage | Tile on briefing | unit tests | Manager speed | — |
| 42 | Time clock polish | Overtime visibility | Dashboard widget | tests | Homebase gap ↓ | — |
| 43 | Payroll export path | preview → beta checklist | Export RBAC sustained | tests | Accountant | — |

### J. Enterprise Trust (Cycles 44–45)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 44 | SSO pilot_ready promotion | Gate with IdP artifact | `ssoDeliveryStatus: pilot_ready` | pilot-ready smoke | Enterprise deals | Over-claim |
| 45 | Procurement FAQ sync | Match pilot_ready state | FAQ cert green | procurement cert | Legal | — |

### K. API / Partner (Cycles 46–47)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 46 | Public API live smoke | Staging API key drill | PASS artifact | public API smoke | Partner wedge | — |
| 47 | Scope picker UI | Admin UI for API key scopes | UI matches registry | unit tests | Developer UX | — |

### L. Monetization (Cycle 48)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 48 | Pilot SKU packaging | Entitlement clarity in billing UI | Plan labels match matrix | billing tests | Revenue clarity | — |

### M. Investor / GTM (Cycle 49)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 49 | Metrics + case study | Baseline PASSED + customer-approved draft | Artifacts PASSED | smoke metrics + case study | Fundraise | Premature |

### N. Technical Scale Handoff (Cycle 50)

| Cycle | Goal | Tasks | Acceptance Criteria | Validation | Business Impact | Risk |
|------:|------|-------|---------------------|------------|-----------------|------|
| 50 | Era 20 handoff | Scorecard refresh + backlog prune | Breakthrough audit v2 triggered | scorecard cert | Next era | — |

---

## WOW Feature Discovery Table (Band K / C)

| Feature | Impact | Complexity | Competitor Gap | Required Data | Required Backend | Required UX | Risk | Priority |
|---------|--------|------------|----------------|---------------|------------------|-------------|------|----------|
| Owner Daily Briefing | **Very High** | Medium | Square static dashboard | orders, KDS, integrations, go-live | aggregator service | briefing panel | perf | **P0 product** |
| Launch Wizard | **Very High** | Medium | Square onboarding | templates, go-live | wizard orchestrator | 5-step shell | scope | **P0 product** |
| Smart manager alerts | High | Medium | Toast alerts immature | shifts, orders, webhooks | alert rules | feed on briefing | noise | P1 |
| Real-time profit tile | High | High | MarginEdge depth | costing + orders | margin snapshot job | briefing tile | data quality | P1 |
| Integration Health Center | High | Medium | Fake green dashboards | smoke artifacts | health aggregator | single page | — | P1 |
| Smart KDS priority | High | Medium | Toast expo | ticket metadata | scoring function | expo column | wrong sort | P1 |
| Predictive prep | Medium | High | None common | historical orders | rules/ML stub | calendar hints | over-promise | P2 |
| Cashier speed mode | Medium | Low | Square | — | layout flag | terminal chrome | — | P1 |
| Multi-loc scorecard | Medium | High | Revel | cross-loc metrics | aggregation | exec page | — | P2 |
| Operator training mode | Medium | Medium | — | sandbox flag | env toggle | banner + limits | data leak | P2 |

---

## Segment Ideal State Summary (14 Segments)

| Segment | Ideal Workflow | Current Gap | Features Needed | Revenue Potential | Priority |
|---------|----------------|-------------|-----------------|-------------------|----------|
| Small café | SF + POS + simple KDS | Nav complexity | Launch wizard | Medium | **P0** |
| Bar | Tabs + POS + inventory | Tabs preview | Tab beta | Medium | P2 |
| Fast casual | High-volume KDS + SF | Rush-hour unproven | KDS priority | High | P1 |
| Full-service | Tables + KDS + POS | Table preview | Table beta | High | P2 |
| Ghost kitchen | Multi-brand SF + KDS + packing | Live channel proof | Channel PASS | High | **P0** |
| Meal prep | Production calendar + packing | Drill unexecuted | Calendar drill | High | P1 |
| Catering | Quotes + production + CRM | Conversion polish | Quote follow-up | Medium | P2 |
| Multi-location group | Cross-loc reporting | Workspace polish | Scorecard | High | P2 |
| Franchise | Governance + templates | RBAC depth | Template program | High | P2 |
| Enterprise chain | SSO + audit + API | IdP proof | SSO pilot_ready | Very High | **P0** |
| Food truck | Mobile POS + SF | Offline missing | Software POS only | Low | P3 |
| Bakery | Production + SF | Label preview | Labels beta | Medium | P3 |
| Cloud kitchen | Multi-SF + KDS | Channel proof | Health center | High | P1 |
| Commissary | Production + transfers | Transfer preview | Transfer beta | Medium | P3 |

---

## Era 19 Success Criteria

**MET when:**
- [ ] `smoke:p0-staging-proof-unblock` → PASS  
- [ ] `smoke:pilot-gono-go` → GO with customer record  
- [ ] At least one live channel smoke PASS  
- [ ] Owner Daily Briefing shipped with unit tests  
- [ ] Launch Wizard shell shipped  
- [ ] Pilot metrics baseline `overall: PASSED`  
- [ ] No forbidden claims violations  
- [ ] WOW factor score target ≥55 on re-audit  

**NOT MET if:** only focus strips added; SKIPPED artifacts committed as PASS; maturity inflated.

---

## Handoff to Era 20

After Cycle 50: full WOW re-audit; evaluate unified inventory/rewards unlock decision; scale pen test; consider native mobile exploration; expand to 100-cycle map only if first paid pilot revenue proven.
