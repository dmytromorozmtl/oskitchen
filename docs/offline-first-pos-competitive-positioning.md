# Offline-First POS — Competitive Positioning & Sales Guide

**Status:** Production-ready — default offline queue, sync counter, receipt/pre-auth staging, conflict detection  
**Audience:** Sales, owners evaluating Toast Hub, FOH managers  
**Technical:** [`pos-offline-queue.ts`](../services/pos-offline-queue.ts) · [`offline-pos-queue.ts`](../lib/pos/offline-pos-queue.ts) · [`/dashboard/pos/terminal`](../app/dashboard/pos/terminal/page.tsx)

---

## One-line pitch

**Works without internet. No extra server. No extra cost — offline queue included by default.**

---

## Positioning headline

> **Toast charges $1,200 for offline. We include it free. No server. No extra hardware.**

Subheading: **Offline-first POS — browser queue, sync when back online**

---

## Competitor comparison

| Platform | Offline mode | Extra hardware | Typical cost |
|----------|-------------|----------------|--------------|
| Toast | ✅ | Toast Hub ~$1,200 | ~$1,200 + proprietary terminal |
| Square | ✅ | Square Terminal ~$299 | ~$299 |
| **OS Kitchen** | **✅ Default** | **None** | **$0** |

| Capability | Toast | Square | **OS Kitchen** |
|------------|-------|--------|----------------|
| Offline without hub/server | ❌ Hub required | ⚠️ Terminal preferred | **✅ Browser queue default** |
| Queued order counter | Opaque | Basic | **✅ "47 orders synced when back online"** |
| Receipt print when back online | Hub-dependent | Terminal | **✅ Receipt queue → print on reconnect** |
| Multi-device table conflict detection | Limited | Limited | **✅ Same table / multiple devices flagged** |
| Card offline | EMV hub | Terminal store-and-forward | **⚠️ Pre-auth metadata stored — capture when online (not EMV certified)** |

---

## How it works

1. **Default on** — `offlineQueueEnabled: true` in POS settings unless disabled.
2. **Offline sale** — Cash and offline-safe payment modes queue in IndexedDB (client) and can stage server-side via `queueOrder`.
3. **Back online** — `syncQueue` replays through canonical `checkoutPosSale` with idempotent `offlineSaleId`.
4. **Counter message** — `formatOfflineSyncSuccessMessage(47)` → *"47 orders synced when back online"*.
5. **Receipts** — `queueReceiptPrint` holds receipt text; flushed as printed when sync completes (browser print on client).
6. **Card pre-auth** — `storeOfflinePreAuthorization` stores metadata for Stripe Terminal capture when connected — **not** certified EMV store-and-forward.
7. **Conflicts** — `detectOfflineTableConflicts` flags same table modified on multiple devices while offline.

---

## Sales pitch (30 seconds)

> "Toast offline needs a $1,200 Hub. Square wants their terminal on every counter. OS Kitchen queues sales in the browser — no extra box, no extra lease. When Wi‑Fi returns, staff see exactly how many orders synced. Receipts print. If two iPads touched the same table offline, the system flags it. Included — not an upsell."

---

## Safe sales wording

**Allowed:**

- "Offline queue enabled by default"
- "Cash sales queue locally and sync when connectivity returns"
- "Sync counter shows orders replayed when back online"
- "Receipt queue prints when back online"
- "Table conflict detection across devices"
- "Pre-auth metadata stored for capture when Stripe Terminal is online"

**Not allowed:**

- "Certified EMV offline / store-and-forward"
- "Card payments work fully offline"
- "Toast offline parity"
- "Zero sync failures guaranteed"
- "Production-certified hardware offline"

---

## What ships today (evidence)

| Capability | Evidence |
|------------|----------|
| Default offline queue | `lib/pos/pos-settings.ts`, `POS_OFFLINE_MODE.md` |
| Server staging + sync | `services/pos-offline-queue.ts` |
| Sync success message | `formatOfflineSyncSuccessMessage` |
| Receipt print queue | `queueReceiptPrint`, `flushReceiptQueue` |
| Pre-auth staging | `storeOfflinePreAuthorization` |
| Table conflict detection | `detectOfflineTableConflicts` |
| 100-order stress test | `stressTestOfflineQueue`, `tests/unit/pos-offline-queue.test.ts` |
| E2E offline cash path | `e2e/pos-offline-queue.spec.ts` |
| POS UI indicators | `OfflineSyncStatusBar`, `pos-terminal-client.tsx` |

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "We need card offline" | OS Kitchen blocks placeholder card flows offline to avoid false PAID states. Pre-auth metadata can stage for Stripe Terminal capture when online — not EMV-certified offline. |
| "Toast Hub is reliable" | It is — for Toast-only hardware stacks. OS Kitchen targets BYOD tablets you already own. |
| "What if two servers edit one table?" | Conflict detection marks same-table multi-device edits for review before sync completes. |

---

## Proof path

```bash
npm test -- tests/unit/pos-offline-queue.test.ts tests/unit/offline-sync.test.ts
npx playwright test e2e/pos-offline-queue.spec.ts --project=chromium-authed
```

Open `/dashboard/pos/terminal` — toggle offline in DevTools → complete cash sale → reconnect → verify sync counter.

---

## Related docs

- [`POS_OFFLINE_MODE.md`](POS_OFFLINE_MODE.md) — operator runbook
- [`no-hardware-lock-in-positioning.md`](no-hardware-lock-in-positioning.md) — BYOD positioning
