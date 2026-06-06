import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_ERA170_CANONICAL_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA170_CAPABILITIES,
  POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_ERA170_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA170_SUMMARY_ARTIFACT,
  POS_OFFLINE_QUEUE_ERA170_WIRING_PATHS,
} from "@/lib/pos/pos-offline-queue-era170-policy";
import {
  auditPosOfflineQueueSmokeEra170Wiring,
  buildPosOfflineQueueSmokeEra170Summary,
  resolvePosOfflineQueueSmokeEra170ProofStatus,
} from "@/lib/pos/pos-offline-queue-era170-smoke-summary";
import { POS_OFFLINE_QUEUE_ERA95_POLICY_ID } from "@/lib/pos/pos-offline-queue-era95-policy";
import {
  OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT,
  OFFLINE_POS_INDEXED_DB_NAME,
} from "@/services/pos-offline-queue";

const ROOT = process.cwd();

describe("pos offline queue era170", () => {
  it("locks era170 policy and artifact path", () => {
    expect(POS_OFFLINE_QUEUE_ERA170_POLICY_ID).toBe("era170-pos-offline-queue-v1");
    expect(POS_OFFLINE_QUEUE_ERA170_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-offline-queue-era170-smoke-summary.json",
    );
    expect(POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT).toBe(3);
    expect(POS_OFFLINE_QUEUE_ERA170_WIRING_PATHS).toHaveLength(8);
    expect(POS_OFFLINE_QUEUE_ERA170_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era170 with canonical Offline POS queue policy", () => {
    expect(POS_OFFLINE_QUEUE_ERA170_CANONICAL_POLICY_ID).toBe(POS_OFFLINE_QUEUE_ERA95_POLICY_ID);
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe(POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME);
    expect(OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT).toBe(POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT);
  });

  it("audits in-repo Offline POS Round 2 wiring", () => {
    const audit = auditPosOfflineQueueSmokeEra170Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_OFFLINE_QUEUE_ERA170_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes IndexedDB, PCI encryption, card payments, and auto-sync wiring", () => {
    const clientQueue = readFileSync(join(ROOT, "lib/pos/offline-pos-queue.ts"), "utf8");
    expect(clientQueue).toContain("OFFLINE_POS_INDEXED_DB_NAME");
    expect(clientQueue).toContain("registerOfflinePosAutoSync");

    const pci = readFileSync(join(ROOT, "lib/pos/offline-pci-local-encryption.ts"), "utf8");
    expect(pci).toContain("sealOfflinePciField");
    expect(pci).toContain("aes-gcm-v1");

    const serverQueue = readFileSync(join(ROOT, "services/pos-offline-queue.ts"), "utf8");
    expect(serverQueue).toContain("syncQueueWithAutoRetry");
    expect(serverQueue).toContain("queueOrderWithPciValidation");
    expect(serverQueue).toContain("OFFLINE_CARD_INDEXED_DB_NAME");

    const cardService = readFileSync(join(ROOT, "services/pos/offline-card-service.ts"), "utf8");
    expect(cardService).toContain("syncOfflineCardCaptures");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosOfflineQueueSmokeEra170ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosOfflineQueueSmokeEra170ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosOfflineQueueSmokeEra170Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("indexed_db");
    expect(summary.capabilities).toContain("pci_local_encryption");
    expect(summary.capabilities).toContain("card_payments");
    expect(summary.capabilities).toContain("auto_sync");
  });
});
