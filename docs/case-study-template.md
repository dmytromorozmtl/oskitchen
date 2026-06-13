# Case study template — OS Kitchen

**Policy:** `case-study-template-v1` · **MKT-11 code:** `case-study-template-mkt11-v1` ([`lib/marketing/case-study-template-policy.ts`](../lib/marketing/case-study-template-policy.ts))  
**Status:** Canonical template — **internal use until publish gates pass**  
**Updated:** 2026-06-02  
**Owner:** Marketing + CS + Legal  
**Audience:** GTM, Sales, CS, Founder  
**Related:** [`founding-customer-story.md`](./founding-customer-story.md) · [`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) · [`case-study-template-p2-50.md`](./case-study-template-p2-50.md) · [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) · [`feature-announcement-template.md`](./feature-announcement-template.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)  
**Proof wiring:** [`pilot-case-study-draft-era17.md`](./pilot-case-study-draft-era17.md) · [`pilot-week1-checklist.md`](./pilot-week1-checklist.md)  
**Code surface:** `lib/marketing/case-studies.ts` → `/case-studies/[slug]`  
**Legacy (non-canonical):** [`templates/CASE_STUDY_TEMPLATE.md`](./templates/CASE_STUDY_TEMPLATE.md)

---

## Before you write

OS Kitchen has **no published customer case study** as of June 2026 (`loiSignedDate: null` in [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)). This template is the **fill-in scaffold** for the first signed pilot — not marketing copy you can ship today.

**Pre-pilot (no LOI yet):** use [`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) for founder story + design partner outreach — not this doc.

**Milestone scaffold (W1/M1/M3):** use [`case-study-template-p2-50.md`](./case-study-template-p2-50.md) + [`case-studies/_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md) for Challenge → Solution → Results checkpoints.

| Customer stage | Case study usage | See |
|----------------|------------------|-----|
| Design partner (LOI) | Internal draft only — no public name | [`founding-customer-story.md`](./founding-customer-story.md) |
| Paid pilot | Anonymized draft OK with “pilot” badge | Gate A–B in [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) |
| Convert (Gate C) | Named or anonymized **candidate** | Gate C — convert does **not** auto-unlock publish |
| Reference customer (≥90d paid + approval) | Website, ads, investor deck | Separate marketing sign-off below |

| Gate | Requirement | Artifact / command |
|------|-------------|-------------------|
| Pilot live | GO or CONDITIONAL in GO evaluator | `artifacts/pilot-gono-go-summary.json` |
| Agreement | Signed pilot SOW / LOI | [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| Close | Gate C convert (optional for anonymized pilot story) | [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) § Gate C |
| Metrics | Verified dashboard exports only | `npm run smoke:pilot-metrics-baseline` → `overall: PASSED` |
| Permission | Written case study release | `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` or `anonymized_signed` |
| Claims | No forbidden outcomes | `npm run smoke:pilot-forbidden-claims-enforcement` |
| Publish | Internal draft smoke PASS | `npm run smoke:pilot-case-study-draft` |

**Until all gates pass:** keep `[TBD]` placeholders; label targets as `(target)`; do not name customers on `/customers`, deck, or blog.

**Mid-pilot never unlocks:** Case studies, investor KPI slides, or LIVE integration claims — even if Gate B is ACCEPT.

---

## File naming

When a pilot is ready for internal draft:

```
docs/case-studies/<slug>-draft.md          # internal review — copy from _TEMPLATE.md
docs/case-studies/_TEMPLATE.md             # MKT-11 fill-in scaffold
docs/case-studies/<slug>-published.md      # after legal + customer sign-off
public/customers/<slug>/page.tsx           # optional — action 27+ GTM
artifacts/case-study-<slug>-summary.json   # metrics + approval audit trail
```

**Slug examples:** `meal-prep-denver-anon`, `ghost-kitchen-toronto-named`

---

## Publish to web (`lib/marketing/case-studies.ts`)

After internal draft + legal approval, add an entry to `RAW_CASE_STUDIES` in [`lib/marketing/case-studies.ts`](../lib/marketing/case-studies.ts):

| Field | Pilot (pre-permission) | Published (post-approval) |
|-------|------------------------|---------------------------|
| `status` | `"pilot"` | `"published"` |
| `heroMetric` / outcomes | Must include `(target)` suffix | Verified numbers only |
| `attribution` | `"Pilot operator (permission pending)"` | Signed name + title |
| `quote` | Placeholder or composite — label clearly | Exact signed wording |
| Page badge | Amber “Coming Q3 — metrics are targets” | Remove badge |

**Disclaimer:** `CASE_STUDIES_DISCLAIMER` renders on list pages — keep aligned with honest scope.

**SEO:** Add slug to `lib/marketing/sitemap-urls.ts` when `status: "published"`.

**Launch comms:** Use [`feature-announcement-template.md`](./feature-announcement-template.md) Type B (pilot milestone) — not Type D LIVE.

---

## Short form (sales email / deck sidebar)

Use **after** metrics gate PASS only.

```markdown
**[Operator name OR "Anonymized meal prep operator, US Midwest"]**
[Segment] · [1–3 locations] · [Plan tier]

**Challenge:** [1 sentence — channel chaos, manual production, packing errors]

**Solution:** OS Kitchen [modules actually used — e.g. Order Hub + KDS + storefront]

**Results (pilot window, verified):**
- Orders/day: [before] → [after] ([Δ%])
- Median bump time: [X] min → [Y] min
- Integration health score: [before] → [after]/100

**Quote:** "[One sentence — operator voice, signed release]"
```

---

## Long form (web / PDF / `/customers`)

Copy this section into `docs/case-studies/<slug>-draft.md` and replace `[TBD]` cells.

---

### Header block

| Field | Value |
|-------|-------|
| **Title** | [How {Operator} unified preorder + kitchen ops with OS Kitchen] |
| **Subtitle** | [Segment-specific one-liner] |
| **Customer** | [Legal name] OR **Anonymized** ([segment], [region]) |
| **Permission** | ☐ named signed ☐ anonymized signed |
| **Pilot dates** | [Start] – [End or "ongoing"] |
| **Author / reviewer** | [GTM owner] · [CS owner] · [Legal date] |

---

### 1 — At a glance (hero stats)

> **Only verified numbers.** Source each stat in the metrics table footer.

| Stat | Value | Source |
|------|-------|--------|
| Orders/day (pilot week) | [TBD] | `pilot-metrics-baseline` · Week 1 Day 5–7 |
| Median bump time | [TBD] min | KDS telemetry / pilot checklist |
| Integration health score | [TBD]/100 | `/dashboard/integrations/health` export |
| Time to first live order | [TBD] | Launch Wizard / onboarding log |

**Optional (if captured):** checkout success %, packing error rate, hours saved on coordination.

---

### 2 — Customer profile

**Segment:** ☐ Meal prep ☐ Ghost kitchen ☐ Weekly preorder brand ☐ Catering ☐ Café / QSR  

**ICP fit:** ☐ $500K–$3M revenue ☐ 1–3 locations ☐ Preorder/production complexity  

**Location:** [City, Region] or **Withheld (anonymized)**  

**Team size:** [FTE kitchen + ops]  

**Channels before pilot:** ☐ Walk-in ☐ Storefront ☐ WooCommerce ☐ Shopify ☐ Delivery apps ☐ Phone/WhatsApp  

**Plan:** Starter | Pro | Team (pilot pricing per SOW)

---

### 3 — The challenge (Before)

Write 2–4 short paragraphs from **discovery notes** — not invented pain.

- **Order chaos:** [TBD — e.g. orders split across spreadsheet, POS, WhatsApp]
- **Production planning:** [TBD — manual batching, no cutoff enforcement]
- **Line visibility:** [TBD — paper tickets, missed bumps]
- **Integration risk:** [TBD — silent channel failures, no health score]

**Before snapshot (verified or TBD):**

| Metric | Value | How measured |
|--------|-------|--------------|
| Orders/week | [TBD] | Customer export / discovery |
| Tools in stack | [TBD] | Discovery interview |
| Support tickets/week (ops) | [TBD] | Customer estimate — label as estimate until verified |
| Integration incidents/month | [TBD] | Customer estimate |

---

### 4 — Why OS Kitchen

Pick **3 pillars actually used** — align with [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) only if health module was in scope.

| Pillar | What they used | Honest label |
|--------|----------------|--------------|
| Unified Order Hub | [TBD] | BETA / LIVE per registry |
| KDS | [TBD] | Qualified — not "rush-hour certified" unless proof exists |
| Storefront / preorder | [TBD] | BETA |
| Woo / Shopify channel | [TBD] | BETA — live smoke artifact if claimed |
| Integration Health | [TBD] | BETA — score ≠ uptime guarantee |
| Native meal plans | [TBD] | BETA |

**Implementation timeline (Week 1):**

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Kickoff + Launch Wizard | CS |
| 1–2 | First channel / storefront live | Integration |
| 3–5 | KDS + production board in service | Operator |
| 5–7 | Baseline metrics captured | CS + Ops |

Reference: [`pilot-week1-checklist.md`](./pilot-week1-checklist.md)

---

### 5 — Results (After)

**Pilot window:** [Week 2–4] or [60 days] — match SOW Exhibit C.

| Metric | Before | After | Δ | Verified source |
|--------|--------|-------|---|-----------------|
| **Orders/day** | TBD | TBD | TBD | `artifacts/pilot-metrics-baseline-summary.json` |
| **Median bump time (min)** | TBD | TBD | TBD | KDS / pilot checklist |
| **Integration health score** | TBD | TBD | TBD | Health dashboard export |
| Checkout success % | TBD | TBD | TBD | Storefront / channel reports |
| KDS bump rate | TBD | TBD | TBD | pilot-metrics-baseline |
| Support tickets / week | TBD | TBD | TBD | Customer + internal |
| Operator NPS / feedback (1–10) | TBD | TBD | TBD | Retrospective survey |

**Narrative (2–3 sentences):** [TBD — tie numbers to operator workflow; no superlatives without data]

---

### 6 — Quote

> "[TBD — operator quote after pilot retrospective; must match signed release wording]"  
> — **[Name, Title]**, [Company]  
> OR — **Operations lead**, anonymized [segment] operator, [region]

**Quote approval:** ☐ Customer signed ☐ Legal reviewed ☐ Anonymization approved

---

### 7 — Stack context (optional, honest)

| Layer | Before | After | Notes |
|-------|--------|-------|-------|
| POS | [TBD] | OS Kitchen POS (software) | No Toast/Square hardware parity claim |
| E-commerce | [TBD] | [Woo / Shopify / OS storefront] | Channel maturity per registry |
| KDS | [TBD] | OS Kitchen KDS | Realtime qualified — not rush-hour cert |
| Inventory | [TBD] | [TBD] | **No unified cross-channel depletion claim** unless proof artifact |
| Replaced tools | [TBD] | — | |
| Kept alongside | [TBD] | — | e.g. accounting, delivery aggregator |

**Limitations acknowledged:** [e.g. offline POS not supported; SSO enterprise IdP pilot-only; Woo Subs read-only]

---

### 8 — What's next

- [TBD — expansion modules, second location, additional channel]
- Internal only until customer approves future-tense claims

---

## Forbidden in published case studies

Enforced via `npm run smoke:pilot-forbidden-claims-enforcement` and `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` — see [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md):

| Do not claim | Why |
|--------------|-----|
| Fabricated operator, city, or metrics | Legal + trust |
| Production SSO / SOC2 as outcome | Not pilot-proven |
| Unified inventory depletion across channels | Registry honesty |
| Rush-hour KDS certification | Requires SLO proof artifact |
| Woo/Shopify "fully synced" without live smoke PASS | Vault / channel proof |
| Marketplace or hardware parity with Toast/Square | Competitor matrix |
| "100+ reports at enterprise scale" without perf proof | Report catalog plan |
| untouchable / guaranteed ROI / magic AGI | Forbidden claims CI |

---

## Safe wording (pre-publish)

**Allowed now (qualitative, internal):**

- "Pilot case study template ready — awaiting first signed pilot permission"
- "Qualified pilot infrastructure with honest maturity labels"
- "Modules in scope: Order Hub, KDS, storefront, channel wiring (BETA)"

**Allowed only after metrics + approval gates:**

- Before/after table with sourced numbers
- Named or anonymized quote with signed release
- Integration health score delta **with BETA caveat**

---

## Sign-off checklist

| # | Step | Owner | Done |
|---|------|-------|------|
| 1 | Internal draft from this template | GTM | ☐ |
| 2 | Pilot agreement signed | Sales | ☐ |
| 3 | Week 1 checklist complete | CS | ☐ |
| 4 | `smoke:pilot-metrics-baseline` → `overall: PASSED` | Ops | ☐ |
| 5 | Customer case study permission | Legal + customer | ☐ |
| 6 | Metrics cross-checked from dashboard exports | Ops | ☐ |
| 7 | `smoke:pilot-case-study-draft` → `publishProofStatus: proof_ready_for_publish` | GTM | ☐ |
| 8 | `verify-claims` strict mode PASS | GTM | ☐ |
| 9 | Published at approved channel (`/customers`, deck v3, blog) | GTM | ☐ |

---

## Related commands

```bash
npm run smoke:pilot-case-study-draft
npm run smoke:pilot-metrics-baseline
npm run smoke:pilot-forbidden-claims-enforcement
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## Related docs

| Doc | Use |
|-----|-----|
| [`pilot-case-study-draft-era17.md`](./pilot-case-study-draft-era17.md) | Era 17 proof wiring + smoke artifact fields |
| [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) | Week 1 KPI capture (orders/day, bump, health) |
| [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) | Pilot lifecycle |
| [`sales-deck.md`](./sales-deck.md) | Slide 12 case study slot (post-permission) |
| [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) | Health score narrative (BETA caveat) |
| [`founding-customer-story.md`](./founding-customer-story.md) | Pre-customer narrative guardrails |
| [`seo-audit.md`](./seo-audit.md) | Sitemap when publishing `/case-studies/*` |
