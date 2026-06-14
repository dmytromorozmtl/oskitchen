# OS Kitchen — Product Roadmap 2026

**Authors:** CPO / Principal Architecture  
**Date:** 19 May 2026  
**Horizon:** Q2 2026 (pilot) → Q4 2026 (scale)  
**Source of truth (capabilities):** `lib/capabilities/capability-matrix.ts`  
**Production:** https://os-kitchen.com

---

## Executive summary

OS Kitchen enters **paid pilot** with a **production-grade core** (orders → production → packing → billing) and a **honest integration tier** (WooCommerce/Shopify BETA, Stripe env-dependent, no SMS/offline POS/marketplace natives). The next six months prioritize:

1. **Pilot learning** — structured feedback, activation/retention metrics, kill misleading claims.
2. **Hardening to GA** — capabilities that are code-complete but env- or process-dependent.
3. **Revenue expansion** — storefront conversion, reporting, and operator efficiency.
4. **Selective enterprise** — multi-location and identity only where contracts justify build.

**Strategic north star:** *The operating system for weekly preorder kitchens* — not a generic restaurant POS or marketplace aggregator.

---

## Market context

| Segment | Primary job-to-be-done | OS Kitchen fit today | 2026 focus |
|---------|------------------------|---------------------|------------|
| **Meal prep** | Weekly menu → batch production → delivery/pickup | **Strong** (today, production, routes) | Activation, menu cadence, labels |
| **Catering** | Quotes → events → fulfillment | **Moderate** (quotes module, partial) | Quote→order bridge, deposits |
| **Bakery / preorder** | SKU windows, pickup slots | **Strong** (storefront BETA) | Storefront GA, slot capacity |
| **Ghost / multi-brand** | Channel chaos | **Partial** (Woo/Shopify BETA only) | Certified imports, not DoorDash native |
| **Enterprise multi-site** | SSO, SCIM, audit | **Weak** (roadmap) | Q4 only with paid design partners |

---

## Capability analysis (matrix-driven)

### Legend

| Status in matrix | Roadmap meaning |
|------------------|-----------------|
| **BETA → LIVE (30–90d)** | Code exists; needs env, certification, monitoring, or UX polish |
| **SETUP_READY → LIVE** | Flip env + runbook; minimal engineering |
| **PARTIAL → GA** | Ship missing slice (workers, UI, legal automation) |
| **PARTNER_ACCESS_REQUIRED** | **No calendar commitment** without signed partner program |
| **ROADMAP** | Scheduled quarter OR deprioritized until demand |
| **NOT_AVAILABLE** | **Out of scope 2026** unless strategy changes |

---

### A. Promote to production-ready (30–90 days)

| Capability | Current | Target | Work required |
|------------|---------|--------|---------------|
| **Order → production → packing** | GA path (code) | **LIVE** | Pilot SLOs, golden-path monitoring, onboarding checklist |
| **Native storefront** | BETA | **LIVE** | Stripe live reconciliation, large-catalog perf, SEO per tenant |
| **Stripe Checkout** | BETA (env) | **LIVE** | Webhook reconciliation dashboard, failed-payment alerts |
| **Resend email** | SETUP_READY | **LIVE** | Prod keys, SPF/DKIM runbook, bounce handling doc |
| **Custom domain** | SETUP_READY | **LIVE** | DNS/TLS playbook, support macro |
| **Google Maps** | SETUP_READY | **LIVE** | Quota alerts, embed fallbacks |
| **WooCommerce import** | BETA | **LIVE** | Per-tenant certification template, async queue default |
| **Shopify import** | BETA | **LIVE** | Same + idempotency audit |
| **Workspace API keys** | BETA | **LIVE** | Upstash rate limits, audit log export |
| **CRM / customers** | GA path | **LIVE** | Segment export, import hygiene |
| **CSV import/export** | PARTIAL | **GA (bounded)** | 10MB cap documented; background job for large files (Q3) |
| **OpenAI assist** | BETA | **BETA** (keep) | Copilot guardrails; no “enterprise AI” claims |
| **Webhook replay** | BETA | **BETA (break-glass)** | Operator training only; not a feature to sell |

---

### B. Requires partnerships (do not roadmap without contract)

| Capability | Status | Partner | Minimum to start engineering |
|------------|--------|---------|------------------------------|
| **Uber Eats marketplace** | PARTNER_ACCESS_REQUIRED | Uber | Signed API + legal + pilot merchant |
| **Uber Direct dispatch** | ROADMAP | Uber Direct | Onboarding + dispatch SLA |
| **DoorDash** | ROADMAP | DoorDash | No connector in repo — **0 eng until partner** |

**2026 position:** Offer **manual + Woo/Shopify** channel consolidation; position marketplaces as **2027+** or partner-led.

---

### C. Explicitly out of scope (2026)

| Capability | Status | Rationale |
|------------|--------|-----------|
| **SMS notifications** | NOT_AVAILABLE | TCPA, provider cost, low pilot signal — use email + in-app |
| **POS offline mode** | NOT_AVAILABLE | Architectural cost; pilot is online-first |
| **Stripe Terminal (hardware)** | NOT_AVAILABLE | Native payment terminals deferred — browser POS + cash/external terminal; Stripe Terminal SDK not integrated |
| **Native payment terminals** | NOT_AVAILABLE | deferred — no proprietary OS Kitchen readers; use browser POS and hosted checkout today |
| **SOC 2 attestation** | ROADMAP | Foundations only; sell “security program in progress” |
| **SCIM** | ROADMAP | After SSO; no demand without enterprise ARR |
| **Native consumer app** | NOT_AVAILABLE | Deferred until **500+** paying operators — storefront PWA + mobile web today |
| **Field sales / local reps** | NOT_AVAILABLE | digital-only GTM — self-serve signup, book demo, design partner outreach; no Toast-style field force |
| **Native iOS app** | NOT_AVAILABLE | deferred — browser POS/KDS on iPad/iPhone; no staff App Store app in 2026 |

---

### D. Enterprise / scale (Q4 2026+)

| Capability | Current | Target quarter | Notes |
|------------|---------|----------------|-------|
| **SSO (SAML/OIDC)** | ROADMAP | Q4 2026 | 1 design partner required |
| **Multi-location / org hierarchy** | Partial in data model | Q4 2026 | Location switcher, consolidated reporting |
| **Stripe async billing outbox** | DESIGN_READY | Q3 2026 | Reliability at scale |
| **DPA / self-serve DSR** | PARTIAL | Q3 2026 | Legal + automated export/delete |
| **SOC 2 Type I prep** | ROADMAP | 2027 | Policy pack in Q4 if enterprise pipeline |

---

## Quarterly roadmap

### Q2 2026 — Paid pilot (May–Aug 2026)

**Theme:** *Learn, stabilize, activate.*

| Theme | Initiatives | Capability impact |
|-------|-------------|-------------------|
| **Pilot ops** | Feedback template, weekly operator calls, `pilot-ready-check` in CI | Core path LIVE |
| **Activation** | Onboarding v2, empty-state playbooks, first-order wizard | Today + orders |
| **Trust** | Resend + Upstash in prod, status page, incident runbook | Email LIVE, rate limits |
| **Integrations** | Woo/Shopify certification kit (1-pager per tenant) | BETA → LIVE |
| **Storefront** | Checkout error UX, mobile menu QA, GA on conversion | Storefront LIVE |
| **Honesty** | `verify-claims` in release process; sales sign-off v2 | No SMS/Uber/offline claims |
| **Defer** | SSO, multi-location, DoorDash, experiments UI default-off | — |

**Exit criteria (Q2):** See [Pilot success metrics](#pilot-success-metrics).

---

### Q3 2026 — Growth (Sep–Nov 2026)

**Theme:** *Retention, efficiency, second location prep.*

| Theme | Initiatives | Capability impact |
|-------|-------------|-------------------|
| **Reporting** | Executive dashboard v2, export schedules, margin/costing polish | Reports PARTIAL → GA |
| **Catering** | Quote → order conversion, deposit + Stripe link | Catering GA for mid-market |
| **Production** | Batch boards, allergen/diet labels, print templates | Production LIVE+ |
| **Delivery** | Route optimization (Maps), driver handoff — **not** Uber Direct | Maps LIVE |
| **Integrations** | Webhook health dashboard, replay guardrails | Webhook BETA controlled |
| **Platform** | Public API v1 docs, rate limit tiers | API keys LIVE |
| **Billing** | Async Stripe outbox (if load justifies) | DESIGN_READY → BETA |
| **Background jobs** | Large CSV via worker + S3 | CSV PARTIAL → GA |

**Competitive Tier 1 (see [COMPETITIVE_ANALYSIS_2026.md](COMPETITIVE_ANALYSIS_2026.md))** — ship after pilot feedback (weeks 3–4); complete by end Q3:

| # | Initiative | Code baseline | Target |
|---|------------|---------------|--------|
| 1 | Costing A vs T — variance alerts & operator playbook | `costing/avt` shipped | GA for Pro tier |
| 2 | PO approval workflow (submit / approve / email) | `purchase_approval_events` | GA purchasing |
| 3 | Recipe scaling on production batches | `production_batches` | Production LIVE+ |
| 4 | Catering deposits + quote→order sign-off | `quote-conversion-service` + UI | Catering GA |
| 5 | Supplier price charts & comparison | `supplier_price_history` | Purchasing GA |
| 6 | Integration health command center | `integration-health-service` | Integrations LIVE |
| 7 | Meal plan auto-renew cron + skip/pause polish | `meal_plan_cycles` | Meal plans BETA → LIVE |

**Target ICP expansion:** Meal prep 10–50 orders/week → catering 50–200.

---

### Q4 2026 — Scale (Dec 2026–Feb 2027)

**Theme:** *Multi-site, enterprise pipeline, operational excellence.*

| Theme | Initiatives | Capability impact |
|-------|-------------|-------------------|
| **Multi-location** | Location entity UX, cross-location reporting, permissions | New GA tier |
| **Enterprise** | SSO pilot with 1 brand (3+ locations) | SSO ROADMAP → BETA |
| **Compliance** | Self-serve data export/delete, audit log retention | DPA PARTIAL → GA |
| **Performance** | Storefront CDN/caching, DB read replicas eval | Infra |
| **Partner** | Uber Eats **only if** partnership signed; else marketing freeze | PARTNER gate |
| **Self-serve** | Reduce white-glove: in-app setup wizards | Onboarding |

**Not in Q4 unless contracted:** DoorDash, Stripe Terminal, SMS, offline POS.

---

## Engineering ↔ product map (audit backlog)

Priority items from full system audit, mapped to quarters:

| Audit theme | Q2 | Q3 | Q4 |
|-------------|----|----|-----|
| Auth / security (done in pilot hardening) | ✅ | maintain | maintain |
| Rate limits (Upstash) | ✅ | extend per API | enterprise tiers |
| Loading/error coverage | ✅ (453/452) | spot-check new routes | — |
| Cron surface (131 routes) | manifest lock | deprecate dead routes | — |
| Public API Zod + try/catch | critical paths | breadth | — |
| A11y (Lighthouse 100 marketing) | dashboard pass | POS + storefront | — |
| Experiment / advanced UI | hidden in pilot | opt-in beta | — |

---

## Pilot success metrics

### Product metrics (operators)

| Metric | Definition | Pilot target (90 days) | GA launch gate |
|--------|------------|------------------------|----------------|
| **Activation rate** | % signups with ≥1 order within 7 days | ≥ 40% | ≥ 55% |
| **Time-to-first-order** | Median hours signup → first paid/submitted order | < 72h | < 48h |
| **Weekly active kitchens** | % paying tenants with ≥1 session/week | ≥ 70% | ≥ 80% |
| **Orders per active kitchen** | Median orders/week (activated) | ≥ 15 | ≥ 25 |
| **Storefront attach rate** | % kitchens with live storefront + ≥1 web order/30d | ≥ 30% | ≥ 50% |
| **Integration attach** | % with Woo OR Shopify connected | ≥ 20% (self-selected) | ≥ 35% |
| **NPS** | Quarterly survey (see feedback template) | ≥ 30 | ≥ 40 |
| **Support tickets / kitchen** | Monthly tickets per active tenant | < 2 | < 1 |
| **Churn (logo)** | % pilots not renewing month 3 | < 15% | < 8% |

### Technical metrics

| Metric | Target (pilot) | GA gate |
|--------|----------------|---------|
| **Uptime** (health + synthetic) | 99.5% monthly | 99.9% |
| **API health** `status: ok` | > 99% checks | Same |
| **p95 dashboard TTFB** | < 800ms (authenticated) | < 600ms |
| **p95 storefront checkout** | < 1.2s | < 1s |
| **Error rate** (5xx / requests) | < 0.1% | < 0.05% |
| **Failed Stripe webhooks** | < 0.5% unreconciled 24h | < 0.1% |
| **E2E HTTP smoke** | 100% pass on deploy | + auth E2E in CI |
| **Rate limit adapter** | Upstash in prod | Required |

### Business / go-to-market gates (pilot → GA)

| Gate | Requirement |
|------|-------------|
| **G1 — Pilot cohort** | ≥ 8 paying operators, ≥ 12 weeks live |
| **G2 — Golden path** | 100% of pilot kitchens complete order → production → packing once |
| **G3 — Claims audit** | Zero `verify-claims` failures; sales sign-off current |
| **G4 — Support** | Documented SLAs, < 24h email response pilot |
| **G5 — Incidents** | No unresolved SEV-1 > 4h during pilot |
| **G6 — Capability honesty** | Matrix statuses updated; no NOT_AVAILABLE sold |

**GA launch definition:** Public self-serve signup (limited plans), standard onboarding, published SLA, and **LIVE** tier for core + storefront + Stripe (when configured).

---

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-promising integrations | Churn, legal | Matrix + `verify-claims` + sales sign-off |
| Stripe/env misconfig | No revenue | Onboarding checklist, billing health widget |
| Marketplace pressure (Uber/DoorDash) | Distraction | Partner gate in roadmap |
| Solo-kitchen support load | Burnout | Feedback template, priority tiers |
| Experiment / AI surface creep | Quality | Feature flags, pilot profile |

---

## Decision log (2026)

| Date | Decision | Owner |
|------|----------|-------|
| 2026-05-19 | SMS, offline POS, Stripe Terminal **not** in 2026 roadmap | CPO |
| 2026-05-19 | Uber/DoorDash **partner-gated** only | CPO |
| 2026-05-19 | Pilot → GA requires 8+ operators + metric gates | CPO |
| 2026-05-19 | Q3 focus: reporting + catering, not new channels | CPO |

---

## Related documents

| Document | Purpose |
|----------|---------|
| [COMPETITIVE_ANALYSIS_2026.md](COMPETITIVE_ANALYSIS_2026.md) | Competitor landscape + Tier 1–3 features |
| [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md) | Sales-safe claims (updated v2) |
| [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md) | Operator feedback collection |
| [PILOT_LAUNCH_FINAL_19MAY.md](PILOT_LAUNCH_FINAL_19MAY.md) | Ops checklist |
| [ACCEPTANCE_VERDICT_19MAY.md](ACCEPTANCE_VERDICT_19MAY.md) | Technical acceptance |
| [FULL_SYSTEM_AUDIT_REPORT.md](FULL_SYSTEM_AUDIT_REPORT.md) | Audit backlog |

---

*Review quarterly or when `capability-matrix.ts` changes.*
