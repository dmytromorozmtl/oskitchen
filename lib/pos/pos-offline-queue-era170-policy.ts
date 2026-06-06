/**
 * Era 170 — Offline POS wiring cert (Phase 2 Round 2 #22).
 *
 * Full path: IndexedDB checkout queue → PCI local encryption → card capture → auto-sync replay.
 */

import {
  POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_ERA95_OPS_DOC,
  POS_OFFLINE_QUEUE_ERA95_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT,
  POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS,
} from "@/lib/pos/pos-offline-queue-era95-policy";

export const POS_OFFLINE_QUEUE_ERA170_POLICY_ID = "era170-pos-offline-queue-v1" as const;

export const POS_OFFLINE_QUEUE_ERA170_SUMMARY_ARTIFACT =
  "artifacts/pos-offline-queue-era170-smoke-summary.json" as const;

export const POS_OFFLINE_QUEUE_ERA170_NPM_SCRIPT = "smoke:pos-offline-queue-era170" as const;

export const POS_OFFLINE_QUEUE_ERA170_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-offline-queue-era170.ts" as const;

export const POS_OFFLINE_QUEUE_ERA170_OPS_DOC = "docs/pos-offline-queue-era170-setup.md" as const;

export const POS_OFFLINE_QUEUE_ERA170_CANONICAL_OPS_DOC = POS_OFFLINE_QUEUE_ERA95_OPS_DOC;

export const POS_OFFLINE_QUEUE_ERA170_CANONICAL_SUMMARY_ARTIFACT =
  POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT;

export const POS_OFFLINE_QUEUE_ERA170_WIRING_PATHS = POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS;

export const POS_OFFLINE_QUEUE_ERA170_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal — toggle offline mode and queue a cash sale.",
  "Queue an OFFLINE_CARD_QUEUED sale with last4/brand metadata — verify PCI panel shows queued row.",
  "Restore connectivity — auto-sync replays checkout + card capture queues.",
  "Run npm run smoke:pos-offline-queue-era95 — canonical era95 wiring cert PASSED.",
  "Run npm run smoke:pos-offline-queue-era170 — artifact overall PASSED.",
] as const;

export const POS_OFFLINE_QUEUE_ERA170_CI_SCRIPTS = [
  "test:ci:pos-offline-queue-era170",
  "test:ci:pos-offline-queue-era170:cert",
] as const;

export const POS_OFFLINE_QUEUE_ERA170_UNIT_TESTS = [
  "tests/unit/pos-offline-queue-era170.test.ts",
  "tests/unit/pos-offline-queue-era95.test.ts",
  "tests/unit/offline-pos-pci-encryption.test.ts",
] as const;

export const POS_OFFLINE_QUEUE_ERA170_CANONICAL_POLICY_ID = POS_OFFLINE_QUEUE_ERA95_POLICY_ID;

export const POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME = POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME;

export const POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT =
  POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT;

export const POS_OFFLINE_QUEUE_ERA170_CAPABILITIES = [
  "indexed_db",
  "pci_local_encryption",
  "card_payments",
  "auto_sync",
] as const;
