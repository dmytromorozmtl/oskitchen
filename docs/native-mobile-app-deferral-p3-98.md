# Native mobile app deferral (P3-98)

**Policy:** `native-mobile-app-deferral-p3-98-v1`  
**Department:** Mobile  
**Status:** **DEFERRED** — no native iOS or Android store apps until **$1M ARR**  
**Registry:** [`artifacts/native-mobile-app-deferral-p3-98.json`](../artifacts/native-mobile-app-deferral-p3-98.json)

---

## Decision

OS Kitchen is **web-first**. Native mobile apps in the App Store or Play Store — for operators or end-customers — are **not on the 2026 roadmap** and will not be built until **$1M ARR** and clear demand from design partners.

**Current ARR (June 2026):** $0 — native mobile apps are out of scope with no calendar date.

Complements P3-92 (consumer app until 500+ operators) and P3-95 (native iOS operator app deferred).

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Mobile browser dashboard | `/dashboard` | BETA |
| Responsive web POS / KDS | `/dashboard/pos` | BETA |
| Branded storefront PWA | `/dashboard/storefront` | BETA |
| Add to Home Screen (web app) | `/quick-start` | BETA |

Public line: *No native iOS or Android mobile app until $1M ARR — mobile browser dashboard, responsive web, and PWA today.*

---

## Sales / GTM

Do **not** promise:

- "Native mobile app coming soon"
- "Download our mobile app"
- "iOS and Android app launch"

Do say:

- "Run OS Kitchen in the mobile browser on phones and tablets you already own — no App Store or Play Store download required today."

---

## Verify

```bash
npm run check:native-mobile-app-deferral-p3-98
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
