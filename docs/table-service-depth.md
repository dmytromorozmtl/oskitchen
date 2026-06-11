# Table service depth — bar & dining room FOH

**Policy:** `table-service-depth-p2-89-v1`  
**Route:** [`/dashboard/pos/table-service`](/dashboard/pos/table-service)  
**Legacy:** [`BILL_SPLITTING.md`](./BILL_SPLITTING.md)

Seven browser-first table service workflows — **BETA** depth, not production-certified Toast-class floor service. **verify** rush-hour flows before external claims.

---

## Seven capabilities

| Test id | Capability | Module |
|---------|------------|--------|
| `table-service-split-bills` | Split bills | `lib/pos/bill-splitting.ts` |
| `table-service-merge-tables` | Merge tables | `services/pos/table-service-depth-service.ts` |
| `table-service-transfer-seats` | Transfer seats | `services/pos/table-service-depth-service.ts` |
| `table-service-tabs` | Tabs | `services/pos/tab-service.ts` |
| `table-service-bar-mode` | Bar mode | `components/pos/tab-panel.tsx` |
| `table-service-server-banking` | Server banking | `lib/pos/table-service-depth-operations.ts` |
| `table-service-tips-reconciliation` | Tips reconciliation | `lib/pos/table-service-depth-operations.ts` |

---

## Operator flows

1. **Split bills** — POS → Tabs → Split bill (equal / percentage / seat / item).
2. **Merge tables** — Combine open tabs from two tables; source tab status → `MERGED`.
3. **Transfer seats** — Bulk reassign `paidById` when guests move chairs.
4. **Tabs** — Open tab, quick-add bar items, close with tax + tip.
5. **Bar mode** — Beer, wine, cocktail one-tap items on tab panel.
6. **Server banking** — Name tabs `Server - Table N` for tip rollup by prefix.
7. **Tips reconciliation** — Compare declared shift tips vs closed-tab totals.

**Limitations:** Partial per-share checkout is **guidance** only — not automated multi-payment. Floor plan realtime occupancy is **not production-ready**.

---

## CI

```bash
npm run audit:table-service-depth
npm run test:ci:table-service-depth
npm run test:ci:bill-splitting
```

Wired in `.github/workflows/deploy-prod-gate.yml`.

---

## Related

| Doc / route | Use |
|-------------|-----|
| [`/dashboard/pos/tabs`](/dashboard/pos/tabs) | Live tab operations |
| [`/dashboard/tables`](/dashboard/tables) | Floor plan tables |
| `e2e/bill-splitting.spec.ts` | Split bill E2E |
