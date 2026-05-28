# Technical Debt Audit — Post Era 19

**Date:** 2026-05-28 · **HEAD:** `7b17ffa`  
**Technical scalability score: 71/100**

---

## Debt Table

| Debt | Evidence | Impact | Priority | Fix |
|------|----------|--------|----------|-----|
| **612 services** monolith | `find services -name '*.ts'` | Maintainability, onboarding | P1 post-pilot | Domain consolidation map |
| **365 Prisma models** | schema.prisma | Typecheck OOM, migration risk | **P0** sustain | Model grouping; defer splits until pilot |
| **268 enums** | schema.prisma | Schema noise | P2 | Enum consolidation passes |
| **701 pages** | app router | Nav/IA confusion | P1 | Hide preview; merge go-live→wizard |
| **1521 docs** | docs/ count | Truth drift | P1 | Canonical index only for claims |
| Era 19 policy file proliferation | 35+ `lib/briefing/*era19*` | Indirection | P2 | Merge policies post-stabilization |
| Duplicate attention-strip pattern | Era 18 + 19 | UX code volume | P2 | Extract shared `AttentionStrip` primitives |
| Briefing service orchestration size | 600+ line service | Test brittleness | P2 | Slice by role pack modules |
| Action modules outside registry | 145 actions, 19 registry | RBAC drift risk | P1 | Registry expansion lint |
| Placeholder UI strings (574 hits) | ripgrep | User confusion | P1 | Nav maturity hide |
| TODO/FIXME (53) | code scan | Low | P3 | Triage quarterly |
| Staging E2E ops dependency | Playwright SKIPPED | Release confidence | **P0** | Ops secrets |
| Generated artifacts discipline | artifacts/*.json | False PASS risk | P1 | Commit policy |
| Integration registry 0 LIVE | integration-registry.ts | Sales/engineering gap | P1 | Live smoke PASS first |
| Copilot/AI preview surfaces | 178 files | Claim risk | P2 | Hide or explainability gate |
| Cross-channel rewards deferred | locked policies | Product pressure | — | **do not unlock** without era |
| POS-only inventory deferred | locked policies | Product pressure | — | **do not unlock** |
| Cron experimental archive | 121 archived | Low | sustain | — |
| Typecheck pressure | prior era notes | CI flake | P1 | prisma generate discipline |
| Dead/preview routes | matrix preview rows | Security/UX noise | P1 | page-maturity sweep |
| Inverted era execution | 39 UX cycles before proof | Commercial delay | **P0** | Era 20 proof-first |
| Missing era19 scorecard | no doc | Governance gap | P2 | Write at close |

---

## Duplicate / Bloat Hotspots

- **Briefing:** many `*-era19-policy.ts` pairs — acceptable for era velocity; consolidate in Era 21
- **Go-live + Launch Wizard:** parallel onboarding surfaces — merge messaging debt
- **Integration health + Today strips:** partial collapse when briefing active — finish removal of redundant strips
- **Era 18 + Era 19 focus modules:** shared pattern, not always shared components

---

## Test Debt

| Area | State |
|------|-------|
| Era 19 pillars | **Strong** (42 unit files) |
| Staging Playwright KDS | **awaiting_github_pass** |
| Live integration smokes | **SKIPPED** |
| E2E pilot golden path | **SKIPPED** |

---

## Scale Risks

- Prisma model count blocks new engineer velocity
- Service count makes "where does logic live?" hard without `system-reality-model.md`
- 650 package scripts — discovery via `qa-master-test-plan.md` required

---

## Recommended Debt Order (Post-Pilot)

1. Nav/page hide sweep  
2. Briefing policy consolidation  
3. Service domain boundaries (orders, kitchen, integrations)  
4. Prisma model audit (merge unused)  
5. Shared operator UX primitives  

**Forbidden during Era 20 proof band:** large refactors, schema splits, new policy eras without proof PASS.
