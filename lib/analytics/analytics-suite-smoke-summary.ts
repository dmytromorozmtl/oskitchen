/**
 * Analytics Suite smoke summary — wiring audit (Era 125).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ANALYTICS_SUITE_ERA125_LANES,
  ANALYTICS_SUITE_ERA125_POLICY_ID,
  ANALYTICS_SUITE_ERA125_ROUTE,
  ANALYTICS_SUITE_ERA125_WIRING_PATHS,
} from "@/lib/analytics/analytics-suite-era125-policy";
import { ANALYTICS_SUITE_SERVICE } from "@/lib/analytics/analytics-suite-policy";

export const ANALYTICS_SUITE_SMOKE_SUMMARY_VERSION = ANALYTICS_SUITE_ERA125_POLICY_ID;

export type AnalyticsSuiteSmokeEra125Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AnalyticsSuiteSmokeEra125ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AnalyticsSuiteSmokeEra125Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AnalyticsSuiteSmokeEra125Summary = {
  version: typeof ANALYTICS_SUITE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AnalyticsSuiteSmokeEra125Overall;
  proofStatus: AnalyticsSuiteSmokeEra125ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  lanes: readonly string[];
  steps: AnalyticsSuiteSmokeEra125Step[];
  honestyNote: string;
};

export function auditAnalyticsSuiteSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of ANALYTICS_SUITE_ERA125_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === ANALYTICS_SUITE_SERVICE) {
      if (!src.includes("loadAnalyticsSuiteSnapshot")) {
        failures.push("analytics-suite-service.ts missing loadAnalyticsSuiteSnapshot");
      }
      if (!src.includes("loadExecutiveOverview")) {
        failures.push("analytics-suite-service.ts missing executive overview loader");
      }
      if (!src.includes("loadOrderAnalytics")) {
        failures.push("analytics-suite-service.ts missing order analytics loader");
      }
      if (!src.includes("loadForecasting2Snapshot")) {
        failures.push("analytics-suite-service.ts missing forecast integration");
      }
      if (!src.includes("buildAnalyticsSuiteSnapshot")) {
        failures.push("analytics-suite-service.ts missing buildAnalyticsSuiteSnapshot");
      }
    }

    if (rel === "lib/analytics/analytics-suite-builders.ts") {
      if (!src.includes("buildAnalyticsSuiteMetric")) {
        failures.push("analytics-suite-builders.ts missing buildAnalyticsSuiteMetric");
      }
      if (!src.includes("buildAnalyticsSuiteLane")) {
        failures.push("analytics-suite-builders.ts missing buildAnalyticsSuiteLane");
      }
      if (!src.includes("buildAnalyticsSuiteSnapshot")) {
        failures.push("analytics-suite-builders.ts missing buildAnalyticsSuiteSnapshot");
      }
      if (!src.includes("Revenue")) {
        failures.push("analytics-suite-builders.ts missing revenue lane label");
      }
      if (!src.includes("Forecast")) {
        failures.push("analytics-suite-builders.ts missing forecast lane label");
      }
    }

    if (rel === "lib/analytics/analytics-suite-policy.ts") {
      if (!src.includes("ANALYTICS_SUITE_POLICY_ID")) {
        failures.push("analytics-suite-policy.ts missing policy id");
      }
      if (!src.includes("ANALYTICS_SUITE_PATH")) {
        failures.push("analytics-suite-policy.ts missing route path");
      }
      if (!src.includes("ANALYTICS_SUITE_DEFAULT_DAYS")) {
        failures.push("analytics-suite-policy.ts missing default days");
      }
    }

    if (rel === "app/dashboard/analytics/suite/page.tsx") {
      if (!src.includes("loadAnalyticsSuiteSnapshot")) {
        failures.push("analytics suite page missing loadAnalyticsSuiteSnapshot");
      }
      if (!src.includes("AnalyticsSuitePanel")) {
        failures.push("analytics suite page missing AnalyticsSuitePanel");
      }
      if (!src.includes("Unified command view across revenue, orders, customers, operations, catering, meal plans, inventory, and 90-day forecast")) {
        failures.push("analytics suite page missing unified metrics copy");
      }
    }

    if (rel === "components/analytics/analytics-suite-panel.tsx") {
      if (!src.includes("analytics-suite-panel")) {
        failures.push("analytics-suite-panel.tsx missing root test id");
      }
      if (!src.includes("Metric lanes")) {
        failures.push("analytics-suite-panel.tsx missing metric lanes summary");
      }
      if (!src.includes("One screen — all analytics")) {
        failures.push("analytics-suite-panel.tsx missing one-screen copy");
      }
      if (!src.includes("Drill down")) {
        failures.push("analytics-suite-panel.tsx missing drill-down links");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAnalyticsSuiteSmokeEra125ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AnalyticsSuiteSmokeEra125ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAnalyticsSuiteSmokeEra125Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AnalyticsSuiteSmokeEra125Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAnalyticsSuiteSmokeEra125ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AnalyticsSuiteSmokeEra125Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AnalyticsSuiteSmokeEra125Step[] = [
    {
      id: "wiring_audit",
      label: "Revenue → orders → operations → forecast — all metrics one screen",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 125 Analytics Suite cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: ANALYTICS_SUITE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: ANALYTICS_SUITE_ERA125_ROUTE,
    lanes: ANALYTICS_SUITE_ERA125_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires tenant order history and analytics data in the default window.",
  };
}

export function formatAnalyticsSuiteSmokeEra125ReportLines(
  summary: AnalyticsSuiteSmokeEra125Summary,
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
