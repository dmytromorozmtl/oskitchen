# Public roadmap honest dates (P3-88)

**Policy:** `public-roadmap-honest-dates-p3-88-v1`  
**Department:** Marketing  
**Public URL:** `/roadmap`  
**Upstream:** [`docs/public-roadmap-p3-69.md`](./public-roadmap-p3-69.md) · [`lib/marketing/remove-hardware-roadmap-p1-25-policy.ts`](../lib/marketing/remove-hardware-roadmap-p1-25-policy.ts)  
**Registry:** [`artifacts/public-roadmap-honest-dates-p3-88.json`](../artifacts/public-roadmap-honest-dates-p3-88.json)

---

## Rules (no undated hardware)

1. **Quarter labels only** — every dated section uses explicit `Q2 2026`, `Q3 2026`, or `Q4 2026` labels.
2. **Confidence on every item** — `high`, `medium`, or `conditional` badges on `/roadmap`.
3. **Hardware out of quarters** — terminal, reader SDK, and native hardware never appear in dated quarter sections; they live under **Out of scope** with **no calendar date**.
4. **No undated promises** — banned phrases include "coming soon", "roadmap-only", "TBA", and P1-25 hardware teases.

---

## Verify

```bash
npm run check:public-roadmap-honest-dates-p3-88
```

CI gate: `.github/workflows/ci.yml`

---

## Status

Published — quarter labels are targets, not delivery guarantees. Hardware stays deferred until partner contracts or design partner demand.
