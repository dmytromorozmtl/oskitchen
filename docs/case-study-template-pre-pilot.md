# Pre-pilot case study template — founder story edition

**Policy:** `case-study-template-pre-pilot-absolute-final-v1`  
**Status:** **Pre-pilot only** — no signed LOI, no customer metrics, no public publish  
**Updated:** 2026-06-06  
**Owner:** Founder + Marketing  
**Audience:** Investor deck, design-partner outreach, `/book-demo` follow-up, internal GTM  
**Upgrade path:** [`case-study-template.md`](./case-study-template.md) after pilot metrics + customer approval  
**Related:** [`founding-customer-story.md`](./founding-customer-story.md) · [`loi-signed.md`](./loi-signed.md) · [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md)

OS Kitchen has **zero published case studies** and **zero signed LOIs** (June 2026). This template is the **honest pre-pilot narrative**: founder origin story + operator archetype — **not** a fabricated customer win.

Use for decks, founder LinkedIn, and design-partner emails. **Do not** present as a customer case study until [`case-study-template.md`](./case-study-template.md) gates pass.

**Fill-in scaffold:** [`case-studies/_PRE_PILOT_TEMPLATE.md`](./case-studies/_PRE_PILOT_TEMPLATE.md)

---

## When to use (vs post-pilot template)

| Situation | Use this pre-pilot template | Use post-pilot template |
|-----------|----------------------------|-------------------------|
| No signed LOI yet | Yes | No |
| Investor / prospect asks "who uses this?" | Yes — founder story + archetype | No customer names |
| Design partner outreach email | Yes — CTA section | No |
| Pilot Week 4 with verified metrics | No | Yes — [`case-study-template.md`](./case-study-template.md) |
| Website `/customers` page | No until approval gates | Yes |

---

## Pre-pilot case study template — structure

Copy [`case-studies/_PRE_PILOT_TEMPLATE.md`](./case-studies/_PRE_PILOT_TEMPLATE.md) for a one-page deck sidebar or blog draft.

| Section | Purpose | Customer data allowed? |
|---------|---------|------------------------|
| Founder story | Why OS Kitchen exists — **founder voice** | No customer names |
| Operator archetype | ICP profile — **segment**, not a fake operator | Anonymized segment only |
| Before pilot | Industry pain from discovery patterns | Qualitative — no fabricated stats |
| Why we're building OS Kitchen | Product pillars with BETA labels | Engineering evidence only |
| Design partner call to action | LOI / book-demo invite | Program status honest |
| Upgrade path | Checklist to post-pilot case study | Internal |

---

## Founder story

### The problem we saw

Multi-channel food operators — commissaries, ghost kitchens, meal-prep brands — run production and fulfillment across storefronts, spreadsheets, and channel tools with **no single order-to-kitchen truth**. Integration status is opaque; AI vendors sell dashboards without operational grounding. The founder observed operators copying orders between Shopify, WhatsApp, and paper tickets daily — error cost rising before revenue justifies Toast-scale hardware.

**Sales-safe one-liner:**

> We built OS Kitchen because production kitchens need an operating system — not another POS brochure with hidden BETA integrations.

### Why we built before the first customer

| Pillar | What exists (June 2026) | Honest caveat |
|--------|---------------------------|---------------|
| **Today Command Center** | `/dashboard/today` — briefing, alerts, jump links | Pilot KPIs not captured |
| **Order hub → KDS → packing** | Unified codebase path | Not rush-hour certified |
| **Seven AI modules** | Engineering complete per `ai-moats-tracker.json` | BETA / preview — not AGI |
| **B2B marketplace buyer** | Catalog → PO scaffold | BETA; vendor seeding |
| **Integration Health UI** | SKIPPED / BETA visible in product | **0 LIVE** third-party integrations |
| **Honest claims posture** | Forbidden-claims CI, limitation sheet | Pre-revenue, bus factor 1 |

This is **build-first, market-unproven** — the founder story is product depth and honesty, not customer logos.

### Founder quote

> *"I'd rather show a operator exactly what's BETA than pretend we're Toast on day one. OS Kitchen is the kitchen OS I wished existed when commissary operators were duct-taping Shopify to spreadsheets — we're recruiting the first design partners to prove it together."*  
> — **[Founder name]**, Founder, OS Kitchen · **June 2026 · not a customer testimonial**

**Label rule:** Always mark founder quotes as **founder**, never as operator voice.

### What changes after the first pilot

| Milestone | Story upgrade |
|-----------|---------------|
| Signed LOI | Add anonymized design partner section — internal only |
| Pilot Week 1 complete | Reference [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) milestones qualitatively |
| Metrics baseline PASS | Migrate to [`case-study-template.md`](./case-study-template.md) § Results |
| Customer written approval | Named or anonymized quote replaces founder quote block |
| Gate C convert | Publish on `/customers` per `lib/marketing/case-studies.ts` |

---

## Operator archetype

Describe the **ICP segment** — not a fabricated business.

| Field | Pre-pilot value (example) |
|-------|---------------------------|
| **Segment** | Commissary / ghost kitchen / meal-prep operator |
| **Scale** | 1–3 locations · $500K–$3M revenue band |
| **Channels** | Storefront + Woo/Shopify + manual phone orders |
| **Pain pattern** | Orders copied to spreadsheets · no KDS truth · opaque channel sync |
| **Why they fit** | Production complexity > counter-only POS |
| **Name / city** | **Withheld** until LOI + approval |

**Forbidden:** Inventing "Riverbend Kitchen, Denver" or stock photos labeled as customers.

Reference: [`icp-definition-final.md`](./icp-definition-final.md) · [`loi-design-partner-template.md`](./loi-design-partner-template.md)

---

## Before pilot

Write 2–3 paragraphs on **industry-before** — discovery themes, not fake operator metrics.

- **Order chaos:** Channels siloed; no unified production queue  
- **Production planning:** Manual batching; cutoff errors  
- **Line visibility:** Paper tickets; missed bumps  
- **Integration risk:** Silent channel failures; no health score  

| Metric | Pre-pilot template |
|--------|-------------------|
| Orders/week | **Not claimed** — use "operators report 200–800/week in discovery" only if sourced |
| Tools in stack | POS + ecommerce + spreadsheets (typical pattern) |
| Customer count using OS Kitchen | **0** |

---

## Why we're building OS Kitchen

Pick **3 pillars** aligned with honest registry — same table as post-pilot template but **no before/after numbers**.

| Pillar | Pre-pilot narrative | Label |
|--------|---------------------|-------|
| Unified Order Hub | One queue from storefront + channels | BETA |
| Today Command Center | Owner daily briefing | Qualified |
| KDS + production board | Kitchen truth | Qualified — not rush-hour SLA |
| Integration Health | Visible SKIPPED / BETA | BETA |
| AI modules (7) | Briefing, costing, purchasing, etc. | BETA / preview |

**Differentiation paragraph (sales-safe):**

> Unlike incumbents leading with hardware terminals, OS Kitchen leads with kitchen and fulfillment depth plus seven AI modules in one platform — with visible maturity labels. We're early on customers and LIVE partner proof; we're strong on unified ops scaffolding.

See [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) · [`competitive-battle-cards.md`](./competitive-battle-cards.md)

---

## Design partner call to action

**Approved CTA block (copy-paste):**

> OS Kitchen is recruiting **founding design partners** — commissaries, ghost kitchens, and meal-prep operators who want a unified kitchen OS with honest BETA labels. 90-day pilot on staging → production, weekly product feedback, direct founder line. No customer logos yet; yes to order hub, Today briefing, and qualified channel wiring.  
> **Next step:** [`/book-demo`](/book-demo) · LOI template: [`loi-design-partner-template.md`](./loi-design-partner-template.md)

| Channel | Pre-pilot usage |
|---------|-----------------|
| Investor deck | Founder story + archetype + "program open" |
| Outbound email | Design partner CTA — attach limitation sheet |
| Website | "Design partners welcome" — not logo bar |
| LinkedIn | Founder build-in-public — product screenshots only |

---

## Short form (deck sidebar — pre-pilot)

```markdown
**OS Kitchen — founding design partner program (June 2026)**

**Challenge (industry):** Multi-channel operators duct-tape storefronts, spreadsheets, and POS — no kitchen OS.

**Solution (building):** Order hub → KDS → production → packing + Today Command Center + 7 AI modules (BETA).

**Results:** Pilot program open — **no verified customer metrics yet**.

**Quote:** Founder vision quote only — see Founder story § Founder quote.
```

---

## Upgrade to post-pilot case study

When first pilot completes baseline capture:

| # | Step | Artifact |
|---|------|----------|
| 1 | Confirm LOI + SOW signed | `artifacts/pilot-gono-go-summary.json` |
| 2 | Complete Week 1 roadmap | [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) |
| 3 | Run metrics baseline smoke | `npm run smoke:pilot-metrics-baseline` → `overall: PASSED` |
| 4 | Copy post-pilot template | [`case-studies/_TEMPLATE.md`](./case-studies/_TEMPLATE.md) |
| 5 | Replace founder quote with **signed operator quote** | Legal approval |
| 6 | Run case study draft smoke | `npm run smoke:pilot-case-study-draft` |
| 7 | Publish only after permission gate | `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` |

**Canonical post-pilot doc:** [`case-study-template.md`](./case-study-template.md) (MKT-11)

---

## Forbidden pre-pilot claims

Never present pre-pilot template as a customer win:

| Forbidden | Use instead |
|-----------|-------------|
| "Our customer X…" | "Design partner program open" |
| "Case study proves…" | "Pre-pilot founder story — metrics TBD" |
| "Thousands of operators" | "Pre-revenue · founding partner program" |
| "Proven ROI" / "Saved $X" | Illustrative calculator with footnote |
| "Live DoorDash / Uber Eats" | Integration Health SKIPPED honesty |
| Stock photo as customer kitchen | Product screenshots · demo tenant |
| Founder quote styled as operator testimonial | Label **Founder**, not customer |

Lint: `lintCaseStudyPrePilotCopy` in [`case-study-template-pre-pilot-policy.ts`](../lib/marketing/case-study-template-pre-pilot-policy.ts)  
CI: `npm run test:ci:case-study-template-pre-pilot`

---

## Related commands

```bash
npm run test:ci:case-study-template-pre-pilot
npm run test:ci:case-study-template          # MKT-11 post-pilot template
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## Related docs

| Doc | Use |
|-----|-----|
| [`founding-customer-story.md`](./founding-customer-story.md) | Extended origin narrative |
| [`case-study-template.md`](./case-study-template.md) | Post-pilot long form (MKT-11) |
| [`pilot-case-study-draft-era17.md`](./pilot-case-study-draft-era17.md) | Internal draft wiring |
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | Attach to outreach |
| [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) | First pilot timeline |
