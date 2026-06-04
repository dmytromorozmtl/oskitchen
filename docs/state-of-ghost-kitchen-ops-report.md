# State of Ghost Kitchen Operations — industry report (draft)

**Task:** MKT-33  
**Status:** **DRAFT OUTLINE** — publish only after **≥5 pilot** anonymized data contributions  
**Updated:** 2026-06-03  
**Working title:** *State of Ghost Kitchen Operations 2026*  
**Parent:** [`icp-definition-final.md`](./icp-definition-final.md) · [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) · [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

This doc is the **canonical outline and data contract** for OS Kitchen’s first industry report on ghost-kitchen and commissary operations. It is **not** a published PDF yet — we have **0 pilots** contributing aggregate data as of June 2026.

**Purpose:** Thought leadership for ICP prospects, honest SEO, and sales enablement — **without fabricated market-size statistics**.

---

## Publish gates (all required)

| # | Gate | Threshold | Evidence |
|---|------|-----------|----------|
| **IG1** | Contributing pilots | **≥5** | Five LOIs or paid pilots with Week-4+ operations |
| **IG2** | Anonymized aggregate file | Complete | `artifacts/state-of-ghost-kitchen-ops-summary.json` |
| **IG3** | No individual tenant identification | Legal review | Redaction checklist signed |
| **IG4** | Metrics from verified exports only | Per pilot | `pilot-metrics-baseline` or dashboard export |
| **IG5** | Forbidden claims lint | PASS | `lintStateOfGhostKitchenOpsCopy()` |
| **IG6** | Series A hold | No investor KPIs in report | [`series-a-hold-notice.md`](./series-a-hold-notice.md) |

Run: `isStateOfGhostKitchenOpsReportPublishable(pilotCount)` — returns `true` only when `pilotCount >= 5` and artifact `publishable: true`.

**Do not cite** third-party market-size numbers (e.g. “$XXB ghost kitchen industry”) unless sourced with footnote URL — prefer **pilot-cohort medians only**.

---

## Report sections (outline)

| # | Section | Data source | Status |
|---|---------|-------------|--------|
| **S1** | Executive summary | IG2 aggregate | TBD |
| **S2** | Who we surveyed (methodology) | 5 anonymized pilots, segment mix | TBD |
| **S3** | Multi-brand complexity | Brands per kitchen (median, range) | TBD |
| **S4** | Order channel fragmentation | % orders by channel bucket | TBD |
| **S5** | Production & KDS pain | Bump times, rework rate (if captured) | TBD |
| **S6** | Integration Health reality | PASS / BETA / SKIPPED distribution | TBD |
| **S7** | Margin visibility gap | COGS capture rate, alert frequency | TBD |
| **S8** | Software stack before OS Kitchen | POS + spreadsheets + tablets | TBD |
| **S9** | What changed in pilot window | Qualitative themes (anonymized quotes) | TBD |
| **S10** | Honest limitations | What OS Kitchen does **not** prove yet | Required |
| **S11** | Design partner CTA | LOI path — not mass-market launch | Required |

---

## Data collection contract (per pilot)

Each contributing pilot exports **anonymized** metrics into the cohort file:

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `pilotId` | string | `PILOT-ANON-03` | No legal name in public artifact |
| `segment` | enum | `ghost_kitchen` | From ICP |
| `brandCount` | number | 4 | Virtual brands in workspace |
| `ordersPerDayMedian` | number | 120 | Week 2–4 window |
| `channelMix` | object | `{ shopify: 0.4, manual: 0.35, ... }` | Must sum ~1.0 |
| `integrationHealthScore` | number | 62 | From Integration Health |
| `kdsBumpP95Sec` | number \| null | 45 | Null if not measured |
| `cogsCaptureRate` | number \| null | 0.7 | % SKUs with COGS |
| `npsScore` | number | 8 | 0–10 promoter-style |
| `quoteApproved` | string \| null | "We stopped reconciling tablets…" | Written approval |

**Aggregation rules:**

- Publish **medians and ranges** — not individual pilot rows in public PDF.
- Minimum **n=5** for any percentage claim in S4–S7.
- Label OS Kitchen as **research sponsor** — not independent third-party analyst.

---

## Artifact schema (internal)

`artifacts/state-of-ghost-kitchen-ops-summary.json`:

```json
{
  "policyId": "state-of-ghost-kitchen-ops-mkt33-v1",
  "pilotsContributing": 0,
  "publishable": false,
  "cohortMedians": {
    "brandCount": null,
    "ordersPerDay": null,
    "integrationHealthScore": null
  },
  "blockers": ["insufficient_pilot_data"]
}
```

Set `publishable: true` only when `pilotsContributing >= 5` and legal redaction complete.

---

## Executive summary template (fill after IG1–IG2)

> In [MONTH YEAR], OS Kitchen aggregated anonymized operational data from **[N]** ghost-kitchen and commissary pilots using our kitchen operations platform. Median operator ran **[M]** virtual brands and **[O]** orders/day across fragmented channels. Integration Health scores averaged **[H]** — with most channel connectors still **BETA** or **SKIPPED** in staging proof. This report documents **pilot-cohort reality**, not industry-wide market forecasts.

---

## Forbidden report claims

- Unsourced “$XB ghost kitchen market” or CAGR forecasts presented as our research
- “Thousands of operators surveyed” — max honest claim is **n = pilot count**
- “OS Kitchen customers outperform industry” without control group
- Named customers without written approval
- LIVE integration claims while artifacts show SKIPPED
- “Toast/Square replacement” or rush-hour certification
- Investor metrics, ARR, or Series A narrative

Run `lintStateOfGhostKitchenOpsCopy(draft)` on every public section before PDF/landing publish.

---

## Distribution plan (post-publish)

| Channel | Asset | UTM |
|---------|-------|-----|
| `/blog` long-form | HTML + PDF download | `utm_campaign=ghost-kitchen-report-mkt33` |
| LinkedIn carousel | S3–S6 stat cards (n≥5 only) | `utm_medium=social` |
| Webinar follow-up | Attach to [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) registrants | `utm_medium=webinar` |
| Sales deck insert | One slide “Pilot cohort insights” | Internal only until IG6 |

**Defer** paid promotion until [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) gates clear.

---

## Pre-publish checklist

1. Confirm **≥5** pilots in `pilotsContributing`.
2. Legal signs anonymization memo.
3. Run forbidden-claims lint on executive summary + S10.
4. Engineering verifies no PII in `artifacts/state-of-ghost-kitchen-ops-summary.json`.
5. Add `/trust` footnote on integration maturity labels in S6.
6. Archive PDF in `artifacts/state-of-ghost-kitchen-ops-report/`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`case-study-template.md`](./case-study-template.md) | Named stories — separate from aggregate report |
| [`seo-10-icp-keywords.md`](./seo-10-icp-keywords.md) | Organic landing keywords |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | BC1 ghost kitchen talk track |
