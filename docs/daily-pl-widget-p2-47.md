# Daily P&L widget — R365 parity (P2-47)

**Policy:** `daily-pl-widget-p2-47-v1`  
**Department:** Finance  
**Registry:** [`artifacts/daily-pl-widget-p2-47-registry.json`](../artifacts/daily-pl-widget-p2-47-registry.json)

---

## R365 parity scope

Daily revenue snapshot on `/dashboard/today` — **today vs yesterday vs target**.

| Step | Source |
|------|--------|
| **Aggregate revenue today** | Orders `CONFIRMED` · `PREPARING` · `READY` · `COMPLETED` created today |
| **Aggregate revenue yesterday** | Same statuses, prior UTC day |
| **Resolve daily target** | Configured `dailyRevenueTarget` in settings center, else 7-day average |
| **Render P&L widget** | `DailyPlWidgetStrip` with pace badge |

> **R365 parity** — operator-facing daily revenue pulse. **BETA** directional view — **not audited** GL or tax reporting. Reconcile in Restaurant P&L before close.

---

## Routes

- **Widget:** [`/dashboard/today`](/dashboard/today)
- **P&L report:** [`/dashboard/reports/financial/pnl`](/dashboard/reports/financial/pnl)
- **Analytics:** [`/dashboard/analytics`](/dashboard/analytics)

---

## Audit

```bash
npm run audit:daily-pl-widget-p2-47
npm run check:daily-pl-widget-p2-47
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Daily P&L widget P2-47 audit step.
