# Next Master Prompt Input — KitchenOS

**Date:** 2026-05-27  
**Purpose:** Canonical facts, priorities, and constraints for authoring the **next NEW MASTER PROMPT** (evolution era).  
**Full audit:** `docs/full-strategic-reaudit-2026-05-27.md`

---

## 1. Current Product Reality (Facts Only)

- KitchenOS is a **Next.js 15 App Router monolith** (React 19, Prisma 6, Postgres, Supabase auth, Stripe).
- **Scale:** 699 pages, 296 API routes, 144 actions, 603 services, 362 models, 266 enums.
- **Not an MVP:** Restaurant POS, storefront, order hub, production, packing, CRM, inventory, purchasing, staff, billing, platform admin, and large marketing surface all exist in code.
- **Flagship truth:** **Unified order spine** via `services/orders/order-creation-service.ts` feeding manual orders, POS, storefront, public API.
- **Second flagship:** **Storefront checkout** (`actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`) — pilot-ready with strong unit tests.
- **POS:** Beta/pilot — real checkout, shifts, registers, tabs, terminal API; **not** Toast-class (hardware, table service, offline cert, bar depth).
- **KDS:** Daily-service bump/recall with permissions; **not** certified rush-hour ticket KDS.
- **Integrations:** Stripe **live**; Shopify/Woo **partial**; DoorDash/Grubhub/Uber Eats largely **placeholder**.
- **Docs:** 1,434 markdown files — many contradict canonical May 2026 docs; **governance debt**.

---

## 2. Current Architecture Reality

| Layer | Reality |
|-------|---------|
| Entry | App Router pages + server actions + API routes |
| Domain logic | `services/*` (603 files), domain-grouped |
| AuthZ | 59 permission keys; **20/144** actions use `requireMutationPermission`; **~85** tenant-only |
| API governance | `lib/api/route-registry.ts` — 8 classes; validation in CI |
| Tenant | `requireTenantActor` + workspace migration still active |
| Audit | `auditLog()` central; denial audits per domain; `withAuditMutation` unused |
| Cron | **137** route files; **15** in production `vercel.json` |
| Build | Memory-tuned (8–14GB); prebuilt deploy; recent **production TS fixes** committed |

---

## 3. Completed Since Last Master Prompt (Evidence: git + code)

- Production TypeScript / Vercel build blockers fixed (`952571a` and related).
- Growth actor scope uses workspace granted permissions.
- Async RBAC helpers explicit `Promise<>` return types.
- Storefront: subnav types, publish audit email, checkout retry rate limit, discounts/loyalty/gift cards RBAC consolidation.
- Import Center: canonical workspace RBAC + type-scoped job permissions.
- Billing subnav link types fixed.
- POS (prior cycles, now extensive): canonical POS permission keys on checkout, refund, void, shift, register, terminal route; focused unit tests for terminal lifecycle, refund/void, shift math; page parity for settings, handheld, tabs, transactions, receipts.
- Cron: timing-safe `verifyCronSecret`, `cron.auth_denied` audits; CI `validate:production-crons` + inventory Vitest gates.
- Storefront media: `storefront.media.manage`, malware scan hook, upload audit.
- CRM hub, rewards, import/export center ingredient preview RBAC.
- Reports: `requireReportReadActor`, report key scoping.

---

## 4. Still-Open P0 Items

| ID | Item | Evidence |
|----|------|----------|
| P0-1 | **RBAC wave 2** — ~85 tenant-only action files | grep `requireTenantActor` without `requireMutationPermission` |
| P0-2 | **Storefront publish API** — `app/api/storefront/theme/publish`, `builder/publish` lack `storefront.publish` | route inspection |
| P0-3 | **Superadmin / email bypass** — `lib/platform-owner.ts`, `actions/order-creation.ts` | hardcoded email |
| P0-4 | **Fail-closed public POST** — IoT when secret unset; leads/NPS unauthenticated | API routes |
| P0-5 | **Money-path E2E in CI** — only 3 Playwright specs in `ci.yml` | workflow |
| P0-6 | **Cron surface hygiene** — 137 routes vs 15 production | `app/api/cron/` |
| P0-7 | **Inventory depletion proof** — POS/storefront → stock | integration tests |
| P0-8 | **Sales/navigation governance** — hide placeholder integrations & immature modules | maturity matrix vs nav |

---

## 5. Still-Open P1 Items

- KDS v1 productization (ticket-level, stations, certified realtime).
- POS offline policy + tests (honest claims).
- Shopify/Woo full webhook→order E2E.
- Public API v1 contracts for all 8 resources.
- Typecheck slicing / OOM elimination without relaxing strictness.
- Doc consolidation (1,434 → ~12 canonical).
- Table service / floor plan (preview only — no sell).
- Mailchimp / campaign builder (not built).
- Cross-channel loyalty/gift card E2E.
- Commissary + notification-rules permission keys.

---

## 6. New Risks Introduced by Recent Cycles

1. Partial RBAC migration creates **inconsistent operator experience** (POS strict, other modules loose).
2. Large POS test suite may imply **production-ready POS** — still not true for hardware/tables/offline.
3. Experimental **cron route names** may have grown via autonomous passes (brainstem, hypergraph, martian-orbital, etc.).
4. **Storefront action RBAC** fixed while **publish API routes** lag — asymmetric security.
5. **CI green** without checkout/POS E2E → release false confidence.
6. Untracked `tests/node_modules/` in working tree — hygiene risk.

---

## 7. Outdated Assumptions (Do NOT Carry Forward)

| Old assumption | Current truth |
|----------------|---------------|
| "Cron validation is broken" | **Fixed** — Vitest live reconciliation in CI |
| "POS has no permission model" | **POS slice done** — keys + tests; gaps remain on workflow depth |
| "RBAC not started" | **~35% migrated** — POS, storefront admin, billing, import center, kitchen daily, growth |
| "Storefront is MVP only" | **Pilot-ready** checkout with rate limits, Stripe, pay-later, RBAC |
| "Need more features to compete" | Need **hardening + focus**, not breadth |
| "All crons are production" | Only **15** scheduled; 122+ are non-prod/experimental |
| "Docs reflect current state" | **Most audit docs are stale**; trust May 26–27 canonical set |

---

## 8. Highest-Leverage Strategy (Next Era)

**Theme:** *Harden the spine, certify money paths, productize kitchen, govern truth.*

1. **Finish authorization canon** on remaining high-risk mutations (not new permissions doc — **migration**).
2. **CI owns revenue:** storefront checkout, payment failure, POS checkout, cross-tenant denial — minimum E2E tier.
3. **One KDS story:** ship ticket KDS v1 or explicitly defer and hide extras.
4. **Cron/archive cleanup:** production manifest = only deployable cron handlers.
5. **GTM alignment:** navigation + marketing filtered by `docs/feature-maturity-matrix.md`.
6. **Stop autonomous feature sprawl** until P0 table above is green.

---

## 9. What the Next Master Prompt MUST Focus On

- Explicit **cycle budget** (15–30) mapped to P0 table.
- **requireMutationPermission** migration checklist by module (wave 2 list).
- Storefront **publish API** parity with actions.
- **E2E CI tier** definition and required specs list.
- **KDS v1** scope document (in/out).
- **Integration honesty** — PLACEHOLDER hidden from default sales UI.
- **Doc canon** — 12 files max; deprecate others.
- **Definition of done** from `docs/definition-of-done.md` as promotion gate.
- Evidence requirements: every claim cites file path + test path.

---

## 10. What the Next Master Prompt MUST Avoid

- New Prisma models / modules without P0 clearance.
- New `app/api/cron/*` experimental routes.
- Marketing or nav exposure of PLACEHOLDER integrations.
- Toast/Square POS parity claims.
- Native hardware / offline POS claims.
- AI/copilot expansion before explainability + budget gates.
- Theme experiment / ZK / compliance-sync cron additions.
- Broad refactors (split monolith, rewrite auth).
- Amending hundreds of stale audit docs.
- `tests/node_modules` or destructive git operations.

---

## 11. Required Safety Rules (Copy Into Master Prompt)

```
AUDIT-FIRST / IMPLEMENT-SECOND
- No destructive git, DB, or production operations.
- No force push, reset, or production deploy unless explicitly requested.
- No large refactors across unrelated modules.
- No new cron routes unless added to production manifest + reconciliation tests.
- No maturity promotion without tests listed in definition-of-done.
- Every mutation touch must use requireMutationPermission or documented public exception.
- Denials on sensitive paths must audit.
- Commits only when user asks.
```

---

## 12. Required Priority Order

1. Platform safety (RBAC, publish API, public POST, email bypass)
2. Tenant integrity (workspace scope, cross-tenant tests)
3. Revenue path reliability (storefront + POS + Stripe webhooks)
4. Release confidence (E2E CI tier, typecheck stability)
5. KDS productization
6. Inventory depletion correctness
7. Integration certification (Shopify/Woo)
8. UX/nav governance
9. Performance / typecheck slicing
10. Enterprise (SSO, compliance) — **defer**

---

## 13. Recommended Next 15–30 Cycles (Ordered)

| Cycle band | Deliverable | Acceptance |
|------------|-------------|------------|
| 1–2 | Storefront publish API RBAC + tests | Denied without `storefront.publish` |
| 3–4 | Remove email bypass; platform role only | No hardcoded founder email in mutations |
| 5–6 | RBAC wave 2: commissary, notification-rules, monetization | Negative role tests |
| 7–8 | IoT/leads/NPS fail-closed or rate-limited | Security unit tests |
| 9–10 | CI E2E: storefront checkout + payment fail | Workflow green |
| 11–12 | CI E2E: POS checkout | Workflow green |
| 13–14 | Inventory depletion integration test | POS + storefront paths |
| 15–16 | Cron archive: non-prod routes gated | inventory test passes; count documented |
| 17–18 | KDS v1 spec + station model spike | Doc + prototype behind flag |
| 19–20 | KDS bump E2E | Playwright green |
| 21–22 | Nav filter by maturity matrix | No placeholder in default nav |
| 23–24 | Integration UI: hide PLACEHOLDER | Registry-driven |
| 25–26 | Public API contract tests (6 resources) | Vitest contracts |
| 27–28 | Doc canon rewrite (12 files) | Old audits marked deprecated |
| 29–30 | Scorecard refresh | Update this re-audit |

---

## 14. Recommended Recurring Prompt Changes

- Start each cycle with: `git log -5`, `git diff --stat`, and **P0 checklist status**.
- End each cycle with: files changed, tests added, maturity matrix rows updated.
- Mandate: **no new pages** unless maturity promotion approved.
- Mandate: run `npm run validate:production-crons` + `test:pos-rbac` when touching POS/cron.
- Ban: creating new `docs/*AUDIT*.md` — update canonical set only.

---

## 15. Foundation Docs to Rewrite or Create

| Action | File |
|--------|------|
| **Keep as canon** | `system-reality-model.md`, `feature-maturity-matrix.md`, `p0-hardening-roadmap.md`, `rbac-permission-architecture.md`, `implementation-backlog.md`, `definition-of-done.md`, `product-positioning.md`, `competitor-feature-gap-matrix.md` |
| **Update counts** | `system-reality-model.md` (this re-audit inventory) |
| **Create** | `docs/canonical-doc-index.md` — lists 12 allowed docs + deprecation notice — **done (Cycle 27–28)** |
| **Create** | `docs/kds-v1-scope.md` — before KDS implementation cycles |
| **Create** | `docs/ci-e2e-tier-matrix.md` — which E2E runs where |
| **Deprecate** | Ad-hoc `*AUDIT*.md` not in index (1,300+ files) — banner only, no delete |

---

## Scorecard Snapshot (for master prompt header)

| Area | Score |
|------|------:|
| Overall | 64 |
| Storefront | 72 |
| Backend/API | 66 |
| DevOps | 70 |
| QA (unit) | 65 |
| POS | 55 |
| KDS | 48 |
| RBAC | 52 |
| Integrations | 45 |
| Enterprise | 40 |

---

## Decision: Master Prompt Validity

| Question | Answer |
|----------|--------|
| Is old master prompt still valid? | **Partially** — safety ordering yes; facts and "not started" claims no |
| New master prompt required now? | **YES** |
| Safe to continue recurring cycles before rewrite? | **NO** — without new prompt, risk regresses into sprawl |
| Single sentence for new prompt | **"Complete platform safety and money-path certification on the existing spine; do not expand surface area."** |

---

*Generated 2026-05-27 from live repository inspection. Use with `docs/full-strategic-reaudit-2026-05-27.md`.*
