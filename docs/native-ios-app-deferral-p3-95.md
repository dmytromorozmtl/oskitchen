# Native iOS app deferral (P3-95)

**Policy:** `native-ios-app-deferral-p3-95-v1`  
**Department:** Mobile  
**Status:** **DEFERRED** — no native iOS App Store app for staff POS/KDS/back-office  
**Registry:** [`artifacts/native-ios-app-deferral-p3-95.json`](../artifacts/native-ios-app-deferral-p3-95.json)

---

## Decision

OS Kitchen is **browser-first for operators**. We do **not** ship a native Swift iOS app for staff POS, kitchen display, or back-office workflows in 2026.

Native iOS App Store listing is **deferred with no calendar date** — mobile Safari and Chrome on iPad/iPhone are the supported operator surfaces today.

*(Separate from P3-92 consumer app deferral — that covers end-customer App Store apps, not staff tooling.)*

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Mobile browser dashboard | `/dashboard` | BETA |
| Browser POS on iPad | `/dashboard/pos` | BETA |
| Browser kitchen display (KDS) | `/dashboard/kitchen` | BETA |
| Add to Home Screen (web app) | `/quick-start` | BETA |

Public line: *No native iOS App Store app for staff POS/KDS — run dashboard, POS, and kitchen on mobile Safari or Chrome on iPad and iPhone today.*

---

## Sales / GTM

Do **not** promise:

- "Native iOS app coming soon"
- "Download OS Kitchen on iOS" (staff app)
- "KDS iOS app coming soon"

Do say:

- "Run POS and KDS in the browser on the iPad you already own — no App Store download required."

---

## Verify

```bash
npm run check:native-ios-app-deferral-p3-95
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
