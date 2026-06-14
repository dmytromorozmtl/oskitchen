# Dispatch network deferral (P3-97)

**Policy:** `dispatch-network-deferral-p3-97-v1`  
**Department:** Delivery  
**Status:** **DEFERRED** — no proprietary driver fleet or nationwide dispatch network  
**Registry:** [`artifacts/dispatch-network-deferral-p3-97.json`](../artifacts/dispatch-network-deferral-p3-97.json)

---

## Decision

OS Kitchen does **not** operate a nationwide driver fleet, courier logistics network, or Olo-style dispatch aggregator. Delivery orchestration in the product is **BETA pilot scope** — route planning and handoff workflows, not a owned driver network.

Dispatch network is **deferred with no calendar date**.

---

## Use today instead

| Alternative | Path | Status |
|-------------|------|--------|
| Manual delivery routes (BETA) | `/dashboard/delivery/route-optimization` | BETA |
| Delivery orchestration (BETA) | `/dashboard/delivery/orchestration` | BETA |
| Delivery zones configuration | `/dashboard/settings/delivery-zones` | BETA |
| Third-party channel integrations | `/dashboard/integrations` | LIVE |

Public line: *No proprietary dispatch or driver network — manual delivery routes, third-party courier integrations, and delivery zones on your existing stack today.*

---

## Sales / GTM

Do **not** promise:

- "Dispatch network coming soon"
- "OS Kitchen driver network"
- "Nationwide dispatch network from OS Kitchen"

Do say:

- "Olo and DoorDash win on dispatch network scale. We help independents own storefront + kitchen ops — use BETA route tools and your existing couriers."

---

## Verify

```bash
npm run check:dispatch-network-deferral-p3-97
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
