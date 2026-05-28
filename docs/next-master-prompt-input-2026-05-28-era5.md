# Next Master Prompt Input — KitchenOS Era 5 (Post–Era 4 Re-Audit)

**Date:** 2026-05-28  
**Purpose:** Canonical facts for the **Evolution Era 5** master prompt, refreshed after `docs/full-strategic-reaudit-2026-05-28-era4.md`  
**Evidence branch:** `main` @ `bab3d24`

> **Execution status (2026-05-28):** Eras **5–15 have already run** on this branch. This document is the **authoritative post–Era 4 re-audit input** requested for Era 5 planning. For **current** recurring prompts use [`next-master-prompt-input-2026-05-27-era15.md`](./next-master-prompt-input-2026-05-27-era15.md) (Era 16). Do not discard era5–era15 scorecards — they record what was actually executed.

---

## 1. Current product reality

- **Monolith scale:** 699 pages, 175 API routes, 144 actions, 604 services, 362 Prisma models.
- **Certified spine:** POS + storefront money-path CI jobs; POS-only inventory depletion; dual-ledger rewards honesty; 16 production crons; governance bundle partitions.
- **Honest deferrals:** Storefront inventory hook `deferred_locked`; unified rewards `deferred_locked`; marketplace aggregators `placeholder`.
- **Not delivered:** Production SSO/SAML/SCIM, SOC2 attestation, offline POS, Stripe Terminal hardware certification, rush-hour KDS Playwright in default CI.

---

## 2. Current architecture reality

- Order creation centralized in `services/orders/order-creation-service.ts`.
- RBAC: 57 canonical permissions + domain mutation registry + wave 4 helpers (`requireRouteMutation`, copilot, etc.).
- CI: `test:ci:governance-bundles` = 4 partitions; `test:ci:scorecard:cert` chains era4–era15 policy tests (107).
- Typecheck: four local slices @ 6GB; `typecheck:full` @ 8GB remains `quality` canonical gate.

---

## 3. Completed in Era 4 (do not reopen without regression proof)

| # | Item | Policy |
|---|------|--------|
| 1 | POS-only inventory depletion | `era4-pos-only-v1` |
| 2 | POS browser E2E CI policy | `era4-tier2b-optional-v1` |
| 3 | RBAC wave 4 batches 1–2 | `rbac-wave4-batch1/2` |
| 4 | Cron archive (121→16) | `era4-active-production-only-v1` |
| 5 | Shopify/Woo golden path | `era4-channel-golden-path-v1` |
| 6 | Typecheck slice 1 | `era4-typecheck-slice-v1` |
| 7 | Enterprise procurement pack | `era4-procurement-honesty-v1` |
| 8 | Cross-channel rewards honesty | `era4-cross-channel-rewards-v1` |
| 9 | KDS staging smoke | `era4-kds-staging-smoke-v1` |
| 10 | Mutation access consolidation | `era4-mutation-access-consolidation-v1` |
| 11 | Nav/page maturity sweep | `era4-page-maturity-sweep-v1` |
| 12 | Scorecard refresh | `era4-scorecard-refresh-v1` |

---

## 4. What failed or regressed

- **None** on Era 4 spine policies as of `bab3d24`.
- **Incident:** `321f506` restored cron surface after accidental experimental staging — process risk, not policy regression.
- **Test drift (fixed `bab3d24`):** pre–Era 9 cert-live tests expected direct `governance-bundles` substrings; wiring was correct via partitions.

---

## 5. Still-open P0 (post–Era 4; carry to Era 16)

| ID | Item |
|----|------|
| E5-P0-1 | SSO/SAML production (R2+) — `not_started` after R1 spike |
| E5-P0-2 | Storefront inventory hook — only if `era5-pos-only-gtm-lock-v1` lifted |

---

## 6. Still-open P1

- First green GitHub staging workflows (secrets).
- Live `smoke:woo-shopify` / Shopify proof.
- Production calendar manual staging sign-off.
- Full typecheck OOM monitoring in CI.
- `tests/node_modules/` never committed.

---

## 7. New risks (2026-05-28 re-audit)

1. Internal **100/100** governance score mistaken for competitor parity.
2. Doc sprawl (**1,477** markdown files) contradicting canon.
3. Optional E2E tiers interpreted as “always certified green.”
4. New sensitive actions skipping domain registry.
5. Webhook surface area (49 routes) without uniform replay monitoring story.

---

## 8. Outdated assumptions

- “137 cron routes” — **obsolete**; disk = **16**.
- “296 API routes” — **175** now.
- “Re-run Era 4 Cycle 2 POS E2E” — **forbidden** unless regression proven.
- “Era 4 incomplete after N cycles” — **false**; 12/12 map items done.

---

## 9. Required strategic theme for Era 5 (historical recommendation)

**Theme:** **Sustain spine + deepen customer-value honesty** — not new surface area.

Sub-themes (executed in Eras 5–8 on this branch):
1. Lock POS-only GTM permanently (`era5-pos-only-gtm-lock-v1`).
2. Chain RBAC wave 4 into `test:security`.
3. Expand typecheck slices + optional CI parallel job.
4. Claims registry + marketing governance.
5. Dual-ledger rewards lock (`era6-dual-ledger-gtm-lock-v1`).

---

## 10. What Era 5 must focus on

- **Certification depth** over feature breadth.
- **Explicit deferrals** with policy IDs + CI certs.
- **Ops smoke scripts** for staging (later eras).
- **Partition governance bundles** when CI time grows (Era 9).

---

## 11. What Era 5 must avoid

- Re-implementing POS browser E2E policy.
- Re-archiving crons without incident.
- Claiming unified inventory, unified rewards, live DoorDash/Uber.
- New experimental cron routes.
- Broad new modules (AI, hardware POS) without era budget.

---

## 12. Safety rules

Same as Era 4 closure: no destructive migrations, no production deploy from agent, no `git add .` on cron trees, explicit paths on commit, verify `ls app/api/cron | wc -l` === 16.

---

## 13. Priority order (Era 5 cycles)

1. RBAC wave 4 in security CI  
2. Typecheck slice 2 (storefront/marketing)  
3. POS-only GTM permanent lock  
4. Copilot / production-calendar form deny UX  
5. POS E2E secrets explicit skip acceptance  
6. Scorecard refresh → Era 6 input  

*(Items 1–6 were completed as Eras 5–6 on this branch.)*

---

## 14. Recommended 15–30 cycles (Era 5 band plan)

| Cycles | Focus |
|--------|--------|
| 1–5 | Era 5 P0 table above |
| 6–10 | Dual-ledger lock, KDS realtime smoke wiring, typecheck in CI |
| 11–15 | Claims registry, commercial pilot runbook, storefront Stripe E2E honesty |
| 16–20 | Enterprise identity roadmap_only, production calendar UI |
| 21–25 | Channel golden path recert, staging E2E secrets |
| 26–30 | Scorecard refresh + re-audit trigger only if scale shifts |

---

## 15. Recommended recurring prompt changes

- Replace “Era 4 Cycle 2 next” with **read era15 handoff + closure scorecard**.
- Require `governanceBundlesIncludesCert()` in new cert-live tests.
- Mandate policy ID + backlog ID per cycle.
- Ban unified inventory/rewards language in commits without policy change.

---

## 16. New master prompt required now?

| Question | Answer |
|----------|--------|
| Era 5 master prompt needed in 2026-05-28? | **Was needed after Era 4** — this file satisfies that input. |
| New master prompt needed **now**? | **No** — use **Era 16** from era15 handoff unless commercial posture shifts. |
| Full re-audit needed now? | **Done** — `docs/full-strategic-reaudit-2026-05-28-era4.md`. |

---

## Scorecard snapshot (post–Era 4 re-audit blended)

| Area | Score |
|------|------:|
| Overall (blended) | **86** |
| Governance/DevOps/QA (cert) | 94–100 |
| POS competitive | **58** |
| Integrations | **60** |
| Enterprise | **67** |
| Investor DD | **72** |

---

## Key doc anchors

- Re-audit: `docs/full-strategic-reaudit-2026-05-28-era4.md`
- Era 4 closure: `docs/era4-completion-scorecard-2026-05-27.md`
- Era 4 cycles: `docs/era4-cycle-completion-scorecard-2026-05-27.md`
- Current handoff: `docs/next-master-prompt-input-2026-05-27-era15.md`
