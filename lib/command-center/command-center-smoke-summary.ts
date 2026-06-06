/**
 * Command Center smoke summary — wiring audit (Era 132).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMAND_CENTER_ERA132_LANES,
  COMMAND_CENTER_ERA132_POLICY_ID,
  COMMAND_CENTER_ERA132_ROUTE,
  COMMAND_CENTER_ERA132_WIRING_PATHS,
} from "@/lib/command-center/command-center-era132-policy";
import { COMMAND_CENTER_SERVICE } from "@/lib/command-center/command-center-policy";

export const COMMAND_CENTER_SMOKE_SUMMARY_VERSION = COMMAND_CENTER_ERA132_POLICY_ID;

export type CommandCenterSmokeEra132Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CommandCenterSmokeEra132ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CommandCenterSmokeEra132Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CommandCenterSmokeEra132Summary = {
  version: typeof COMMAND_CENTER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CommandCenterSmokeEra132Overall;
  proofStatus: CommandCenterSmokeEra132ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  lanes: readonly string[];
  steps: CommandCenterSmokeEra132Step[];
  honestyNote: string;
};

export function auditCommandCenterSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of COMMAND_CENTER_ERA132_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === COMMAND_CENTER_SERVICE) {
      if (!src.includes("loadCommandCenterSnapshot")) {
        failures.push("command-center-service.ts missing loadCommandCenterSnapshot");
      }
      if (!src.includes("loadExecutiveOverview")) {
        failures.push("command-center-service.ts missing loadExecutiveOverview");
      }
      if (!src.includes("loadTodayCommandCenter")) {
        failures.push("command-center-service.ts missing loadTodayCommandCenter");
      }
      if (!src.includes("loadForecasting2Snapshot")) {
        failures.push("command-center-service.ts missing loadForecasting2Snapshot");
      }
      if (!src.includes("loadRouteOverviewKpis")) {
        failures.push("command-center-service.ts missing loadRouteOverviewKpis");
      }
      if (!src.includes("buildCommandCenterSnapshot")) {
        failures.push("command-center-service.ts missing buildCommandCenterSnapshot");
      }
      if (!src.includes('id: "market"')) {
        failures.push("command-center-service.ts missing market lane");
      }
      if (!src.includes('id: "roles"')) {
        failures.push("command-center-service.ts missing roles lane");
      }
    }

    if (rel === "lib/command-center/command-center-builders.ts") {
      if (!src.includes("buildCommandCenterTicker")) {
        failures.push("command-center-builders.ts missing buildCommandCenterTicker");
      }
      if (!src.includes("buildCommandCenterLane")) {
        failures.push("command-center-builders.ts missing buildCommandCenterLane");
      }
      if (!src.includes("buildCommandCenterSnapshot")) {
        failures.push("command-center-builders.ts missing buildCommandCenterSnapshot");
      }
      if (!src.includes("buildCommandCenterAlertsFromBlockers")) {
        failures.push("command-center-builders.ts missing buildCommandCenterAlertsFromBlockers");
      }
      if (!src.includes("MARKET")) {
        failures.push("command-center-builders.ts missing MARKET lane label");
      }
      if (!src.includes("ROLES")) {
        failures.push("command-center-builders.ts missing ROLES lane label");
      }
    }

    if (rel === "lib/command-center/command-center-policy.ts") {
      if (!src.includes("COMMAND_CENTER_POLICY_ID")) {
        failures.push("command-center-policy.ts missing policy id");
      }
      if (!src.includes("COMMAND_CENTER_PATH")) {
        failures.push("command-center-policy.ts missing route path");
      }
      if (!src.includes("COMMAND_CENTER_LANE_IDS")) {
        failures.push("command-center-policy.ts missing lane ids");
      }
    }

    if (rel === "app/dashboard/command-center/page.tsx") {
      if (!src.includes("loadCommandCenterSnapshot")) {
        failures.push("command center page missing loadCommandCenterSnapshot");
      }
      if (!src.includes("CommandCenterPanel")) {
        failures.push("command center page missing CommandCenterPanel");
      }
      if (
        !src.includes(
          "Dense Bloomberg-style view across market, operations, live signals, forecast, and role",
        )
      ) {
        failures.push("command center page missing Bloomberg terminal copy");
      }
      if (!src.includes("canAccessOwnerOnlySurfaces")) {
        failures.push("command center page missing owner access gate");
      }
    }

    if (rel === "components/command-center/command-center-panel.tsx") {
      if (!src.includes("command-center-panel")) {
        failures.push("command-center-panel.tsx missing root test id");
      }
      if (!src.includes("OS Kitchen Terminal")) {
        failures.push("command-center-panel.tsx missing terminal header");
      }
      if (!src.includes("ALERTS")) {
        failures.push("command-center-panel.tsx missing alerts section");
      }
      if (!src.includes("TickerCell")) {
        failures.push("command-center-panel.tsx missing ticker cells");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCommandCenterSmokeEra132ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CommandCenterSmokeEra132ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCommandCenterSmokeEra132Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CommandCenterSmokeEra132Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCommandCenterSmokeEra132ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CommandCenterSmokeEra132Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CommandCenterSmokeEra132Step[] = [
    {
      id: "wiring_audit",
      label: "Market → ops → live → forecast → roles terminal lanes",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 132 Command Center cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: COMMAND_CENTER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: COMMAND_CENTER_ERA132_ROUTE,
    lanes: COMMAND_CENTER_ERA132_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires owner/leadership access and populated analytics data.",
  };
}

export function formatCommandCenterSmokeEra132ReportLines(
  summary: CommandCenterSmokeEra132Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
