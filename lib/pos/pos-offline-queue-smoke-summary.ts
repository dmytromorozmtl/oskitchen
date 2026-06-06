/**
 * Offline POS queue smoke summary — wiring audit (Era 95).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_ERA95_POLICY_ID,
  POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS,
} from "@/lib/pos/pos-offline-queue-era95-policy";

export const POS_OFFLINE_QUEUE_SMOKE_SUMMARY_VERSION = POS_OFFLINE_QUEUE_ERA95_POLICY_ID;

export type PosOfflineQueueSmokeEra95Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosOfflineQueueSmokeEra95ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosOfflineQueueSmokeEra95Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosOfflineQueueSmokeEra95Summary = {
  version: typeof POS_OFFLINE_QUEUE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosOfflineQueueSmokeEra95Overall;
  proofStatus: PosOfflineQueueSmokeEra95ProofStatus;
  wiringCertPassed: boolean;
  indexedDbName: string;
  autoSyncRetryLimit: number;
  steps: PosOfflineQueueSmokeEra95Step[];
  honestyNote: string;
};

export function auditPosOfflineQueueSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_OFFLINE_QUEUE_ERA95_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/pos/offline-pos-queue.ts") {
      if (!src.includes("OFFLINE_POS_INDEXED_DB_NAME")) {
        failures.push("offline-pos-queue.ts missing IndexedDB name export");
      }
      if (!src.includes("enqueueOfflinePosCheckout")) {
        failures.push("offline-pos-queue.ts missing enqueueOfflinePosCheckout");
      }
      if (!src.includes("registerOfflinePosAutoSync")) {
        failures.push("offline-pos-queue.ts missing auto-sync registration");
      }
    }

    if (rel === "lib/pos/offline-pci-local-encryption.ts") {
      if (!src.includes("sealOfflinePciField")) {
        failures.push("offline-pci-local-encryption.ts missing sealOfflinePciField");
      }
      if (!src.includes("aes-gcm-v1")) {
        failures.push("offline-pci-local-encryption.ts missing aes-gcm-v1 algorithm");
      }
    }

    if (rel === "lib/pos/offline-pos-auto-sync.ts") {
      if (!src.includes("registerOfflinePosAutoSync")) {
        failures.push("offline-pos-auto-sync.ts missing registerOfflinePosAutoSync");
      }
      if (!src.includes("OFFLINE_POS_AUTO_SYNC_INTERVAL_MS")) {
        failures.push("offline-pos-auto-sync.ts missing auto-sync interval");
      }
    }

    if (rel === "services/pos-offline-queue.ts") {
      if (!src.includes("syncQueueWithAutoRetry")) {
        failures.push("pos-offline-queue.ts missing syncQueueWithAutoRetry");
      }
      if (!src.includes("queueOrderWithPciValidation")) {
        failures.push("pos-offline-queue.ts missing queueOrderWithPciValidation");
      }
      if (!src.includes("OFFLINE_CARD_INDEXED_DB_NAME")) {
        failures.push("pos-offline-queue.ts missing card IndexedDB contract");
      }
    }

    if (rel === "lib/pos/offline-card-client-queue.ts") {
      if (!src.includes("sealOfflinePciRecord")) {
        failures.push("offline-card-client-queue.ts missing PCI seal at rest");
      }
    }

    if (rel === "services/pos/offline-card-service.ts") {
      if (!src.includes("enqueueOfflineCardCapture")) {
        failures.push("offline-card-service.ts missing enqueueOfflineCardCapture");
      }
      if (!src.includes("syncOfflineCardCaptures")) {
        failures.push("offline-card-service.ts missing syncOfflineCardCaptures");
      }
    }

    if (rel === "components/pos/offline-card-sync-panel.tsx") {
      if (!src.includes("offline-card-sync-panel")) {
        failures.push("offline-card-sync-panel.tsx missing test id");
      }
      if (!src.includes("syncOfflineCardCapturesAction")) {
        failures.push("offline-card-sync-panel.tsx missing card sync action");
      }
    }

    if (rel === "hooks/use-offline-sync-status.ts") {
      if (!src.includes("listOfflinePosCheckouts")) {
        failures.push("use-offline-sync-status.ts missing checkout queue hook");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosOfflineQueueSmokeEra95ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosOfflineQueueSmokeEra95ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosOfflineQueueSmokeEra95Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosOfflineQueueSmokeEra95Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosOfflineQueueSmokeEra95ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosOfflineQueueSmokeEra95Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosOfflineQueueSmokeEra95Step[] = [
    {
      id: "wiring_audit",
      label:
        "IndexedDB checkout queue → PCI local encryption → card capture → auto-sync replay",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 95 Offline POS queue cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_OFFLINE_QUEUE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    indexedDbName: POS_OFFLINE_QUEUE_ERA95_INDEXED_DB_NAME,
    autoSyncRetryLimit: POS_OFFLINE_QUEUE_ERA95_AUTO_SYNC_RETRY_LIMIT,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live EMV store-and-forward requires certified hardware when disconnected.",
  };
}

export function formatPosOfflineQueueSmokeEra95ReportLines(
  summary: PosOfflineQueueSmokeEra95Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `IndexedDB: ${summary.indexedDbName}`,
    `Auto-sync retry limit: ${summary.autoSyncRetryLimit}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
