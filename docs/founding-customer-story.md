# Founding customer story

**Policy:** `founding-customer-story-v1`  
**Updated:** 2026-06-02  
**Owner:** Founder + Marketing + Sales  
**Status:** **Pre-founding-customer** — no signed LOI or paid pilot on record (June 2026)  
**Sources:** [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

This document holds the **approved narrative** for OS Kitchen’s first design partner / founding customer — plus the **honest story we tell today** before a customer exists. Replace placeholder sections only after countersigned LOI and written marketing approval.

**Honesty rule:** Do not publish customer names, logos, quotes, or KPIs until Gate C convert in [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) and legal sign-off. Template metrics are **not** customer proof.

---

## Current state (June 2026)

| Fact | Value | Implication for story |
|------|-------|----------------------|
| Signed LOI / paid pilot | **None** (`loiSignedDate: null`) | No “our customer X” claims |
| Case studies / logos | **0** | No logo bar on homepage |
| Pilot GO/NO-GO | **NO-GO** (ops + customer gates) | “Design partner program open” |
| Engineering surface | Broad — order hub, Today, 7 AI modules, marketplace scaffold | Origin story = product-built, market-unproven |

**Approved public line today:**

> OS Kitchen is built for commissaries and multi-channel food operators who outgrow spreadsheets and duct-taped channel tools. We’re recruiting **founding design partners** to co-shape the platform — seven AI modules in production at qualified maturity, honest BETA labels on integrations, and a B2B marketplace scaffold. No paying founding customer yet; pilot program open.

---

## What “founding customer” means at OS Kitchen

| Stage | Definition | Story usage |
|-------|------------|-------------|
| **Design partner** | Signed LOI, weekly feedback, staging golden path | “Co-building with [Name]” — internal/deck only until approved |
| **Paid pilot** | SOW + production usage in scope | “Pilot customer” — not “thousands of operators” |
| **Founding customer** | Converted paid after successful pilot (Gate C) | First logo, quote, case study candidate |
| **Reference customer** | ≥90 days paid + written testimonial approval | Website, ads, investor deck |

First founding customer expected profile: commissary, ghost kitchen, meal-prep, or small multi-unit (≤5 locations) — see [`loi-design-partner-template.md`](./loi-design-partner-template.md).

---

## Origin story (true today — use in decks & outreach)

### The problem

Multi-channel food operators run production, packing, and fulfillment across storefronts, marketplaces, and manual orders — often with **disconnected tools**, opaque integration status, and AI hype without operational grounding. Commissaries and ghost kitchens need **one order hub** and an **owner command center**, not another POS brochure.

### Why OS Kitchen exists

OS Kitchen was built as an **operating system** for that workflow: orders → kitchen (KDS) → production → packing → routes, with a **Today Command Center** for daily decisions and **seven proprietary AI modules** (deterministic briefing, costing, purchasing suggestions, menu structure, simulation, camera-ready stations, benchmarks) — each labeled honestly for maturity.

### What we built before the first customer

| Pillar | Evidence | Honest caveat |
|--------|----------|---------------|
| **Unified ops** | Storefront, POS, KDS, production, packing in one codebase | Not all modules sales-safe LIVE |
| **Today Command Center** | `/dashboard/today` — briefing, alerts, jump links | Pilot metrics not captured |
| **AI modules** | 22/22 engineering tasks in [`ai-moats-tracker.json`](../artifacts/ai-moats-tracker.json) | BETA/preview; not AGI |
| **B2B marketplace** | Buyer catalog → PO path | BETA; vendor seeding in progress |
| **Integration honesty** | BETA badges, SKIPPED smokes visible in UI | **0 LIVE** third-party integrations |
| **Trust posture** | Forbidden-claims CI, limitation sheet | Pre-revenue, bus factor 1 |

### Differentiation (one paragraph — sales safe)

> Unlike incumbents who lead with hardware terminals and mature app stores, OS Kitchen leads with **depth across kitchen and fulfillment** plus **seven AI modules in one platform** — with visible BETA labels instead of overpromising. We’re early on customers and LIVE partner proof; we’re strong on unified ops scaffolding and honest integration health. See [`competitor-comparison-honest.md`](./competitor-comparison-honest.md).

---

## Founding customer story template (fill after LOI + approval)

**Do not publish until `[MARKETING_APPROVED_DATE]` is signed.**

### Headline options

- “How [Operator Name] runs [commissary / ghost kitchen / meal prep] on OS Kitchen”
- “Founding partner: [Operator Name] co-built their daily command center with OS Kitchen”

### Structure

| Section | Content to capture | Source |
|---------|-------------------|--------|
| **Who they are** | `[BUSINESS_NAME]`, `[CITY]`, `[SEGMENT]`, `[LOCATIONS_IN_SCOPE]` | LOI / kickoff |
| **Before OS Kitchen** | Tools, pain (channels, production, visibility) | Discovery notes — **their words** |
| **Why they joined** | Design partner motivation — not paid testimonial unless true | LOI interview |
| **What they use** | Today, order hub, KDS, storefront/Woo — **only in-scope modules** | SOW Exhibit A |
| **Early outcome** | Qualitative only until R5 metrics PASS | Pilot metrics artifact |
| **Quote** | `[QUOTE]` — `[NAME]`, `[TITLE]` | Written approval required |
| **Honesty footer** | BETA integrations, pilot scope, no guaranteed ROI | [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) |

### Sample quote placeholders (replace — never ship as real)

> “We needed one place to see today’s orders and kitchen load — not another dashboard that hides what’s BETA.”  
> — **[Name], [Title], [Business]** · Design partner, [Month Year]

> “The briefing on Today saves us from opening five tabs — we still run our own numbers on margins.”  
> — **[Name]** · Pilot customer, [Month Year]

### Metrics block (only if `baselineProofStatus: proof_captured`)

| Metric | Week 2 | Week 8 | Source |
|--------|--------|--------|--------|
| Orders/day | | | Order hub |
| Operator feedback (1–5) | | | Survey |
| Storefront checkout success | | | Logs |

**Forbidden:** Fabricated percentages · “Saved $X” without finance review · LIVE integration claims.

---

## Narrative by audience

| Audience | Use today | Add after founding customer |
|----------|-----------|----------------------------|
| **Investor** | Origin + honest gap vs Toast/Square · design partner pipeline | First LOI date · pilot KPI trend |
| **Prospect** | Problem/solution · limitation sheet · LOI invite | Named peer in same segment (with permission) |
| **Website** | “Design partners welcome” · `/beta` or `/book-demo` | Logo + quote block |
| **LinkedIn** | Founder build-in-public · module demos | Customer spotlight post |
| **Press** | Not recommended pre-customer | Launch PR with approved quote only |

---

## Forbidden vs approved language

| Forbidden | Approved instead |
|-----------|------------------|
| “Our customers love…” | “Design partners tell us…” (with named source) |
| “Leading operators choose OS Kitchen” | “Founding design partner program open” |
| “Proven ROI” | “Pilot metrics in progress” / illustrative calculator footnote |
| Stock photo as “customer kitchen” | Product screenshots · demo environment |
| Competitor customer logos implied | Honest compare doc only |

CI-enforced phrases: [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) § Forbidden phrases.

---

## Update checklist (when first LOI signs)

| # | Action | Owner |
|---|--------|-------|
| 1 | Set `PILOT_GONOGO_CUSTOMER_NAME` + `loiSignedDate` in GO/NO-GO artifact | Ops |
| 2 | Fill template sections above — internal draft only | CS + Marketing |
| 3 | Customer approves quote in writing | Legal |
| 4 | Update [`pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) after kickoff | Ops |
| 5 | Gate external use on Gate B/C from [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) | Founder |
| 6 | Publish case study via Task 69 template when convert | Marketing |

---

## Short-form copy blocks

### Elevator (30 sec)

OS Kitchen unifies orders, kitchen, production, and fulfillment for commissaries and multi-channel operators — with a Today Command Center and seven AI modules built in, not bolted on. We’re pre-scale on customers and recruiting founding design partners who want honest BETA labels instead of integration fiction.

### Email snippet (design partner outreach)

We’re looking for **one founding design partner** in [segment] to run a 90-day pilot on staging → production — weekly feedback, golden path onboarding, and direct line to product. No national marketplace claim yet; yes to order hub, Today briefing, and qualified channel sync. LOI template attached.

### Deck footer (every slide)

*June 2026 · No signed founding customer · 0 LIVE third-party integrations · Pilot program open*

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | First legal step |
| [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) | Task 66 outreach |
| [`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) | Pre-pilot founder story + design partner CTA |
| [`case-study-template.md`](./case-study-template.md) | Post-pilot — Task 69 / MKT-11 |
| [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) | Competitive context |
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | AI narrative |
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | Prospect attachment |

---

## Review log

| Date | Version | Change |
|------|---------|--------|
| 2026-06-02 | 1.0 | Pre-customer origin story + fill-in template |

**Next review:** Within 7 days of first countersigned LOI.
