# KitchenOS Canonical Documentation Index

**Status:** canonical doc governance index for Evolution Era 2  
**Updated:** 2026-05-27 (Era 8 Cycle 2 — KDS Realtime E2E staging scope)  
**Rule:** Do not create new ad-hoc `docs/*AUDIT*.md` files. Update this index and the canonical set below.

---

## How to use this index

1. **Start here** for product, engineering, QA, security, and release decisions.
2. **Do not** treat module audit files (`*_MODULE_AUDIT.md`, `*READINESS*AUDIT*`, dated full audits) as current truth unless explicitly linked from a canonical doc.
3. **Update canonical docs in place** when cycles change maturity, RBAC, money paths, or CI tiers.
4. **Historical audits** remain in-repo for archaeology only — see [Deprecated families](#deprecated-families).

---

## Core canon (13)

Operational source of truth for day-to-day hardening and release gating.

| Doc | Purpose | Owner |
|-----|---------|-------|
| [`system-reality-model.md`](./system-reality-model.md) | Code-backed current-state inventory and architecture summary | Platform |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Per-feature maturity, nav/marketing/sales claim rules | Product/Platform |
| [`p0-hardening-roadmap.md`](./p0-hardening-roadmap.md) | P0/P1 stabilization sequence before expansion | Platform |
| [`rbac-permission-architecture.md`](./rbac-permission-architecture.md) | Canonical permission model (target + implemented slices) | Security/Platform |
| [`implementation-backlog.md`](./implementation-backlog.md) | Execution backlog grouped by strategic priority | Engineering |
| [`definition-of-done.md`](./definition-of-done.md) | Completion standard for product, eng, QA, GTM | Product/QA |
| [`qa-master-test-plan.md`](./qa-master-test-plan.md) | Test suite taxonomy and CI bundle references | QA |
| [`devops-release-enterprise-readiness.md`](./devops-release-enterprise-readiness.md) | Release, ops, and enterprise readiness checklist | DevOps |
| [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) | Honest enterprise procurement / security questionnaire pack (`era4-procurement-honesty-v1`) | Product/Security/GTM |
| [`product-positioning.md`](./product-positioning.md) | Market positioning tied to implementation reality | Product/GTM |
| [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) | Honest competitor gap framing | Product |
| [`kds-v1-scope.md`](./kds-v1-scope.md) | KDS v1 in/out scope, workflow, permissions, tests | Kitchen/Ops |
| [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) | Staging/manual KDS operational smoke (Era 4 Cycle 10) | Kitchen/Ops/QA |
| Domain mutation registry | `lib/permissions/domain-mutation-registry.ts` + §2a in [`rbac-permission-architecture.md`](./rbac-permission-architecture.md) | Platform/Security |
| Page maturity sweep | `lib/navigation/page-maturity-honesty.ts`, `lib/navigation/page-maturity-sweep-policy.ts` | Product/UX/GTM |
| [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) | Money-path and smoke E2E tiers by CI job | QA/DevOps |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Paid pilot GO/NO-GO aligned with maturity matrix (`era7-commercial-pilot-runbooks-v1`) | Product/GTM/Ops |

---

## Era / strategic canon (4)

Master-prompt inputs and scorecard evidence. Refresh at era boundaries (re-audit cycles).

| Doc | Purpose |
|-----|---------|
| [`full-strategic-reaudit-2026-05-27-era2.md`](./full-strategic-reaudit-2026-05-27-era2.md) | Era 2+3 live re-audit, scorecard 76/100, Era 4 execution map |
| [`next-master-prompt-input-2026-05-27-era10.md`](./next-master-prompt-input-2026-05-27-era10.md) | Facts and constraints for Evolution Era 11 master prompt |
| [`era10-cycle-completion-scorecard-2026-05-27.md`](./era10-cycle-completion-scorecard-2026-05-27.md) | Era 10 customer value / operator depth (cycles 1–4) + score 97/100 |
| [`next-master-prompt-input-2026-05-27-era9.md`](./next-master-prompt-input-2026-05-27-era9.md) | **Superseded** by era10 input for recurring prompts |
| [`era9-cycle-completion-scorecard-2026-05-27.md`](./era9-cycle-completion-scorecard-2026-05-27.md) | Era 9 enterprise / DevOps / security recert (cycles 1–4) + score 96/100 |
| [`next-master-prompt-input-2026-05-27-era8.md`](./next-master-prompt-input-2026-05-27-era8.md) | **Superseded** by era9 input for recurring prompts |
| [`era8-cycle-completion-scorecard-2026-05-27.md`](./era8-cycle-completion-scorecard-2026-05-27.md) | Era 8 operator depth / GTM hygiene (cycles 1–4) + score 94/100 |
| [`next-master-prompt-input-2026-05-27-era7.md`](./next-master-prompt-input-2026-05-27-era7.md) | **Superseded** by era8 input for recurring prompts |
| [`era7-cycle-completion-scorecard-2026-05-27.md`](./era7-cycle-completion-scorecard-2026-05-27.md) | Era 7 commercial readiness (cycles 1–4) + score 92/100 |
| [`next-master-prompt-input-2026-05-27-era6.md`](./next-master-prompt-input-2026-05-27-era6.md) | **Superseded** by era7 input for recurring prompts |
| [`era6-cycle-completion-scorecard-2026-05-27.md`](./era6-cycle-completion-scorecard-2026-05-27.md) | Era 6 P0 completion (cycles 1–5) + score 90/100 |
| [`next-master-prompt-input-2026-05-27-era5.md`](./next-master-prompt-input-2026-05-27-era5.md) | **Superseded** by era7 input for recurring prompts |
| [`era5-cycle-completion-scorecard-2026-05-27.md`](./era5-cycle-completion-scorecard-2026-05-27.md) | Era 5 P0 completion (cycles 1–5) + score 86/100 |
| [`next-master-prompt-input-2026-05-27-era4.md`](./next-master-prompt-input-2026-05-27-era4.md) | **Superseded** by era6 input for recurring prompts |
| [`era4-cycle-completion-scorecard-2026-05-27.md`](./era4-cycle-completion-scorecard-2026-05-27.md) | Era 4 execution map completion (cycles 1–12) + score 82/100 |
| [`next-master-prompt-input-2026-05-27-era3.md`](./next-master-prompt-input-2026-05-27-era3.md) | **Superseded** by era5 input for recurring prompts |
| [`era2-cycle-completion-scorecard-2026-05-27.md`](./era2-cycle-completion-scorecard-2026-05-27.md) | Era 2 execution map completion + post wave-3 scorecard |
| [`full-strategic-reaudit-2026-05-27.md`](./full-strategic-reaudit-2026-05-27.md) | **Superseded** by era2 re-audit for strategic decisions |
| [`next-master-prompt-input-2026-05-27.md`](./next-master-prompt-input-2026-05-27.md) | **Superseded** by era3 input for recurring prompts |

---

## Supporting reference (not primary canon)

Use when a canonical doc points here. Do **not** promote readiness claims from these without matrix/roadmap alignment.

| Doc | Notes |
|-----|-------|
| [`integration-marketplace-roadmap.md`](./integration-marketplace-roadmap.md) | Integration maturity roadmap; aligns with `lib/integrations/integration-honesty.ts` |
| [`API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`](./API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md) | Public API / webhook developer contracts (supplement to `test:ci:public-api-v1`) |
| [`POS_ARCHITECTURE.md`](./POS_ARCHITECTURE.md) | POS domain architecture reference |
| [`INTEGRATION_MATURITY_MATRIX.md`](./INTEGRATION_MATURITY_MATRIX.md) | Legacy integration matrix — prefer feature-maturity-matrix + integration-honesty |

---

## Deprecated families

**~1,300+ markdown files** under `docs/` fall outside this index. They are **historical** and may contradict current code.

| Pattern / family | Status | Replacement |
|------------------|--------|-------------|
| `docs/*AUDIT*.md` (module, readiness, full-system) | **Deprecated** | Core canon + feature-maturity-matrix |
| `docs/enterprise-full-audit-*.md` | **Deprecated** | full-strategic-reaudit-2026-05-27.md |
| `docs/ultimate-audit-*.md`, `docs/audit*.md` (dated) | **Deprecated** | system-reality-model.md |
| `docs/*_FINAL_*.md` (readiness/gap/blocker) | **Deprecated** | p0-hardening-roadmap.md, implementation-backlog.md |
| Ad-hoc `docs/STOREFRONT_*_AUDIT.md` | **Deprecated** | feature-maturity-matrix storefront rows |

**Banner notice:** [`_DEPRECATED_AUDIT_FAMILY.md`](./_DEPRECATED_AUDIT_FAMILY.md)

**Policy:** Do not delete deprecated docs in bulk. Do not manually edit hundreds of audit files. Add banners only to high-traffic gateway audits when they mislead (see gateway list in `_DEPRECATED_AUDIT_FAMILY.md`).

---

## Evolution Era 2 cycle ledger (completed)

| Cycle band | Outcome | Evidence |
|------------|---------|----------|
| 1–2 | Storefront publish API RBAC | `storefront.publish` on theme/builder publish routes |
| 3–4 | Hardcoded email bypass removal | platform role model, order-create access |
| 5–8 | RBAC wave 2 + public POST fail-closed | settings-center, monetization, iot/leads/nps guards |
| 9–14 | Money-path CI + inventory depletion | storefront-money-path, pos-money-path jobs |
| 15–16 | Cron surface hygiene | 16 production crons, cron-hygiene-live tests |
| 17–18 | KDS v1 scope | `docs/kds-v1-scope.md` |
| 19–20 | KDS v1 prototype | allergen badge, rollout gate, integration test |
| 21–22 | Nav/maturity governance | `lib/navigation/nav-maturity-governance.ts` |
| 23–24 | Integration honesty | `lib/integrations/integration-honesty.ts` |
| 25–26 | Public API v1 contracts | `test:ci:public-api-v1` |
| **27–28** | **Doc canon** | **this index** |
| **29–30** | **Scorecard refresh** | scores in `full-strategic-reaudit-2026-05-27.md` §19, `next-master-prompt-input-2026-05-27.md` §Scorecard |

## Evolution Era 4 cycle ledger (cross-channel truth)

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **Inventory depletion POS-only policy** | `lib/inventory/inventory-depletion-policy.ts` (`era4-pos-only-v1`); `test:ci:inventory-depletion:cert`; matrix + positioning honesty |
| **2** | **POS browser E2E CI policy** | `lib/ci/pos-browser-e2e-policy.ts` (`era4-tier2b-optional-v1`); `test:ci:pos-browser-e2e:policy`; `pos-browser-e2e-summary` artifact |
| **3** | **RBAC wave 4 residuals (batch 1)** | `test:ci:rbac-wave4`; routes/copilot/demo/feedback/integration-menu-sync/production-calendar/holiday-packages |
| **4** | **Cron experimental archive** | 121 routes → `archive/cron-routes/`; `era4-active-production-only-v1`; 16 active production crons |
| **5** | **Shopify/Woo golden path** | `era4-channel-golden-path-v1`; `test:ci:channel-golden-path:cert` |
| **6** | **RBAC wave 4 batch 2** | tables, subscriptions, ethics; `test:ci:rbac-wave4` |
| **7** | **Typecheck slice 1** | `era4-typecheck-slice-v1`; `test:ci:typecheck-slice:cert` |
| **8** | **Enterprise procurement pack** | `era4-procurement-honesty-v1`; `docs/enterprise-procurement-pack.md` |
| **9** | **Cross-channel rewards honesty** | `era4-cross-channel-rewards-v1`; dual ledger |
| **10** | **KDS staging smoke** | `era4-kds-staging-smoke-v1`; `docs/kds-staging-smoke-checklist.md` |
| **11** | **Mutation access consolidation** | `era4-mutation-access-consolidation-v1`; domain registry |
| **12** | **Page maturity sweep** | `era4-page-maturity-sweep-v1`; `PageMaturityRouteNotice` |
| **13** | **Scorecard refresh** | `era4-scorecard-refresh-v1`; this §Scorecard Era 4 |

## Evolution Era 8 cycle ledger

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **Claims registry governance** | `era8-claims-registry-v1`; `test:ci:claims-registry:cert` |
| **2** | **KDS Realtime E2E staging scope** | `era8-kds-realtime-e2e-staging-v1`; Tier E checklist; not in default CI |
| **3** | **Pilot preflight strict claims** | `era8-pilot-preflight-claims-strict-v1`; `pilot-preflight.sh` + `test:ci:pilot-preflight-claims:cert` |
| **4** | **Production calendar move UI** | `era8-production-calendar-move-ui-v1`; `movePlanTaskAction` week-column controls |
| **5** | **Scorecard refresh** | `era8-scorecard-refresh-v1`; this §Scorecard Era 8 |

## Evolution Era 9 cycle ledger

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **SSO architecture spike (R1)** | `era9-enterprise-sso-architecture-spike-v1`; `docs/enterprise-sso-architecture-spike-r1.md` |
| **2** | **Governance bundles partition** | `era9-governance-bundles-partition-v1`; job `governance-bundles-partitions` |
| **3** | **Cron surface recert** | `era9-cron-surface-recert-v1`; `test:ci:cron-hygiene:cert` |
| **4** | **RBAC wave 4 recert** | `era9-rbac-wave4-recert-v1`; `test:ci:rbac-wave4:cert` |
| **5** | **Scorecard refresh** | `era9-scorecard-refresh-v1`; this §Scorecard Era 9 |

## Evolution Era 10 cycle ledger

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **Cross-channel rewards recert** | `era10-cross-channel-rewards-recert-v1`; `test:ci:cross-channel-rewards:cert` |
| **2** | **Production calendar cross-week UI** | `era10-production-calendar-cross-week-ui-v1`; `test:ci:production-calendar-cross-week-ui:cert` |
| **3** | **Production calendar status workflow UI** | `era10-production-calendar-status-workflow-ui-v1`; `test:ci:production-calendar-status-workflow-ui:cert` |
| **4** | **KDS staging smoke recert** | `era10-kds-staging-smoke-recert-v1`; `test:ci:kds-staging-smoke-era10:cert` |
| **5** | **Era 10 scorecard refresh** | `era10-scorecard-refresh-v1`; `test:ci:scorecard:cert` |

## Evolution Era 7 cycle ledger

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **Commercial pilot runbook** | `era7-commercial-pilot-runbooks-v1`; `docs/commercial-pilot-runbook.md` |
| **2** | **Storefront Stripe E2E CI policy** | `era7-storefront-stripe-optional-v1`; `storefront-stripe-e2e-summary` artifact |
| **3** | **Repo hygiene (`tests/node_modules`)** | `era7-tests-node-modules-hygiene-v1`; `test:ci:repo-hygiene:cert` |
| **4** | **Marketing claims governance** | `era7-marketing-claims-governance-v1`; `verify-claims` + `test:ci:marketing-claims-governance:cert` |
| **5** | **Scorecard refresh** | `era7-scorecard-refresh-v1`; this §Scorecard Era 7 |

## Evolution Era 6 cycle ledger

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **Dual-ledger rewards GTM lock** | `era6-dual-ledger-gtm-lock-v1`; `test:ci:cross-channel-rewards:cert` |
| **2** | **KDS realtime / poll smoke** | `era6-kds-realtime-smoke-v1`; `test:ci:kds-realtime-smoke:cert` |
| **3** | **Typecheck slices parallel CI** | `era6-typecheck-slice-ci-v1`; job `typecheck-slices` |
| **4** | **Production calendar form deny** | `era6-production-calendar-form-deny-v1`; `test:ci:rbac-wave4` |
| **5** | **Enterprise identity annual review** | `era6-enterprise-identity-roadmap-v1`; `test:ci:enterprise-identity-roadmap:cert` |
| **6** | **Scorecard refresh** | `era6-scorecard-refresh-v1`; this §Scorecard Era 6 |

## Evolution Era 5 cycle ledger (P0 closure)

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| **1** | **RBAC wave 4 in security-db** | `test:security` chains `test:ci:rbac-wave4` |
| **2** | **Typecheck slice 2** | `era5-typecheck-slice-v2`; `typecheck:slice:storefront-marketing` |
| **3** | **POS-only GTM lock** | `era5-pos-only-gtm-lock-v1`; `inventory-depletion-gtm-lock-cert` |
| **4** | **Copilot void-form deny UX** | `era5-copilot-form-deny-v1` |
| **5** | **POS E2E secrets policy** | `era5-pos-e2e-secrets-accept-v1` |
| **6** | **Scorecard refresh** | `era5-scorecard-refresh-v1`; this §Scorecard Era 5 |

## Evolution Era 3 cycle ledger (governance CI certification)

| Cycle | Outcome | Evidence |
|-------|---------|----------|
| 42 | Storefront money-path CI cert | `test:ci:storefront-money-path:cert` |
| 43 | POS money-path CI cert | `test:ci:pos-money-path:cert` |
| 44 | Inventory depletion cert | `test:ci:inventory-depletion:cert` |
| 45 | Cron hygiene cert | `test:ci:cron-hygiene:cert` |
| 46–47 | KDS v1 scope + prototype cert | `test:ci:kds-v1:cert`, `test:ci:kds-v1:prototype:cert` |
| 48 | Nav/maturity governance cert | `test:ci:nav-governance:cert` |
| 49 | Integration honesty cert | `test:ci:integration-honesty:cert` |
| 50 | Public API v1 cert | `test:ci:public-api-v1:cert` |
| 51 | Doc canon cert | `test:ci:doc-canon:cert` (first in `test:ci:governance-bundles`) |
| **52** | **Scorecard refresh** | **`test:ci:scorecard:cert`**, §Scorecard below |

---

## Scorecard (Evolution Era 2 end — 2026-05-27)

| Area | Score (start) | Score (end) | Δ |
|------|--------------:|------------:|--:|
| Overall | 64 | **71** | +7 |
| Storefront | 72 | **76** | +4 |
| Backend/API | 66 | **71** | +5 |
| DevOps | 70 | **75** | +5 |
| QA (unit) | 65 | **71** | +6 |
| POS | 55 | **60** | +5 |
| KDS | 48 | **54** | +6 |
| RBAC | 52 | **58** | +6 |
| Integrations | 45 | **50** | +5 |
| Enterprise | 40 | **43** | +3 |
| Security | 58 | **66** | +8 |
| Marketing/sales readiness | 55 | **62** | +7 |

**Re-audit decision:** defer full repo re-audit until Q3 2026 or a major release; use this index + §Scorecard for incremental updates.

## Scorecard (Evolution Era 3 increment — 2026-05-27)

Incremental refresh after Era 3 cycles 42–52 (governance CI certification wiring). Baseline = Era 2 end scores above.

| Area | Era 2 end | Current | Δ | Key evidence |
|------|----------:|--------:|--:|--------------|
| Overall | 71 | **73** | +2 | 11 `:cert` live gates in `test:ci:governance-bundles` |
| DevOps | 75 | **78** | +3 | full governance chain in default `quality` job |
| QA (unit) | 71 | **75** | +4 | cert + unit bundles for money-path, cron, KDS, nav, API, doc canon |
| Backend/API | 71 | **72** | +1 | `test:ci:public-api-v1:cert` wiring gate |
| Integrations | 50 | **51** | +1 | `test:ci:integration-honesty:cert` |
| Marketing/sales readiness | 62 | **63** | +1 | nav + integration honesty CI certs |
| Security | 66 | **67** | +1 | doc-canon cert + anti-regression governance chain |

**Re-audit decision (unchanged):** defer full repo re-audit until Q3 2026 or a major release; use incremental scorecard updates via `test:ci:scorecard:cert`.

## Scorecard (Evolution Era 4 end — 2026-05-27)

Incremental refresh after Era 4 cycles 1–12 (cross-channel truth, governance expansion). Baseline = Era 3 increment **73** overall.

| Area | Era 3 end | Era 4 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 73 | **82** | +9 | 18 `:cert` gates; all Era 4 execution items closed |
| Security | 67 | **74** | +7 | RBAC wave 4, mutation registry |
| QA | 75 | **82** | +7 | channel, rewards, KDS smoke, page maturity certs |
| DevOps | 78 | **85** | +7 | cron archive, typecheck slice, POS E2E policy |
| RBAC | 76 | **80** | +4 | wave 4 + `logDomainMutationDenied` |
| Inventory | 62 | **68** | +6 | POS-only depletion policy |
| Integrations | 51 | **58** | +7 | Woo/Shopify golden path |
| POS | 64 | **70** | +6 | explicit browser E2E status artifact |
| KDS | 58 | **64** | +6 | staging smoke checklist |
| Enterprise readiness | 46 | **55** | +9 | procurement pack |
| Marketing/sales | 63 | **70** | +7 | page + nav maturity honesty |
| Storefront | 78 | **79** | +1 | rewards scoped (not unified) |

**Re-audit decision:** defer full repo re-audit until Era 5 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era4.md`.

## Scorecard (Evolution Era 5 end — 2026-05-27)

Incremental refresh after Era 5 cycles 1–5 (P0 closure from era4 handoff). Baseline = Era 4 end **82** overall.

| Area | Era 4 end | Era 5 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 82 | **86** | +4 | All E5 P0 closed with policy + cert wiring |
| Security | 74 | **78** | +4 | wave 4 in security-db; copilot deny UX |
| QA | 82 | **84** | +2 | POS E2E secrets policy cert |
| DevOps | 85 | **88** | +3 | typecheck slice storefront/marketing |
| RBAC | 80 | **83** | +3 | `test:security` chains wave 4 |
| Inventory | 68 | **72** | +4 | permanent GTM lock |
| POS | 70 | **74** | +4 | explicit fork skip acceptance |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 64 | **64** | +0 | unchanged |
| Enterprise readiness | 55 | **55** | +0 | procurement roadmap only |
| Marketing/sales | 70 | **71** | +1 | GTM depletion honesty |
| Storefront | 79 | **80** | +1 | typecheck slice includes storefront spine |

**Re-audit decision:** defer full repo re-audit until Era 6 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era5.md`.

## Scorecard (Evolution Era 6 end — 2026-05-27)

Incremental refresh after Era 6 cycles 1–5 (P0 closure from era5 handoff). Baseline = Era 5 end **86** overall.

| Area | Era 5 end | Era 6 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 86 | **90** | +4 | All E6 P0 closed; production calendar P1 |
| Security | 78 | **81** | +3 | form deny UX; identity annual review |
| QA | 84 | **86** | +2 | KDS realtime + rewards GTM cert |
| DevOps | 88 | **91** | +3 | `typecheck-slices` parallel CI job |
| RBAC | 83 | **86** | +3 | production calendar void-form deny |
| Inventory | 72 | **72** | +0 | storefront hook deferred |
| POS | 74 | **74** | +0 | unchanged |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 64 | **67** | +3 | poll fallback + Tier D checklist |
| Enterprise readiness | 55 | **62** | +7 | `roadmap_only` identity review |
| Marketing/sales | 71 | **74** | +3 | dual-ledger GTM lock |
| Storefront | 80 | **80** | +0 | unchanged |

**Re-audit decision:** defer full repo re-audit until Era 7 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era6.md`.

## Scorecard (Evolution Era 7 end — 2026-05-27)

Incremental refresh after Era 7 cycles 1–4 (commercial readiness from era6 handoff). Baseline = Era 6 end **90** overall.

| Area | Era 6 end | Era 7 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 90 | **92** | +2 | pilot runbook + claims governance + honest E2E tiers |
| Security | 81 | **81** | +0 | unchanged |
| QA | 86 | **87** | +1 | Stripe E2E policy artifact + marketing scan cert |
| DevOps | 91 | **92** | +1 | `tests/node_modules/` hygiene cert |
| RBAC | 86 | **86** | +0 | unchanged |
| Inventory | 72 | **72** | +0 | storefront hook deferred |
| POS | 74 | **74** | +0 | unchanged |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 67 | **67** | +0 | unchanged |
| Enterprise readiness | 62 | **62** | +0 | roadmap_only identity |
| Marketing/sales | 74 | **79** | +5 | commercial pilot + verify-claims governance |
| Storefront | 80 | **83** | +3 | optional Stripe browser tier |

**Re-audit decision:** defer full repo re-audit until Era 8 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era7.md`.

## Scorecard (Evolution Era 8 end — 2026-05-27)

Incremental refresh after Era 8 cycles 1–4 (operator depth / GTM hygiene from era7 handoff). Baseline = Era 7 end **92** overall.

| Area | Era 7 end | Era 8 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 92 | **94** | +2 | claims registry + strict pilot preflight + KDS scope + calendar UI |
| Security | 81 | **81** | +0 | unchanged |
| QA | 87 | **88** | +1 | KDS Tier E scope cert; production calendar move UI cert |
| DevOps | 92 | **93** | +1 | `MARKETING_CLAIMS_STRICT=1` in pilot preflight |
| RBAC | 86 | **87** | +1 | move-task UI with existing `production.manage` guards |
| Inventory | 72 | **72** | +0 | storefront hook deferred |
| POS | 74 | **74** | +0 | optional browser E2E unchanged (`era4-tier2b-optional-v1`) |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 67 | **68** | +1 | honest Realtime Playwright staging scope (Tier E) |
| Enterprise readiness | 62 | **62** | +0 | roadmap_only identity |
| Marketing/sales | 79 | **81** | +2 | zero `needs-evidence` registry + strict pilot gate |
| Storefront | 83 | **83** | +0 | unchanged |

**Re-audit decision:** defer full repo re-audit until Era 9 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era8.md`.

## Scorecard (Evolution Era 9 end — 2026-05-27)

Incremental refresh after Era 9 cycles 1–4 (enterprise / DevOps / security recert from era8 handoff). Baseline = Era 8 end **94** overall.

| Area | Era 8 end | Era 9 end | Δ | Key evidence |
|------|----------:|----------:|--:|--------------|
| Overall | 94 | **96** | +2 | SSO R1 spike + governance partitions + cron/RBAC recert |
| Security | 81 | **82** | +1 | `era9-rbac-wave4-recert-v1` |
| QA | 88 | **88** | +0 | unchanged |
| DevOps | 93 | **95** | +2 | governance partitions + cron recert |
| RBAC | 87 | **88** | +1 | wave-4 guard inventory |
| Inventory | 72 | **72** | +0 | storefront hook deferred |
| POS | 74 | **74** | +0 | optional browser E2E unchanged — **do not re-run Era 4 Cycle 2** |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 68 | **68** | +0 | unchanged |
| Enterprise readiness | 62 | **65** | +3 | SSO R1 architecture spike (design only) |
| Marketing/sales | 81 | **81** | +0 | unchanged |
| Storefront | 83 | **83** | +0 | unchanged |

**Re-audit decision:** defer full repo re-audit until Era 10 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era9.md`.

## Scorecard (Evolution Era 10 end — 2026-05-27)

Incremental refresh after Era 10 cycles 1–4 (customer value / operator depth / KDS recert from era9 handoff). Baseline = Era 9 end **96** overall.

| Area | Era 9 end | Era 10 end | Δ | Key evidence |
|------|----------:|-----------:|--:|--------------|
| Overall | 96 | **97** | +1 | production calendar depth + KDS recert + rewards honesty |
| Security | 82 | **82** | +0 | unchanged |
| QA | 88 | **89** | +1 | expanded cert wiring + honest gaps |
| DevOps | 95 | **95** | +0 | unchanged |
| RBAC | 88 | **88** | +0 | unchanged |
| Inventory | 72 | **72** | +0 | storefront hook deferred |
| POS | 74 | **74** | +0 | optional browser E2E unchanged — **do not re-run Era 4 Cycle 2** |
| Integrations | 58 | **58** | +0 | unchanged |
| KDS | 68 | **70** | +2 | `era10-kds-staging-smoke-recert-v1` |
| Enterprise readiness | 65 | **65** | +0 | SSO R1 design only |
| Marketing/sales | 81 | **82** | +1 | `era10-cross-channel-rewards-recert-v1` |
| Storefront | 83 | **83** | +0 | unchanged |

**Re-audit decision:** defer full repo re-audit until Era 11 theme or major release; use `docs/next-master-prompt-input-2026-05-27-era10.md`.

---

## Validation

- Wiring cert: `tests/unit/doc-canon-ci-live.test.ts` → `npm run test:ci:doc-canon:cert`
- Unit gate: `tests/unit/canonical-doc-index.test.ts` → `npm run test:ci:doc-canon`
- Scorecard cert: `tests/unit/scorecard-ci-live.test.ts` → `npm run test:ci:scorecard:cert`
- Governance bundle: all chained in `npm run test:ci:governance-bundles`

---

## Change log

| Date | Change |
|------|--------|
| 2026-05-27 | Cycle 27–28: initial index, deprecated-family notice, validation test |
| 2026-05-27 | Cycle 29–30: Evolution Era 2 scorecard refresh, inventory counts updated |
| 2026-05-27 | Era 3 Cycle 52: incremental scorecard refresh + `test:ci:scorecard:cert` |
| 2026-05-27 | Era 4 Cycle 1: POS-only inventory depletion policy + cert gate expansion |
| 2026-05-27 | Era 4 Cycle 2: POS browser E2E explicit PASSED/SKIPPED/FAILED policy + CI artifact |
| 2026-05-27 | Era 4 Cycle 3: RBAC wave 4 batch 1 + `test:ci:rbac-wave4` |
| 2026-05-27 | Era 4 Cycle 4: experimental cron archive (121 off App Router) + surface cert |
| 2026-05-27 | Era 4 Cycles 5–12: channel golden path, typecheck slice, procurement, rewards, KDS smoke, mutation registry, page maturity |
| 2026-05-27 | Era 4 Cycle 13: scorecard refresh 82/100 + `next-master-prompt-input-2026-05-27-era4.md` |
| 2026-05-27 | Era 5 Cycle 1: `test:ci:rbac-wave4` chained in `test:security` (security-db job) |
| 2026-05-27 | Era 5 Cycle 2: `typecheck:slice:storefront-marketing` + `era5-typecheck-slice-v2` policy |
| 2026-05-27 | Era 5 Cycle 3: `era5-pos-only-gtm-lock-v1` + inventory GTM lock cert |
| 2026-05-27 | Era 5 Cycle 4: `era5-copilot-form-deny-v1` — copilot form deny redirect UX |
| 2026-05-27 | Era 5 Cycle 5: `era5-pos-e2e-secrets-accept-v1` — POS browser E2E fork skip policy cert |
| 2026-05-27 | Era 5 Cycle 6: scorecard refresh 86/100 + `next-master-prompt-input-2026-05-27-era5.md` |
| 2026-05-27 | Era 6 Cycle 1: `era6-dual-ledger-gtm-lock-v1` — permanent dual-ledger rewards GTM lock |
| 2026-05-27 | Era 6 Cycle 2: `era6-kds-realtime-smoke-v1` — poll fallback + Realtime channel unit cert |
| 2026-05-27 | Era 6 Cycle 3: `era6-typecheck-slice-ci-v1` — parallel `typecheck-slices` CI job |
| 2026-05-27 | Era 6 Cycle 4: `era6-production-calendar-form-deny-v1` — void form redirect on deny |
| 2026-05-27 | Era 6 Cycle 5: `era6-enterprise-identity-roadmap-v1` — SSO/SCIM/SOC2 roadmap_only review |
| 2026-05-27 | Era 6 Cycle 6: scorecard refresh 90/100 + `next-master-prompt-input-2026-05-27-era6.md` |
| 2026-05-27 | Era 7 Cycle 1: `era7-commercial-pilot-runbooks-v1` — canonical commercial pilot runbook |
| 2026-05-27 | Era 7 Cycle 2: `era7-storefront-stripe-optional-v1` — honest Stripe browser E2E tier + summary artifact |
| 2026-05-27 | Era 7 Cycle 3: `era7-tests-node-modules-hygiene-v1` — gitignore + CI cert blocks tracked nested test installs |
| 2026-05-27 | Era 7 Cycle 4: `era7-marketing-claims-governance-v1` — matrix-aligned marketing claims scan + CI cert |
| 2026-05-27 | Era 7 Cycle 5: scorecard refresh 92/100 + `next-master-prompt-input-2026-05-27-era7.md` |
| 2026-05-27 | Era 8 Cycle 1: `era8-claims-registry-v1` — zero `needs-evidence` rows in claims registry |
| 2026-05-27 | Era 8 Cycle 2: `era8-kds-realtime-e2e-staging-v1` — honest staging-only Realtime E2E scope |
| 2026-05-27 | Era 8 Cycle 3: `era8-pilot-preflight-claims-strict-v1` — strict `verify-claims` in paid pilot preflight |
| 2026-05-27 | Era 8 Cycle 4: `era8-production-calendar-move-ui-v1` — move task UI on production calendar |
| 2026-05-27 | Era 8 Cycle 5: scorecard refresh 94/100 + `next-master-prompt-input-2026-05-27-era8.md` |
| 2026-05-27 | Era 9 Cycle 1: `era9-enterprise-sso-architecture-spike-v1` — SSO R1 design spike (not production) |
| 2026-05-27 | Era 9 Cycle 2: `era9-governance-bundles-partition-v1` — parallel governance CI partitions |
| 2026-05-27 | Era 9 Cycle 3: `era9-cron-surface-recert-v1` — cron archive posture recert (no new routes) |
| 2026-05-27 | Era 9 Cycle 4: `era9-rbac-wave4-recert-v1` — wave-4 mutation guard inventory + cert |
| 2026-05-27 | Era 9 Cycle 5: scorecard refresh 96/100 + `next-master-prompt-input-2026-05-27-era9.md` |
| 2026-05-27 | Era 10 Cycle 1: `era10-cross-channel-rewards-recert-v1` — dual-ledger rewards honesty recert |
| 2026-05-27 | Era 10 Cycle 2: `era10-production-calendar-cross-week-ui-v1` — week nav + cross-week moves |
| 2026-05-27 | Era 10 Cycle 3: `era10-production-calendar-status-workflow-ui-v1` — task status workflow on calendar |
| 2026-05-27 | Era 10 Cycle 4: `era10-kds-staging-smoke-recert-v1` — bump + recall integration recert |
| 2026-05-27 | Era 10 Cycle 5: `era10-scorecard-refresh-v1` — score 97/100; era11 handoff |
