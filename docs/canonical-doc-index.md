# KitchenOS Canonical Documentation Index

**Status:** canonical doc governance index for Evolution Era 2  
**Updated:** 2026-05-27 (Cycle 27–28)  
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

## Era / strategic canon (2)

Master-prompt inputs and scorecard evidence. Refresh at era boundaries (re-audit cycles).

| Doc | Purpose |
|-----|---------|
| [`full-strategic-reaudit-2026-05-27.md`](./full-strategic-reaudit-2026-05-27.md) | Live repo re-audit, scorecard snapshot, execution map |
| [`next-master-prompt-input-2026-05-27.md`](./next-master-prompt-input-2026-05-27.md) | Facts and constraints for Evolution Era 2 recurring prompt |

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

---

## Validation

- Unit gate: `tests/unit/canonical-doc-index.test.ts`
- CI bundle: `npm run test:ci:doc-canon`

---

## Change log

| Date | Change |
|------|--------|
| 2026-05-27 | Cycle 27–28: initial index, deprecated-family notice, validation test |
| 2026-05-27 | Cycle 29–30: Evolution Era 2 scorecard refresh, inventory counts updated |
