# Hardware ecosystem deferral (P3-96)

**Policy:** `hardware-ecosystem-deferral-p3-96-v1`  
**Department:** Hardware  
**Status:** **DEFERRED** — no proprietary hardware ecosystem, bundles, or certified device SKUs  
**Registry:** [`artifacts/hardware-ecosystem-deferral-p3-96.json`](../artifacts/hardware-ecosystem-deferral-p3-96.json)

---

## Decision

OS Kitchen is **software-first**. We do **not** sell a proprietary hardware ecosystem — no Toast-style terminal bundles, certified OS Kitchen readers, or integrated hardware suite in 2026.

Hardware ecosystem is **deferred with no calendar date**. Operators run on BYOD tablets, browser print to Epson/Star, and third-party devices they already own.

Complements P1-25 (no "hardware coming soon" teases) and P3-94 (native payment terminal deferral).

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Browser POS on BYOD tablets | `/dashboard/pos` | BETA |
| Browser print (Epson/Star) | `/dashboard/settings` | BETA |
| Browser kitchen display | `/dashboard/kitchen` | BETA |
| Hardware honesty / compat status | `/trust` | LIVE |

Public line: *No proprietary hardware ecosystem — browser POS on BYOD tablets, browser print to Epson/Star, and third-party devices you already own.*

---

## Sales / GTM

Do **not** promise:

- "Hardware ecosystem coming soon"
- "OS Kitchen hardware bundle"
- "Certified OS Kitchen hardware"

Do say:

- "We win on unified cloud kitchen OS on devices you already have — not proprietary terminal leases."

---

## Verify

```bash
npm run check:hardware-ecosystem-deferral-p3-96
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md) · P1-25 `check:remove-hardware-roadmap-p1-25`
