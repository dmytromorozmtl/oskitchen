# Sales limitation sheet

**Policy:** `sales-limitation-sheet-v1`  
**Updated:** 2026-06-02  
**Audience:** Sales, CS, design partners, qualified prospects  
**Owner:** Founder + Sales  
**Companion docs:** [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`CAPABILITY_SIGNOFF_SALES.md`](./CAPABILITY_SIGNOFF_SALES.md) · [`beta-to-live-roadmap.md`](./beta-to-live-roadmap.md)

**Purpose:** One-page honesty sheet to attach after discovery or demo. Lists **what OS Kitchen does not commit to today** — so pilots start with aligned expectations. This is not a contract; the paid pilot SOW and LOI supersede for legal scope.

**How to use:** Email or share link in follow-up. Read aloud the top three limitations on every first demo close. When a prospect asks “Can you do X?”, search this doc before answering.

---

## Snapshot (June 2026)

| Dimension | Today | Safe to promise in pilot SOW |
|-----------|-------|------------------------------|
| Paying customers / case studies | **0 signed** | Design-partner feedback only |
| Third-party integrations **LIVE** | **0** (7 BETA, 1 PLACEHOLDER) | BETA with Integration Health caveat |
| B2B HoReCa marketplace | **BETA scaffold** | Catalog/checkout path with seeded vendors |
| Enterprise SSO / SOC2 Type II | **Not production** | Email/password pilot; roadmap Q4+ |
| 24/7 support SLA | **Not default** | Business-hours email unless contracted |
| AI modules | **7 in codebase** | Each module qualified maturity — not AGI |

---

## Section 1 — Integrations & channels

### Not LIVE today (do not sell as production-certified)

| Integration / channel | Status | Limitation | Say instead |
|----------------------|--------|------------|-------------|
| DoorDash, Grubhub, Uber Eats | BETA | Partner credentials + smoke proof required | “Qualified beta — not live marketplace ops” |
| Uber Direct | PLACEHOLDER | No production dispatch path | “On roadmap — not available for go-live” |
| QuickBooks, Xero | BETA | OAuth + export — no tax/accounting advice | “Connector in beta; your accountant validates books” |
| 7shifts, Homebase | BETA | Staff sync — not full HRIS | “Labor sync beta; not payroll replacement” |
| WooCommerce / Shopify | pilot_ready, smoke SKIPPED | Test-shop golden path; vault pending | “Setup-ready — staging smoke before prod claim” |

**Promotion order (when LIVE matters):** WooCommerce → DoorDash → QuickBooks — see [`beta-to-live-roadmap.md`](./beta-to-live-roadmap.md).

### Channel limitations

| Limitation | Detail |
|------------|--------|
| No “all delivery apps connected” | Consolidate via Woo/Shopify or manual orders |
| No bidirectional inventory at scale | POS recipe depletion certified; cross-channel sync unproven |
| No unified gift card / loyalty across POS + storefront | Separate ledgers — dual balance |
| Shopify Markets deep sync | Code exists; live tenant smoke not PASS |

---

## Section 2 — POS & in-venue operations

| Limitation | Detail |
|------------|--------|
| **No offline POS** | Counter POS requires network; cash/mark-paid queue only where documented |
| **No Stripe Terminal / proprietary hardware** | Browser/tablet POS — not Toast/Square terminal parity |
| **No rush-hour KDS certification** | KDS shipped; no ops sign-off at peak volume |
| **No floor-plan realtime occupancy** | Layout editor BETA — not live table state |
| **Handheld ordering** | PWA BETA — not dedicated rugged handheld fleet |

**Redirect:** Operators needing offline card capture or proprietary terminals should keep existing hardware for in-venue; OS Kitchen leads on **preorder, production, packing, and multi-channel hub**.

---

## Section 3 — AI & automation

| Module | Limitation |
|--------|------------|
| **Kitchen Camera AI** | Preview/synthetic mode default — no live camera = no detection claims |
| **AI Restaurant Brain / Daily briefing** | Deterministic rules + templates — not autonomous agent |
| **Digital Twin, Menu Engine, Purchasing** | BETA maturity — human approval gates remain |
| **Food Cost AI** | Recipe costing — not guaranteed margin outcomes |
| **Benchmark Network** | Cohort comparisons — not industry-certified benchmarks |

**Never say:** “100% accurate,” “always correct,” “untouchable moat,” “replaces your manager.”

**Always say:** “Seven proprietary modules in production at qualified maturity — pilot proof in progress.”

Full module copy: [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

---

## Section 4 — B2B marketplace (buyer & vendor)

| Limitation | Detail |
|------------|--------|
| Not a national supplier network | 3–5 seed vendors target — design partners only until seeded |
| Vendor payouts | Stripe Connect BETA — flag off by default |
| Instant vendor payouts | Roadmap only (Task 116) |
| Migration dependency | `marketplace_core` migration must be applied |
| Empty catalog default | Categories seed ≠ products — vendor onboarding required |

**Safe pilot scope:** Buyer catalog → cart → checkout → PO on staging with seeded vendors — not open marketplace launch.

Reference: [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md)

---

## Section 5 — Enterprise & compliance

| Topic | Limitation |
|-------|------------|
| **SSO (SAML/OIDC)** | Pilot foundation — not production enterprise SSO |
| **SCIM / directory sync** | Not shipped |
| **SOC 2 Type II** | Security program documented — **no attestation claimed** |
| **HIPAA / PCI scope** | Stripe handles card data; OS Kitchen is not a PCI QSA substitute |
| **Data residency guarantees** | Standard cloud regions — custom residency by contract only |
| **Legal hold / e-discovery** | Basic audit logs — not full enterprise archive |

Enterprise RFPs: qualify against [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) when published (Task 103) — default to pilot tier.

---

## Section 6 — Support & operations

| Limitation | Detail |
|------------|--------|
| **Support hours** | Email + in-app — not 24/7 unless SOW adds tier |
| **Implementation** | Paid pilot = white-glove onboarding — not unlimited free setup |
| **Uptime SLA** | Best-effort pilot — formal SLA at GA only |
| **Custom integrations** | Out of scope unless SOW + engineering estimate |
| **Training** | Documentation + sync calls — not on-site fleet training default |

Incident severity and response: [`incident-response-process.md`](./incident-response-process.md) when published (Task 61).

---

## Section 7 — Financial & ROI claims

| Do not claim | Rule |
|--------------|------|
| Guaranteed food cost % reduction | ROI calculator = **illustrative** assumptions |
| Guaranteed labor savings | AI scheduling = heuristic assist |
| Loan approval / instant funding | Capital page = third-party resources — OS Kitchen does not lend |
| Pre-approved credit offers | Forbidden in CI |
| Customer-proven metrics | **0 case studies** — no “operators save X hours” without named proof |

Attach ROI outputs with footnote: *Internal model — not customer case study.*

---

## Section 8 — Competitive positioning limits

| Limitation | Detail |
|------------|--------|
| vs Toast / Square / Lightspeed | Honest wins only — not “better at everything” |
| Customer logos | None without signed case study |
| Hardware parity | Software-first — no proprietary terminal fleet |
| Integration count | Do not imply LIVE count > registry LIVE rows |

Reference: [`competitor-comparison-honest.md`](./competitor-comparison-honest.md)

---

## Quick response scripts

**Integrations:**  
> “We show Integration Health on every connector — BETA means code exists, LIVE means production proof with your credentials. Today we have zero third-party LIVE integrations; WooCommerce is first in our promotion queue.”

**AI:**  
> “Seven AI modules are real product surfaces, not a chatbot wrapper. Kitchen camera stays in preview until you connect a stream. We don’t claim AGI or perfect predictions.”

**Marketplace:**  
> “B2B supply marketplace is in qualified beta — buyer checkout works with seeded vendors; we’re not claiming a national supplier network yet.”

**Enterprise:**  
> “Email/password pilot today. SSO and SOC2 Type II are roadmap — we won’t put them in your SOW until engineering sign-off.”

**When out of scope:**  
> “That’s outside our pilot commitment. Here’s our limitation sheet — let’s scope what we can prove in 90 days.”

---

## Pre-SOW checklist (sales)

Before sending pilot contract, confirm prospect acknowledges:

| # | Limitation acknowledged | ☐ |
|---|-------------------------|:-:|
| 1 | 0 LIVE third-party integrations unless written exception with smoke proof | ☐ |
| 2 | BETA labels on delivery, accounting, labor connectors | ☐ |
| 3 | No offline POS / no proprietary payment terminal | ☐ |
| 4 | AI modules = assistive, not autonomous | ☐ |
| 5 | Marketplace = pilot scope only if in SOW | ☐ |
| 6 | No customer ROI guarantees | ☐ |
| 7 | Support = business hours unless tier purchased | ☐ |

Store acknowledgment in CRM note or LOI §2 ([`loi-design-partner-template.md`](./loi-design-partner-template.md)).

---

## Document hierarchy

| Doc | Use when |
|-----|----------|
| **This sheet** | Prospect honesty — post-demo attachment |
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Internal sales training + CI alignment |
| [`CAPABILITY_SIGNOFF_SALES.md`](./CAPABILITY_SIGNOFF_SALES.md) | Approved-to-sell matrix (May 2026) |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | Engineering LIVE promotion |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Binding pilot scope |

**If documents conflict:** pilot SOW > LOI > this sheet > marketing pages.

---

## Related tasks

| Task | Doc |
|------|-----|
| 53 | `sales-safe-claims-registry.md` |
| 57 | `beta-to-live-roadmap.md` |
| 60 | `pilot-acceptance-criteria.md` |
| 100 | `ai-honesty-policy.md` |

---

*Version 1.0 · June 2026 · Review monthly or after any LIVE integration promotion.*
