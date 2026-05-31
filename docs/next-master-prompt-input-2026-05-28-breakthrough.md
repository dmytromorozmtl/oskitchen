# Next Master Prompt Input — OS Kitchen Breakthrough Era 19

**Date:** 2026-05-28  
**Purpose:** Canonical input for **Evolution Era 19 — BREAKTHROUGH** master prompt (supersedes Era 18 handoff for strategic direction)  
**Audit baseline:** `docs/full-wow-product-breakthrough-audit-2026-05-28.md` @ `064af17`  
**Execution map:** `docs/next-50-cycle-global-breakthrough-map-2026-05-28.md`  
**Era 18 status:** Cycles 1–**60** complete on `main`; operator UX focus arc delivered; **P0 proof still SKIPPED**

> **For recurring Era 19 prompts:** Era 18 delivered operator focus wiring. **Do not** add more attention-strip cycles until P0 PASS or explicit WOW pillar cycle. Prior handoff: `docs/next-master-prompt-input-2026-05-28-era18.md` (historical).

---

## 1. Current Product Reality

- **700** pages; broad food-ops surface: orders, POS, storefront, KDS, production, inventory, CRM, staff, billing, platform admin.
- **Pilot-sellable (qualified):** order spine, storefront checkout (tier-2 CI), POS software (tier-2b), KDS/production/packing (qualified), CRM, Woo/Shopify golden path (synthetic), commercial pilot pack, forbidden-claims gate.
- **Era 18 delivered:** 60 cycles — role landing, Today focus, order hub/KDS/production/packing/go-live/integration/SSO focus strips, platform go-live queue, commercial pilot ops panels, go-live next-step hero + readiness ring.
- **Not sellable as delivered:** production SSO, SOC2, SCIM, unified inventory/rewards, marketplace live, POS offline/hardware, rush-hour KDS, Public API SLA.
- **No paid pilot customer** — `pilot-gono-go-summary.json` → **NO-GO**.
- **P0 staging** — `awaiting_ops_credentials` (11 env vars); smoke re-run @ audit → **SKIPPED**.

---

## 2. Current Architecture Reality

- Monolith: **607** services, **365** Prisma models, **176** API routes, **16** crons, **59** RBAC keys, **19** mutation registry entries.
- Auth: Supabase + workspace RBAC; SSO R2 **`pilot_foundation`** (wiring cert PASSED; IdP login SKIPPED).
- Money paths CI: storefront tier-2, POS tier-2b — **do not redo browser E2E policy**.
- Inventory: **POS-only** depletion — locked.
- Rewards: **dual ledger** — locked.
- Integrations registry: **0 LIVE**, 4 BETA, 4 PLACEHOLDER.

---

## 3. Feature-by-Feature Findings (Summary)

- **Strong:** order spine, money paths, RBAC, webhooks, go-live governance, Era 18 operator clarity.
- **Looks complete, isn't commercial:** SSO admin, integration health UX, go-live command center, Woo/Shopify wizards, loyalty/gift, Public API.
- **Preview/hide:** marketplace aggregators, food safety depth, campaigns, hardware POS, offline.
- **WOW gap:** no net-new breakthrough feature — only focus UX.

Full table: `docs/feature-by-feature-wow-gap-audit-2026-05-28.md`.

---

## 4. Workflow Gaps

| Gap | Priority |
|-----|----------|
| SSO login → dashboard (no IdP proof) | **P0** |
| Woo/Shopify live ingest (SKIPPED) | **P0** |
| Paid pilot GO/NO-GO (NO-GO) | **P0** |
| Staging GitHub workflows (no PASS URL) | **P0** |
| Owner hour-scale launch | **P0** |
| Segment → campaign | defer |
| Loyalty cross-channel | locked |

---

## 5. Competitor Gaps

- Toast: hardware, offline, rush KDS, table depth  
- Square: SMB simplicity, Terminal, unified loyalty  
- Shopify: theme ecosystem, checkout polish  
- 7shifts: labor compliance depth  
- Klaviyo: marketing automation  

Full map: `docs/competitor-leapfrog-roadmap-2026-05-28.md`.

---

## 6. WOW Opportunities (Top 10)

1. Owner Daily Briefing command center  
2. Restaurant Launch Wizard (60-min TTV)  
3. Integration Health Center + remediation  
4. Smart manager alerts  
5. Real-time profit dashboard  
6. Smart KDS priority sorting  
7. One-click pilot setup wizard  
8. Multi-location scorecard  
9. Operator training mode  
10. Predictive prep planning  

---

## 7. Top Features To Add (Era 19)

1. Owner Daily Briefing (WOW pillar — **required**)  
2. Launch Wizard shell  
3. Pilot Setup Wizard (GO/NO-GO integrated)  
4. Integration Health Center  
5. Manager Alert Feed  
6. Cashier Speed Mode  
7. Staging evidence recorder (GitHub URLs in artifacts)  
8. Smart KDS priority column  
9. Real-time profit tile  
10. Partner scope picker UI (Public API)  

---

## 8. Top Features To Finish (Existing)

1. P0 staging proof PASS  
2. SSO IdP login → pilot_ready  
3. Woo/Shopify live smoke PASS  
4. First paid pilot GO  
5. Tier 0 + Tier 2 gates  
6. KDS Playwright GitHub PASS  
7. Production calendar staging drill  
8. Table service beta path  
9. Storefront domain automation  
10. Pilot metrics baseline PASSED  

---

## 9. Top UX Redesign Needs

1. Owner onboarding → Launch Wizard (not more checklist rows)  
2. Today → Daily Briefing evolution  
3. Integrations → single Health Center  
4. Go-live → wizard shell vs scattered pages  
5. Nav reduction 40% default visible items  
6. Cashier speed mode  
7. Enterprise SSO inline proof in wizard  
8. Hide preview marketing until beta  
9. Reports role packs  
10. Stop strip-only cycles without task-time proof  

---

## 10. Top Enterprise Gaps

| Gap | Fix |
|-----|-----|
| SSO IdP proof | Staging smoke PASS |
| SCIM | defer |
| SOC2 | defer — honest procurement |
| Audit retention ops | P2 |
| Pen test | pre-enterprise SSO sales |
| Webhook replay universal | P1 expansion |

---

## 11. Top Pilot Blockers

1. 11 P0 env vars missing  
2. No LOI/customer  
3. Tier 0 fail  
4. Tier 2 SKIPPED  
5. Live channel smoke SKIPPED  
6. GitHub staging PASS missing  
7. ICP not qualified  
8. No staging URL in evidence pack  
9. Metrics baseline not PASSED  
10. Internal confusion: governance 100 ≠ market ready  

---

## 12. Top Monetization Opportunities

1. Paid pilot implementation fee  
2. Commerce channel setup fee (post live PASS)  
3. KDS + production bundle SKU  
4. Enterprise SSO entitlement (post pilot_ready)  
5. Public API partner tier (post live smoke)  
6. Multi-location expansion tier  
7. Catering module upsell  
8. Accountant margin reporting pack  
9. Platform implementation partner program  
10. Case study driven inbound (post pilot)  

---

## 13. Top Investor Blockers

1. No revenue pilot  
2. No KPI baseline artifact PASSED  
3. Template-only one-pager  
4. Competitor readiness 58/100  
5. WOW factor 44/100  
6. No customer-approved case study  
7. P0 staging SKIPPED in due diligence  
8. Blended 90 still below market-defining threshold  

---

## 14. Next Era Theme

**EVOLUTION ERA 19 — BREAKTHROUGH: PROOF + ONE WOW PILLAR**

Sub-themes:
- **Proof band (Cycles 1–12):** P0 ops + first paid pilot only  
- **WOW band (Cycles 13–22):** Owner Daily Briefing + Launch Wizard  
- **Depth band (Cycles 23–40):** Integration health, KDS priority, table beta  
- **Market band (Cycles 41–50):** Metrics, case study, investor v3  

---

## 15. Next 50 Cycle Plan

See `docs/next-50-cycle-global-breakthrough-map-2026-05-28.md`.

---

## 16. Priority Order

1. P0 staging secrets + smoke PASS  
2. Tier 0 + Tier 2 gates  
3. ICP + LOI + GO/NO-GO GO  
4. First paid pilot kickoff  
5. Owner Daily Briefing (WOW)  
6. Launch Wizard  
7. Live channel smoke PASS  
8. SSO pilot_ready  
9. KDS Playwright PASS  
10. Case study + investor v3  

---

## 17. Safety Rules

- **Allowed:** real product progress, honest artifacts, unit tests, docs aligned to proof  
- **Forbidden:** fake PASS, maturity inflation, deploy/push unless asked, unified inventory/rewards unlock, offline POS, hardware cert, marketplace LIVE without era decision  
- **Smoke honesty:** SKIPPED WITH REASON acceptable; never commit fake PASSED JSON  
- **Claims:** `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` every cycle touching GTM  
- **Commit:** user rule — commit after cycle if clean  

---

## 18. What To Avoid

1. Era 18-style focus-strip sprawl (40+ similar cycles)  
2. Reopening Era 4–17 policy delivery without regression  
3. Toast/Square hardware/offline parity fiction  
4. Production SSO/SOC2/SCIM marketing  
5. Unified inventory/rewards sales  
6. Rush-hour KDS claims  
7. Doc-only cycles without product delta  
8. Promoting preview → pilot_ready without proof  
9. New AI features without explainability  
10. Feature sprawl before first paid pilot  

---

## 19. Unlock Only After Pilot Proof

- Unified inventory depletion hook  
- Unified rewards ledger  
- Marketplace LIVE integrations  
- Public API enterprise SLA  
- SOC2 / SCIM roadmap delivery  
- Offline POS  
- Hardware certification  
- Rush-hour KDS certification  
- Investor narrative without KPI artifact  
- Competitor gap "closed" rows in matrix  

---

## 20. Exact Master Prompt Requirements

Each Era 19 cycle MUST:

1. State cycle number, band (A–O), and goal from breakthrough map  
2. Deliver **real product code** (not docs-only) except ops-blocked proof cycles that honestly document SKIPPED  
3. Run validation: relevant unit tests + cert scripts  
4. Update `docs/implementation-backlog.md` and `docs/feature-maturity-matrix.md` when maturity-relevant  
5. Output **23-point cycle summary** (existing Era 18 convention)  
6. Run `git status`, `git diff --stat`  
7. Commit if clean with descriptive message  
8. Never inflate maturity; never fake PASS artifacts  
9. If ops-blocked: document missing env vars + next ops action  
10. Prefer WOW pillar work only after Cycle 12 OR parallel if P0 purely ops-owned  

**North star:** First paid pilot with honest contract + Owner Daily Briefing WOW demo for sales.

**Scores to cite externally:** blended **90**, commercial **69**, competitor **58**, WOW **44** — until proof moves them.

---

## Recommended Next Action

**Ops track:** Configure 11 P0 env vars → `npm run smoke:p0-staging-proof-unblock` PASS.

**Product track (if ops parallel):** Begin Era 19 Cycle 1 — **Owner Daily Briefing** service + Today page hero (WOW pillar design spike with real aggregator reads, no fake metrics).

**GTM track:** Qualify ICP prospect + draft LOI using `docs/commercial-pilot-runbook.md` Tier 0 checklist.
