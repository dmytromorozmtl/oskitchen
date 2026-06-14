# Shopify Partner App Marketplace listing (P3-83)

**Policy:** `shopify-partner-marketplace-p3-83-v1`  
**Updated:** 2026-06-16  
**Status:** **PREP_READY_NOT_LISTED — not yet listed on Shopify App Marketplace**

Gap closure bundle: listing copy, asset checklist, submission runbook, and upstream LIVE proof links for Partner Dashboard submission.

## Readiness matrix

Upstream: [`docs/SHOPIFY_APP_MARKETPLACE_READINESS.md`](./SHOPIFY_APP_MARKETPLACE_READINESS.md)

| Requirement | Status |
|-------------|--------|
| App name | OS Kitchen Fulfillment Sync |
| LIVE connector | **Yes** — dev store + HMAC webhooks |
| KDS order import | **Yes** — P0-14 webhook→KDS E2E |
| Inventory sync | **Yes** — P0-11 bi-directional proof |
| GDPR webhooks | **Required** — wire before submit |
| Marketplace listing | **Not yet listed** — prep only |

## Listing copy

| Field | Draft location |
|-------|----------------|
| App name + tagline | [`artifacts/shopify-partner-marketplace/listing-draft.md`](../artifacts/shopify-partner-marketplace/listing-draft.md) |
| Short + long description | Same |
| Support / Privacy / Terms URLs | Same |

**Tagline:** Turn Shopify food orders into kitchen production and fulfillment

Canonical copy: `lib/marketing/shopify-partner-marketplace-p3-83-content.ts`

## Asset checklist

Store finalized files in `artifacts/shopify-partner-marketplace/`:

| Asset | Spec | Honesty label |
|-------|------|---------------|
| App icon | 1200×1200 PNG | — |
| Order hub | 1600×900 screenshot | LIVE |
| KDS queue | 1600×900 screenshot | LIVE |
| Product mapping | 1600×900 screenshot | LIVE |
| Integration health | 1600×900 screenshot | SKIPPED rows visible |
| Inventory sync | 1600×900 screenshot | LIVE dev store |

## Submission checklist

| Phase | Key action |
|-------|------------|
| Partner account | Create Shopify Partner org + development store |
| App shell | OAuth, embedded app URL, session token validation |
| Listing copy | Finalize listing-draft.md — lint forbidden claims |
| Screenshots | Capture 5 screenshots per asset checklist |
| GDPR webhooks | Wire `customers/data_request`, `customers/redact`, `shop/redact` |
| Dev store QA | `npm run smoke:shopify-live` + inventory sync proof |
| Submit for review | Partner Dashboard → Submit for review |

Full checklist: [`artifacts/shopify-partner-marketplace/submission-checklist.md`](../artifacts/shopify-partner-marketplace/submission-checklist.md)

## Upstream LIVE proofs

| Gap | Proof |
|-----|-------|
| P0-3 | [`artifacts/shopify-webhook-kds-live-smoke.json`](../artifacts/shopify-webhook-kds-live-smoke.json) |
| P0-11 | [`artifacts/shopify-inventory-sync-proof.json`](../artifacts/shopify-inventory-sync-proof.json) |
| P0-14 | [`docs/shopify-webhook-kds-e2e-p0-14.md`](./shopify-webhook-kds-e2e-p0-14.md) |

Integration doc: [`docs/SHOPIFY_INTEGRATION.md`](./SHOPIFY_INTEGRATION.md)

## Honesty rules

- **Not yet listed** — do not claim Shopify App Marketplace approval
- **No Shopify endorsement** — OS Kitchen is an independent app
- **LIVE connector** — dev store proof only; per-tenant production uptime measured separately
- **Development store** — QA on Partner dev store before submission

## CI

```bash
npm run check:shopify-partner-marketplace-p3-83
```

## Artifact

`artifacts/shopify-partner-marketplace-p3-83.json`
