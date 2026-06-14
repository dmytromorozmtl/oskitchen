# Meal Prep OS niche positioning (P3-90)

**Policy:** `meal-prep-niche-p3-90-v1`  
**Department:** Marketing  
**Public URL:** `/meal-prep-software`  
**Dashboard:** `/dashboard/meal-prep`  
**Registry:** [`artifacts/meal-prep-niche-p3-90.json`](../artifacts/meal-prep-niche-p3-90.json)

---

## Positioning

**Meal Prep OS** is OS Kitchen positioned for weekly subscription kitchens — not a separate product SKU.

Three native pillars:

| Pillar | Status | Dashboard |
|--------|--------|-----------|
| **subscription** | BETA | `/dashboard/meal-plans` |
| **production** | LIVE | `/dashboard/production` |
| **storefront** | BETA | `/dashboard/storefront` |

Weekly loop: publish menu + cutoff → subscriptions confirm → production board batches → packing handoff.

---

## Verify

```bash
npm run check:meal-prep-niche-p3-90
```

CI gate: `.github/workflows/ci.yml`

---

## Status

Published on `/meal-prep-software` with honest LIVE/BETA maturity badges. Native meal-plan auto-renew remains BETA until GA gates pass.
