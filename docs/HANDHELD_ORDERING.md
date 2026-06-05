# Handheld ordering

Mobile-first waiter workflow for tableside ordering in OS Kitchen.

## Implemented

- **Handheld POS** at `/dashboard/pos/handheld` — table picker, category filters, touch-sized product grid, sticky cart.
- **Fire to KDS** — opens or reuses an open tab, creates a DINE_IN POS order, enqueues `ProductionWorkItem` rows for kitchen prep, and syncs tab line items.
- **Cash checkout** — DINE_IN fulfillment with table note; uses canonical `posCheckoutAction`.
- **Offline queue** — cash sales queue in IndexedDB by default (same path as POS terminal offline mode).
- **PWA** — scoped manifest at `/dashboard/pos/handheld/manifest.webmanifest` with standalone display for install-to-homescreen.

## Operator guidance

1. Add **tables** under Tables and ensure POS-visible products exist.
2. Open Handheld POS on a phone or tablet and install to home screen for full-screen mode.
3. Select a table, tap products, then **Fire KDS** (online — routes to `/dashboard/kitchen`) or **Cash** (offline-safe).

## Limitations

- KDS fire requires connectivity; offline path is cash checkout only.
- Not certified native handheld hardware — browser PWA only.

See also `docs/POS_OFFLINE_MODE.md` and `e2e/pos-offline-queue.spec.ts`.
