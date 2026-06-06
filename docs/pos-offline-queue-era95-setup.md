# Offline POS queue smoke setup (Era 95)

Era 95 certifies offline POS wiring: IndexedDB checkout queue, PCI local encryption for card metadata, card capture staging, and auto-sync replay on reconnect.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/pos-offline-queue.ts` | Server staging + syncQueueWithAutoRetry + PCI validation |
| `lib/pos/offline-pos-queue.ts` | Browser IndexedDB checkout queue |
| `lib/pos/offline-pci-local-encryption.ts` | Device-local AES-GCM sealing (last4/brand only) |
| `lib/pos/offline-pos-auto-sync.ts` | Online event + interval auto-sync coordinator |
| `lib/pos/offline-card-client-queue.ts` | Browser card capture queue with PCI seal |
| `services/pos/offline-card-service.ts` | Server card capture sync |
| `components/pos/offline-card-sync-panel.tsx` | Terminal UI for queued card captures |
| `hooks/use-offline-sync-status.ts` | Live queue/conflict status hook |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-offline-queue-era95` | Full era95 cert + wiring audit |
| `npm run test:ci:pos-offline-queue-era95` | Era95 + PCI encryption unit tests |
| `npm run test:ci:pos-offline-queue-era95:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Terminal** — queue a sale while offline.
2. Queue an **OFFLINE_CARD_QUEUED** sale with last4/brand — verify PCI panel shows queued row.
3. Restore connectivity — auto-sync replays checkout + card capture queues.
4. Run `npm run smoke:pos-offline-queue-era95` — artifact **PASSED**.

## PCI honesty

PASS certifies in-repo wiring only. Live EMV store-and-forward while disconnected requires certified payment hardware — this stack stages PCI-safe metadata (last4, brand, opaque refs) for capture when Stripe Terminal is online.

## Artifact

Summary written to `artifacts/pos-offline-queue-smoke-summary.json` (gitignored).
