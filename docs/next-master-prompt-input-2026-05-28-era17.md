# Next Master Prompt Input — KitchenOS Evolution Era 17

**Date:** 2026-05-28  
**Purpose:** Canonical facts for the **Evolution Era 17** master prompt and recurring cycle prompts  
**Strategic baseline:** `docs/full-strategic-reaudit-2026-05-28-era16.md`  
**Execution map:** `docs/era17-strategic-execution-map-2026-05-28.md`  
**Era 16 closure:** `docs/era16-cycle-completion-scorecard-2026-05-28.md` @ `c88be6b`

> **For recurring Era 17 prompts:** Era 16 is **complete** (cycles 1–14). Do **not** re-run Era 4–16 delivery cycles unless live regression is proven (`git log` + failing cert). **Superseded** for Era 18+ by `docs/next-master-prompt-input-2026-05-28-era18.md`. Prior handoff: `docs/next-master-prompt-input-2026-05-28-era16.md` (historical).

---

## 1. Current Product Reality

- **700** dashboard/storefront/platform pages; broad food-ops surface (orders, POS, storefront, KDS, production, inventory, CRM, staff, billing).
- **Pilot-sellable (qualified):** order spine, storefront checkout, POS software money path (tier-2b), packing, production board, CRM, Woo/Shopify golden path, commercial pilot GO/NO-GO pack.
- **Not sellable as delivered:** production SSO for all tenants, SOC2 Type II, SCIM, unified inventory/rewards, marketplace live ops (DoorDash/Uber/Grubhub), POS offline/hardware, rush-hour KDS, Public API SLA.
- **No paid pilot customer** recorded in repo as of Era 16 closure — Era 17 must execute commercial proof.

---

## 2. Current Architecture Reality

- Monolith: **604** services, **365** Prisma models, **175** API routes, **16** production crons (enforced).
- Auth: Supabase session + workspace RBAC; SSO R2 **`pilot_foundation`** (Supabase SAML path, callback adapter, admin UI, gated login).
- Security spine: domain mutation registry (**18** entries), mutation linter (Era 16), webhook matrix (**46** routes), partial replay hardening.
- Money paths CI-certified: storefront tier-2, POS tier-2b (browser optional — **do not redo policy**).

---

## 3. What Era 16 Completed

| # | Outcome |
|---|---------|
| 1–4 | SSO R2 design → schema → runtime → admin; **`pilot_foundation`** |
| 5 | Woo/Shopify live smoke orchestrator (`SKIPPED WITH REASON` without creds) |
| 6–7 | Webhook security matrix + Uber Direct/Slack replay dedupe |
| 8 | Mutation registry linter |
| 9 | Commercial pilot evidence pack + GO/NO-GO |
| 10 | KDS + production calendar operational sign-off path |
| 11 | Typecheck slice reporting |
| 12 | Public API partner confidence pack (beta) |
| 13–14 | Scorecard + staging first-green **evidence path** (not GitHub PASS) |

**Governance score:** 100/100. **Blended realism:** 87/100.

---

## 4. What Era 16 Did Not Solve

- IdP staging login proof (`pilot_foundation` ≠ `pilot_ready`)
- GitHub staging workflows **first green PASS**
- Woo/Shopify live smoke **PASS** with real credentials
- Paid pilot customer execution
- Per-route Public API scope enforcement
- Full webhook replay ops for all P1 routes
- Storefront inventory depletion (still `deferred_locked`)
- Unified rewards ledger (still `deferred_locked`)
- POS hardware/offline, marketplace LIVE integrations

---

## 5. Open P0 Risks (Era 17)

| ID | Risk | Mitigation |
|----|------|------------|
| E17-P0-1 | SSO not `pilot_ready` — enterprise deals blocked or mis-sold | IdP staging smoke + policy gate only with artifact |
| E17-P0-2 | Staging workflows never green — release confidence gap | GitHub PASS + `staging-workflows-first-green-summary.json` |
| E17-P0-3 | Live channel smoke SKIPPED — integration claims weak | `smoke:woo-shopify-live` PASS on staging |
| E17-P0-4 | No paid pilot — commercial pack unused | Execute GO/NO-GO + contract + operator golden path |
| E17-P0-5 | Mis-selling unified inventory/rewards/SSO/SOC2 | claims strict + evidence pack forbidden list |

---

## 6. Open P1 Opportunities

- Expand webhook replay hardening (matrix P1 routes)
- Public API scoped auth per route
- KDS staging Playwright workflow PASS
- Production calendar + KDS manual operator sign-off with real staging URL
- POS tablet UX polish (no new E2E policy)
- First investor narrative with pilot metrics

---

## 7. Competitor Gaps (honest)

- **Toast/Square:** hardware, offline, terminal ecosystem, rush-hour KDS polish
- **Shopify/Woo:** native admin + app marketplace (KitchenOS wins on kitchen spine if webhooks work)
- **7shifts/Homebase:** labor depth
- **Klaviyo:** marketing automation depth
- **Oracle/Simphony:** enterprise scale + attestations

**Leapfrog (if pilots prove):** single spine (order → kitchen → packing → storefront/POS) with **honest** CI governance — rare at this stage.

---

## 8. New Features to Add (Era 17 — selective)

Only if pilot-blocking:

- SSO `pilot_ready` evidence module (policy + artifact, not production SAML for all)
- Staging ops evidence record (workflow PASS URLs)
- Optional: bounded Public API scope checks on 2–3 routes
- Optional: webhook replay for next P1 provider

**Do not add:** offline POS, marketplace live build, unified inventory/rewards without era unlock decision.

---

## 9. Existing Features to Finish (quality)

| Feature | Action |
|---------|--------|
| SSO | IdP proof → `pilot_ready` |
| Woo/Shopify | Live smoke PASS |
| KDS | Staging sign-off + optional Playwright green |
| POS | UX polish + runbook (no E2E redo) |
| Public API | Scopes + partner smoke |
| Commercial pilot | First customer execution |
| Dashboard nav | Maturity on new routes |

---

## 10. Era 17 Must Focus On

**Theme: Commercial ops proof**

1. First-green staging evidence (GitHub + smoke JSON)
2. SSO IdP staging login → `pilot_ready`
3. Live Woo/Shopify smoke PASS
4. Paid pilot execution (GO/NO-GO → contract → operator golden path → retro)
5. Sustain governance (bundles, 16 crons, mutation linter, claims registry)

---

## 11. Era 17 Must Avoid

- Re-implementing POS browser E2E policy (Era 4/5 certified)
- Re-opening Era 4–16 cycles without regression proof
- Claiming production SSO, SOC2, unified inventory/rewards, rush-hour KDS, marketplace live
- New experimental crons
- Aggressive feature sprawl (AI expansion, offline POS, hardware cert)
- Inflating governance scorecard without blended evidence

---

## 12. Priority Order

1. P0 staging first green + live channel smoke PASS  
2. P0 SSO IdP proof → `pilot_ready`  
3. P0 paid pilot execution (commercial pack)  
4. P1 KDS/production operator sign-off on real staging  
5. P1 webhook replay expansion + Public API scopes  
6. P2 POS UX, typecheck CI profile, investor one-pager  
7. P3 deferred: inventory hook, unified rewards, marketplaces, offline

---

## 13. Safety Rules

**Allowed:** policy modules with `:cert`, smoke scripts, docs, runbooks, bounded tests, canonical index updates  
**Forbidden:** deploy, push, reset/clean git, destructive migrations, false production claims, broad refactors, feature code without cycle scope

---

## 14. Recommended 30–50 Cycles

See `docs/era17-strategic-execution-map-2026-05-28.md` — **45 cycles**, bands A–L.

---

## 15. Recurring Prompt Requirements

Each Era 17 cycle must state:

1. Cycle number + workstream (A–L)  
2. Single theme (one deliverable)  
3. Policy ID if new cert introduced  
4. Evidence paths (files, artifacts, GitHub run URLs)  
5. Explicit **non-claims** for the cycle  
6. Validation commands (`npm run test:ci:...`, smoke scripts)  
7. Whether Era 4–16 items are touched (default: **no**)

---

## 16. Aggressive Build vs Commercial Hardening?

**Commercial hardening.** Era 17 converts Era 16 foundations into **ops evidence** and **first revenue pilots**, with selective depth on POS/KDS/Public API only where pilot-blocking.

---

## 17. Full Re-Audit After Era 17?

**Conditional.** Run full re-audit at Era 18 boundary if: (a) first paid pilot completes, (b) SSO reaches `pilot_ready`, (c) repo scale shifts (>50 new API routes or major auth rewrite). Otherwise incremental scorecard refresh suffices.

---

## Scorecard Targets (Era 17 end — realistic)

| Area | Era 16 blended | Era 17 target | Requires |
|------|---------------:|--------------:|----------|
| Overall | 87 | **90** | pilot + staging green |
| Enterprise readiness | 74 | **80** | `pilot_ready` SSO |
| Integrations | 63 | **70** | live smoke PASS |
| Commercial pilot | 72 | **85** | paid customer |
| DevOps (blended) | 82 | **88** | GitHub PASS |
| Investor DD | 74 | **78** | pilot metrics |

Governance internal may remain **100/100** — do not conflate with blended scores.

**Era 17 scorecard (Cycle 44):** `era17-scorecard-refresh-v1` — governance **100/100** sustained; blended **89/100** (+2 from Era 16 **87**); Era 17 success criteria **NOT MET** (no paid pilot, SSO not `pilot_ready`, staging/live channel SKIPPED). See `docs/era17-cycle-completion-scorecard-2026-05-28.md`.

**Era 18 handoff (Cycle 45):** `era17-era18-handoff-input-v1` — see `docs/next-master-prompt-input-2026-05-28-era18.md` for recurring Era 18 prompts.

---

## CI / Governance Facts (unchanged)

- Default quality: `npm run test:ci:governance-bundles`
- Scorecard: `npm run test:ci:scorecard:cert` (era4–era17; `era17-scorecard-refresh-v1` on cycle 44)
- Production crons: **16** only
- POS money path: tier-2b always-on — **certified — do not redo**

---

## Documentation Rules

- Update canonical set + `docs/canonical-doc-index.md` at era boundaries only
- Maturity claims must match matrix + policy IDs
- Paid pilots: `docs/commercial-pilot-runbook.md` + `era16-commercial-pilot-evidence-pack-v1`

---

## Recommended Next Action

1. Publish **Evolution Era 17 master prompt** using this input.  
2. Execute **Cycle 1** (Workstream A): IdP staging smoke plan + env documentation.  
3. In parallel, ops runs `smoke:staging-workflows-first-green` and configures GitHub secrets for staging workflows.  
4. Do **not** start Era 17 cycles until master prompt is acknowledged (cycles may continue safely for doc-only ops prep, but delivery cycles should follow Era 17 prompt).
