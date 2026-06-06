/**
 * Forecasting 2.0 smoke summary — wiring audit (Era 124).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORECASTING_2_ERA124_POLICY_ID,
  FORECASTING_2_ERA124_ROUTE,
  FORECASTING_2_ERA124_SIGNALS,
  FORECASTING_2_ERA124_WIRING_PATHS,
} from "@/lib/ai/forecasting-era124-policy";
import { FORECASTING_2_SERVICE } from "@/lib/ai/forecasting-policy";

export const FORECASTING_2_SMOKE_SUMMARY_VERSION = FORECASTING_2_ERA124_POLICY_ID;

export type Forecasting2SmokeEra124Overall = "PASSED" | "FAILED" | "SKIPPED";

export type Forecasting2SmokeEra124ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type Forecasting2SmokeEra124Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type Forecasting2SmokeEra124Summary = {
  version: typeof FORECASTING_2_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: Forecasting2SmokeEra124Overall;
  proofStatus: Forecasting2SmokeEra124ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  signals: readonly string[];
  steps: Forecasting2SmokeEra124Step[];
  honestyNote: string;
};

export function auditForecasting2SmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of FORECASTING_2_ERA124_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === FORECASTING_2_SERVICE) {
      if (!src.includes("loadForecasting2Snapshot")) {
        failures.push("forecasting.ts missing loadForecasting2Snapshot");
      }
      if (!src.includes("loadDailyOrderHistory")) {
        failures.push("forecasting.ts missing daily order history loader");
      }
      if (!src.includes("buildForecasting2Snapshot")) {
        failures.push("forecasting.ts missing buildForecasting2Snapshot");
      }
    }

    if (rel === "lib/ai/forecasting-builders.ts") {
      if (!src.includes("buildForecasting2Series")) {
        failures.push("forecasting-builders.ts missing buildForecasting2Series");
      }
      if (!src.includes("buildForecasting2DailyPoint")) {
        failures.push("forecasting-builders.ts missing buildForecasting2DailyPoint");
      }
      if (!src.includes("holidayMultiplierForDate")) {
        failures.push("forecasting-builders.ts missing holidayMultiplierForDate");
      }
      if (!src.includes("weatherMultiplier")) {
        failures.push("forecasting-builders.ts missing weatherMultiplier");
      }
      if (!src.includes("listUpcomingHolidayWindows")) {
        failures.push("forecasting-builders.ts missing listUpcomingHolidayWindows");
      }
    }

    if (rel === "lib/ai/forecasting-policy.ts") {
      if (!src.includes("FORECASTING_2_POLICY_ID")) {
        failures.push("forecasting-policy.ts missing policy id");
      }
      if (!src.includes("FORECASTING_2_HORIZON_DAYS")) {
        failures.push("forecasting-policy.ts missing horizon days");
      }
      if (!src.includes("FORECASTING_2_HISTORY_DAYS")) {
        failures.push("forecasting-policy.ts missing history days");
      }
    }

    if (rel === "app/dashboard/forecast/forecasting-2/page.tsx") {
      if (!src.includes("loadForecasting2Snapshot")) {
        failures.push("forecasting-2 page missing loadForecasting2Snapshot");
      }
      if (!src.includes("Forecasting2Panel")) {
        failures.push("forecasting-2 page missing Forecasting2Panel");
      }
      if (!src.includes("90-day order and revenue projection from trailing history — adjusted for weather proxies and holiday calendar windows")) {
        failures.push("forecasting-2 page missing 90-day weather holiday copy");
      }
    }

    if (rel === "components/ai/forecasting-2-panel.tsx") {
      if (!src.includes("forecasting-2-panel")) {
        failures.push("forecasting-2-panel.tsx missing root test id");
      }
      if (!src.includes("90-day orders")) {
        failures.push("forecasting-2-panel.tsx missing 90-day orders card");
      }
      if (!src.includes("Upcoming holidays")) {
        failures.push("forecasting-2-panel.tsx missing holidays section");
      }
      if (!src.includes("Weather adjustments")) {
        failures.push("forecasting-2-panel.tsx missing weather section");
      }
      if (!src.includes("Next 30 days")) {
        failures.push("forecasting-2-panel.tsx missing forecast table");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveForecasting2SmokeEra124ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): Forecasting2SmokeEra124ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildForecasting2SmokeEra124Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): Forecasting2SmokeEra124Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveForecasting2SmokeEra124ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: Forecasting2SmokeEra124Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: Forecasting2SmokeEra124Step[] = [
    {
      id: "wiring_audit",
      label: "90-day horizon → weather adjustments → holiday calendar",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 124 Forecasting 2.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: FORECASTING_2_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: FORECASTING_2_ERA124_ROUTE,
    signals: FORECASTING_2_ERA124_SIGNALS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires ≥7 days of order history for meaningful projections.",
  };
}

export function formatForecasting2SmokeEra124ReportLines(
  summary: Forecasting2SmokeEra124Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Signals: ${summary.signals.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
