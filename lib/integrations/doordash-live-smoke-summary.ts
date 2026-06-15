/**
 * DoorDash live smoke summary — wiring audit + KDS/status proof (Era 77).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS,
} from "@/lib/integrations/doordash-live-smoke-era77-policy";

export const DOORDASH_LIVE_SMOKE_SUMMARY_VERSION = DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID;

export type DoorDashLiveSmokeEra77Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DoorDashLiveSmokeEra77ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DoorDashLiveSmokeEra77Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DoorDashLiveSmokeEra77Summary = {
  version: typeof DOORDASH_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DoorDashLiveSmokeEra77Overall;
  proofStatus: DoorDashLiveSmokeEra77ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: DoorDashLiveSmokeEra77Overall | null;
  missingEnvVars: string[];
  steps: DoorDashLiveSmokeEra77Step[];
  honestyNote: string;
};

export function isPlaceholderDoorDashMerchantId(merchantId: string): boolean {
  const normalized = merchantId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "00000000-0000-0000-0000-000000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditDoorDashLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/doordash/kitchen-import.service.ts") {
      if (!src.includes("importDoorDashOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importDoorDashOrderToKitchen");
      }
    }
    if (rel === "services/integrations/doordash/inbound-order.service.ts") {
      if (!src.includes("importDoorDashOrderToKitchen")) {
        failures.push("inbound-order.service.ts missing kitchen import");
      }
    }
    if (rel === "services/integrations/doordash/status-sync.service.ts") {
      if (!src.includes("syncDoorDashStatusFromKitchenOrder")) {
        failures.push("status-sync.service.ts missing syncDoorDashStatusFromKitchenOrder");
      }
    }
    if (rel === "scripts/smoke-doordash-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-doordash-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("status_sync_wiring")) {
        failures.push("smoke-doordash-live.ts missing status_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveDoorDashLiveSmokeEra77ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: DoorDashLiveSmokeEra77Overall | null;
  liveProofStatus?: string;
}): DoorDashLiveSmokeEra77ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_store") {
    return "proof_skipped_placeholder_store";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_store";
}

export function resolveDoorDashLiveSmokeEra77Overall(
  proofStatus: DoorDashLiveSmokeEra77ProofStatus,
): DoorDashLiveSmokeEra77Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_store"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildDoorDashLiveSmokeEra77Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: DoorDashLiveSmokeEra77Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: DoorDashLiveSmokeEra77Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): DoorDashLiveSmokeEra77Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveDoorDashLiveSmokeEra77ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveDoorDashLiveSmokeEra77Overall(proofStatus);

  const steps: DoorDashLiveSmokeEra77Step[] = [
    {
      id: "wiring_audit",
      label: "DoorDash → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 77 DoorDash live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_api_webhook_kds_status",
      label: "Live API → webhook → KDS → status sync",
      status:
        input.liveSmoke.overall === "PASSED"
          ? "PASSED"
          : input.liveSmoke.overall === "SKIPPED"
            ? "SKIPPED"
            : "FAILED",
      reason:
        input.liveSmoke.steps.find((s) => s.status === "FAILED")?.reason ??
        input.liveSmoke.steps.find((s) => s.status === "SKIPPED")?.reason,
    });
  }

  return {
    version: DOORDASH_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live DoorDash marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync pushes kitchen updates back to DoorDash.",
  };
}

export function formatDoorDashLiveSmokeEra77ReportLines(
  summary: DoorDashLiveSmokeEra77Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke: ${summary.liveSmokeOverall ?? "not run"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
