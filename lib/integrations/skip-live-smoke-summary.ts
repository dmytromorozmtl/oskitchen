/**
 * Skip live smoke summary — wiring audit + KDS/status proof (Era 79).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SKIP_LIVE_SMOKE_ERA79_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS,
} from "@/lib/integrations/skip-live-smoke-era79-policy";

export const SKIP_LIVE_SMOKE_SUMMARY_VERSION = SKIP_LIVE_SMOKE_ERA79_POLICY_ID;

export type SkipLiveSmokeEra79Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SkipLiveSmokeEra79ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_store"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SkipLiveSmokeEra79Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SkipLiveSmokeEra79Summary = {
  version: typeof SKIP_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SkipLiveSmokeEra79Overall;
  proofStatus: SkipLiveSmokeEra79ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: SkipLiveSmokeEra79Overall | null;
  missingEnvVars: string[];
  steps: SkipLiveSmokeEra79Step[];
  honestyNote: string;
};

export function isPlaceholderSkipRestaurantId(restaurantId: string): boolean {
  const normalized = restaurantId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "00000000-0000-0000-0000-000000000000" ||
    normalized.endsWith(".local")
  );
}

export function auditSkipLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/skip/kitchen-import.service.ts") {
      if (!src.includes("importSkipOrderToKitchen")) {
        failures.push("kitchen-import.service.ts missing importSkipOrderToKitchen");
      }
    }
    if (rel === "services/integrations/skip/inbound-order.service.ts") {
      if (!src.includes("importSkipOrderToKitchen")) {
        failures.push("inbound-order.service.ts missing kitchen import");
      }
    }
    if (rel === "services/integrations/skip/status-sync.service.ts") {
      if (!src.includes("syncSkipStatusFromKitchenOrder")) {
        failures.push("status-sync.service.ts missing syncSkipStatusFromKitchenOrder");
      }
    }
    if (rel === "scripts/smoke-skip-live.ts") {
      if (!src.includes("kds_kitchen_import")) {
        failures.push("smoke-skip-live.ts missing kds_kitchen_import step");
      }
      if (!src.includes("status_sync_wiring")) {
        failures.push("smoke-skip-live.ts missing status_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveSkipLiveSmokeEra79ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: SkipLiveSmokeEra79Overall | null;
  liveProofStatus?: string;
}): SkipLiveSmokeEra79ProofStatus {
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

export function resolveSkipLiveSmokeEra79Overall(
  proofStatus: SkipLiveSmokeEra79ProofStatus,
): SkipLiveSmokeEra79Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_store"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildSkipLiveSmokeEra79Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: SkipLiveSmokeEra79Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: SkipLiveSmokeEra79Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): SkipLiveSmokeEra79Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveSkipLiveSmokeEra79ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveSkipLiveSmokeEra79Overall(proofStatus);

  const steps: SkipLiveSmokeEra79Step[] = [
    {
      id: "wiring_audit",
      label: "Skip → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 79 Skip live smoke cert",
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
    version: SKIP_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Skip marketplace API + staging orders webhook + ExternalOrder + KDS kitchen import — status sync pushes kitchen updates back to Skip.",
  };
}

export function formatSkipLiveSmokeEra79ReportLines(
  summary: SkipLiveSmokeEra79Summary,
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
