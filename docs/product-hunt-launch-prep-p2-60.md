# Product Hunt launch prep (P2-60)

**Policy:** `product-hunt-launch-prep-p2-60-v1`  
**Updated:** 2026-06-16  
**Status:** **PREP ONLY — do not submit** until [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) gates LG1–LG8 pass

Gap closure bundle: **assets + copy + checklist** wired to the full operational playbook.

## Playbook (full timeline)

[`docs/product-hunt-launch-prep.md`](./product-hunt-launch-prep.md) — T-30 through T+7, hunter outreach, launch-day runbook.

Upstream registry: [`product-hunt-launch-prep-p3-65.md`](./product-hunt-launch-prep-p3-65.md)

## Asset checklist

Store finalized files in `artifacts/product-hunt-launch/`:

| Asset | Spec | Honesty label |
|-------|------|---------------|
| Logo | 240×240 PNG | — |
| Gallery 1 | Today Command Center | pilot_ready |
| Gallery 2 | Integration Health strip | SKIPPED rows in caption |
| Gallery 3 | KDS queue | BETA |
| Gallery 4 | Storefront checkout | BETA |
| Gallery 5 | Owner briefing | BETA |
| Hero GIF | 60s menu → order → KDS | No "all integrations live" |
| Maker comment | `listing-maker-comment.md` | Link `/trust` |

Canonical asset paths: `lib/marketing/product-hunt-launch-prep-p2-60-content.ts`

## Listing copy (draft)

| Field | Draft location |
|-------|----------------|
| Tagline (≤60 chars) | [`artifacts/product-hunt-launch/listing-draft.md`](../artifacts/product-hunt-launch/listing-draft.md) |
| Short description | Same |
| Maker first comment | [`artifacts/product-hunt-launch/listing-maker-comment.md`](../artifacts/product-hunt-launch/listing-maker-comment.md) |

**Tagline:** Kitchen ops for commissaries — honest BETA, pilot onboarding

Pre-publish: `lintProductHuntLaunchDeferCopy()` → **0 forbidden hits**

## Prep checklist (summary)

| Phase | Key action |
|-------|------------|
| T-30 | Draft copy + forbidden-claims lint + screenshot candidates |
| T-14 | Re-run LG1–LG8; **DEFER** if pilots < 3 |
| T-7 | Lock gallery + maker comment |
| T-1 | Lint 0 hits; staging smoke PASS |
| Launch day | Publish 00:01 PT; comment by 00:05 |
| T+7 | Retro — forbidden-claim incidents must be **0** |

## Honesty rules

- **BETA** / **SKIPPED** labels on all integration screenshots
- **DEFER** until ≥3 design partners — see defer doc
- **0 forbidden hits** on all public copy
- **Design partner** pilots — no fabricated customer logos
- **Do not submit** to Product Hunt until human gates HG1–HG10 pass

Claims registry: [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

## CI

```bash
npm run check:product-hunt-launch-prep-p2-60
```

## Artifact

`artifacts/product-hunt-launch-prep-p2-60.json`
