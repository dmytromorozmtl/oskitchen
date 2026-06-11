# POS offline mode v1.0

**Policy:** `pos-offline-mode-v1-p2-88-v1`  
**Route:** [`/dashboard/pos/settings/offline`](/dashboard/pos/settings/offline)  
**Legacy doc:** [`POS_OFFLINE_MODE.md`](./POS_OFFLINE_MODE.md)

Blueprint P2-88 ships five offline capabilities for browser-first POS — honest about cash-only offline payment and no certified EMV store-and-forward.

---

## Five capabilities

| Test id | Capability | Module |
|---------|------------|--------|
| `pos-offline-local-cart` | Local cart | `lib/pos/pos-local-cart.ts` |
| `pos-offline-payment-caveat` | Offline payment caveat | `lib/pos/pos-offline.ts` |
| `pos-offline-sync-queue` | Sync queue | `lib/pos/offline-pos-queue.ts` |
| `pos-offline-conflict-resolution` | Conflict resolution | `lib/pos/offline-sync.ts` |
| `pos-offline-audit-log` | Audit log | `services/pos/pos-offline-audit-service.ts` |

---

## Operator flow

1. **Local cart** — line items persist in sessionStorage per register; survive refresh while building an order.
2. **Offline payment caveat** — placeholder Stripe / in-app card flows blocked while offline; cash and offline-safe modes only.
3. **Sync queue** — completed offline sales enqueue in IndexedDB `kitchenos-offline-pos` / `checkout_queue`.
4. **Conflict resolution** — replay classifies duplicate, inventory, shift closed, plan blocked; default `manual_review`.
5. **Audit log** — `POS_OFFLINE_SALE_QUEUED`, `POS_OFFLINE_SYNC_COMPLETED`, `POS_OFFLINE_SYNC_CONFLICT` in workspace audit.

**verify** queue count on POS terminal before claiming 100% order capture during flaky Wi-Fi.

---

## CI

```bash
npm run audit:pos-offline-mode-v1
npm run test:ci:pos-offline-mode-v1
npm run test:ci:pos-offline-mode
npm run test:ci:offline-pos-reconnect-sync-e2e
```

Wired in `.github/workflows/deploy-prod-gate.yml`.

---

## Related

| Doc / test | Use |
|------------|-----|
| [`POS_OFFLINE_MODE.md`](./POS_OFFLINE_MODE.md) | Operator guidance |
| `e2e/pos-offline-mode.spec.ts` | Playwright offline queue |
| `e2e/offline-pos-reconnect-sync.spec.ts` | Reconnect sync E2E |
