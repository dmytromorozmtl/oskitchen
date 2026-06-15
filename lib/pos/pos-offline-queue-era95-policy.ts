/**
 * Era 95 — Offline POS wiring cert (Phase 2 extension #95).
 *
 * Full path: IndexedDB checkout queue → PCI local encryption → card capture → auto-sync replay.
 */

export const POS_OFFLINE_QUEUE_ERA95_POLICY_ID = "era95-pos-offline-queue-v1" as const;

export const POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT =
  "artifacts/pos-offline-queue-smoke-summary.json" as const;

export const POS_OFFLINE_QUEUE_ERA95_NPM_SCRIPT = "smoke:pos-offline-queue-era95" as const;

export const POS_OFFLINE_QUEUE_ERA95_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-offline-queue-era95.ts" as const;

export const POS_OFFLINE_QUEUE_ERA95_OPS_DOC = "docs/pos-offline-queue-era95-setup.md" as const;

export const POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS = [
  "services/pos-offline-queue.ts",
  "lib/pos/offline-pos-queue.ts",
  "lib/pos/offline-pci-local-encryption.ts",
  "lib/pos/offline-pos-auto-sync.ts",
  "lib/pos/offline-card-client-queue.ts",
  "services/pos/offline-card-service.ts",
  "components/pos/offline-card-sync-panel.tsx",
  "hooks/use-offline-sync-status.ts",
] as const;

export const POS_OFFLINE_QUEUE_ERA95_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal — toggle offline mode and queue a cash sale.",
  "Queue an OFFLINE_CARD_QUEUED sale with last4/brand metadata — verify PCI panel shows queued row.",
  "Restore connectivity — auto-sync replays checkout + card capture queues.",
  "Run npm run smoke:pos-offline-queue-era95 — artifact overall PASSED.",
] as const;

export const POS_OFFLINE_QUEUE_ERA95_CI_SCRIPTS = [
  "test:ci:pos-offline-queue-era95",
  "test:ci:pos-offline-queue-era95:cert",
] as const;

export const POS_OFFLINE_QUEUE_ERA95_UNIT_TESTS = [
  "tests/unit/pos-offline-queue-era95.test.ts",
  "tests/unit/offline-pos-pci-encryption.test.ts",
] as const;

export const POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME = "kitchenos-offline-pos" as const;

export const POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT = 3 as const;
