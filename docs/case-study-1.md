# Case study #1 — Riverbend Commissary (design partner)

**Policy:** `era75-case-study-1-v1`  
**Slug:** `riverbend-commissary-design-partner`  
**Status:** **Internal draft** — not published on `/customers` until publish gates pass  
**Customer:** Riverbend Commissary LLC  
**Pilot window:** 2026-06-06 → 2026-06-12 (Week 1 design partner)  
**Parent:** [`case-study-template.md`](./case-study-template.md) · [`pilot-week1-report.md`](./pilot-week1-report.md) · [`loi-signed.md`](./loi-signed.md)

OS Kitchen’s **first case study** — filled from design-partner Week 1 evidence. Metrics are **staging workspace** captures unless noted verified on production.

**Honesty rule:** Do not publish externally, add to `RAW_CASE_STUDIES`, or cite in investor deck until `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` and `npm run smoke:pilot-metrics-baseline` returns `baselineProofStatus: proof_captured`.

---

## Header

| Field | Value |
|-------|-------|
| **Title** | How Riverbend Commissary unified commissary production and pickup orders with OS Kitchen |
| **Subtitle** | Design-partner pilot — commissary + pickup storefront, staging workspace |
| **Customer** | Riverbend Commissary LLC (named internal draft) |
| **Permission** | ☐ named signed ☐ anonymized signed — **pending written approval** |
| **Author / reviewer** | GTM · CS · Legal review pending |

---

## At a glance (hero stats)

| Stat | Value | Source |
|------|-------|--------|
| Orders/day (pilot week peak) | **12/day** | [`pilot-week1-report.md`](./pilot-week1-report.md) — staging Day 6 |
| Median bump time | **9 min** | Week 1 KDS sample (14 tickets) |
| Integration health score | **76/100** | `/dashboard/integration-health` Day 7 |
| Time to first live order | **4.2 hours** | Launch Wizard → Order Hub (staging) |
| Operator satisfaction | **4.3 / 5** | Post-week survey |

**Label:** Staging design-partner Week 1 — not production-scale proof.

---

## Customer profile

**Segment:** Commissary + pickup storefront  

**ICP fit:** Single commissary production kitchen + 1 pickup location · owner-led ops  

**Location:** Portland, OR  

**Team size:** 8 FTE kitchen + 2 ops  

**Channels before pilot:** Walk-in pickup · phone orders · spreadsheet production batches  

**Plan:** Design partner LOI (LOI-DP-001) — not paid pilot SOW yet  

**Workspace:** `riverbend-commissary` (staging)

---

## The challenge (Before)

Riverbend runs commissary production for multiple pickup SKUs with a small team. Before OS Kitchen, orders arrived through phone, walk-in, and a basic storefront — production batches were tracked in spreadsheets, and the line had no shared bump/recall discipline.

- **Order chaos:** No single Order Hub — staff reconciled channels manually at shift start.
- **Production planning:** Batch sizes estimated from memory; cutoff times not enforced in software.
- **Line visibility:** Paper tickets; missed bumps during peak pickup windows.
- **Integration risk:** No integration health score; channel failures invisible until customers complained.

**Before snapshot (discovery estimates — not verified KPIs):**

| Metric | Value | How measured |
|--------|-------|--------------|
| Orders/week | ~65 | Owner estimate |
| Tools in stack | Spreadsheet + basic POS | Discovery interview |
| Support tickets/week (ops) | ~4 | Owner estimate |
| Integration incidents/month | Unknown | No monitoring |

---

## Why OS Kitchen

| Pillar | What they used | Honest label |
|--------|----------------|--------------|
| Unified Order Hub | Storefront test orders → single queue | **pilot_ready** |
| KDS bump/recall | 14 staging tickets during service sim | **pilot_ready** — not rush-hour certified |
| Today command center | Owner morning briefing | **pilot_ready** |
| In-browser POS | Shift open → test sale → closeout | **pilot_ready** |
| Integration Health | Day 2 cadence review | **BETA** — score ≠ uptime SLA |
| WooCommerce / Shopify | Not live in Week 1 | **BETA** — placeholder dev stores |
| AI briefing | Deterministic morning pack | **BETA** |

**Week 1 timeline:** See [`pilot-week1-report.md`](./pilot-week1-report.md).

---

## Results (After)

**Pilot window:** Week 1 (2026-06-06 → 2026-06-12) — design partner staging.

| Metric | Before | After (Week 1) | Δ | Verified source |
|--------|--------|----------------|---|-----------------|
| **Orders/day** | ~9 (estimate) | **12** (staging peak) | +33% | pilot-week1-report |
| **Median bump time (min)** | ~18 (estimate) | **9** | −9 min | KDS sample |
| **Integration health score** | N/A | **76** | watch band | Health dashboard |
| Operator satisfaction (1–5) | N/A | **4.3** | — | Post-week survey |

**Narrative:** Riverbend moved from spreadsheet-driven production to a single Order Hub and KDS bump rhythm in one week on staging. Integration health remains in the **watch** band until Woo dev store replaces the placeholder host. Design-partner collaboration targets met; production metrics baseline not yet captured.

---

## Quote

> "We finally see every pickup order in one place before it hits the line — the briefing and KDS bump flow match how we actually run commissary production."
> — **Jordan Riverbend**, Owner, Riverbend Commissary LLC

**Quote status:** Draft for internal review — **requires verbatim written approval** before publish.

---

## Stack context (honest)

| Layer | Week 1 status |
|-------|---------------|
| OS Kitchen modules | Order Hub, KDS, Today, POS, Integration Health (BETA) |
| Third-party LIVE integrations | **0** — Woo/Shopify smokes SKIPPED |
| Production traffic | **No** — staging workspace only |
| Paid pilot SOW | **Not signed** — LOI design-partner term |
| SOC 2 / enterprise SSO | **Not in scope** |

---

## What's next

1. Replace Woo placeholder store → lift health score ≥80 ([`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md)).
2. Run `npm run smoke:pilot-metrics-baseline` on production traffic.
3. Obtain written case study approval (`PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed`).
4. Re-run `npm run smoke:pilot-case-study-draft` → internal draft PASS.
5. Discuss paid pilot SOW at Week 12 LOI retrospective.

---

## Publish gates

| Gate | Status |
|------|--------|
| Pilot GO/NO-GO | **NO-GO** — vault + channel proof pending |
| Signed pilot SOW | **Pending** — LOI only |
| Metrics baseline artifact | **Not captured** |
| Customer approval | **Pending** |
| `smoke:pilot-case-study-draft` | **Not run** |
| `verify-claims` on final copy | **Required before publish** |

**Do not** add to `lib/marketing/case-studies.ts` until all gates PASS.

---

## Honest limitations

- **Staging metrics only** — not safe for website hero stats or investor KPI slides.
- **Design partner LOI** — collaboration framework, not production SLA or ROI guarantee.
- **Health score 76** — watch band; Woo placeholder drags score.
- **No LIVE integrations** — cannot claim live-certified Woo/Shopify/DoorDash.
- Forbidden claims: [`forbidden-claims-training.md`](./forbidden-claims-training.md) · `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`

---

## Related docs

| Doc | Use |
|-----|-----|
| [`case-study-template.md`](./case-study-template.md) | Master template (MKT-11) |
| [`pilot-week1-report.md`](./pilot-week1-report.md) | Week 1 evidence source |
| [`loi-signed.md`](./loi-signed.md) | Signed LOI record |
| [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) | PR after approval (MKT-29) |
| [`founding-customer-story.md`](./founding-customer-story.md) | Narrative after Gate C |
