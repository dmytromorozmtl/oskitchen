/**
 * Offline POS queue summary — Round 2 wiring audit (Era 170).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT,
  POS_OFFLINE_QUEUE_ERA170_CANONICAL_SUMMARY_ARTIFACT,
  POS_OFFLINE_QUEUE_ERA170_CAPABILITIES,
  POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME,
  POS_OFFLINE_QUEUE_ERA170_POLICY_ID,
} from "@/lib/pos/pos-offline-queue-era170-policy";
import { auditPosOfflineQueueSmokeWiring } from "@/lib/pos/pos-offline-queue-smoke-summary";

export const POS_OFFLINE_QUEUE_ERA170_SMOKE_SUMMARY_VERSION = POS_OFFLINE_QUEUE_ERA170_POLICY_ID;

export type PosOfflineQueueSmokeEra170Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosOfflineQueueSmokeEra170ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosOfflineQueueSmokeEra170Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosOfflineQueueSmokeEra170Summary = {
  version: typeof POS_OFFLINE_QUEUE_ERA170_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosOfflineQueueSmokeEra170Overall;
  proofStatus: PosOfflineQueueSmokeEra170ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  indexedDbName: string;
  autoSyncRetryLimit: number;
  capabilities: readonly string[];
  steps: PosOfflineQueueSmokeEra170Step[];
  honestyNote: string;
};

export function auditPosOfflineQueueSmokeEra170Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosOfflineQueueSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_OFFLINE_QUEUE_ERA170_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosOfflineQueueSmokeEra170ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosOfflineQueueSmokeEra170ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosOfflineQueueSmokeEra170Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosOfflineQueueSmokeEra170Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosOfflineQueueSmokeEra170ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosOfflineQueueSmokeEra170Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosOfflineQueueSmokeEra170Step[] = [
    {
      id: "wiring_audit",
      label:
        "IndexedDB checkout queue → PCI local encryption → card capture → auto-sync replay",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 170 Offline POS queue cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era95)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era95 smoke PASSED"
          : liveSmokeOverall
            ? `era95 artifact overall: ${liveSmokeOverall}`
            : "No era95 artifact — run npm run smoke:pos-offline-queue-era95",
    },
  ];

  return {
    version: POS_OFFLINE_QUEUE_ERA170_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    indexedDbName: POS_OFFLINE_QUEUE_ERA170_INDEXED_DB_NAME,
    autoSyncRetryLimit: POS_OFFLINE_QUEUE_ERA170_AUTO_SYNC_RETRY_LIMIT,
    capabilities: POS_OFFLINE_QUEUE_ERA170_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live EMV store-and-forward requires certified hardware when disconnected.",
  };
}

export function formatPosOfflineQueueSmokeEra170ReportLines(
  summary: PosOfflineQueueSmokeEra170Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era95): ${summary.liveSmokeOverall ?? "not run"}`,
    `IndexedDB: ${summary.indexedDbName}`,
    `Auto-sync retry limit: ${summary.autoSyncRetryLimit}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
