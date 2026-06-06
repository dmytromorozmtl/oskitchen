/**
 * Grubhub live smoke summary — wiring audit + KDS/status proof (Era 78).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS,
} from "@/lib/integrations/grubhub-live-smoke-era78-policy";

export const GRUBHUB_LIVE_SMOKE_SUMMARY_VERSION = GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID;

export type GrubhubLiveSmokeEra78Overall = "PASSED" | "FAILED" | "SKIPPED";

export type GrubhubLiveSmokeEra78ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type GrubhubLiveSmokeEra78Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type GrubhubLiveSmokeEra78Summary = {
  version: typeof GRUBHUB_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: GrubhubLiveSmokeEra78Overall;
  proofStatus: GrubhubLiveSmokeEra78ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: GrubhubLiveSmokeEra78Overall | null;
  missingEnvVars: string[];
  steps: GrubhubLiveSmokeEra78Step[];
  honestyNote: string;
};

export function isPlaceholderGrubhubMerchantId(merchantId: string): boolean {
  const normalized = merchantId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "00000000-0000-0000-0000-000000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditGrubhubLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/grubhub/kitchen-import.service.ts") {
      if (!src.includes("importGrubhubOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importGrubhubOrderToKitchen");
      }
    }
    if (rel === "services/integrations/grubhub/inbound-order.service.ts") {
      if (!src.includes("importGrubhubOrderToKitchen")) {
        failures.push("inbound-order.service.ts missing kitchen import");
      }
    }
    if (rel === "services/integrations/grubhub/status-sync.service.ts") {
      if (!src.includes("syncGrubhubStatusFromKitchenOrder")) {
        failures.push("status-sync.service.ts missing syncGrubhubStatusFromKitchenOrder");
      }
    }
    if (rel === "scripts/smoke-grubhub-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-grubhub-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("status_sync_wiring")) {
        failures.push("smoke-grubhub-live.ts missing status_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveGrubhubLiveSmokeEra78ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: GrubhubLiveSmokeEra78Overall | null;
  liveProofStatus?: string;
}): GrubhubLiveSmokeEra78ProofStatus {
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

export function resolveGrubhubLiveSmokeEra78Overall(
  proofStatus: GrubhubLiveSmokeEra78ProofStatus,
): GrubhubLiveSmokeEra78Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_store"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildGrubhubLiveSmokeEra78Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: GrubhubLiveSmokeEra78Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: GrubhubLiveSmokeEra78Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): GrubhubLiveSmokeEra78Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveGrubhubLiveSmokeEra78ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveGrubhubLiveSmokeEra78Overall(proofStatus);

  const steps: GrubhubLiveSmokeEra78Step[] = [
    {
      id: "wiring_audit",
      label: "Grubhub → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 78 Grubhub live smoke cert",
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
    version: GRUBHUB_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Grubhub marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync pushes kitchen updates back to Grubhub.",
  };
}

export function formatGrubhubLiveSmokeEra78ReportLines(
  summary: GrubhubLiveSmokeEra78Summary,
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
