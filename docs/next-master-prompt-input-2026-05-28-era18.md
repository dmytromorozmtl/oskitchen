# Next Master Prompt Input — KitchenOS Evolution Era 18

**Date:** 2026-05-28  
**Purpose:** Canonical facts for the **Evolution Era 18** master prompt and recurring cycle prompts — **post full Era 17 re-audit**  
**Strategic baseline:** `docs/full-product-strategic-reaudit-2026-05-28-era17.md` @ `5e00dd4`  
**Execution map:** `docs/era18-global-leap-execution-map-2026-05-28.md`  
**Feature audit:** `docs/feature-by-feature-audit-2026-05-28.md`  
**Competitor map:** `docs/era17-product-gap-and-competitor-map-2026-05-28.md`  
**Era 17 closure:** `docs/era17-cycle-completion-scorecard-2026-05-28.md`

> **For recurring Era 18 prompts:** Era 17 is **complete** (cycles 1–45). Do **not** re-run Era 4–17 delivery cycles unless live regression is proven (`git log` + failing cert). Prior handoff: `docs/next-master-prompt-input-2026-05-28-era17.md` (historical).

---

## Era 17 outcomes

Era 17 closed the policy/wiring layer: SSO pilot foundation, P0 unblock orchestrators, commercial GO/NO-GO pack, governance **100/100**, blended **89/100**. Live staging proof and paid pilot execution remain **operator-blocked**.

## Era 17 success criteria

**NOT MET** — no IdP login PASS, no GitHub staging first-green PASS URLs, no Woo/Shopify live PASS, no paid pilot customer, Tier 0/Tier 2 incomplete in GO/NO-GO artifact.

## Open P0 for Era 18

Configure 11 P0 staging env vars → `smoke:p0-staging-proof-unblock` PASS; GitHub staging workflows first green; Woo/Shopify live smoke; Tier 0 engineering gate; Tier 2 golden path; qualified ICP + LOI; first paid pilot execution.

## Era 18 strategic theme

**Execute staging proof and first paid pilot** — evidence over policy; no feature sprawl until P0 PASS artifacts exist.

## Re-audit decision

Defer full re-audit at Era 18 start. Trigger full re-audit when first paid pilot completes, SSO reaches `pilot_ready` with IdP artifact, or repo scale shifts materially (>50 new API routes).

## Recommended Era 18 master prompt theme

**GLOBAL LEAP: staging proof + first paid pilot** — honest claims, forbidden-claims gate, operator speed (POS discount UI, role-based home, integration visibility), no Toast/Square parity fiction.

---

## 1. Current Product Reality

- **700** dashboard/storefront/platform pages; broad food-ops surface (orders, POS, storefront, KDS, production, inventory, CRM, staff, billing).
- **Pilot-sellable (qualified):** order spine, storefront checkout (tier-2 CI), POS software money path (tier-2b), packing, production board/calendar (qualified), CRM, Woo/Shopify golden path (synthetic CI), commercial pilot GO/NO-GO pack, forbidden-claims gate.
- **Not sellable as delivered:** production SSO for all tenants, SOC2 Type II, SCIM, unified inventory/rewards, marketplace live ops, POS offline/hardware, rush-hour KDS, Public API SLA.
- **No paid pilot customer** — `artifacts/pilot-gono-go-summary.json` → **NO-GO** @ audit run 2026-05-28.
- **P0 staging proof FAILED** — `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_failed`; 11 missing env vars; ops checklist: [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md) (`era17-p0-staging-proof-unblock-v1`).

---

## 2. Current Architecture Reality

- Monolith: **604** services, **365** Prisma models, **175** API routes, **16** production crons (enforced), **59** RBAC keys, **18** mutation registry entries.
- Auth: Supabase session + workspace RBAC; SSO R2 **`pilot_foundation`** (Supabase SAML path, callback adapter, admin UI, gated login, tenant mapping tests, pilot_ready **gate wired** — promotion blocked until IdP artifact).
- Security: webhook matrix (**46** routes), replay P1 expansion (Resend + Uber Eats), public POST abuse review Era 17, Public API per-route scopes.
- Money paths CI-certified: storefront tier-2, POS tier-2b — **do not redo browser E2E policy**.
- Inventory: **POS-only** depletion (`era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`); storefront/API/manual/integration channels **do not deplete**.
- Rewards: **dual ledger** (`era6-dual-ledger-gtm-lock-v1`); not interchangeable across POS and storefront.

---

## 3. What Era 17 Achieved

| Theme | Outcome |
|-------|---------|
| SSO | IdP staging smoke plan; login proof path; pilot_ready gate; operator runbook; tenant mapping; procurement sync — delivery **pilot_foundation** |
| Staging / channels | P0 unblock orchestrator; first-green orchestrators; Woo/Shopify live smoke paths — **SKIPPED/FAIL** without credentials |
| Commercial pilot | GO/NO-GO evaluator; forbidden-claims gate; ICP/contract; golden path; metrics/rollback wiring — **NO-GO** locally |
| Security | Webhook replay P1; public POST abuse; Public API per-route scopes |
| POS / KDS / ops | Tablet UX; operator runbooks; manager discount depth; KDS/production drill wiring |
| GTM | Investor one-pager (template); competitor matrix refresh; internal case study draft |
| Governance | Scorecard **100/100**; blended **89/100**; success criteria **NOT MET** |

---

## 4. What Era 17 Did Not Solve

- IdP staging login **PASS** (`loginProofStatus: proof_passed`)
- GitHub staging workflows **first green PASS** with recorded run URLs
- Woo/Shopify live smoke **PASS** with real credentials
- Paid pilot customer execution
- Tier 0 engineering gate PASS in GO/NO-GO
- Tier 2 operator golden path sign-off on staging
- Pilot metrics baseline `overall: PASSED`
- SSO `pilot_ready` promotion
- KDS Playwright GitHub PASS
- Production calendar operator drill on staging

---

## 5. Top P0 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| E18-P0-1 | SSO not `pilot_ready` — enterprise mis-sell | IdP staging smoke PASS → gate only with artifact |
| E18-P0-2 | Staging workflows never green | GitHub PASS + `staging-workflows-first-green-summary.json` |
| E18-P0-3 | Live channel smoke SKIPPED — integration claims weak | `smoke:woo-shopify-live` PASS on staging |
| E18-P0-4 | No paid pilot — commercial pack unused | GO/NO-GO → contract → golden path → metrics |
| E18-P0-5 | Mis-selling unified inventory/rewards/SSO/SOC2 | forbidden-claims + evidence pack |
| E18-P0-6 | Tier 0 GO/NO-GO fail | Fix tier0 preflight blockers |
| E18-P0-7 | Governance 100 confused with market readiness | Always cite blended **89** and competitor **58** |

---

## 6. Top P1 Opportunities

- First paid pilot with honest qualified contract
- SSO `pilot_ready` unlocks enterprise procurement wedge
- Live Woo/Shopify PASS strengthens omnichannel narrative
- Unified order spine as flagship story **with proof artifacts**
- KDS + production calendar bundle for prep/catering/ghost kitchen ICP
- Governance honesty as trust moat vs Toast/Square marketing
- Public API partner live smoke on staging
- POS manager discount UI (guards exist)
- Role-based operator home (Square simplicity gap)
- Investor narrative v3 with real pilot KPIs

---

## 7. Top Competitor Gaps

- **Toast/Square:** hardware, offline, terminal ecosystem, rush-hour KDS, table service depth, SMB simplicity
- **Shopify/Woo:** native admin + app marketplace (KitchenOS wins on kitchen spine **if** live webhooks proven)
- **7shifts/Homebase:** labor depth and compliance packaging
- **Klaviyo/Mailchimp:** marketing automation depth
- **Oracle/Simphony:** enterprise scale + attestations (SSO/SOC2/SCIM)
- **Restaurant365/MarginEdge:** inventory/accounting depth (KitchenOS has POS-only depletion honesty)

**Competitor readiness score: 58/100** — do not claim parity.

---

## 8. Top Features to Add (Era 18 — selective)

Only if pilot-blocking or post-GO:

- Staging ops evidence records (GitHub URLs in artifacts)
- Paid pilot customer record in GO/NO-GO artifact
- SSO `pilot_ready` promotion module (artifact-gated only)
- Role-based operator home MVP (post-pilot feedback)
- Manager discount UI (server guards exist)
- Pilot metrics dashboard export
- Manager integration health strip on operator home (Era 18 Cycle 4)

**Do not add without explicit era unlock:** offline POS, hardware cert, marketplace LIVE, unified inventory/rewards, SCIM, SOC2 program, rush-hour KDS cert, broad AI.

---

## 9. Top Features to Finish

| Feature | Action |
|---------|--------|
| SSO | IdP proof → `pilot_ready` |
| Woo/Shopify | Live smoke PASS |
| Staging GitHub | First green PASS URLs |
| Commercial pilot | First customer GO |
| KDS | Staging sign-off + Playwright green |
| Production calendar | Operator drill on staging |
| Tier 0/2 pilot gates | PASS in GO/NO-GO |
| POS | Manager discount UI |
| Public API | Partner live smoke |
| Investor/case study | Real metrics gate |

---

## 10. Top UX Improvements

- Role-based home for cashier/kitchen (reduce nav noise)
- Manager discount UI on POS
- Shift variance approval UI
- Permission-denied consistency (sustain Era 17)
- Pilot onboarding time-to-first-order reduction
- Integration setup wizard (Era 17 — sustain with live proof)

---

## 11. Top Enterprise Gaps

- SSO IdP live proof (pilot_foundation → pilot_ready)
- SCIM not implemented
- SOC2 Type II not certified
- Backup/restore drill proof partial
- Access review for support impersonation
- Public API no SLA
- Pen test before enterprise SSO sales at scale

---

## 12. Top Pilot Blockers

1. `p0ProofStatus: proof_failed` — 11 env vars missing  
2. `decision: NO-GO` — no customer, ICP, tier0, tier2, P0  
3. No staging URL in evidence pack  
4. No signed LOI  
5. Live channel + SSO + GitHub proof all SKIPPED  

---

## 13. Top Investor Blockers

1. No paid pilot revenue  
2. No pilot metrics baseline PASSED  
3. Case study internal draft only  
4. Investor one-pager template-only  
5. Competitor readiness 58/100 — no hardware/marketplace proof  
6. Blended 89 ≠ governance 100 — must explain honestly  

---

## 14. Era 18 Strategic Theme

**Execute staging proof and first paid pilot**

Convert Era 17 **policy foundations** into **runtime evidence** and **revenue pilot execution**. Evidence over policy. No feature sprawl until P0 artifacts move from SKIPPED/FAILED to PASSED.

---

## 15. Era 18 Priority Order

1. **P0** Configure staging secrets → `smoke:p0-staging-proof-unblock` → PASSED  
2. **P0** SSO IdP login → `pilot_ready` gate (if enterprise pilot)  
3. **P0** Woo/Shopify live smoke PASS  
4. **P0** GitHub staging workflows PASS URLs  
5. **P0** Tier 0 + Tier 2 pilot gates → GO/NO-GO GO  
6. **P0** First paid pilot LOI + kickoff  
7. **P1** KDS/production staging sign-off  
8. **P1** Pilot metrics baseline + investor v3  
9. **P2** POS UX depth, labor, accounting exports  
10. **P3** deferred: inventory hook, unified rewards, marketplaces, offline  

---

## 16. Era 18 Safety Rules

**Allowed:** ops credential configuration, smoke script runs, artifact capture, runbooks, bounded tests, docs, canonical index updates at era boundary, artifact-gated policy promotion only  

**Forbidden:** deploy, push, reset/clean git, destructive migrations, false production claims, broad refactors, feature code without cycle scope, POS browser E2E redo, inventory/rewards unlock without era decision, inflating scorecard without proof  

---

## 17. Recommended 48 Cycles

See `docs/era18-global-leap-execution-map-2026-05-28.md` — bands A–N, **48 cycles**.

| Band | Theme |
|------|-------|
| A | Commercial pilot execution (1–8) |
| B | SSO pilot_ready (9–14) |
| C | Live channel proof (15–20) |
| D | Staging/DevOps evidence (21–25) |
| E | Webhook/API hardening (26–29) |
| F | POS commercial depth (30–33) |
| G | KDS/production ops (34–37) |
| H | Inventory/costing (38–40) |
| I | CRM/loyalty honesty (41–42) |
| J | UX/operator speed (43–45) |
| K | Investor/procurement (46–47) |
| L | Scorecard + handoff (48) |
| M | Competitor leapfrog (conditional post-GO) |
| N | Era 19 handoff |

---

## 18. Recurring Prompt Requirements

Each Era 18 cycle must state:

1. Cycle number + workstream (A–N)  
2. Single theme (one deliverable)  
3. Policy ID if new cert introduced  
4. Evidence paths (files, artifacts, GitHub run URLs)  
5. Explicit **non-claims** for the cycle  
6. Validation commands (`npm run test:ci:...`, smoke scripts)  
7. Whether Era 4–17 items are touched (default: **no**)  
8. Whether cycle requires ops credentials (default: flag SKIPPED honestly if missing)  

---

## 19. What Era 18 Must Avoid

- Re-implementing POS browser E2E policy (Era 4/5 certified)  
- Re-opening Era 4–17 cycles without regression proof  
- Claiming production SSO, SOC2, unified inventory/rewards, rush-hour KDS, marketplace live  
- New experimental crons (stay at **16**)  
- Aggressive feature sprawl before first paid pilot GO  
- Inflating governance scorecard without blended evidence  
- Fake PASS artifacts or customer records  

---

## 20. What Era 18 Should Unlock Only With Explicit Decision

- Storefront/API inventory depletion (`era5-pos-only-gtm-lock-v1`)  
- Unified cross-channel rewards ledger (`era6-dual-ledger-gtm-lock-v1`)  
- Offline POS / Stripe Terminal hardware certification  
- DoorDash/Uber Eats/Grubhub LIVE integrations  
- SOC2 Type II / SCIM  
- Rush-hour KDS certification  
- Public API production SLA  
- Broad AI/copilot expansion  

---

## Scorecard (Era 17 end)

Era 17 end → Era 18 start scorecard (governance vs blended):

| Area | Governance | Blended | Era 18 Target | Requires |
|------|----------:|--------:|--------------:|----------|
| Overall | 100 | **89** | **92** | paid pilot + P0 PASS |
| Enterprise | — | **73** | **78** | SSO pilot_ready |
| Integrations | — | **63** | **72** | live smoke PASS |
| Commercial pilot | — | **68** | **85** | GO + customer |
| DevOps | 100 | **82** | **90** | GitHub PASS |
| Competitor readiness | — | **58** | **62** | pilot proof (not parity) |
| Investor DD | — | **72** | **78** | metrics PASSED |

Governance internal may remain **100/100** — do not conflate with blended or competitor scores.

---

## CI / Governance Facts (unchanged)

- Default quality: `npm run test:ci:governance-bundles`  
- Scorecard: `npm run test:ci:scorecard:cert` (era4–era17; era18 refresh at cycle 48)  
- Handoff cert: `test:ci:era17-era18-handoff:cert`  
- Production crons: **16** only  
- POS money path: tier-2b — **certified — do not redo**  
- Claims: `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before external materials  
- P0 aggregate: `npm run smoke:p0-staging-proof-unblock`  
- Pilot gate: `npm run smoke:pilot-gono-go`  

---

## Documentation Rules

- Update canonical set + `docs/canonical-doc-index.md` at era boundaries  
- Maturity claims must match matrix + policy IDs + smoke artifacts  
- Paid pilots: `docs/commercial-pilot-runbook.md` + forbidden-claims gate  
- Full re-audit baseline: `docs/full-product-strategic-reaudit-2026-05-28-era17.md`  

---

## Recommended Next Action

1. **Ops:** Configure 11 P0 env vars — see [`era18-p0-staging-proof-ops-checklist.md`](./era18-p0-staging-proof-ops-checklist.md) (`era17-p0-staging-proof-unblock-v1`); `npm run smoke:p0-staging-proof-unblock -- --checklist-only`.
2. **Ops:** Re-run `npm run smoke:p0-staging-proof-unblock` until `p0ProofStatus: proof_passed`.  
3. **Commercial:** Qualify ICP prospect; prepare qualified LOI from Era 17 templates.  
4. **Engineering:** Fix Tier 0 blockers; sustain governance bundles — no feature sprawl.  
5. **GTM:** Run `smoke:pilot-forbidden-claims-enforcement` on release branch before any contract.  
6. **Publish Era 18 master prompt** using this input + execution map.  

---

## Era 18 Master Prompt Emphasis

The Era 18 master prompt must emphasize:

1. **Evidence over policy** — PASS artifacts before any maturity promotion  
2. **First paid pilot** as north star — cycles A–C before M-band leapfrog  
3. **Honest non-claims** every cycle — especially SSO, inventory, rewards, KDS rush, hardware  
4. **No Era 4–17 redelivery** unless regression proven  
5. **Blended scoring** — governance 100 ≠ market ready; competitor 58 ≠ Toast  
6. **Conditional full re-audit** at Era 18 end if pilot + SSO proof achieved  

**Era 18 master prompt is required now.**
