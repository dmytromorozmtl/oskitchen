# OS Kitchen — Full System Analysis & Roadmap

**Date:** 2026-05-15  
**Classification:** Internal product + engineering strategy (non-binding financial forecast).

---

## 1. Executive summary

OS Kitchen is a **broad FoodOps + Commerce platform** implemented as a modern Next.js 15 / TypeScript / Prisma monolith with clear separation between **marketing**, **workspace dashboard**, **public storefront**, and **internal platform** surfaces. The codebase is **feature-rich** relative to typical early commercial MVPs; the primary risk is **surface-area complexity** (hundreds of Prisma models, deep dashboard navigation) rather than fundamental stack fragility.

**Biggest strengths**

- Single-product data model enabling unified orders, production, packing, CRM, and analytics narratives.
- Honest integration posture (capability matrix + landing copy explicitly avoids fake hardware / offline claims).
- Hardening investments already documented (webhooks async architecture, rate limiting, audit reason sanitization, platform guards).

**Biggest risks**

- **Operational complexity** for new customers without guided onboarding automation.
- **Performance at scale** requires continuous query discipline (pagination, indexes, snapshot KPIs).
- **Security IDOR** class bugs are the highest-impact latent category — needs periodic `actions/` audits.

**Launch recommendation**

- **Closed beta / paid pilot:** **Go** with tight ICP (multi-channel meal prep & catering operators) *if* webhook crons, billing envs, and support SLAs are monitored.
- **Broad SMB public launch:** **Hold** until Order Hub + POS + storefront flows have full Playwright smoke on CI for every release tag.
- **Enterprise claims:** **Restrict** to architecture + roadmap language until SSO/SCIM/SOC2 evidence exists.

---

## 2. Readiness scores (indicative ranges)

| Stage | Score | Rationale |
|-------|-------|-----------|
| Commercial MVP readiness | **68–78%** | Core loops exist; breadth > depth on some modules. |
| Closed beta readiness | **72–82%** | Suitable with founder-led onboarding + manual ops. |
| Paid pilot readiness | **65–75%** | Viable when billing + support + webhook ops are contractually clear. |
| Public self-serve launch | **55–65%** | Needs stronger guided setup + automated CI smoke + perf proof. |
| Enterprise readiness | **35–50%** | RBAC exists; enterprise packaging (SSO, SCIM, formal compliance) not sell-ready without external attestation. |

---

## 3. System-by-system analysis (condensed)

| Module | Status | Works well | Weak / watch | Fixed this pass | Next improvements |
|--------|--------|------------|--------------|-----------------|---------------------|
| Marketing site | **Strong** | Honest claims, features grid | SEO/OG depth varies | Lint hygiene on changelog | Structured data pass |
| Onboarding | **Medium** | Adaptive JSON patterns | Long path | — | Progress telemetry |
| Dashboard shell | **Strong** | Modes + command palette | Depth | — | Setup-required banners |
| Today | **Medium+** | Signals services | Query cost | — | Snapshot reuse audit |
| POS | **Medium+** | Checkout + receipts | Hardware scope clarity | Memo + tests ancillary | More E2E |
| Orders / Hub / Detail | **Medium+** | Lifecycle services | Stuck-state UX | — | Next-action panel |
| Product mapping | **Medium** | Workbench pages | Cognitive load | Unused import cleanup | Guided wizard |
| Storefront | **Medium+** | Builder + checkout gates | Alt text | Lazy-load images | LCP tuning |
| Sales channels | **Medium** | Registry honesty | Per-provider QA | — | Health timestamps |
| Integration health | **Medium** | Workspace + platform | Stale greens | — | SLA clocks |
| Webhooks / cron | **Medium+** | Secret gate | Ops alerting | — | Alerting |
| Production / KDS | **Medium** | Command centers | Vertical variance | — | Station templates |
| Packing / verify | **Medium** | Flows exist | Hardware testing | — | Scanner QA program |
| Routes / delivery | **Medium-** | Internal + Uber placeholders | Provider maturity | — | Pilot playbook |
| Tasks | **Medium** | Automation foundation | Adoption | — | Templates |
| Locations / brands | **Medium+** | Deep settings | Duplication with settings | — | Consolidation |
| CRM | **Medium+** | Segments / dedupe | Linking edge cases | — | Tests |
| Meal plans / catering | **Medium** | Quote services | Follow-up automation | — | CRM bridge |
| Inventory demand / purchasing | **Medium-** | Engines exist | Real supplier integrations | — | CSV-first ops |
| Costing / AvT | **Medium-** | Reports foundation | Confidence UX | — | Tests + copy |
| Analytics / forecast / reports | **Medium** | KPI plumbing | Chart perf | — | Lazy charts |
| Executive | **Medium** | Overview | Data governance | — | Access reviews |
| Copilot | **Early** | Wiring | Model governance | — | Feature flag discipline |
| Staff | **Medium-** | Roles | Fine-grained matrix | — | Capability map |
| Billing | **Medium+** | Stripe modes | Disabled-state copy | — | Self-serve upgrade path |
| Notifications / alerts | **Medium** | Templates | Deliverability ops | — | Runbooks |
| Support | **Medium+** | Inbox | Field separation tests | Import cleanup | Reply vs note tests |
| Settings | **Large** | Center pattern | Sprawl | Unused Button imports removed | Progressive disclosure |
| Audit logs | **Medium+** | Retention services | Coverage gaps | Sanitization tests | More actions logged |
| Error recovery | **Medium+** | Webhook linkage | Stale jobs | — | Heartbeat |
| Data integrity | **Medium** | Checks | UX surfacing | — | Guided repairs |
| Demo scenarios | **Medium** | Seeds | Safety | — | Audit on reset |
| Platform admin | **Strong** (internal) | Guards | Role seed ops | — | Quarterly access review |
| Developer API | **Medium-** | Public v1 | Scope docs | — | Contract tests |
| Trust / legal | **Medium** | Pages exist | Enterprise mapping | — | SOC2 roadmap honesty |

---

## 4. Prioritized backlog (rollup)

### P0 (production blockers) — none confirmed statically; watchlist

- Potential IDOR in new actions without workspace guard (continuous review).

### P1 (commercial MVP)

- Support reply vs internal note separation tests + UI audit.
- Storefront server/client checkout rule parity check.
- Cron + webhook queue monitoring & alerting.
- Integration health “last success” surfacing.

### P2 (polish)

- Order status label centralization; chart lazy loading; OG metadata sweep.
- Accessibility alt text on storefront images.

### P3 (cleanup)

- knip/ts-prune; marketing bullet generation from registry; folder splits.

---

## 5. Technical debt themes

| Debt type | Notes |
|-----------|-------|
| Architecture | Monolith simplicity is a strength; microservice split **not** recommended near-term. |
| Query / perf | Pagination + indexes must evolve with largest workspaces. |
| Schema | Very large — onboarding cost; consider domain bounded contexts in docs, not splits. |
| Tests | Vitest strong; Playwright coverage needs CI gating expansion. |
| Security | IDOR class — systematic review. |
| UX | Nav depth + setup guidance. |
| Docs | Many excellent deep docs — maintain index (this audit set). |

---

## 6. Product roadmap

### Next 7 days

- Run Playwright smoke on CI for release branch.
- Ops checklist: `CRON_SECRET`, Stripe webhooks, Resend domain.

### Next 30 days

- Support ticket visibility tests + copy pass on billing disabled states.
- KPI snapshot alignment audit on dashboard landing widgets.

### Next 60 days

- Order detail “next action” panel for stuck states.
- Integration health timestamps + synthetic checks.

### Next 90 days

- Virtualized Order Hub for 1k+/day workspaces (pilot-driven).
- Expanded public API contract tests.

### Next 6 months

- Selective enterprise features behind flags (SSO investigation only with budget).

### Next 12 months

- Partner certification path + vertical playbooks packaged as services.

---

## 7. Launch strategy

1. **Internal demo** — scripted golden paths (`dashboard/demo/scenarios`).
2. **Closed beta** — N≤15 kitchens with weekly founder check-ins.
3. **Paid pilots** — annual agreements with explicit module scope + support SLA.
4. **First ICPs** — preorder-heavy meal prep, catering with deposits, ghost kitchens with Shopify/Woo already live.
5. **Modules to soft-hide** — Copilot depth, niche nutrition advanced flows until stable.
6. **Avoid selling** — native POS hardware, offline mode, full accounting replacement, SOC2 attestation until real.

---

## 8. Revenue potential (illustrative only)

| Tier | SMB | Multi-location | Enterprise |
|------|-----|----------------|------------|
| ARPA thought band | $49–$199/mo | $299–$999/mo | $2k–$15k+/mo |
| Assumptions | Self-serve Stripe | Adds locations + routing | Adds SSO roadmap + services |

**Risks:** integration support load, churn from onboarding friction, webhook-driven incident blame.

---

## 9. Competitor positioning (high-level; **not** fresh market data)

> **Important:** The comparisons below are **strategic positioning heuristics** based on common industry categories, **not** verified 2026 product facts. For pricing/feature parity claims in sales collateral, add customer-performed diligence.

| Competitor / category | OS Kitchen likely stronger at | OS Kitchen likely weaker at (today) | Avoid competing on (now) | Differentiation angle |
|-----------------------|-------------------------------|-------------------------------------|----------------------------|-------------------------|
| Toast / Square / Lightspeed / Clover (incumbent POS) | Unified meal-ops + preorder + kitchen narrative; honest web POS scope | Mature offline POS, payment hardware ecosystems, massive app marketplaces | “Replace Toast end-to-end” | **Preorder + production + catering** OS layer *alongside* or *above* POS |
| Cuboh / Deliverect (aggregator ops) | Owned storefront + native OS Kitchen orders + mapping workbench | Deep marketplace order normalization maturity | “We replace Deliverect day one” | **Branded commerce + ops** for mid-market multi-brand groups |
| Olo (digital ordering enterprise) | SMB speed + integrated kitchen workflow | Enterprise digital ordering scale proof | Enterprise drive-thru scale claims | **Catering + meal prep** digital + ops |
| Restaurant365 / MarketMan / xtraCHEF / Apicbase (BOH financial & inventory) | Operational order-driven demand signals | Full accounting, deep inventory network effects | Being “the GL” | **Demand → purchasing suggestions** without accounting replacement claims |
| 7shifts / HotSchedules (labor) | Cross-module staff surfaces | Dedicated labor compliance depth | Wage & hour law completeness | **Task + readiness** adjacent to production |
| Meal prep / catering vertical SaaS | Vertical storytelling + demo scenarios | Established brand ecosystems | “We are the category incumbent” | **Composable OS**: commerce + ops in one workspace |
| Shopify / Woo ecosystem | Native + imported order hub; mapping | Becoming the storefront CMS for all merchants | “Better CMS than Shopify” | **Operator truth** after commerce captures order |

#### Needs manual market verification (do not cite as facts without research)

- Exact competitor pricing buckets as of 2026-Q2.
- Feature parity matrices for named POS systems (API tables change frequently).
- Regional compliance (tips, VAT, labor) completeness.

---

## 10. Final recommendations

1. **Fix first:** Monitoring for webhooks + cron; support ticket separation tests; IDOR sweep on `actions/`.
2. **Postpone:** Aggressive enterprise security marketing; broad marketplace aggregator parity claims.
3. **Hide / gate:** Experimental AI depth; niche modules without support runbooks.
4. **Build next:** Operational “stuck order” resolver UX; integration health timestamps; Playwright CI gating.
5. **Sell first:** Preorder + production + packing for meal prep & catering teams already on Shopify/Woo + Stripe.

---

## Appendix — Audit artifact index

- `docs/FULL_SYSTEM_INVENTORY_AUDIT.md`
- `docs/GLOBAL_BUG_ERROR_AUDIT.md`
- `docs/PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md`
- `docs/PERFORMANCE_FIXES_APPLIED.md`
- `docs/SECURITY_RBAC_TENANCY_AUDIT.md`
- `docs/DATABASE_MODEL_MIGRATION_AUDIT.md`
- `docs/CORE_OPERATIONAL_FLOW_AUDIT.md`
- `docs/STOREFRONT_PROFESSIONAL_AUDIT.md`
- `docs/INTEGRATIONS_WEBHOOKS_RECOVERY_AUDIT.md`
- `docs/UX_UI_NAVIGATION_AUDIT.md`
- `docs/QA_TEST_COVERAGE_AUDIT.md`
- `docs/MARKETING_PRICING_CLAIMS_AUDIT.md`
- `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`
- `docs/OPTIMIZATION_REFACTOR_OPPORTUNITIES.md`
- `docs/FULL_SYSTEM_AUDIT_FINAL_REPORT.md`
