# Next Master Prompt Input — KitchenOS Era 4

**Date:** 2026-05-27  
**Purpose:** Canonical facts, priorities, and constraints for authoring the **next NEW MASTER PROMPT** (post Era 2 + Era 3 RBAC wave)  
**Full audit:** `docs/full-strategic-reaudit-2026-05-27-era2.md`  
**Era 2 scorecard:** `docs/era2-cycle-completion-scorecard-2026-05-27.md`

---

## 1. Current Product Reality (Facts Only)

- KitchenOS is a **Next.js 15 App Router monolith** (React 19, Prisma 6, Postgres, Supabase auth, Stripe).
- **Scale (2026-05-27 live):** 699 pages, 296 API routes, 146 action modules, 604 services, 362 models, 266 enums, 505 Vitest files, 53 Playwright specs, 1,440 docs.
- **Not an MVP:** POS, storefront, order hub, production, packing, CRM, inventory, purchasing, staff, billing, platform admin, and marketing all exist in code.
- **Flagship:** Unified order spine via `services/orders/order-creation-service.ts` (manual, POS, storefront, public API).
- **Second flagship:** Storefront checkout — **CI-certified** pay-later E2E (`storefront-money-path` job); publish API RBAC fixed.
- **POS:** Beta/pilot — unit + integration + inventory depletion in CI; browser E2E **conditional** on secrets.
- **KDS:** v1 daily-service bump/recall **certified (qualified)** — not rush-hour or multi-station.
- **Integrations:** Stripe live; Shopify/Woo partial; DoorDash/Grubhub/Uber **placeholder** with honesty CI.
- **RBAC:** 59 canonical keys; wave 2 + wave 3 (cycles 53–99) migrated most high-risk mutations; ~130/146 action modules use tenant or domain guards.
- **Docs:** 14-doc canon + index; 1,440 total markdown files — **governance debt outside canon**.

---

## 2. Current Architecture Reality

| Layer | Reality |
|-------|---------|
| Entry | App Router + server actions + API routes |
| Domain logic | `services/*` (604 files) |
| AuthZ | 59 keys; domain `require-*-actor` + `requireMutationPermission`; wave 3 bundle in CI |
| API governance | `lib/api/route-registry.ts`; validate in CI |
| Tenant | `requireTenantActor` + workspace migration active |
| Audit | Central `auditLog`; denial audits; audit center RBAC (cycles 95–99) |
| Cron | **16** production (`vercel.json`); **137** route files (experimental gated) |
| CI | `quality` + `security-db` + `storefront-money-path` + `pos-money-path` + `kds-v1-prototype` |
| Build | Memory-tuned (8–14GB); prebuilt deploy |

---

## 3. What Was Completed in Era 2 (cycles 1–30 + cert band 42–52)

| Item | Status |
|------|--------|
| Storefront publish API RBAC | ✅ `storefront.publish` on theme/builder routes |
| Email bypass removal (runtime) | ✅ Platform role row; static closure test in CI |
| RBAC wave 2 | ✅ POS, storefront admin, billing, import, kitchen, growth, settings |
| Public POST fail-closed | ✅ IoT, NPS, ROI guards |
| Storefront money-path CI | ✅ Dedicated job + cert gate |
| POS money-path CI | ⚠️ Unit/integration/inventory yes; E2E secrets-optional |
| Inventory depletion proof | ⚠️ POS only; storefront explicitly deferred |
| Cron hygiene | ✅ 16 prod crons; CI reconciliation |
| KDS v1 scope + prototype | ✅ Scope doc + integration bump test |
| Nav/maturity governance | ✅ CI cert |
| Integration honesty | ✅ CI cert |
| Public API v1 contracts | ✅ 8 resources |
| Doc canon | ✅ Index + deprecated family |
| Scorecard refresh | ✅ Era 2 end + Era 3 increment |

---

## 4. What Was Completed in Era 3 RBAC Wave (cycles 53–99)

- Costing, purchasing, PO approval, bulk-price, AP, bank reconciliation.
- Products, menus, inventory, categories, nutrition/allergen profiles.
- Food safety, kitchen tasks, forecast, packing verification.
- Locations, brands, module preferences, onboarding, implementation, operating mode, catering.
- Settings self-account, kitchen settings, webhook replay, kitchen AI, label print queue.
- Order creation denial audits + security CI bundle.
- Global search RBAC + owner scope fix (cycle 88).
- Support tickets, partner org provision, audit center export/retention/view (cycles 90–99).
- Platform email bypass wired into `test:security` (cycle 93).

**Net:** “~85 tenant-only actions” from May 27 audit is **obsolete** — majority migrated.

---

## 5. What Failed or Regressed

| Item | Notes |
|------|-------|
| Nothing material regressed | No reverted RBAC on money paths observed |
| **Partial delivery treated as complete in old docs** | POS E2E optional; storefront depletion absent |
| Scorecard deferral | Q3 re-audit deferral superseded by this audit |
| Working tree hygiene | `tests/node_modules/` untracked |

---

## 6. Still-Open P0

| ID | Item | Evidence |
|----|------|----------|
| P0-1 | **Storefront inventory depletion** — implement or permanently label “POS-only depletion” | `tests/unit/inventory-depletion-cert-live.test.ts` |
| P0-2 | **POS browser E2E policy** — require secrets or fail job with explicit skip artifact | `.github/workflows/ci.yml` pos-money-path job |
| P0-3 | **Typecheck slicing** — full strict `tsc` OOM at dev scale | `tsconfig.typecheck.json`, 8GB heap |
| P0-4 | **Cron route archive** — 137 files vs 16 prod | `app/api/cron/` |
| P0-5 | **Residual sensitive actions** — delivery-route, copilot mutations, demo paths | grep unguarded list in re-audit §5.2 |

**Closed since May 27 morning audit:** publish API RBAC, email runtime bypass, RBAC wave 2, public POST fail-closed, most wave 3 domains, governance CI bundles.

---

## 7. Still-Open P1

- Shopify/Woo full webhook→order→kitchen E2E loop.
- Stripe live-card storefront E2E (staging tier).
- Cross-channel loyalty/gift card redemption E2E.
- KDS realtime/staging smoke (not rush-hour product).
- Permission helper consolidation (single mutation access narrative).
- SSO/SOC2 **roadmap** (not implementation claim).
- Table service / floor plan — remain preview; no sell.
- Remove or gitignore `tests/node_modules/`.

---

## 8. New Risks (Era 4)

1. **False completion narrative** — Era 2 scorecard green while storefront depletion and POS E2E gaps remain.
2. **RBAC complexity** — many domain wrappers; harder to audit than one registry.
3. **Production cron includes `doordash-sync`** — placeholder integration with live schedule (verify intent).
4. **Doc sprawl** — 1,440 files; only 14 canonical.
5. **Enterprise buyers** — RBAC improved but SSO/SOC2 absent.
6. **OpenAPI manifest uncommitted drift** — minor contract sync risk.

---

## 9. Outdated Assumptions (Do NOT Carry Forward)

| Old assumption | Current truth |
|----------------|---------------|
| "~85 tenant-only actions" | **~15 residual** special/demo/logistics surfaces |
| "Storefront publish API unguarded" | **Fixed** — `requireStorefrontPublishActor` |
| "Order creation email bypass" | **Fixed** — `orders.manage` |
| "CI lacks money-path E2E" | **Storefront pay-later in CI**; POS partial |
| "RBAC not started" | **Wave 2+3 largely complete** |
| "Cron validation broken" | **Fixed** — live Vitest gates |
| "Governance bundles not in CI" | **In default quality job** — 11 cert scripts |
| "Evolution Era 2 incomplete" | **13/15 complete**, 2 partial |
| "Overall score ~64–71" | **76** post wave 3 (this audit) |
| "Defer full re-audit to Q3" | **Done** — `full-strategic-reaudit-2026-05-27-era2.md` |

---

## 10. Required Strategic Theme for Era 4

**Theme:** *Cross-channel operational truth, enterprise procurement basics, archive experimental surface — no breadth expansion.*

Sub-themes:
1. **Inventory truth** — depletion parity or honest matrix.
2. **Money-path CI policy** — no optional green without documented skip.
3. **Surface reduction** — cron archive, placeholder route shells.
4. **Enterprise narrative** — SSO/SOC2 roadmap, procurement FAQ, no fake cert.
5. **Integration proof** — one Shopify/Woo golden loop in staging.

---

## 11. What Era 4 Must Focus On

- Cycle 1 decision: storefront depletion implement vs document deferral permanently.
- POS E2E secrets policy in CI.
- RBAC wave 4 residual list (§5.2 in re-audit).
- Cron experimental archive.
- Typecheck project references.
- Staging integration E2E for Shopify/Woo.
- Update canonical docs only (14 + era docs); no new audit sprawl.
- Enterprise readiness **documentation** (SSO/SOC2 mapping).

---

## 12. What Era 4 Must Avoid

- New Prisma models / modules without P0 clearance.
- New `app/api/cron/*` experimental routes.
- Marketing/nav exposure of PLACEHOLDER integrations as live.
- Toast/Square POS/hardware/offline parity claims.
- Native KDS rush-hour certification claims.
- AI/copilot feature expansion before budget/explainability gates.
- Theme experiment / compliance-sync cron additions.
- Monolith split or auth rewrite.
- Bulk edits to 1,300+ deprecated audit docs.
- Committing `tests/node_modules/`.

---

## 13. Safety Rules (Copy Into Master Prompt)

```
AUDIT-FIRST / HARDENING-ONLY unless explicitly approved:

ALLOWED: targeted RBAC, tests, CI wiring, doc canon updates, cron archive,
         depletion hook (if approved), staging E2E, typecheck slices.

FORBIDDEN: new product modules, new experimental crons, marketing breadth,
           destructive git/db ops, deploy/push without request.

Every cycle must cite: file path + test path + canonical doc row updated (if maturity changes).
```

---

## 14. Priority Order

1. Storefront depletion decision + matrix honesty  
2. POS E2E CI policy  
3. RBAC wave 4 residual  
4. Cron archive  
5. Shopify/Woo staging E2E  
6. Typecheck slices  
7. SSO/SOC2 roadmap doc  
8. Permission helper consolidation doc  
9. KDS staging smoke  
10. Dead route / doc gateway banners  

---

## 15. Recommended 15–30 Cycles (Era 4)

| Cycles | Deliverable |
|--------|-------------|
| 1–3 | Depletion decision + implementation or matrix + cert test update |
| 4–5 | POS E2E CI policy + secrets documentation |
| 6–10 | RBAC wave 4 (delivery-route, copilot, integration-menu-sync, demo fail-closed) + `test:ci:rbac-wave4` |
| 11–14 | Cron archive (`_experimental/` or delete gated routes) + hygiene test update |
| 15–18 | Shopify/Woo staging golden path script + optional CI workflow_dispatch |
| 19–22 | Typecheck project references pilot (dashboard slice) |
| 23–25 | Enterprise procurement pack (SSO/SOC2 mapping, no false cert) |
| 26–28 | Cross-channel loyalty/gift E2E |
| 29–30 | Era 4 scorecard + master prompt input refresh |

---

## 16. Recommended Recurring Prompt Changes

- Replace “RBAC wave 2/3” checklist with **wave 4 residual table** from re-audit §5.2.
- Add **mandatory depletion honesty check** each cycle (`feature-maturity-matrix` inventory row).
- Add **CI E2E policy check** — report whether POS E2E ran or skip reason.
- Remove completed Era 2 items from cycle template (publish API, email bypass, fail-closed POST).
- Point all maturity changes to **14-doc canon only**.
- Require **scorecard delta** only when area moves ≥2 points with evidence.

---

## 17. Scorecard Snapshot (This Audit)

| Area | Score | Blocks +10 |
|------|------:|------------|
| **Overall** | **76** | Depletion truth + SSO roadmap |
| RBAC | 76 | Helper consolidation + wave 4 |
| Security | 72 | SSO + residual actions |
| QA | 78 | Mandatory POS E2E |
| DevOps | 80 | Typecheck slices |
| Storefront | 78 | Depletion or permanent label |
| POS | 64 | E2E + offline policy |
| KDS | 58 | v2 scope or hide extras |
| Inventory | 62 | Cross-channel |
| Integrations | 52 | Live partner proof |
| Enterprise | 46 | SOC2/SSO plan |
| Investor DD | 58 | Data room pack |

### Evolution Era 3 increment (cycles 42–52, historical)

| Area | Era 2 end | Era 3 cert | Δ |
|------|----------:|-----------:|--:|
| Overall | 71 | 73 | +2 |
| DevOps | 75 | 78 | +3 |
| QA | 71 | 75 | +4 |
| Security | 66 | 67 | +1 |

### Post wave 3 increment (cycles 53–99, this audit)

| Area | Era 3 cert | Current | Δ |
|------|----------:|--------:|--:|
| Overall | 73 | **76** | +3 |
| RBAC | 58 | **76** | +18 |
| Security | 67 | **72** | +5 |
| QA | 75 | **78** | +3 |

---

## 18. Whether New Master Prompt Is Needed Now

**Yes.** Era 2 master prompt and May 27 `next-master-prompt-input-2026-05-27.md` are **obsolete** on:
- RBAC completion state  
- CI/governance bundle wiring  
- Scorecard (76 vs 71)  
- Open P0 list (depletion, E2E policy, cron archive)

**Recurring cycles can continue safely** only for: RBAC wave 4 residuals, CI wiring, doc canon updates, cron archive — **not** new product surface.

---

## 19. What the New Master Prompt Must Emphasize

1. **Operational truth over feature count** — depletion, E2E policy, integration loops.  
2. **Evidence contract** — file + test + matrix row every cycle.  
3. **14-doc canon governance** — no audit sprawl.  
4. **Enterprise honesty** — roadmap docs, not certification claims.  
5. **Archive experimental surface** — crons/webhooks naming discipline.  
6. **Cycle budget 15–30** mapped to §15 above.

---

## 20. Canonical Doc Updates Required When Era 4 Starts

| Doc | Update |
|-----|--------|
| `canonical-doc-index.md` | Add Era 4 ledger; link this audit |
| `feature-maturity-matrix.md` | Inventory row after depletion decision |
| `p0-hardening-roadmap.md` | Close RBAC items; add Era 4 P0 |
| `implementation-backlog.md` | Trim KOS-P0-001 progress paragraph; add Era 4 IDs |
| `ci-e2e-tier-matrix.md` | POS E2E policy |
| `system-reality-model.md` | Refresh counts from §2 of re-audit |

**Do not update:** 1,300+ deprecated audit files.

---

## Validation

```bash
npm run test:ci:governance-bundles
npm run test:ci:rbac-wave3
npm run test:security
npm run validate:production-crons
```

Update `tests/unit/scorecard-ci-live.test.ts` when Era 4 scores change (point at new audit doc paths).
