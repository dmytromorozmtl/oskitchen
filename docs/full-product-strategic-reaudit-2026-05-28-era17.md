# OS Kitchen Full Product Strategic Re-Audit — Post Evolution Era 17

**Date:** 2026-05-28  
**Method:** Read-only inspection of live repository (`main` @ `5e00dd4`); inventory commands executed locally; smoke scripts run (`smoke:pilot-gono-go`, `smoke:p0-staging-proof-unblock`); **no** product code changes; **no** deploy/push/migrations  
**Supersedes:** `docs/full-strategic-reaudit-2026-05-28-era16.md` for post–Era 17 inventory, commercial proof posture, competitor gaps, and Era 18 execution facts  
**Companions:** `docs/era17-cycle-completion-scorecard-2026-05-28.md`, `docs/feature-by-feature-audit-2026-05-28.md`, `docs/era17-product-gap-and-competitor-map-2026-05-28.md`, `docs/era18-global-leap-execution-map-2026-05-28.md`, `docs/next-master-prompt-input-2026-05-28-era18.md`

---

## Executive Summary

OS Kitchen is a **large, production-shaped food-operations monolith** with an **exceptionally strong governance spine** (Eras 4–17) and **weak external market proof**. Era 17 completed 45 delivery cycles at the **policy and wiring layer** — SSO IdP smoke plan, pilot GO/NO-GO evaluator, forbidden-claims gate, webhook replay P1, Public API per-route scopes, POS commercial depth, GTM proof templates — but **failed all Era 17 success criteria** that require operator credentials, GitHub PASS URLs, or a paid customer.

**Live scale (2026-05-28, `5e00dd4`):** **700** pages, **175** API routes, **8** public API v1 routes, **46** webhook routes, **16** cron routes (= production allowlist), **145** action modules, **604** services, **748** components, **365** Prisma models, **268** enums, **823** Vitest + **36** Playwright specs (**881** total), **1,509** markdown docs, **646** package scripts (**60** smoke, **237** `test:ci:*`), **17** GitHub workflows, **59** RBAC permission keys, **18** domain mutation registry entries, **57** feature-maturity matrix rows, **8** integration registry entries (**4 PLACEHOLDER**, **4 BETA**, **0 LIVE**), **6** marketing claims registry entries.

**Strongest assets:** Unified order spine (`order-creation-service`); storefront + POS money-path CI (tier-2 / tier-2b); RBAC wave 4 + mutation linter; 16-route cron discipline; commercial pilot evidence pack + honest GO/NO-GO; webhook security matrix (46 routes); Woo/Shopify golden path (synthetic CI); SSO R2 **pilot_foundation** with gated callback + tenant mapping tests; governance bundles at **100/100**.

**Weakest assets (commercially material):** **No paid pilot customer**; P0 staging proof **FAILED** locally (`p0ProofStatus: proof_failed`); SSO still **pilot_foundation** (IdP login SKIPPED — 6 env vars); GitHub staging workflows **no PASS URL recorded**; Woo/Shopify live smoke **SKIPPED** (credentials); marketplace aggregators **PLACEHOLDER**; POS hardware/offline **not certified**; KDS **no rush-hour** certification; **POS-only** inventory depletion; **dual-ledger** rewards; Public API **beta** without SLA; **1,509** docs vs **~57** canonical index links.

**Era 17 verdict:** **Complete** (cycles 1–45). **Success criteria: NOT MET.** Governance **100/100** ≠ market readiness.

**Blended overall (investor/CTO realism):** **89/100** (Era 16 **87**; +2 from Era 17 policy depth — **not** inflated by ops proof). **Commercial pilot readiness: 68/100.** **Enterprise readiness: 73/100.** **Competitor readiness: 58/100** (vs Toast/Square/Lightspeed depth).

**Era 18 theme:** **Execute staging proof and first paid pilot** — evidence over policy; no feature sprawl until P0 artifacts move from SKIPPED to PASSED.

---

## 1. Git / Repo / Era State

| Item | Evidence | Status | Risk | Action |
|------|----------|--------|------|--------|
| Branch | `git branch --show-current` → `main` | **main** | Low | — |
| HEAD | `5e00dd4` — `feat(era17): wire SSO pilot_ready gate into pilot GO/NO-GO (KOS-E17-045)` | **5e00dd4** | Low | Use this SHA for audit |
| Working tree | `git status` → clean | **Clean** | Low | — |
| Era 17 closure | Cycles 1–45; scorecard @ `0f27ac4`; post-scorecard commits wire P0/SSO into GO/NO-GO | **Complete** | Low | Do not re-run Era 4–17 without regression |
| Era 17 Cycle 1 | `enterprise-sso-idp-staging-smoke-plan.md` present | **Present** | Low | Ops must execute Cycle 2 |
| Unfinished work | P0 proofs SKIPPED; paid pilot NO-GO; Tier 0 failed in GO/NO-GO artifact | **Ops-blocked** | **High** | Era 18 P0 execution |
| Docs vs code | Matrix + policies align on POS-only inventory, dual ledger, SSO pilot_foundation | **Aligned** | Low | Sustain claims strict |
| Era 4–16 prompts | Superseded by Era 17/18 handoff inputs | **Stale for delivery** | Medium if reopened | Reference only |
| Generated artifacts | `artifacts/pilot-gono-go-summary.json`, `artifacts/p0-staging-proof-unblock-summary.json` on disk | **Present** | Medium | Not committed; audit evidence |

**Recent commits (last 10):** SSO pilot_ready gate in GO/NO-GO; procurement sync; SSO pilot_ready evaluator; P0 staging gates; P0 unblock orchestrator; SSO tenant mapping; SSO operator runbook; Era 18 handoff; scorecard refresh; competitor matrix refresh.

---

## 2. Fresh System Inventory

| Metric | Count | Evidence Command | Notes |
|--------|------:|------------------|-------|
| App Router pages | **700** | `find app -name 'page.tsx' \| wc -l` | Dashboard + storefront + platform |
| API routes | **175** | `find app/api -name 'route.ts' \| wc -l` | |
| Public API v1 routes | **8** | `find app/api/public -name 'route.ts' \| wc -l` | Beta; per-route scopes Era 17 |
| Webhook routes | **46** | `find app/api/webhooks -name 'route.ts' \| wc -l` | Matrix cert: 46 classified |
| Cron routes | **16** | `find app/api/cron -name 'route.ts' \| wc -l` | = production allowlist |
| Action modules | **145** | `find actions -name '*.ts' \| wc -l` | |
| Services | **604** | `find services -name '*.ts' \| wc -l` | Monolith scale pressure |
| Components | **748** | `find components -type f \| wc -l` | |
| Hooks | **3** | `find hooks -type f \| wc -l` | Minimal |
| Stores | **1** | `stores/ui-store.ts` | Zustand |
| Prisma models | **365** | `grep -c '^model ' prisma/schema.prisma` | Typecheck OOM risk |
| Prisma enums | **268** | `grep -c '^enum ' prisma/schema.prisma` | |
| Vitest tests | **823** | `find tests -name '*.test.ts' \| wc -l` | |
| Playwright specs | **36** | `find e2e -name '*.spec.ts' \| wc -l` | + `tests/e2e/` |
| Total test files | **881** | tests + e2e | Strong unit; staging E2E ops-dependent |
| CI workflows | **17** | `.github/workflows/*.yml` | 4 staging-focused |
| Package scripts | **646** | `Object.keys(scripts).length` | |
| Smoke scripts | **60** | `smoke:*` filter | Era 17 adds P0/pilot pack |
| `test:ci:*` scripts | **237** | package.json | Governance partitioned |
| Docs total | **1,509** | `find docs -name '*.md' \| wc -l` | Sprawl risk |
| Canonical index links | **~57** | `docs/canonical-doc-index.md` | |
| Feature maturity rows | **57** | `feature-maturity-matrix.md` | |
| Integration registry | **8** | `integration-registry.ts` | 4 PLACEHOLDER, 4 BETA, 0 LIVE |
| Claims registry | **6** | `config/marketing/claims-registry.json` | Strict mode enforced |
| RBAC permission keys | **59** | `PERMISSIONS` object keys | |
| Mutation registry entries | **18** | `domain-mutation-registry.ts` | + linter Era 16 |
| SSO-related files | **~80+** | grep lib/app/docs | pilot_foundation |
| KDS-related files | **~50+** | grep kds/kitchen-screen | pilot_ready qualified |
| POS-related files | **~200+** | grep pos | beta certified software |
| Storefront files | **~300+** | grep storefront | pilot_ready checkout |
| Inventory files | **~80+** | grep inventory | POS-only lock |
| TODO/FIXME (lib+app) | **Low** | grep scan | Not material debt signal |
| Public POST routes | **~100+** | grep POST in app/api | Abuse review Era 17 P1 |

---

## 3. Era 17 Completion vs Success Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Paid pilot + signed contract + GO artifact | **NOT MET** | `artifacts/pilot-gono-go-summary.json` → `decision: NO-GO`; `customerExecutionStatus: skipped_missing_customer` |
| SSO `pilot_ready` with IdP evidence | **NOT MET** | `enterprise-sso-pilot-ready-era17-policy.ts` → `awaiting_idp_login_proof`; default `pilot_foundation` |
| 2/3 staging workflows GitHub PASS | **NOT MET** | `stagingWorkflowsFirstGreen` SKIPPED — missing `E2E_STAGING_BASE_URL`, login secrets |
| Woo or Shopify live smoke PASS | **NOT MET** | `channelLive` SKIPPED — `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` |
| Governance bundles green + claims strict | **MET** | `test:ci:governance-bundles`; forbidden-claims gate `proof_passed` |
| Scorecard without inflation | **MET** | Blended **89/100**; explicit NOT MET criteria documented |

**Era 17 delivered at policy layer:** IdP smoke plan, GO/NO-GO evaluator, forbidden-claims enforcement, webhook replay P1 (Resend), Public API scopes, POS tablet UX/runbook, channel pilot playbook/wizard, investor/competitor/case study templates, nav/permission UX, inventory messaging, costing spot check.

---

## 4. What Can Be Sold Today

### Pilot-sellable (qualified contract + honest matrix labels)

- Order hub + manual orders (`pilot_ready`)
- Storefront checkout + publish path (`pilot_ready` — tier-2 CI)
- POS software checkout/refund/void/shift (`beta` — tier-2b CI; **no hardware/offline**)
- KDS bump/recall (`pilot_ready` — **no rush-hour**)
- Production board/calendar (`pilot_ready` qualified)
- Packing/verification (`pilot_ready`)
- CRM profiles/segments (`pilot_ready` qualified)
- Woo/Shopify golden path (`pilot_ready` — **needs live smoke PASS for strong claim**)
- Billing/subscriptions (`pilot_ready`)
- Commercial pilot pack (GO/NO-GO, rollback, ICP templates)

### Safest ICP

Single-location or ≤5 units; owner-operator engaged; needs kitchen + storefront + in-browser POS; accepts beta/pilot labels; Woo **or** Shopify; **does not require** SSO, marketplace live ops, unified inventory, or hardware.

### Must NOT claim

Production SSO/SOC2/SCIM; unified inventory/rewards; Toast/Square hardware/offline parity; rush-hour KDS; live DoorDash/Uber/Grubhub; Public API SLA; production-certified POS hardware; storefront inventory depletion.

---

## 5. End-to-End Workflow Audit (Summary)

| Workflow | End-to-End? | Broken Link | Risk | Fix |
|----------|-------------|-------------|------|-----|
| Owner onboarding | **Partial** | IA complexity; nav beta | Medium | Golden path + checklist |
| Staff invite → login → RBAC | **Yes** (email auth) | SSO path unproven | Medium | IdP smoke |
| SSO login → dashboard | **No** (ops proof) | Cycle 2 SKIPPED | **High** | Staging IdP credentials |
| Menu → storefront publish | **Yes** | Domain/media preview gaps | Medium | Publish runbook |
| Storefront checkout | **Yes** | CI tier-2; optional Stripe browser | Low | Sustain cert |
| SF order → hub → kitchen | **Yes** | No inventory depletion | Medium (GTM) | Honest messaging |
| POS checkout → receipt → depletion | **Yes** (POS only) | Hardware N/A | Low | Sustain tier-2b |
| POS refund/void | **Yes** | Manager UI depth | Low | UX polish |
| POS shift open → closeout | **Yes** | Variance approval UI | Medium | Manager workflows |
| KDS bump/recall | **Yes** (qualified) | Rush-hour; Playwright SKIPPED | Medium | Staging proof |
| Production calendar | **Yes** (qualified) | No drag-drop/KDS sync | Medium | Operator drill |
| Woo/Shopify → canonical order | **Yes** (synthetic) | Live smoke SKIPPED | **High** | Credentials + PASS |
| Public API order create | **Yes** | Beta scopes | Medium | Partner smoke |
| Stripe webhook finalization | **Yes** | Replay partial | Medium | Expand P1 |
| Loyalty earn/redeem | **Partial** | Dual ledger | **High** (mis-sell) | Honest GTM |
| Gift card redeem | **Partial** | Cross-channel locked | **High** | Honest GTM |
| Segment → campaign | **No** | Campaign preview | Medium | Defer or preview label |
| Schedule → time clock → labor | **Partial** | Payroll preview | Medium | RBAC + export depth |
| Paid pilot GO/NO-GO | **Wired** | **NO-GO** locally | **High** | Execute P0 + customer |
| Staging release workflow | **No** | GitHub PASS missing | **High** | Ops secrets |
| Enterprise procurement Q&A | **Yes** (honest) | SSO answers partial | Medium | pilot_ready after proof |
| Support impersonation → audit | **Yes** | internal_only | Low | Access review |

Full workflow table: see `docs/feature-by-feature-audit-2026-05-28.md` § Workflows.

---

## 6. Commercial Pilot Readiness

| Dimension | Score | Notes |
|-----------|------:|-------|
| **Overall pilot readiness** | **68/100** | Governance strong; execution absent |
| GO/NO-GO artifact | NO-GO | 6 blockers in live smoke run |
| Tier 0 engineering | **FAIL** | `tier0ProofStatus=proof_failed` |
| Tier 1 staging | **PASS** | Wiring cert |
| Tier 2 golden path | **SKIPPED** | Missing staging operator attestation |
| Forbidden claims | **PASS** | Enforcement wired |
| P0 staging proof | **FAILED** | 11 missing env vars |

**Pilot package (when GO):** Order hub, storefront, POS tier-2b, KDS qualified, production calendar, Woo/Shopify, CRM, packing, billing.

**Pilot pricing hypothesis:** $500–2,500/mo pilot fee + implementation block; 90-day term; success = orders/day, checkout success, KDS bump latency, weekly operator sign-off.

**Blocking before first paid pilot:** Configure staging secrets; run `smoke:p0-staging-proof-unblock` → PASSED; complete Tier 2 golden path; qualify ICP prospect; sign LOI; re-run `smoke:pilot-gono-go` → GO.

---

## 7. Enterprise Readiness

| Capability | State | Gap | Risk |
|------------|-------|-----|------|
| SSO | **pilot_foundation** | IdP login proof | **High** mis-sell |
| SCIM | not_implemented | Full build | High if claimed |
| SOC2 Type II | not_certified | Attestation | High if claimed |
| RBAC | **strong** | Helper sprawl | Medium |
| Tenant isolation | **strong baseline** | Pen test | Medium |
| Audit logs | beta | Retention/export | Medium |
| Procurement pack | beta honest | SSO FAQ partial | Medium |
| Backup/restore | documented partial | Drill proof | Medium |
| Support impersonation | internal_only | Access review | Medium |
| DPA/subprocessors | listed in pack | Updates | Low |

**Enterprise readiness score: 73/100**

---

## 8. Security / RBAC / API Audit

| Area | Score | Top Risks |
|------|------:|-----------|
| **Security (blended)** | **87/100** | Webhook replay not universal; public POST surface |
| Auth/session | Strong SMB | SSO unproven live |
| RBAC | 59 keys + wave 4 | Not all actions use registry |
| Webhooks | 46 classified | Partial replay hardening |
| Public API | 8 routes + scopes | No SLA; rate limits partial |
| Upload security | Malware scan hook | AV vendor cert gap |

**Top 20 security risks (abbreviated):** (1) SSO cross-tenant misconfig without IdP proof; (2) Webhook replay on non-P1 routes; (3) Public POST abuse on high-traffic routes; (4) API key scope bypass on new routes; (5) Storefront checkout abuse; (6) Support impersonation audit gaps; (7) Export route PII leakage; (8) Cron secret rotation; (9) Integration credential encryption key exposure; (10) Upload malware bypass; (11) Break-glass SSO abuse; (12) Tenant actor bypass in legacy actions; (13) Public API pagination DoS; (14) Webhook signature skip on misconfig; (15) DSR export over-breadth; (16) Platform admin role drift; (17) Staging secrets in logs; (18) Stripe webhook idempotency edge cases; (19) Cross-channel rewards fraud; (20) Doc sprawl causing false claims.

**Era 18 security plan:** Complete P0 staging proof; expand webhook replay to remaining P1; sustain mutation linter; pen test before enterprise SSO sales; no SOC2 claim.

---

## 9. Money Path and Data Integrity

| Money Path | Correct? | Idempotent? | Tested? | Risk |
|------------|----------|-------------|---------|------|
| Storefront checkout | **Yes** | **Yes** | tier-2 CI | Low |
| POS checkout | **Yes** | **Yes** | tier-2b CI | Low |
| Stripe webhook | **Yes** | **Partial** | cert | Medium |
| POS refund/void | **Yes** | **Yes** | unit tests | Low |
| Discounts/tips/tax | **Yes** | **Yes** | guard tests | Low |
| Inventory depletion | **POS only** | **Yes** (POS) | cert | **GTM** if mis-sold |
| Loyalty/gift redeem | **Dual ledger** | **Partial** | cross-channel cert | **High** mis-sell |
| External order import | **Yes** (golden path) | **Yes** | synthetic CI | Live proof gap |
| Billing subscription | **Yes** | **Yes** | webhook tests | Low |

---

## 10. UX / Operator Speed (Summary)

| Role | Top Friction | Priority |
|------|--------------|----------|
| Owner | Nav breadth; preview routes | P1 |
| Cashier | POS tablet polish improved Era 17; manager discount UI deferred | P1 |
| Kitchen | KDS polling vs realtime expectations | P1 |
| Server | Table service preview only | P2 |
| Marketer | Campaign preview; dual ledger confusion | P2 |
| Enterprise admin | No SSO self-service proof | P0 |

---

## 11. Technical Debt / Scale

| Debt | Impact | Era 18? |
|------|--------|---------|
| 365 Prisma models | Typecheck OOM | Yes — slice discipline |
| 604 services | Navigation/discovery | Yes — ownership map |
| 1,509 docs | False truth risk | Yes — canonical prune |
| Dual inventory/rewards logic | GTM confusion | Locked unless era unlock |
| Legacy actions outside mutation registry | Security drift | Sustain linter |
| Duplicate order entrypoints | Maintenance | Document spine only |
| Client-heavy dashboard pages | Performance | P2 |

---

## 12. DevOps / CI / Staging

| Score | Value | Evidence |
|-------|------:|----------|
| DevOps (governance) | **100** | Bundles green |
| DevOps (blended) | **82** | No GitHub staging PASS |
| Staging readiness | **55** | P0 SKIPPED |
| Release confidence | **60** | Tier 0 fail in GO/NO-GO |

**Top gaps:** GitHub `e2e-staging`, `woo-shopify-staging-smoke`, `playwright-kds-staging` never recorded PASS; full typecheck OOM risk; 17 workflows need secret hygiene.

---

## 13. Documentation and Claims Contradictions

| Claim | Location | True? | Fix |
|-------|----------|-------|-----|
| SSO production-ready | Any marketing | **No** | pilot_foundation only |
| Unified inventory | Legacy audits | **No** | POS-only policy |
| Unified rewards | Legacy marketing | **No** | dual-ledger lock |
| Era 17 success | Some summaries | **No** | NOT MET explicit |
| Governance 100 = product ready | Scorecard | **No** | Blended 89 |
| Woo/Shopify live certified | Without artifact | **No** | Need PASS JSON |

---

## 14. Investor / GTM / Market

| Dimension | Score |
|-----------|------:|
| Investor readiness | **72/100** |
| GTM readiness | **70/100** |

**Strongest narrative:** One order spine across storefront, POS, kitchen, packing with honest CI governance — rare at this maturity stage.

**Weakest narrative:** No paid pilot, no live integration proof, no enterprise SSO proof, far from Toast hardware ecosystem.

**90-day GTM plan:** (1) P0 staging PASS; (2) first paid pilot LOI; (3) capture metrics baseline; (4) publish qualified case study; (5) investor one-pager with real KPIs.

---

## 15. Evidence-Based Scorecard

| Area | Score | Blocks +10 | Era 18 Work |
|------|------:|------------|-------------|
| Overall (governance) | **100** | N/A — plateau | Sustain |
| Overall (blended) | **89** | P0 proof + pilot | Execute Era 18 A–C |
| Architecture | **85** | Schema sprawl | Slice typecheck |
| Backend/API | **84** | Public API SLA | Partner hardening |
| Frontend/UX | **78** | Nav/FOH depth | Operator speed band |
| Database | **72** | 365 models | Schema discipline |
| POS | **76** | Hardware/offline | Software depth only |
| POS competitive | **52** | Toast parity | Do not claim |
| Storefront | **83** | Domains/media | Publish hardening |
| KDS | **76** | Rush-hour | Staging Playwright PASS |
| Inventory | **73** | Cross-channel | Locked — messaging |
| Costing | **70** | Accountant sign-off | Pilot spot checks |
| CRM | **80** | Automation | Segments depth |
| Loyalty/gift | **68** | Unified ledger | Honest dual |
| Staff/scheduling | **65** | 7shifts depth | Labor band P2 |
| Billing | **85** | Enterprise invoicing | Sustain |
| Integrations | **63** | Live smoke | **P0** |
| Public API | **70** | SLA | Beta posture |
| Security | **87** | Replay universal | P1 expansion |
| RBAC | **92** | Registry coverage | Linter sustain |
| Enterprise | **73** | SSO proof | **P0** |
| DevOps | **82** | GitHub green | **P0** |
| QA | **97** | Staging E2E flake | Ops proof |
| Documentation | **75** | Sprawl | Canonical focus |
| GTM | **70** | Paid pilot | **P0** |
| Commercial pilot | **68** | Customer | **P0** |
| Investor | **72** | Metrics | Post-pilot |
| Competitor readiness | **58** | Hardware/marketplace | Honest wedge |

---

## 16. Top Risks and Opportunities

### Top 10 P0 Risks

1. **No paid pilot customer** — commercial pack unused  
2. **P0 staging proof FAILED** — 11 missing env vars  
3. **SSO pilot_foundation** — enterprise deals mis-sold  
4. **Tier 0 GO/NO-GO fail** — release confidence gap  
5. **Live Woo/Shopify SKIPPED** — integration claims weak  
6. **Unified inventory/rewards mis-sell** — GTM trap  
7. **Governance 100 confusion** — internal vs external readiness  
8. **Doc sprawl (1,509 files)** — contradictory audits  
9. **Typecheck/monolith scale** — CI OOM  
10. **No GitHub staging PASS URL** — staging workflows unproven  

### Top 10 P1 Opportunities

1. First paid pilot with honest qualified contract  
2. SSO `pilot_ready` after IdP PASS — unlock enterprise wedge  
3. Live channel smoke PASS — strengthen Shopify/Woo story  
4. KDS/production staging operator sign-off  
5. Unified order spine as flagship GTM narrative  
6. Governance honesty as trust moat vs incumbents  
7. Production calendar + KDS bundle for prep/catering ICP  
8. Public API partner onboarding with scopes  
9. POS tablet UX + runbook for software-only pilots  
10. Investor narrative with real pilot metrics  

---

## 17. Biggest Risks (Single Statement)

| Category | Risk |
|----------|------|
| Architecture | **365-model monolith** without slice ownership — typecheck and onboarding cost compound |
| Product | **Policy-complete but proof-absent** — sales ahead of staging artifacts |
| UX | **Surface area exceeds operator focus** — Square beats on simplicity |
| GTM | **Mis-selling unified inventory/rewards/SSO** despite locks |
| Investor | **No revenue pilot or KPI baseline** — narrative is template-only |

---

## 18. Era 18 Master Prompt Required?

**Yes — immediately.** Era 17 closed the policy layer; Era 18 must **execute** P0 ops proof and first paid pilot. Emphasize: evidence over policy, forbidden claims, no Era 4–17 redelivery, no feature sprawl until P0 PASS.

**Recommended next action:** Configure staging secrets → `npm run smoke:p0-staging-proof-unblock` → remediate failures → Tier 2 golden path → qualify ICP → LOI → `smoke:pilot-gono-go` → GO with qualifications.

---

## Validation Commands (audit snapshot)

```bash
npm run smoke:pilot-gono-go
npm run smoke:p0-staging-proof-unblock
npm run test:ci:governance-bundles
npm run test:ci:scorecard:cert
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
find app/api/cron -name route.ts | wc -l   # expect 16
```

**Live smoke run @ audit:** `pilot-gono-go` → **NO-GO**; `p0-staging-proof-unblock` → **FAILED** (`proof_failed`).
