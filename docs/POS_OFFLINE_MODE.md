# POS — Offline / Degraded Mode

## Implemented

- **Offline queue enabled by default** via `mergePosSettings()` (`lib/pos/pos-settings.ts`). Workspaces inherit `offlineQueueEnabled: true` unless explicitly disabled in `KitchenSettings.posSettingsJson`.
- `PosTerminalClient` queues **cash** and other offline-safe payment modes in IndexedDB when the browser reports offline.
- **Sync on reconnect** replays queued sales through `posCheckoutAction` → `checkoutPosSale` with idempotent `offlineSaleId`.
- **Conflict resolution** classifies sync failures (inventory, duplicate, shift closed, plan blocked) and either removes duplicate replays or marks rows as `conflict` for manual review (`manual_review` default; `server_wins` optional).
- **Indicators**: global `OfflineIndicator` (layout) and POS `OfflineSyncStatusBar` show connectivity, queued count, and conflict count.
- `posPaymentAllowedWhileOffline` blocks placeholder card flows while offline.

## Operator guidance

1. Keep **cash** or **mark-paid-after-external-terminal** modes when connectivity is flaky.
2. If sync reports conflicts, open **POS Terminal** and review queued rows — inventory or catalog changes may have blocked replay.
3. Disable offline queue only when you require live server confirmation for every sale (`offlineQueueEnabled: false` in `posSettingsJson`).

## Not implemented

- Certified hardware offline / EMV store-and-forward.
- Multi-device inventory locking while fully offline.

See also `e2e/pos-offline-queue.spec.ts` and `lib/pos/offline-pos-queue.ts`.

**v1.0 (P2-88):** [`pos-offline-mode-v1.md`](./pos-offline-mode-v1.md) — local cart, sync queue, conflict resolution, audit log at [`/dashboard/pos/settings/offline`](/dashboard/pos/settings/offline).
