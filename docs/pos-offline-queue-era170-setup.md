# Offline POS queue setup (Era 170)

Era 170 certifies offline POS wiring (Round 2): IndexedDB checkout queue, PCI local encryption for card metadata, card capture staging, and auto-sync replay — with canonical proof via era95 live smoke.

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
| `npm run smoke:pos-offline-queue-era170` | Full era170 cert + wiring audit |
| `npm run test:ci:pos-offline-queue-era170` | Era170 + era95 + PCI encryption tests |
| `npm run test:ci:pos-offline-queue-era170:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-offline-queue-era95` | Canonical era95 smoke |

## Human activation

1. Open **Dashboard → POS → Terminal** — queue a sale while offline.
2. Queue an **OFFLINE_CARD_QUEUED** sale with last4/brand — verify PCI panel shows queued row.
3. Restore connectivity — auto-sync replays checkout + card capture queues.
4. Run `npm run smoke:pos-offline-queue-era170` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `indexed_db` | `kitchenos-offline-pos` checkout + card queues |
| `pci_local_encryption` | `sealOfflinePciField` AES-GCM v1 |
| `card_payments` | OFFLINE_CARD_QUEUED + card capture sync |
| `auto_sync` | `registerOfflinePosAutoSync` + retry limit 3 |

## Artifact

Summary written to `artifacts/pos-offline-queue-era170-smoke-summary.json` (gitignored).

See also: [pos-offline-queue-era95-setup.md](./pos-offline-queue-era95-setup.md)
