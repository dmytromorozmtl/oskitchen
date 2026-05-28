# Evolution Era 4 — Closure / Completion Scorecard

**Date:** 2026-05-27  
**Mode:** Era 4 CLOSURE (evidence-based; do not assume cycle count = completion)  
**Strategic command (Era 4):** Make the existing spine true, certified, connected, and commercially defensible.  
**Evidence branch:** `main` @ `4dfd5cc` (Era 15 complete; Era 4 cycles 1–12 + scorecard refresh at `b0c1dd3`)  
**Related:** [`era4-cycle-completion-scorecard-2026-05-27.md`](./era4-cycle-completion-scorecard-2026-05-27.md) (cycle-level 82/100 snapshot), [`era15-cycle-completion-scorecard-2026-05-27.md`](./era15-cycle-completion-scorecard-2026-05-27.md) (current sustained state)

---

## Executive decision

| Question | Answer |
|----------|--------|
| **Is Era 4 complete?** | **Yes** — all 12 Era 4 execution cycles shipped with policy + CI certs; sustained through Eras 5–15 recerts without regression of spine policies. |
| **Outcome class** | **A — Era 4 complete; do not restart Era 4 cycles.** Use [`next-master-prompt-input-2026-05-27-era15.md`](./next-master-prompt-input-2026-05-27-era15.md) for Era 16 (not a new Era 5 input — [`next-master-prompt-input-2026-05-27-era5.md`](./next-master-prompt-input-2026-05-27-era5.md) already exists). |
| **Safe to continue recurring Era 4 prompt?** | **No** — stale prompts that reopen POS browser E2E (Cycle 2) or re-archive crons are superseded. |
| **Full re-audit required?** | **Defer** until Era 16 delivery theme or major commercial posture change. |

**Closure caveat (2026-05-27 audit):** Several pre–Era 9 `*-ci-live.test.ts` files asserted direct substring matches on `test:ci:governance-bundles` after Era 9 partitioned bundles (`era9-governance-bundles-partition-v1`). Wiring was correct; tests were stale. Closure fixed them to use `governanceBundlesIncludesCert()` from `lib/ci/governance-bundles-partition-policy.ts`.

---

## Era 4 objective completion map

| Objective | Status | Evidence | Tests / scripts | Docs | Remaining risk | Closure action | Era 5+? |
|-----------|--------|----------|---------------|------|----------------|----------------|---------|
| 1. Storefront inventory truth | **deliberately_deferred** | `lib/inventory/inventory-depletion-policy.ts` (`era4-pos-only-v1`), `era5-pos-only-gtm-lock-v1` | `test:ci:inventory-depletion:cert`, `test:ci:pos-money-path:inventory` | `docs/ci-e2e-tier-matrix.md`, feature matrix POS-only | Unified storefront depletion not built; GTM must not claim cross-channel stock | **Closed as honest policy** — hook is Era 5+ only if lock lifted | **Yes** (E8-1) |
| 2. POS browser E2E CI policy | **completed** | `lib/ci/pos-browser-e2e-policy.ts`, `era4-tier2b-optional-v1`, `era5-pos-e2e-secrets-accept-v1` | `test:ci:pos-money-path:cert`, `test:ci:pos-browser-e2e:policy`, CI job `pos-money-path` | `docs/ci-e2e-tier-matrix.md` | Fork PRs skip without secrets; not “always green browser E2E” | **Do not re-run** — verify `pos-browser-e2e-summary` on release | Ops only |
| 3. RBAC wave 4 residuals | **completed** | `lib/permissions/domain-mutation-registry.ts`, wave 4 action guards | `test:ci:rbac-wave4`, `test:ci:rbac-wave4:cert`, chained in `test:security` (Era 5) | `docs/rbac-permission-architecture.md` | New sensitive actions need registry discipline | Recert Eras 9/11/14 — no open wave-4 batch | No |
| 4. Cron archive / surface reduction | **completed** | 16 routes under `app/api/cron/`; 121 archived (Era 4) | `validate:production-crons`, `validate:cron-inventory`, `test:ci:cron-hygiene:cert` | `docs/devops-release-enterprise-readiness.md` | Accidental re-staging of experimental crons (fixed `321f506`) | **Recert Era 14** — maintain 16-only policy | No |
| 5. Shopify/Woo golden path | **completed** (pilot) | `era4-channel-golden-path-v1`, Era 12/14 recerts | `test:ci:channel-golden-path:cert`, `smoke:woo-shopify` (ops) | `docs/feature-maturity-matrix.md`, integration honesty | Live store credentials not in default CI | **Closed** — live smoke is ops | Ops |
| 6. Typecheck slices | **completed** | `era4-typecheck-slice-v1` → Era 11/15 recerts | `test:ci:typecheck-slice:cert`, `smoke:typecheck-slices` | DevOps canon, `typecheck:full` still canonical in `quality` | Full monolith typecheck still memory-heavy | **Closed** — slices not default CI typecheck job | Monitor |
| 7. Enterprise procurement basics | **completed** | `era4-procurement-honesty-v1`, Era 15 recert | `test:ci:enterprise-procurement:cert`, `smoke:enterprise-procurement` | `docs/enterprise-procurement-pack.md` | No SSO/SOC2/SCIM delivery | **Closed** — roadmap-only enterprise ID | **Yes** (E8-2 SSO R2) |
| 8. Cross-channel loyalty/gift E2E | **partially_completed** | `era4-cross-channel-rewards-v1`, `deferred_locked` (Era 14) | `test:ci:cross-channel-rewards:cert` | Feature matrix dual-ledger honesty | Not unified cross-channel ledger | **Closed honestly** — no false unified rewards claim | **Yes** |
| 9. KDS staging smoke | **completed** (qualified) | `era4-kds-staging-smoke-v1`, Era 10/15 recerts | `test:ci:kds-staging-smoke:cert`, `smoke:kds-staging` | `docs/kds-staging-smoke-checklist.md` | No rush-hour / no default Playwright KDS in CI | **Closed** — staging checklist + smoke | Ops |
| 10. Permission helper consolidation | **completed** | `era4-mutation-access-consolidation-v1`, registry | `test:ci:mutation-access-consolidation:cert` | RBAC architecture §2a | Mass rewrite explicitly avoided | Recert Eras 11/14 | No |
| 11. Nav/page maturity sweep | **completed** | `era4-page-maturity-sweep-v1`, `page-maturity-honesty.ts` | `test:ci:page-maturity-sweep:cert`, `test:ci:nav-governance:cert` | Feature matrix, product positioning | New routes need maturity classification | Recert Era 14 | No |
| 12. Documentation canon | **completed** | `docs/canonical-doc-index.md`, `test:ci:doc-canon:cert` | `test:ci:doc-canon`, claims registry, marketing claims governance | All core canon listed in index | Drift if ad-hoc audits reappear | **Governed** — update in place | No |
| 13. Scorecard refresh | **completed** | Era 4 scorecard 82/100; Eras 5–15 refresh to 100/100 plateau | `test:ci:scorecard:cert` (107 policy tests) | Era 4–15 scorecard docs | 100/100 ≠ feature-complete vs competitors | **Closed** — use Era 15 handoff | Era 16 |
| 14. Sales/GTM honesty | **completed** (governed) | Claims registry, marketing claims governance, pilot preflight | `verify-claims`, `test:ci:marketing-claims-governance:cert` | `docs/product-positioning.md`, commercial pilot runbook | Human sales can still over-promise outside tooling | **Ongoing governance** | Monitor |
| 15. Investor defensibility | **partially_completed** | Procurement pack, maturity matrix, era scorecards | Governance bundles, integration honesty | `docs/competitor-feature-gap-matrix.md` | No audited SOC2 / production SSO | **Honest deferral** documented | **Yes** |

---

## Validation gates (closure run 2026-05-27)

| Validation gate | Command | Result | Failure reason | Required fix | Blocking? |
|-----------------|---------|--------|----------------|--------------|-----------|
| Inventory depletion cert | `npm run test:ci:inventory-depletion:cert` | **PASS** (after test fix) | Stale governance-bundle substring assertions | Use `governanceBundlesIncludesCert` | No |
| POS money-path cert | `npm run test:ci:pos-money-path:cert` | **PASS** | Same | Same | No |
| Storefront money-path cert | `npm run test:ci:storefront-money-path:cert` | **PASS** | Same | Same | No |
| RBAC wave 4 | `npm run test:ci:rbac-wave4` | **PASS** | — | — | No |
| RBAC wave 4 cert | `npm run test:ci:rbac-wave4:cert` | **PASS** | — | — | No |
| Governance partition cert | `npm run test:ci:governance-bundles-partition:cert` | **PASS** | — | — | No |
| Channel golden path cert | `npm run test:ci:channel-golden-path:cert` | **PASS** | — | — | No |
| Cross-channel rewards cert | `npm run test:ci:cross-channel-rewards:cert` | **PASS** | — | — | No |
| KDS staging smoke cert | `npm run test:ci:kds-staging-smoke:cert` | **PASS** | — | — | No |
| Typecheck slice cert | `npm run test:ci:typecheck-slice:cert` | **PASS** | — | — | No |
| Mutation access cert | `npm run test:ci:mutation-access-consolidation:cert` | **PASS** | — | — | No |
| Page maturity cert | `npm run test:ci:page-maturity-sweep:cert` | **PASS** | — | — | No |
| Enterprise procurement cert | `npm run test:ci:enterprise-procurement:cert` | **PASS** | — | — | No |
| Cron hygiene cert | `npm run test:ci:cron-hygiene:cert` | **PASS** | — | — | No |
| Doc canon cert | `npm run test:ci:doc-canon:cert` | **PASS** (after test fix) | Same partition assertion drift | Same | No |
| Integration honesty cert | `npm run test:ci:integration-honesty:cert` | **PASS** (after test fix) | Same | Same | No |
| Scorecard cert | `npm run test:ci:scorecard:cert` | **PASS** (107 tests) | — | — | No |
| Production crons | `npm run validate:production-crons` | **PASS** (4 tests) | — | — | No |
| Cron inventory | `npm run validate:cron-inventory` | **PASS** (4 tests) | — | — | No |
| Cron route count | `ls app/api/cron \| wc -l` | **16** | — | — | No |
| Full governance bundles | `npm run test:ci:governance-bundles` | **Not run** (long) | — | CI `quality` job runs full bundle | No |
| Full `test:security` | `npm run test:security` | **Not run** (long) | — | CI `security-db` | No |
| Full typecheck | `npm run typecheck:full` | **Not run** (OOM risk local) | — | Use `smoke:typecheck-slices` / CI | No |

---

## Money-path truth (closure audit)

| Money path | Current state | CI coverage | E2E coverage | Maturity | Remaining risk | Sales claim allowed? |
|------------|---------------|-------------|--------------|----------|----------------|------------------------|
| Storefront checkout | Live path; Stripe optional in CI | `storefront-money-path` job, unit + pay-later E2E | Playwright when `STRIPE_SECRET_KEY` set | Certified tier-2 | Secrets-dependent green | **Pilot** — not “always-on CI green” |
| POS checkout | Canonical service + RBAC | `pos-money-path` unit/integration/inventory | Browser E2E optional (`era5` secrets policy) | Certified | Fork skip without secrets | **Yes** with CI tier disclosure |
| POS refund / void | Implemented in POS lifecycle tests | `pos-terminal-checkout-lifecycle.test.ts` | Limited browser | Partial / unit-heavy | Edge cases ops-tested | **Qualified** |
| Stripe webhook | Webhook handlers + tests in security bundle | `test:security` subsets | Staging ops | Certified direction | Live webhook signing ops | **Qualified** |
| POS inventory depletion | `recordPendingInventoryImpactsForPosOrder` | `pos-inventory-depletion.integration.test.ts` | Integration | **POS-only certified** | Storefront does not deplete | **POS-only** — not unified inventory |
| Storefront depletion policy | **Not hooked** by design | Policy cert locks absence | N/A | `deferred_locked` | Product decision needed | **No** unified stock claim |
| Loyalty redemption | Dual-ledger honesty | `test:ci:cross-channel-rewards:cert` | Not full cross-channel E2E | Honest partial | Channel-specific ledgers | **No** unified loyalty claim |
| Gift card redemption | Same as loyalty scope | Same cert family | Partial | Honest partial | Cross-channel gift not unified | **No** unified gift claim |
| Public API order creation | v1 certified | `test:ci:public-api-v1:cert` | Contract tests | Certified API slice | Rate limits / ops | **Qualified** per matrix |
| Shopify/Woo import path | Golden path certified | `test:ci:channel-golden-path:cert` | `smoke:woo-shopify` ops | Pilot | Live credentials | **Pilot only** |

---

## RBAC wave 4 — residual scan (sample)

| File | Current guard | Permission / operation | Test | Audit | Status |
|------|---------------|------------------------|------|-------|--------|
| `actions/delivery-route.ts` | `requireRouteMutation` | `delivery_route.*` ops | `delivery-route-actions-rbac.test.ts` | Domain denial logging | **Guarded** |
| `actions/copilot.ts` | Domain mutation | copilot ops | `copilot-actions-rbac.test.ts`, form-deny CI | Yes | **Guarded** |
| `actions/integration-menu-sync.ts` | Domain mutation | menu sync | `integration-menu-sync-rbac.test.ts` | Yes | **Guarded** |
| Demo / feedback / tables / production calendar / subscriptions / holiday packages | Wave 4 test files | Per registry | `test:ci:rbac-wave4` (42 tests) | `logDomainMutationDenied` | **Guarded** |

No unguarded P0 sensitive action surfaced in closure spot-check; new actions must follow registry process (Era 11/14 recert).

---

## Cron / experimental surface

| Cron area | Count / state | Evidence | Risk | Closure action |
|-----------|---------------|----------|------|----------------|
| Production cron routes (disk) | **16** | `app/api/cron/`, `validate:production-crons` | Re-staging experimental tree | Never `git add .` on cron dirs |
| Archived experimental | **121** moved (Era 4) | `era4-active-production-only-v1` | Drift | Era 14 recert |
| `vercel.json` / config alignment | Validators pass | `cron-reconciliation-live`, `cron-hygiene-live` | Misconfigured schedule | **Closed** |
| Experimental on disk | **0** in production tree | Era 14 cycle 4 | Bloat return | Monitor each commit |

---

## Integration honesty (summary)

| Integration | Maturity | UI visible? | Sales claim | Tests | Runbook | Gap |
|-------------|----------|-------------|-------------|-------|---------|-----|
| Stripe | Live / certified tiers | Yes | Qualified pilot | Money-path + matrix | CI tier matrix | Secrets for green E2E |
| Stripe Terminal | Preview | Gated | No production hardware cert | Policy | Matrix | Hardware cert |
| Shopify / Woo | Pilot golden path | Yes | Pilot only | `channel-golden-path:cert` | `smoke:woo-shopify` | Live store ops |
| DoorDash / Grubhub / Uber | Placeholder | Placeholder nav | **Hidden** | `integration-honesty` | Matrix | Not production |
| QuickBooks / Xero / labor / marketing | Mixed | Per matrix | Per honesty registry | integration-honesty | Procurement pack | Partner-specific |
| Twilio / GA4 / PostHog / Sentry | Per matrix | Per feature | Per claims registry | governance certs | DevOps doc | Not blanket “all integrations live” |

---

## Enterprise procurement basics

| Enterprise item | Exists? | Honest? | Evidence | Gap | Era 5+? |
|-----------------|---------|---------|----------|-----|---------|
| SSO roadmap | Yes | Yes (roadmap only) | `enterprise-procurement-pack.md`, SSO spike R1 | R2 pilot `not_started` | **Yes** |
| SCIM roadmap | Yes | Yes (not delivered) | Procurement pack | Not implemented | **Yes** |
| SOC2 readiness | Yes | Yes (readiness not cert) | Procurement pack | No attestation | **Yes** |
| Data retention / backup / IR | Yes | Yes (plan-level) | DevOps + procurement pack | Not audited | **Yes** |
| Audit log documentation | Yes | Yes | RBAC + audit center docs | — | No |
| Tenant isolation evidence | Yes | Partial | Tests + architecture docs | Formal pen test | **Yes** |
| Security questionnaire draft | Yes | Yes | `enterprise-procurement-pack.md` | Customer-specific | No |
| Procurement FAQ | Yes | Yes | Era 15 recert | — | No |

---

## Typecheck / performance

| Area | Current state | Since Era 4 start | Remaining risk | Next action |
|------|---------------|-------------------|----------------|-------------|
| Typecheck slices | 4 slices @ 6GB (Era 15 recert) | Era 4 slice 1 → Era 11/15 expansion | Slices not in default CI typecheck job | Era 16: optional parallel CI only if needed |
| Full typecheck | `typecheck:full` @ 8GB in `quality` | Unchanged canonical gate | OOM on small runners | Keep slices for local dev |
| Build / heavy routes | Documented in performance canon | Incremental | Large route count | Defer to Era 16 theme |

---

## Sales / claims verification (sample)

| Claim | Location | True? | Fix | Status |
|-------|----------|-------|-----|--------|
| Unified cross-channel inventory | GTM / matrix | **No** | POS-only policy enforced | **Correct** |
| POS money path certified | Matrix / tier matrix | **Yes** (tiered) | — | **Correct** |
| KDS production-certified / rush-hour | Matrix / KDS scope | **No** | Staging smoke only | **Correct** |
| Offline POS | product-positioning | **No** for enterprise chains | Explicit exclusion | **Correct** |
| Marketplace DoorDash/Uber live | Nav placeholder | **No** | integration-honesty | **Correct** |
| SOC2 / SSO today | Procurement pack | **No** (roadmap) | era4-procurement-honesty | **Correct** |

---

## Scorecard delta (Era 4 closure lens)

| Area | Era 4 end (cycle scorecard) | Current (Era 15) | Δ | Evidence | Blocks +10? |
|------|----------------------------:|-----------------:|--:|----------|-------------|
| Overall | 82 | **100** | +18 | Era 5–15 governance recerts | Plateau — not competitor parity |
| Security | 74 | **82** | +8 | RBAC wave 4 in security, claims registry | SSO R2 |
| QA | 82 | **94** | +12 | Money paths, KDS smoke, operator checklists | Live E2E secrets |
| DevOps | 85 | **100** | +15 | Cron archive, partitions, staging workflows | First green staging WF |
| RBAC | 80 | **90** | +10 | Wave 4 + registry | New domains |
| Inventory | 68 | **72** | +4 | Honest POS-only | Storefront hook |
| POS | 70 | **74** | +4 | Browser E2E policy | Optional tier honesty |
| Integrations | 58 | **60** | +2 | Golden path | Live channel smoke |
| KDS | 64 | **74** | +10 | Staging smoke recerts | Rush-hour / realtime |
| Enterprise | 55 | **67** | +12 | Procurement pack | SSO/SOC2 delivery |
| Marketing/sales | 70 | **83** | +13 | Page maturity + claims | Human discipline |

---

## P0 / P1 after Era 4 closure (carried to Era 16)

**P0 (product / platform)**

- **E8-2:** SSO/SAML R2 — `not_started`; needs explicit era budget.
- **E8-1:** Storefront inventory hook — only if POS-only GTM lock lifted.

**P1 (ops / certification)**

- First green GitHub staging workflows (secrets + `smoke:staging-workflows`).
- Manual production calendar sign-off on staging (`smoke:production-calendar`).
- Live `smoke:woo-shopify` when credentials available.

**Closed during this closure audit (engineering)**

- Stale `*-ci-live.test.ts` governance bundle assertions → `governanceBundlesIncludesCert()`.

---

## Recommended next action

1. **Stop** recurring “Era 4 Cycle 2 POS E2E” prompts — superseded.
2. **Start Era 16** from `docs/next-master-prompt-input-2026-05-27-era15.md` (SSO R2 or live channel proof themes).
3. **Commit** closure doc + cert-live test fixes (explicit paths; verify `ls app/api/cron | wc -l` === 16 before commit).

**Recommended commit message:**

```
docs(governance): Era 4 closure scorecard and governance-bundle cert-live fixes.

Prove Era 4 objectives complete; align ci-live tests with era9 partition policy.
```
