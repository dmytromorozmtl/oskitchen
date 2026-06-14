# Native budgeting module (P3-91)

**Policy:** `native-budgeting-p3-91-v1`  
**Department:** Finance  
**Dashboard URL:** `/dashboard/finance/budget`  
**PnL integration:** `/dashboard/reports/financial/pnl`  
**Registry:** [`artifacts/native-budgeting-p3-91.json`](../artifacts/native-budgeting-p3-91.json)

---

## R365 parity (operator-first)

Native budgeting lets owners set **budget vs actual** targets without an accountant:

| Category | Default % of revenue |
|----------|---------------------|
| Food cost | 30% |
| Labor | 30% |
| Occupancy | 8% |
| Operating supplies | 4% |
| Repairs | 2% |
| Marketing | 5% |
| Admin & G&A | 6% |
| EBITDA target | 15% |
| Net income target | 12% |

Targets persist in `KitchenSettings.settingsCenterJson.finance.nativeBudget`. Actuals pull from live orders, cost snapshots, and labor data.

**Not a GL replacement** — QuickBooks journal sync remains optional for full Restaurant365-class reconciliation.

---

## Verify

```bash
npm run check:native-budgeting-p3-91
```

CI gate: `.github/workflows/ci.yml`

---

## Status

LIVE — operator-editable targets with budget vs actual on `/dashboard/finance/budget` and P&L statement.
