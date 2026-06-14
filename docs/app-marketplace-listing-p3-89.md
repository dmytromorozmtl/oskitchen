# App marketplace nav removal (P3-89)

**Policy:** `app-marketplace-listing-p3-89-v1`  
**Department:** Marketing  
**Route:** `/app-marketplace` (direct URL only — **remove from nav**)  
**Fallback:** [`/partners`](/partners) for certified SI partner program  
**Registry:** [`artifacts/app-marketplace-listing-p3-89.json`](../artifacts/app-marketplace-listing-p3-89.json)

---

## Problem

The public `/app-marketplace` catalog is illustrative — no self-serve OAuth app store yet. Linking it from primary navigation sets false expectations.

## Decision

1. **Remove from nav** — marketing header, footer, mobile nav, and dashboard extension CTAs must not link to `/app-marketplace`.
2. **Keep the page** — direct URL and SEO remain; honest BETA/ROADMAP labels stay on the page itself.
3. **Redirect operators** — extensions strip and partner CTAs point to `/partners` instead.

---

## Verify

```bash
npm run check:app-marketplace-listing-p3-89
```

CI gate: `.github/workflows/ci.yml`

---

## Status

Nav removed — page published for direct access only.
