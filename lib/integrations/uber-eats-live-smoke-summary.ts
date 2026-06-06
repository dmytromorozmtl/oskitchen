/**
 * Uber Eats live smoke summary — wiring audit + KDS/status proof (Era 76).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS,
} from "@/lib/integrations/uber-eats-live-smoke-era76-policy";

export const UBER_EATS_LIVE_SMOKE_SUMMARY_VERSION = UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID;

export type UberEatsLiveSmokeEra76Overall = "PASSED" | "FAILED" | "SKIPPED";

export type UberEatsLiveSmokeEra76ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type UberEatsLiveSmokeEra76Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type UberEatsLiveSmokeEra76Summary = {
  version: typeof UBER_EATS_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: UberEatsLiveSmokeEra76Overall;
  proofStatus: UberEatsLiveSmokeEra76ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: UberEatsLiveSmokeEra76Overall | null;
  missingEnvVars: string[];
  steps: UberEatsLiveSmokeEra76Step[];
  honestyNote: string;
};

export function isPlaceholderUberEatsStoreId(storeId: string): boolean {
  const normalized = storeId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "00000000-0000-0000-0000-000000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditUberEatsLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/uber-eats/kitchen-import.service.ts") {
      if (!src.includes("importUberEatsOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importUberEatsOrderToKitchen");
      }
    }
    if (rel === "services/integrations/uber-eats/inbound-order.service.ts") {
      if (!src.includes("importUberEatsOrderToKitchen")) {
        failures.push("inbound-order.service.ts missing kitchen import");
      }
    }
    if (rel === "services/integrations/uber-eats/status-sync.service.ts") {
      if (!src.includes("syncUberEatsStatusFromKitchenOrder")) {
        failures.push("status-sync.service.ts missing syncUberEatsStatusFromKitchenOrder");
      }
    }
    if (rel === "scripts/smoke-uber-eats-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-uber-eats-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("status_sync_wiring")) {
        failures.push("smoke-uber-eats-live.ts missing status_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveUberEatsLiveSmokeEra76ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: UberEatsLiveSmokeEra76Overall | null;
  liveProofStatus?: string;
}): UberEatsLiveSmokeEra76ProofStatus {
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

export function resolveUberEatsLiveSmokeEra76Overall(
  proofStatus: UberEatsLiveSmokeEra76ProofStatus,
): UberEatsLiveSmokeEra76Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_store"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildUberEatsLiveSmokeEra76Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: UberEatsLiveSmokeEra76Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: UberEatsLiveSmokeEra76Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): UberEatsLiveSmokeEra76Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveUberEatsLiveSmokeEra76ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveUberEatsLiveSmokeEra76Overall(proofStatus);

  const steps: UberEatsLiveSmokeEra76Step[] = [
    {
      id: "wiring_audit",
      label: "Uber → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 76 Uber Eats live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_webhook_kds_status",
      label: "Live OAuth → webhook → KDS → status sync",
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
    version: UBER_EATS_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Uber OAuth + staging orders webhook + ExternalOrder + KDS kitchen import — status sync pushes kitchen updates back to Uber.",
  };
}

export function formatUberEatsLiveSmokeEra76ReportLines(
  summary: UberEatsLiveSmokeEra76Summary,
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
