# Delivery routing optimization — Olo parity (P2-45)

**Policy:** `delivery-routing-optimization-p2-45-v1`  
**Department:** Delivery  
**Registry:** [`artifacts/delivery-routing-optimization-p2-45-registry.json`](../artifacts/delivery-routing-optimization-p2-45-registry.json)

---

## Olo parity scope

Minimize delivery time via dispatch optimization and surface live driver progress on the routes dashboard.

| Step | UI | Backend |
|------|-----|---------|
| **Optimize stop order** | `/dashboard/routes/optimize` | `loadDeliveryDispatchOptimizationModel()` · nearest-neighbor / Google Routes |
| **Minimize drive time** | Dispatch optimization panel | `optimizeDispatchStopOrder()` · `applyOptimizedStopOrder()` |
| **Track driver progress** | Driver tracking widget on `/dashboard/routes` | `loadDriverTrackingWidgetModel()` |
| **Driver handoff** | `/dashboard/routes/[id]/driver` | Stop status updates · maps links |

> **Olo parity** — minimize delivery time with optimized stop sequencing. **Driver tracking** shows completion %, current stop, and ETA. Google Routes used when configured; otherwise **heuristic** nearest-neighbor applies.

---

## Routes

- **Routes overview + tracking:** [`/dashboard/routes`](/dashboard/routes)
- **Dispatch optimization:** [`/dashboard/routes/optimize`](/dashboard/routes/optimize)
- **Driver view:** `/dashboard/routes/[routeId]/driver`

---

## Audit

```bash
npm run audit:delivery-routing-optimization-p2-45
npm run check:delivery-routing-optimization-p2-45
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Delivery routing optimization P2-45 audit step.
