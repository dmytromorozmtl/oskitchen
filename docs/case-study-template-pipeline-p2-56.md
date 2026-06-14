# Case study template + pipeline (P2-56)

**Policy:** `case-study-template-pipeline-p2-56-v1`  
**Updated:** 2026-06-16  
**Gap:** Template until LOI → internal draft during pilot → publish review **30 days** after pilot start

## Pipeline stages

| Stage | When | Template |
|-------|------|----------|
| `pre_loi_template` | Before signed LOI | [`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) |
| `loi_signed_internal_draft` | LOI countersigned, pilot not live | [`case-studies/_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md) |
| `pilot_active_w1` | Pilot live, before day 30 | [`case-studies/_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md) — W1 capture |
| `pilot_day_30_publish_review` | ≥30 days after pilot start | [`case-study-template.md`](./case-study-template.md) — M1 publish gates |
| `published_post_gates` | Customer approval + metrics verified | [`lib/marketing/case-studies.ts`](../lib/marketing/case-studies.ts) |

## Pre-LOI (no customer story)

Use [`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md) for founder story + operator archetype. **Do not** name customers or publish metrics.

LOI template: [`loi-design-partner-template.md`](./loi-design-partner-template.md)

## LOI → pilot internal draft

1. Countersigned LOI on file (`loiSignedDate` in [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json))
2. Copy [`case-studies/_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md) → `docs/case-studies/<slug>-milestone-draft.md`
3. Fill Challenge / Solution / Results W1 only — label targets as `(target)`

## Day 30 publish review (M1)

**Publish review eligible** = pilot start date + **30 calendar days**.

At day 30:

1. Run `npm run smoke:pilot-metrics-baseline` → `overall: PASSED`
2. Complete M1 rows in milestone draft ([`case-study-template-p2-50.md`](./case-study-template-p2-50.md))
3. Obtain customer permission (`PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` or `anonymized_signed`)
4. Pass publish gates in [`case-study-template.md`](./case-study-template.md)
5. Only then add entry to `RAW_CASE_STUDIES` with `status: "published"`

> **Internal draft only** until all gates pass — no `/customers` page, ads, or blog publish before permission.

## Fill-in checklist

Copy [`case-studies/_LOI_TO_PUBLISH_PIPELINE.md`](./case-studies/_LOI_TO_PUBLISH_PIPELINE.md) per design partner.

## CI

```bash
npm run check:case-study-template-pipeline-p2-56
```

## Artifact

`artifacts/case-study-template-pipeline-p2-56.json`
