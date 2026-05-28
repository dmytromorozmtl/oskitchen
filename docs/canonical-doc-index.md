# KitchenOS Canonical Documentation Index

**Status:** canonical doc governance index for Evolution Era 2  
**Updated:** 2026-05-27 (Era 4 Cycle 1)  
**Rule:** Do not create new ad-hoc `docs/*AUDIT*.md` files. Update this index and the canonical set below.

---

## How to use this index

1. **Start here** for product, engineering, QA, security, and release decisions.
2. **Do not** treat module audit files (`*_MODULE_AUDIT.md`, `*READINESS*AUDIT*`, dated full audits) as current truth unless explicitly linked from a canonical doc.
3. **Update canonical docs in place** when cycles change maturity, RBAC, money paths, or CI tiers.
4. **Historical audits** remain in-repo for archaeology only — see [Deprecated families](#deprecated-families).

---

## Core canon (12)

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
| [`product-positioning.md`](./product-positioning.md) | Market positioning tied to implementation reality | Product/GTM |
| [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) | Honest competitor gap framing | Product |
| [`kds-v1-scope.md`](./kds-v1-scope.md) | KDS v1 in/out scope, workflow, permissions, tests | Kitchen/Ops |
| [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md) | Money-path and smoke E2E tiers by CI job | QA/DevOps |

---

## Era / strategic canon (4)

Master-prompt inputs and scorecard evidence. Refresh at era boundaries (re-audit cycles).

| Doc | Purpose |
|-----|---------|
| [`full-strategic-reaudit-2026-05-27-era2.md`](./full-strategic-reaudit-2026-05-27-era2.md) | Era 2+3 live re-audit, scorecard 76/100, Era 4 execution map |
| [`next-master-prompt-input-2026-05-27-era3.md`](./next-master-prompt-input-2026-05-27-era3.md) | Facts and constraints for Evolution Era 4 master prompt |
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
