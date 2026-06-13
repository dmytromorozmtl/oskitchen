# Cashier shift flow — Square parity (P2-42)

**Policy:** `cashier-shift-flow-p2-42-v1`  
**Department:** POS  
**Registry:** [`artifacts/cashier-shift-flow-p2-42-registry.json`](../artifacts/cashier-shift-flow-p2-42-registry.json)

---

## Square parity scope

End-to-end cashier shift on `/dashboard/pos/cash`:

| Step | UI | Backend |
|------|-----|---------|
| **Open shift** | Open drawer panel | `openPosShift()` |
| **Assign drawer** | Register select on open | `registerId` → POS register |
| **Cash count** | Mid-shift count panel | `recordCashDrawerCount()` |
| **Close shift** | Close drawer + variance ack | `closePosShift()` |
| **Shift report** | Printable report + CSV export | `buildCashCloseReport()` · `/api/pos/shifts/export` |

> Square parity — open shift, assign drawer to register, mid-shift cash count, close with variance, printable/CSV report. Card sales excluded from expected cash.

---

## Routes

- **Primary flow:** [`/dashboard/pos/cash`](/dashboard/pos/cash)
- **Shift history:** [`/dashboard/pos/shifts`](/dashboard/pos/shifts)
- **CSV export:** `/api/pos/shifts/export`

---

## Audit

```bash
npm run audit:cashier-shift-flow-p2-42
npm run check:cashier-shift-flow-p2-42
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Cashier shift flow P2-42 audit step.
