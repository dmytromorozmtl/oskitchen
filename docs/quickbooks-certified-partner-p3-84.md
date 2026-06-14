# QuickBooks certified partner program (P3-84)

**Policy:** `quickbooks-certified-partner-p3-84-v1`  
**Updated:** 2026-06-16  
**Status:** **APPLICATION_PREP_NOT_CERTIFIED — not yet certified under Intuit App Partner program**

Gap closure bundle: Intuit App Partner application checklist, listing copy, asset specs, and upstream LIVE QuickBooks connector proofs.

**Integration:** [`docs/QUICKBOOKS_INTEGRATION.md`](./QUICKBOOKS_INTEGRATION.md)

---

## Executive summary

| Dimension | Finding |
|-----------|---------|
| **App name** | OS Kitchen Sales Sync |
| **LIVE connector** | **Yes** — Intuit OAuth + daily sales journal |
| **Sandbox QA** | **Required** — real realm ID before production keys |
| **Partner certification** | **Not yet certified** — application prep only |
| **Target submit** | 2026-07-15 |
| **Intuit endorsement** | **None** — independent app |

**Safe headline:** "Daily kitchen sales post to QuickBooks automatically — LIVE connector, partner application in prep."

**Forbidden:** "QuickBooks certified partner," "Intuit approved," "official QuickBooks app" (until approved).

---

## Application checklist

| Phase | Key action |
|-------|------------|
| Intuit Developer account | Create developer.intuit.com account + sandbox company |
| App registration | Register OAuth app; set redirect URI + accounting scopes |
| Sandbox QA | `npm run smoke:quickbooks-live` + map chart of accounts |
| Security disclosure | Complete Intuit security questionnaire + data handling doc |
| App listing copy | Finalize listing-draft.md — lint forbidden claims |
| Production keys | Request production OAuth keys after sandbox sign-off |
| Submit application | Intuit Partner Portal → submit App Partner application |

Full checklist: [`artifacts/quickbooks-partner-program/application-checklist.md`](../artifacts/quickbooks-partner-program/application-checklist.md)

---

## Listing copy

| Field | Draft location |
|-------|----------------|
| App name + tagline | [`artifacts/quickbooks-partner-program/listing-draft.md`](../artifacts/quickbooks-partner-program/listing-draft.md) |
| Short + long description | Same |

**Tagline:** Post daily kitchen sales to QuickBooks automatically

Canonical copy: `lib/marketing/quickbooks-certified-partner-p3-84-content.ts`

---

## Required OAuth scopes

- `com.intuit.quickbooks.accounting`
- `openid`
- `profile`
- `email`

## Required endpoints

- `GET /api/integrations/quickbooks/oauth/callback`
- `GET /api/integrations/quickbooks/accounts`
- `POST /api/integrations/quickbooks/sync-journal`
- `GET /api/export/quickbooks`

---

## Asset checklist

Store finalized files in `artifacts/quickbooks-partner-program/`:

| Asset | Spec | Honesty label |
|-------|------|---------------|
| App logo | 512×512 PNG | — |
| OAuth connect | 1280×800 screenshot | LIVE sandbox |
| Chart mapping | 1280×800 screenshot | LIVE |
| Daily journal | 1280×800 screenshot | LIVE sandbox |
| Integration health | 1280×800 screenshot | SKIPPED rows visible |

---

## Upstream LIVE proofs

| Proof | Location |
|-------|----------|
| Integration doc | [`docs/QUICKBOOKS_INTEGRATION.md`](./QUICKBOOKS_INTEGRATION.md) |
| Smoke setup | [`docs/quickbooks-live-smoke-setup.md`](./quickbooks-live-smoke-setup.md) |
| Smoke artifact | [`artifacts/quickbooks-live-smoke-summary.json`](../artifacts/quickbooks-live-smoke-summary.json) |
| OAuth unit test | `tests/unit/quickbooks-live-oauth.test.ts` |
| Journal unit test | `tests/unit/quickbooks-daily-sales-journal.test.ts` |

---

## Honesty rules

- **Not yet certified** — do not claim Intuit App Partner certification
- **No Intuit endorsement** — OS Kitchen is an independent app
- **LIVE connector** — OAuth + journal wiring verified in code; per-tenant uptime measured separately
- **Sandbox** — production keys only after Intuit sandbox sign-off

---

## CI

```bash
npm run check:quickbooks-certified-partner-p3-84
```

## Artifact

`artifacts/quickbooks-certified-partner-p3-84.json`
