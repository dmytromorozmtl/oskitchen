# Honest competitor comparison

**Policy:** `competitor-comparison-honest-v1`  
**Status:** sales + investor safe comparison — engineering vs market proof separated  
**Updated:** 2026-06-02  
**Sources:** [`artifacts/competitor-feature-tracker.json`](../artifacts/competitor-feature-tracker.json) · [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) · [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

Use this doc in decks, discovery calls, and diligence — **never** claim parity where LIVE integrations, customers, or SLAs are unproven.

---

## Executive summary

| Dimension | OS Kitchen (honest) | Toast | Square | Lightspeed |
|-----------|---------------------|-------|--------|------------|
| **Reference customers / LOI** | **0 signed** (June 2026) | Thousands | Millions of sellers | Established base |
| **LIVE third-party integrations** | **17 LIVE** (7 BETA + 1 PLACEHOLDER) | Mature marketplace | Mature app ecosystem | Strong partner network |
| **In-person payments / hardware** | Software POS — browser/tablet | **Leader** — terminals + ecosystem | **Leader** — Reader ecosystem | Strong hardware partners |
| **Unified ops breadth (code)** | **Broad** — order hub, KDS, production, packing, marketplace scaffold | Strong ops stack | POS-first; less kitchen depth | Restaurant + retail variants |
| **AI modules (engineering)** | **7 proprietary modules shipped** (22/22 tracker) — **unproven in market** | Toast IQ / xtraCHEF (mature narrative) | Square AI features (payments-led) | Analytics + integrations |
| **B2B HoReCa marketplace (buyer)** | **Shipped scaffold** (40/40 tracker) — migration/pilot dependent | Third-party apps | Less central | Vendor integrations |
| **Staging / pilot proof** | P0 smokes **SKIPPED** — NO-GO | N/A (incumbent) | N/A | N/A |
| **Enterprise SSO / SOC2** | Roadmap / pilot wiring | **Mature** | **Mature** | **Mature** |

**One-line pitch (safe):** OS Kitchen is a **camera-ready, AI-module-rich operating system** for commissaries and multi-channel operators — early stage on customers and LIVE integrations vs incumbents.

---

## Where OS Kitchen is ahead (honest)

Engineering and product **scaffolding** — not market validation.

| Area | Why we claim ahead | Caveat |
|------|-------------------|--------|
| **Today Command Center + deterministic AI briefing** | Single owner hub with briefing, alerts, jump links — `today-command-center.tsx` | Not proven ROI; pilot NO-GO |
| **7 proprietary AI modules in one codebase** | Restaurant Brain, Digital Twin, Menu, Food Cost, Purchasing, Kitchen Camera framework, Benchmark — tracker 22/22 | BETA/preview maturity; kitchen camera synthetic by default |
| **B2B marketplace buyer UX** | Catalog → cart → checkout → PO path in dashboard | BETA; needs migration + vendor seeding |
| **Integration honesty UX** | BETA badges, SKIPPED banners, preview camera banner | Competitors don't need this — we do because we're pre-LIVE |
| **Breadth of ops surface** | 566 dashboard routes — order-to-fulfillment depth | Nav sprawl risk; not all sales-safe |
| **Bill splitting (sales-safe YES)** | Only `salesSafeVerdict: yes` in competitor feature audit | Narrow win vs full Toast/Square POS depth |
| **Software-first POS** | No proprietary terminal lock-in | **Behind** on certified hardware — different axis |

---

## Where OS Kitchen is behind (honest)

| Area | Gap | Do not claim |
|------|-----|--------------|
| **Customers & case studies** | 0 paid pilots / LOI at handoff | "Thousands of restaurants" |
| **Payment processing scale** | Stripe Connect — not processor-of-record like Square/Toast | "Replace Square Terminal stack" |
| **Hardware ecosystem** | Browser/tablet POS | Toast Go, Square Reader, Lightspeed hardware |
| **LIVE delivery marketplaces** | DoorDash/Uber/Grubhub **BETA** | "Unified delivery ops live today" |
| **Offline / rush-hour certified** | Degraded queue — no offline card | "Toast-class rush hour" |
| **Enterprise compliance** | SOC2/SCIM roadmap | "Enterprise-ready day one" |
| **Proven uptime SLAs** | No production LIVE integration 24h proof | "Five nines" |
| **Brand & distribution** | Early GTM | Incumbent trust and reseller networks |
| **Native mobile apps** | PWA/web-first | Dedicated iOS/Android POS apps |

---

## Head-to-head by competitor

### vs Toast

| Toast wins | OS Kitchen wins (qualified) |
|------------|----------------------------|
| Hardware (Toast Go, KDS devices) | Software-only POS — lower hardware capex story |
| Payment processing at scale | B2B marketplace buyer scaffold (unique angle) |
| Reference customers & Toast Capital | 7 AI modules in one OS (engineering — pilot unproven) |
| xtraCHEF / Toast IQ brand | Deterministic Today briefing + integration honesty UI |
| Live delivery + partner marketplace maturity | Unified order hub → production → packing depth in one repo |

**Safe talk track:** *"Toast owns in-restaurant hardware and scale. We target operators who want a unified cloud OS with AI modules and B2B supply marketplace — we're pre-customer and honest about BETA integrations."*

### vs Square

| Square wins | OS Kitchen wins (qualified) |
|-------------|----------------------------|
| In-person payments + Reader ecosystem | Kitchen/production/packing workflow depth |
| Brand recognition for SMB | Commissary / ghost kitchen / meal-prep ICP focus |
| App marketplace maturity | AI Restaurant Brain on Today Command Center |
| Offline card (where offered) | Multi-module AI moats (code complete) |

**Safe talk track:** *"Square is the default for simple retail POS. We're building for operators who run production kitchens and multi-channel fulfillment — still early on proof."*

### vs Lightspeed

| Lightspeed wins | OS Kitchen wins (qualified) |
|-----------------|----------------------------|
| Established restaurant + retail install base | AI module breadth (7 modules) |
| Partner/hardware channels | B2B HoReCa marketplace (buyer side) |
| LIVE integrations catalog | Today hub + digital twin simulation (BETA) |
| Multi-location at scale (proven) | Multi-location schema + dashboard (partial sales-safe) |

**Safe talk track:** *"Lightspeed has proven multi-site deployments. We match on schema ambition but not on LIVE integrations or customer proof yet."*

---

## Feature parity table (selected)

From `salesSafeFeatures` in competitor tracker — **partial** unless noted.

| Feature area | OS Kitchen | Toast/Square/Lightspeed (typical) | Sales-safe? |
|--------------|------------|-----------------------------------|:-----------:|
| KDS bump/recall | Shipped — not rush-hour certified | Mature | Partial |
| Delivery ingest (DD/Uber/GH) | BETA wiring | LIVE for customers | Partial |
| Offline mode | Cash queue only | Varies — often stronger | Partial |
| Multi-location dashboard | PlanGate | Mature | Partial |
| Bill splitting | **YES** (audit) | Mature | **Yes** |
| AI scheduling | Partial / rules | Varies | Partial |
| Marketplace / vendor buying | BETA scaffold | Toast xtraCHEF / third-party | Partial |
| Enterprise SSO | Pilot foundation | Production | No (roadmap) |

Full ledger: [`artifacts/competitor-feature-tracker.json`](../artifacts/competitor-feature-tracker.json) — use `salesSafeFeatures` for GTM, not `engineeringDelivery`.

---

## What to say in sales calls

**Do say:**
- "We're engineering-complete on seven AI modules; pilot proof and LIVE integrations are the current gap."
- "Compare us on unified order-to-fulfillment + B2B marketplace vision — not on payment terminal market share."
- "Our Integration Health and BETA badges show what's live vs preview — ask us to screen-share that."

**Do not say:**
- "We beat Toast/Square on everything."
- "Production-certified integrations."
- "Thousands of customers" or named logos without signed case study.

---

## Evidence checklist before competitive claims

| Claim type | Required evidence |
|------------|-------------------|
| Feature parity | `salesSafeVerdict: yes` or documented partial caveat |
| AI leadership | [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) + module maturity |
| Integration parity | [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) LIVE gate |
| Customer win | Signed LOI or case study — none today |
| vs Toast hardware | Acknowledge gap — software-first story only |

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before updating compare pages.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | AI differentiation |
| [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md) | Camera vs vision vendors |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | First customer path |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | Live-call battle cards BC1–BC8 (+ BC-S1–S3 supplementary) |
| [`toast-gap-analysis.md`](./toast-gap-analysis.md) | Deep Toast analysis (Task 93) |
