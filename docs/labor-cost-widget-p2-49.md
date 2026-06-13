# Labor cost % widget — 7shifts parity (P2-49)

**Policy:** `labor-cost-widget-p2-49-v1`  
**Department:** Staff  
**Registry:** [`artifacts/labor-cost-widget-p2-49-registry.json`](../artifacts/labor-cost-widget-p2-49-registry.json)

---

## 7shifts parity scope

Real-time **labor % vs revenue** on `/dashboard/today`.

| Step | Source |
|------|--------|
| **Aggregate labor hours today** | Time entries + active clock-ins |
| **Aggregate revenue today** | Non-cancelled orders created today |
| **Compute labor %** | labor cost ÷ revenue × 100 |
| **Render labor widget** | `LaborCostWidgetStrip` with pace vs target |

> **7shifts parity** — operator-facing labor pulse. **BETA** directional view — **not audited** payroll or tax reporting. Reconcile in labor tracker before close.

---

## Routes

- **Widget:** [`/dashboard/today`](/dashboard/today)
- **Labor tracker:** [`/dashboard/staff/labor-realtime`](/dashboard/staff/labor-realtime)
- **Staff hub:** [`/dashboard/staff`](/dashboard/staff)

---

## Audit

```bash
npm run audit:labor-cost-widget-p2-49
npm run check:labor-cost-widget-p2-49
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Labor cost widget P2-49 audit step.
