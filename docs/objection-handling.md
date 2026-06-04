# Objection handling — sales playbook

**Policy:** `objection-handling-mkt23-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE, CS — discovery, demo, and follow-up calls  
**Status:** canonical response library · supersedes short notes in [`OBJECTION_HANDLING_ADVANCED.md`](./OBJECTION_HANDLING_ADVANCED.md)  
**Honesty:** [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

Twelve core objections with **acknowledge → honest response → redirect → disqualify if needed**. Never overcome an objection by overpromising LIVE integrations, customer proof, or compliance.

---

## Response framework (LAER)

| Step | Action |
|------|--------|
| **L — Listen** | Let them finish; note exact words in CRM |
| **A — Acknowledge** | Validate concern without agreeing to false premise |
| **E — Explore** | One clarifying question if needed |
| **R — Respond** | Honest scope + redirect to fit or pass |

**Disqualify early** when objection reveals hard requirement we cannot meet in 90-day pilot (production SSO, offline card day-one, Toast hardware parity).

---

## Twelve core objections

### O1 — "We already use Toast / Square / Lightspeed"

| Field | Content |
|-------|---------|
| **Heard from** | Full-service dine-in, hardware-led buyers |
| **Acknowledge** | "Toast and Square own in-venue hardware and payments scale — that's real." |
| **Respond** | "OS Kitchen targets operators who **own fulfillment** across Shopify, phone, and delivery — order hub, production, packing, and honest Integration Health. We're software-first on tablets you have — not a terminal replacement." |
| **Redirect** | [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) · [`software-first-pos-positioning.md`](./software-first-pos-positioning.md) |
| **Disqualify if** | Primary ask is proprietary terminal + table service floor plan day one |

---

### O2 — "We already use Shopify / WooCommerce"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Keep Shopify for checkout — we don't replace your storefront." |
| **Respond** | "OS Kitchen coordinates **after the order arrives**: production quantities, KDS, packing, and owner Today view. Shopify/Woo import paths are **BETA** — Integration Health shows PASS, BETA, or SKIPPED honestly." |
| **Redirect** | `/shopify` · [`shopify-bundle-sales-guide.md`](./shopify-bundle-sales-guide.md) |
| **Disqualify if** | They need Shopify App Store OAuth listing today with zero custom app setup |

---

### O3 — "Square is free — why pay for OS Kitchen?"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Square's entry pricing is aggressive on payments-led POS." |
| **Respond** | "Compare **admin hours**, mis-picks, refund cost, and limited weekly capacity — not sticker price alone. Starter tier targets smaller weekly ops; pilot pricing is transparent on `/pricing`. We don't claim to beat Square on payment processing scale." |
| **Redirect** | [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) |
| **Do not say** | "We're cheaper than Square" · "Free tier matches Square" |

---

### O4 — "You have no customers / no proof"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Correct — **0 signed founding customers** as of June 2026. We don't use fake logos." |
| **Respond** | "We're recruiting **design partners** with weekly feedback, staging workspace, and optional pilot credit. Engineering tracker is strong; **market proof is the pilot we're building together** — LOI is non-binding until you're comfortable." |
| **Redirect** | [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) · [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| **Do not say** | "Thousands of restaurants" · unnamed "leading brands" |

---

### O5 — "Integrations aren't live / SKIPPED rows"

| Field | Content |
|-------|---------|
| **Acknowledge** | "SKIPPED means we haven't run staging smoke — not a fake green tile." |
| **Respond** | "That's intentional honesty. **Integration Health** is our moat: you see maturity before go-live. Woo/Shopify are setup-ready; delivery marketplaces are partner-gated **BETA**. We screen-share SKIPPED during demos so week three isn't a surprise." |
| **Redirect** | `/trust` · [`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md) (MKT-27) |
| **Do not say** | "Everything is live" · "Uber Eats official partner" |

---

### O6 — "We need offline POS / card when Wi-Fi drops"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Offline card capture matters for some counter operators." |
| **Respond** | "OS Kitchen counter POS is **network-dependent** today — cash/mark-paid queue where documented. Offline card is roadmap, not pilot SOW. Many meal-prep and ghost-kitchen operators are preorder-heavy with reliable connectivity." |
| **Redirect** | [`offline-pos-plan.md`](./offline-pos-plan.md) · keep existing terminal for in-venue if needed |
| **Disqualify if** | Offline card is non-negotiable day one |

---

### O7 — "We need SSO / SOC 2 / enterprise compliance"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Enterprise buyers rightfully ask about SSO and attestations." |
| **Respond** | "SSO/SCIM and SOC 2 Type II are **roadmap** — email/password pilot with tenant isolation today. Staging SSO smoke exists; not production-certified for all tenants. We won't sign attestation language we can't meet in 90 days." |
| **Redirect** | [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) · `/legal/security` |
| **Disqualify if** | RFP requires production SSO + SOC2 in pilot term |

---

### O8 — "My staff won't learn another system"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Change fatigue is real in kitchens." |
| **Respond** | "We split **kitchen, packing, and manager** workflows — KDS bump is one action. Pilot includes CS weekly sync and quick-start path. Training mode and role-based nav reduce noise vs dumping 566 routes on line cooks." |
| **Redirect** | [`customer-success-playbook.md`](./customer-success-playbook.md) · `/dashboard/quick-start` |
| **Do not say** | "Zero training required" |

---

### O9 — "Too complex / too many features"

| Field | Content |
|-------|---------|
| **Acknowledge** | "The codebase is broad — we hide preview routes in pilot nav profile." |
| **Respond** | "Pilot scope is **order hub + KDS + production** first — not every module day one. Today Command Center is the owner entry; we don't require marketplace or AI modules in week one." |
| **Redirect** | [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) |
| **Do not say** | "One click setup" · "Launch in 15 minutes" unverified |

---

### O10 — "Uber Eats / DoorDash already sends orders"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Aggregators deliver demand — they don't run your kitchen line." |
| **Respond** | "OS Kitchen executes **after ingest**: KDS, production board, packing, margin view. Direct marketplace APIs are **partner-gated BETA** — many operators consolidate via Woo/Shopify or manual hub until smoke PASS." |
| **Redirect** | Order Hub demo segment in [`demo-script-15min.md`](./demo-script-15min.md) |
| **Do not say** | "Unified delivery ops live today" |

---

### O11 — "We don't trust AI / AI is hype"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Restaurant AI marketing is noisy — skepticism is healthy." |
| **Respond** | "Our **daily briefing is deterministic** — rules + your data, not black-box AGI. Seven modules each carry **BETA/pilot_ready labels** on `/ai`. Food cost and purchasing require **human approval** — nothing auto-runs." |
| **Redirect** | `/ai` · [`ai-honesty-policy.md`](./ai-honesty-policy.md) |
| **Do not say** | "AI guarantees savings" · "autonomous manager" |

---

### O12 — "Spreadsheets work fine"

| Field | Content |
|-------|---------|
| **Acknowledge** | "Spreadsheets are flexible — until volume breaks them." |
| **Respond** | "Import CSV today; move to production/packing when validated. Design partners often keep sheets for finance while OS Kitchen owns **order → kitchen → pack** spine." |
| **Redirect** | CSV import path · phased pilot scope |
| **Disqualify if** | <20 orders/week and no growth intent |

---

## Quick reference matrix

| ID | Objection (short) | Primary doc |
|----|-------------------|-------------|
| O1 | Toast/Square/Lightspeed | competitor-comparison-honest |
| O2 | Already on Shopify/Woo | shopify-bundle-sales-guide |
| O3 | Square is free | transparent-pricing-sales-guide |
| O4 | No customers | design-partner sequence |
| O5 | SKIPPED integrations | trust + limitation sheet |
| O6 | Offline POS | offline-pos-plan |
| O7 | SSO/SOC2 | enterprise-mvp-spec |
| O8 | Staff adoption | customer-success-playbook |
| O9 | Too complex | pilot-execution-checklist |
| O10 | Aggregators enough | demo-script-15min |
| O11 | AI hype | /ai |
| O12 | Spreadsheets fine | CSV import / phased pilot |

---

## Forbidden responses (when handling objections)

Never "overcome" by claiming:

| Forbidden | Why |
|-----------|-----|
| "We have thousands of customers" | False |
| "All integrations are live" | False |
| "We beat Toast on everything" | Dishonest |
| "Guaranteed ROI in 90 days" | Unverifiable |
| "SOC 2 certified" | Not attested |
| "Offline mode ships next month" unless roadmap confirmed | Date overpromise |
| "I'll get engineering to commit LIVE Uber this week" | Partner-gated |

Run: `lintObjectionHandlingCopy()` on custom talk tracks.

---

## CRM logging

| Field | Example |
|-------|---------|
| `objection_primary` | O5_integrations_skipped |
| `objection_verbatim` | Prospect exact quote |
| `response_used` | O5 standard + Integration Health screen-share |
| `outcome` | advanced_demo · nurture · disqualified |
| `disqualifier` | offline_pos · enterprise_sso · null |

Log in growth CRM (`objections` field on onboarding calls) within 24h of call.

---

## Call placement

| Call type | When to use |
|-----------|-------------|
| [`discovery-call-script.md`](./discovery-call-script.md) | Block 3 qualification surfaces O6, O7 early |
| [`demo-script-15min.md`](./demo-script-15min.md) | O5 during Integration Health segment |
| Follow-up email | Attach [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) when O4 or O5 raised |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`OBJECTION_HANDLING_ADVANCED.md`](./OBJECTION_HANDLING_ADVANCED.md) | Legacy short notes — see this doc first |
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | Post-call attachment |
| [`forbidden-claims-training.md`](./forbidden-claims-training.md) | Certification before calls |
| [`pilot-proposal-template.md`](./pilot-proposal-template.md) | Post-objection proposal path (MKT-24) |

**Primary CTA after resolved objection:** [`/book-demo?utm_source=objection&utm_medium=sales&utm_campaign=objection-handling-mkt23`](/book-demo?utm_source=objection&utm_medium=sales&utm_campaign=objection-handling-mkt23)
