# Offline POS card payments (PCI-safe queue)

Operators can queue **card** sales while the browser is offline without OS Kitchen ever storing PAN, CVV, or track data.

## What is stored

| Field | Allowed |
|-------|---------|
| last4 | Yes (4 digits) |
| cardBrand | Yes |
| amountCents | Yes |
| Stripe `paymentIntentId` | Yes (opaque) |
| Full card number | **Never** |
| CVV / track | **Never** |

## Flow

1. POS → Payment → **Offline card (queued)**.
2. Enter **last 4** and brand (from guest receipt or Terminal display).
3. While offline, sale + card metadata queue in IndexedDB.
4. On reconnect, checkout replays, server enqueues capture, **Sync card captures** runs Stripe Terminal `processTerminalPayment` when `paymentIntentId` is present.

## Code map

| Area | Path |
|------|------|
| Service | `services/pos/offline-card-service.ts` |
| PCI guards | `lib/pos/offline-card-pci.ts` |
| Client queue | `lib/pos/offline-card-client-queue.ts` |
| UI | `components/pos/offline-card-sync-panel.tsx` |
| API | `POST /api/pos/offline-card/sync` |

## Honesty

This is **not** EMV-certified store-and-forward. It is a **staging + sync** path aligned with Stripe Terminal offline references. See `docs/offline-pos-plan.md` Phase 4 for certified offline card roadmap.
