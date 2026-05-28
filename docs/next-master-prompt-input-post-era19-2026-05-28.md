# Next Master Prompt Input — Post Era 19 Convergence

**Date:** 2026-05-28  
**HEAD:** `7b17ffa` @ `main`  
**Supersedes:** `docs/next-master-prompt-input-2026-05-28-breakthrough.md` for recurring master prompts  
**Full audit:** `docs/full-strategic-reaudit-post-era19-2026-05-28.md`

---

## 1. Current Product Reality

- **701** pages; unified restaurant OS: orders, POS, storefront, KDS, production, packing, inventory, CRM, labor, billing, platform admin.
- **Era 19 delivered (39 cycles):** Owner Daily Briefing, Launch Wizard, Integration Health Center, operational command-flow convergence (KDS↔packing↔order hub), KDS priority lane, POS speed/closeout/override clarity, permission-denied on packing/production.
- **Pilot-sellable (qualified, unchanged):** order spine, storefront tier-2 CI, POS tier-2b, KDS/production/packing, CRM, Woo/Shopify **synthetic** golden path, commercial pilot governance.
- **Not sellable:** production SSO, SOC2, SCIM, unified inventory/rewards, marketplace live, POS hardware/offline, rush-hour KDS, Public API SLA.
- **No paid pilot customer.** `pilot-gono-go-summary.json` → **NO-GO**.
- **P0 staging** → `awaiting_ops_credentials` (11 env vars).

---

## 2. Current Architecture Reality

- Monolith: **612** services, **365** models, **268** enums, **176** API routes, **16** crons, **59** RBAC keys, **19** mutation registry entries.
- Auth: Supabase + workspace RBAC; SSO R2 **`pilot_foundation`** (wiring cert; IdP login **SKIPPED**).
- Money-path CI: storefront tier-2, POS tier-2b — **do not reopen policy**.
- Inventory: **POS-only** — locked (`era5-pos-only-gtm-lock-v1`).
- Rewards: **dual ledger** — locked.
- Integration registry: **0 LIVE**, 4 BETA, 4 PLACEHOLDER.

---

## 3. What Convergence Improved (Era 19)

| Pillar | Improvement |
|--------|-------------|
| Owner Daily Briefing | Real aggregator on Today; role packs; risk radar; pilot/integration slices; 20+ unit test files |
| Launch Wizard | `/dashboard/launch-wizard`; commercial blockers; onboarding convergence with Today |
| Integration Health | Smoke artifact viewer; channel cards; recovery checklist; support triage |
| Command flows | Briefing deep-links: fulfillment, KDS priority, packing QC, production drill, POS override |
| Operational intelligence | Risk radar + production calendar in briefing; copilot/forecast still preview |

**WOW score moved 44 → 58** because pillars are **real features**, not only Era 18 strips.

---

## 4. What Remains Incomplete

- P0 proof band (cycles 1–6 of breakthrough map) — **not executed**
- Paid pilot customer + LOI
- Live Woo/Shopify smoke PASS
- SSO IdP login PASS
- GitHub staging workflow first green
- Era 19 cycles 40–50 (market band) — not started
- `docs/era19-cycle-completion-scorecard-2026-05-28.md` — **missing**
- Table service, campaigns, hardware, offline — still preview/defer
- Instrumented briefing outcomes / launch TTV measurement

---

## 5–11. Biggest Gaps (Summary)

| Category | Top gaps |
|----------|----------|
| **Product** | Live channel proof; table service; no paid pilot reference |
| **UX** | Nav sprawl; parallel go-live vs wizard; preview modules visible |
| **Workflow** | SSO E2E; segment→campaign; unified loyalty |
| **Competitor** | Hardware/offline; Square Terminal; Klaviyo automation; rush KDS |
| **Commercial** | 11 env vars; NO-GO; no ICP/customer |
| **Enterprise** | IdP proof; pen test; SCIM/SOC2 defer honest |
| **Investor** | No revenue pilot; KPI baseline; template one-pager |

---

## 12. Top 30 Next Actions

1. Configure 11 P0 env vars in ops vault  
2. `smoke:p0-staging-proof-unblock` → `proof_passed`  
3. Fix Tier 0 preflight → PASS  
4. `smoke:enterprise-sso-idp-staging` → login PASS  
5. `smoke:woo-shopify-live` → PASS (one channel minimum)  
6. `smoke:staging-workflows-first-green` → record GitHub URL  
7. Qualify ICP prospect profile  
8. Sign qualified pilot LOI  
9. Re-run `smoke:pilot-gono-go` → **GO**  
10. Execute Tier 2 operator golden path on staging  
11. Pilot kickoff Week 1 (runbook)  
12. Capture `pilot-metrics-baseline-summary` Week 1  
13. **Freeze** new briefing/wizard deep-link cycles  
14. Measure Launch Wizard TTV with first pilot  
15. Instrument briefing tile click outcomes  
16. KDS Playwright staging PASS on GitHub  
17. Execute commerce webhook incident drill  
18. Rollback drill tabletop  
19. Publish pilot SKU pricing  
20. Customer-approved case study draft  
21. Investor one-pager v3 with real KPIs  
22. Nav hide sweep for preview families  
23. Table service beta scoping (post-pilot month 2)  
24. Sustain forbidden-claims gate pre-contract  
25. Record staging URL in evidence pack  
26. Train support on pilot boundaries  
27. Create `era19-cycle-completion-scorecard` at proof closure  
28. Update `canonical-doc-index.md` → post-era19 re-audit  
29. Real-time profit briefing tile (P2, post-pilot)  
30. Multi-location scorecard (P2)

---

## 13. What Next Master Prompt Must Focus On

**Theme: EVOLUTION ERA 20 — PROOF EXECUTION + FIRST PAID PILOT**

- Ops vault → P0 PASS → GO/NO-GO GO → kickoff  
- Use Era 19 pillars in **demo and pilot onboarding**, not as excuse to skip proof  
- One measurement cycle: Launch Wizard TTV + briefing action completion  
- Sustain: money-path CI, POS-only inventory, dual-ledger locks, integration honesty  

---

## 14. What Next Master Prompt Must Forbid

- New Era 19-style convergence cycles (deep-links, checklists, strips) before P0 PASS  
- Fake PASS on smokes or artifacts  
- Maturity inflation (SSO production, LIVE integrations, unified rewards)  
- Reopening browser E2E policy without regression proof  
- Hardware/offline/marketplace live claims  
- 60 more UX-only cycles  
- SCIM/SOC2 implementation claims  
- Unlocking cross-channel inventory or rewards without explicit era  

---

## 15. Recommended 20–30 Cycle Map

See `docs/next-30-cycle-execution-map-post-era19-2026-05-28.md`.

---

## 16. Pilot Next?

**Yes — but only after proof band.** Controlled pilot is **ready in product UX**, **not ready in commercial execution**.

---

## 17. More Internal Polishing?

**Low ROI** for strips/deep-links. **High ROI** for ops proof + first customer + TTV measurement.

---

## 18. New Era Required?

**Yes — Era 20 (Proof Execution).** Era 19 convergence **product goal largely met**; **commercial goal not met**. Do not label Era 19 "closed" until scorecard + P0 PASS.

---

## Scorecard (Handoff)

| Metric | Score |
|--------|------:|
| Overall blended product | 91 |
| WOW factor | 58 |
| Commercial readiness | 70 |
| Pilot readiness (executable) | 64 |
| Competitor readiness | 59 |
| Operator UX | 86 |
| Governance | 100 |

---

## Recommended Commit Message

```
docs: post-Era 19 full re-audit and Era 20 master prompt input

Honest convergence vs commercial proof gap @ 7b17ffa; foundation for proof-first era.
```
