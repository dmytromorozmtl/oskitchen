/**
 * Homebase live smoke summary — wiring audit + scheduling/time clock proof (Era 83).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS,
} from "@/lib/integrations/homebase-live-smoke-era83-policy";

export const HOMEBASE_LIVE_SMOKE_SUMMARY_VERSION = HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID;

export type HomebaseLiveSmokeEra83Overall = "PASSED" | "FAILED" | "SKIPPED";

export type HomebaseLiveSmokeEra83ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_location"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type HomebaseLiveSmokeEra83Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type HomebaseLiveSmokeEra83Summary = {
  version: typeof HOMEBASE_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: HomebaseLiveSmokeEra83Overall;
  proofStatus: HomebaseLiveSmokeEra83ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: HomebaseLiveSmokeEra83Overall | null;
  missingEnvVars: string[];
  steps: HomebaseLiveSmokeEra83Step[];
  honestyNote: string;
};

export function isPlaceholderHomebaseLocationId(locationId: string): boolean {
  const normalized = locationId.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "0" ||
    normalized.endsWith(".local")
  );
}

export function auditHomebaseLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of HOMEBASE_LIVE_SMOKE_ERA83_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/homebase/schedule-import.service.ts") {
      if (!src.includes("syncHomebaseScheduleImport")) {
        failures.push("schedule-import.service.ts missing syncHomebaseScheduleImport");
      }
    }
    if (rel === "services/integrations/homebase/schedule-export.service.ts") {
      if (!src.includes("syncHomebaseScheduleExport")) {
        failures.push("schedule-export.service.ts missing syncHomebaseScheduleExport");
      }
    }
    if (rel === "services/integrations/homebase/time-clock.service.ts") {
      if (!src.includes("syncHomebaseTimeClock")) {
        failures.push("time-clock.service.ts missing syncHomebaseTimeClock");
      }
    }
    if (rel === "services/integrations/homebase/homebase-api.ts") {
      if (!src.includes("fetchHomebaseShiftsApi")) {
        failures.push("homebase-api.ts missing fetchHomebaseShiftsApi");
      }
      if (!src.includes("fetchHomebaseTimePunches")) {
        failures.push("homebase-api.ts missing fetchHomebaseTimePunches");
      }
    }
    if (rel === "scripts/smoke-homebase-live.ts") {
      if (!src.includes("schedule_import_wiring")) {
        failures.push("smoke-homebase-live.ts missing schedule_import_wiring step");
      }
      if (!src.includes("time_clock_wiring")) {
        failures.push("smoke-homebase-live.ts missing time_clock_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveHomebaseLiveSmokeEra83ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: HomebaseLiveSmokeEra83Overall | null;
  liveProofStatus?: string;
}): HomebaseLiveSmokeEra83ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_location") {
    return "proof_skipped_placeholder_location";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_location";
}

export function resolveHomebaseLiveSmokeEra83Overall(
  proofStatus: HomebaseLiveSmokeEra83ProofStatus,
): HomebaseLiveSmokeEra83Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_location"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildHomebaseLiveSmokeEra83Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: HomebaseLiveSmokeEra83Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: HomebaseLiveSmokeEra83Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): HomebaseLiveSmokeEra83Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveHomebaseLiveSmokeEra83ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveHomebaseLiveSmokeEra83Overall(proofStatus);

  const steps: HomebaseLiveSmokeEra83Step[] = [
    {
      id: "wiring_audit",
      label: "Homebase → schedule import/export → time clock wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 83 Homebase live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_schedule_timeclock",
      label: "Live OAuth → schedule import → time clock sync",
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
    version: HOMEBASE_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Homebase OAuth + schedule import and time clock wiring — sync may skip when staff mappings are absent.",
  };
}

export function formatHomebaseLiveSmokeEra83ReportLines(
  summary: HomebaseLiveSmokeEra83Summary,
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
