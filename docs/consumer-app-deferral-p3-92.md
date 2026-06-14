# Consumer app deferral (P3-92)

**Policy:** `consumer-app-deferral-p3-92-v1`  
**Department:** Marketing  
**Status:** **DEFERRED** — no App Store / Play Store consumer app until **500+ paying operators**  
**Registry:** [`artifacts/consumer-app-deferral-p3-92.json`](../artifacts/consumer-app-deferral-p3-92.json)

---

## Decision

OS Kitchen is **operator-first B2B software**. A native end-customer (diner/subscriber) app is **not on the 2026 roadmap** and will not be built until we have **500+ paying restaurant operators** and clear demand from design partners.

**Current count (June 2026):** 0 signed founding customers — consumer app is out of scope with no calendar date.

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Branded storefront PWA | `/dashboard/storefront` | BETA |
| Mobile web checkout | `/dashboard/storefront` | BETA |
| QR → storefront ordering | `/dashboard/qr-codes` | BETA |
| Storefront loyalty earn/redeem | `/dashboard/storefront/loyalty` | BETA |

Public line: *No native consumer app until 500+ paying operators — use branded storefront PWA and mobile web checkout today.*

---

## Sales / GTM

Do **not** promise:

- "Consumer app coming soon"
- "Download our app" (for diners)
- "App Store launch" timeline

Do say:

- "Your customers order on **your** branded storefront — mobile web and PWA, no separate app store listing required from OS Kitchen."

---

## Verify

```bash
npm run check:consumer-app-deferral-p3-92
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
