/**
 * 7shifts live smoke summary — wiring audit + labor scheduling proof (Era 82).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS,
} from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";

export const SEVEN_SHIFTS_LIVE_SMOKE_SUMMARY_VERSION = SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID;

export type SevenShiftsLiveSmokeEra82Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SevenShiftsLiveSmokeEra82ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_company"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SevenShiftsLiveSmokeEra82Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SevenShiftsLiveSmokeEra82Summary = {
  version: typeof SEVEN_SHIFTS_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SevenShiftsLiveSmokeEra82Overall;
  proofStatus: SevenShiftsLiveSmokeEra82ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: SevenShiftsLiveSmokeEra82Overall | null;
  missingEnvVars: string[];
  steps: SevenShiftsLiveSmokeEra82Step[];
  honestyNote: string;
};

export function isPlaceholderSevenShiftsCompanyId(companyId: string): boolean {
  const normalized = companyId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "0" ||
    normalized.endsWith(".local")
  );
}

export function auditSevenShiftsLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of SEVEN_SHIFTS_LIVE_SMOKE_ERA82_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/seven-shifts/schedule-import.service.ts") {
      if (!src.includes("syncSevenShiftsScheduleImport")) {
        failures.push("schedule-import.service.ts missing syncSevenShiftsScheduleImport");
      }
    }
    if (rel === "services/integrations/seven-shifts/schedule-export.service.ts") {
      if (!src.includes("syncSevenShiftsScheduleExport")) {
        failures.push("schedule-export.service.ts missing syncSevenShiftsScheduleExport");
      }
    }
    if (rel === "services/integrations/seven-shifts/labor-cost.service.ts") {
      if (!src.includes("syncSevenShiftsLaborCost")) {
        failures.push("labor-cost.service.ts missing syncSevenShiftsLaborCost");
      }
    }
    if (rel === "services/integrations/seven-shifts/seven-shifts-api.ts") {
      if (!src.includes("fetchSevenShiftsShiftsApi")) {
        failures.push("seven-shifts-api.ts missing fetchSevenShiftsShiftsApi");
      }
      if (!src.includes("fetchSevenShiftsLaborReport")) {
        failures.push("seven-shifts-api.ts missing fetchSevenShiftsLaborReport");
      }
    }
    if (rel === "scripts/smoke-seven-shifts-live.ts") {
      if (!src.includes("schedule_import_wiring")) {
        failures.push("smoke-seven-shifts-live.ts missing schedule_import_wiring step");
      }
      if (!src.includes("labor_sync_wiring")) {
        failures.push("smoke-seven-shifts-live.ts missing labor_sync_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveSevenShiftsLiveSmokeEra82ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: SevenShiftsLiveSmokeEra82Overall | null;
  liveProofStatus?: string;
}): SevenShiftsLiveSmokeEra82ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_company") {
    return "proof_skipped_placeholder_company";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_company";
}

export function resolveSevenShiftsLiveSmokeEra82Overall(
  proofStatus: SevenShiftsLiveSmokeEra82ProofStatus,
): SevenShiftsLiveSmokeEra82Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_company"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildSevenShiftsLiveSmokeEra82Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: SevenShiftsLiveSmokeEra82Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: SevenShiftsLiveSmokeEra82Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): SevenShiftsLiveSmokeEra82Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveSevenShiftsLiveSmokeEra82ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveSevenShiftsLiveSmokeEra82Overall(proofStatus);

  const steps: SevenShiftsLiveSmokeEra82Step[] = [
    {
      id: "wiring_audit",
      label: "7shifts → schedule import/export → labor sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 82 7shifts live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_schedule_labor",
      label: "Live OAuth → schedule import → labor sync",
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
    version: SEVEN_SHIFTS_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live 7shifts OAuth + schedule import and labor sync wiring — import may skip when staff mappings are absent.",
  };
}

export function formatSevenShiftsLiveSmokeEra82ReportLines(
  summary: SevenShiftsLiveSmokeEra82Summary,
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
