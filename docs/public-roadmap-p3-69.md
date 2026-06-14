# Public roadmap page (P3-69)

**Policy:** `public-roadmap-p3-69-v1`  
**Department:** Marketing  
**Public URL:** `/roadmap`  
**Upstream:** [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md) · [`docs/STRATEGIC_ROADMAP.md`](./STRATEGIC_ROADMAP.md)  
**Registry:** [`artifacts/public-roadmap-p3-69-registry.json`](../artifacts/public-roadmap-p3-69-registry.json)

---

## Public page

Honest quarterly roadmap with status badges:

| Quarter | Theme |
|---------|-------|
| Q2 2026 — Now | Pilot hardening, BETA integrations |
| Q3 2026 — Next | Reporting, catering, API v1 |
| Q4 2026 — Later | Multi-location, SSO pilot |
| Out of scope | SMS, offline POS, DoorDash native |

Primary keyword: **os kitchen roadmap**

---

## Verify

```bash
npm run check:public-roadmap-p3-69
npm run audit:public-roadmap-p3-69
npm run test:ci:public-roadmap:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

**P3-88 extension:** [`docs/public-roadmap-honest-dates-p3-88.md`](./public-roadmap-honest-dates-p3-88.md) — confidence badges, no undated hardware in quarter sections.

**P3-92 extension:** [`docs/consumer-app-deferral-p3-92.md`](./consumer-app-deferral-p3-92.md) — consumer app deferred until 500+ operators.

---

## Status

Published — not a delivery guarantee. BETA labels remain until certification gates pass.
