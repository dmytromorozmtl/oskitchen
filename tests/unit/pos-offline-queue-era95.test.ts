import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_ERA95_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT,
  POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS,
} from "@/lib/pos/pos-offline-queue-era95-policy";
import {
  auditPosOfflineQueueSmokeWiring,
  buildPosOfflineQueueSmokeEra95Summary,
  resolvePosOfflineQueueSmokeEra95ProofStatus,
} from "@/lib/pos/pos-offline-queue-smoke-summary";
import {
  OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT,
  OFFLINE_POS_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_POLICY_ID,
} from "@/services/pos-offline-queue";

const ROOT = process.cwd();

describe("pos offline queue era95", () => {
  it("locks era95 policy and artifact path", () => {
    expect(POS_OFFLINE_QUEUE_ERA95_POLICY_ID).toBe("era95-pos-offline-queue-v1");
    expect(POS_OFFLINE_QUEUE_ERA95_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-offline-queue-smoke-summary.json",
    );
    expect(POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME).toBe("kitchenos-offline-pos");
    expect(POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT).toBe(3);
  });

  it("aligns era95 constants with canonical offline queue service", () => {
    expect(POS_OFFLINE_QUEUE_POLICY_ID).toBe("pos-offline-queue-v2");
    expect(OFFLINE_POS_INDEXED_DB_NAME).toBe(POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME);
    expect(OFFLINE_POS_AUTO_SYNC_RETRY_LIMIT).toBe(
      POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT,
    );
  });

  it("audits in-repo Offline POS wiring", () => {
    const audit = auditPosOfflineQueueSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes IndexedDB + PCI + auto-sync in offline queue stack", () => {
    const clientQueue = readFileSync(join(ROOT, "lib/pos/offline-pos-queue.ts"), "utf8");
    expect(clientQueue).toContain("OFFLINE_POS_INDEXED_DB_NAME");
    expect(clientQueue).toContain("registerOfflinePosAutoSync");

    const pci = readFileSync(join(ROOT, "lib/pos/offline-pci-local-encryption.ts"), "utf8");
    expect(pci).toContain("sealOfflinePciField");

    const serverQueue = readFileSync(join(ROOT, "services/pos-offline-queue.ts"), "utf8");
    expect(serverQueue).toContain("syncQueueWithAutoRetry");
    expect(serverQueue).toContain("queueOrderWithPciValidation");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosOfflineQueueSmokeEra95ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosOfflineQueueSmokeEra95ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosOfflineQueueSmokeEra95Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.indexedDbName).toBe("kitchenos-offline-pos");
  });
});
