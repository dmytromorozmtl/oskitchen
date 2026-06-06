/**
 * Corporate Reporting smoke summary — wiring audit (Era 138).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CORPORATE_REPORTING_ERA138_POLICY_ID,
  CORPORATE_REPORTING_ERA138_ROUTE,
  CORPORATE_REPORTING_ERA138_SECTIONS,
  CORPORATE_REPORTING_ERA138_SERVICE,
  CORPORATE_REPORTING_ERA138_WIRING_PATHS,
} from "@/lib/enterprise/corporate-reporting-era138-policy";

export const CORPORATE_REPORTING_SMOKE_SUMMARY_VERSION = CORPORATE_REPORTING_ERA138_POLICY_ID;

export type CorporateReportingSmokeEra138Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CorporateReportingSmokeEra138ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CorporateReportingSmokeEra138Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CorporateReportingSmokeEra138Summary = {
  version: typeof CORPORATE_REPORTING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CorporateReportingSmokeEra138Overall;
  proofStatus: CorporateReportingSmokeEra138ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: CorporateReportingSmokeEra138Step[];
  honestyNote: string;
};

export function auditCorporateReportingSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of CORPORATE_REPORTING_ERA138_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === CORPORATE_REPORTING_ERA138_SERVICE) {
      if (!src.includes("loadCorporateReportingDashboard")) {
        failures.push("corporate-reporting-service.ts missing loadCorporateReportingDashboard");
      }
      if (!src.includes("loadExecutiveOverview")) {
        failures.push("corporate-reporting-service.ts missing loadExecutiveOverview");
      }
      if (!src.includes("loadForecasting2Snapshot")) {
        failures.push("corporate-reporting-service.ts missing loadForecasting2Snapshot");
      }
      if (!src.includes("buildCorporateReportingDashboard")) {
        failures.push("corporate-reporting-service.ts missing buildCorporateReportingDashboard");
      }
    }

    if (rel === "lib/enterprise/corporate-reporting-builders.ts") {
      if (!src.includes("buildCorporateReportingDashboard")) {
        failures.push("corporate-reporting-builders.ts missing buildCorporateReportingDashboard");
      }
      if (!src.includes("buildCorporatePlLines")) {
        failures.push("corporate-reporting-builders.ts missing buildCorporatePlLines");
      }
      if (!src.includes("buildCorporateTrends")) {
        failures.push("corporate-reporting-builders.ts missing buildCorporateTrends");
      }
      if (!src.includes("buildCorporateForecastStrip")) {
        failures.push("corporate-reporting-builders.ts missing buildCorporateForecastStrip");
      }
      if (!src.includes("buildCorporatePeriodComparison")) {
        failures.push("corporate-reporting-builders.ts missing buildCorporatePeriodComparison");
      }
    }

    if (rel === "lib/enterprise/corporate-reporting-policy.ts") {
      if (!src.includes("CORPORATE_REPORTING_POLICY_ID")) {
        failures.push("corporate-reporting-policy.ts missing policy id");
      }
      if (!src.includes("CORPORATE_REPORTING_PATH")) {
        failures.push("corporate-reporting-policy.ts missing route path");
      }
      if (!src.includes("CORPORATE_FORECAST_PREVIEW_DAYS")) {
        failures.push("corporate-reporting-policy.ts missing forecast preview days");
      }
    }

    if (rel === "app/dashboard/enterprise/reports/page.tsx") {
      if (!src.includes("loadCorporateReportingDashboard")) {
        failures.push("corporate reports page missing loadCorporateReportingDashboard");
      }
      if (!src.includes("CorporateReportingPanel")) {
        failures.push("corporate reports page missing CorporateReportingPanel");
      }
      if (
        !src.includes(
          "CEO P&L, revenue trends, and 90-day forecasts for leadership and board reporting",
        )
      ) {
        failures.push("corporate reports page missing CEO reporting copy");
      }
    }

    if (rel === "components/enterprise/corporate-reporting-panel.tsx") {
      if (!src.includes("corporate-reporting-panel")) {
        failures.push("corporate-reporting-panel.tsx missing root test id");
      }
      if (!src.includes("P&L statement")) {
        failures.push("corporate-reporting-panel.tsx missing P&L section");
      }
      if (!src.includes("Revenue trend")) {
        failures.push("corporate-reporting-panel.tsx missing revenue trend section");
      }
      if (!src.includes("Forecast outlook")) {
        failures.push("corporate-reporting-panel.tsx missing forecast outlook section");
      }
      if (!src.includes("CEO P&L")) {
        failures.push("corporate-reporting-panel.tsx missing CEO P&L copy");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCorporateReportingSmokeEra138ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CorporateReportingSmokeEra138ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCorporateReportingSmokeEra138Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CorporateReportingSmokeEra138Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCorporateReportingSmokeEra138ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CorporateReportingSmokeEra138Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CorporateReportingSmokeEra138Step[] = [
    {
      id: "wiring_audit",
      label: "CEO P&L → revenue trends → 90-day forecast",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 138 Corporate Reporting cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: CORPORATE_REPORTING_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: CORPORATE_REPORTING_ERA138_ROUTE,
    sections: CORPORATE_REPORTING_ERA138_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace analytics and forecasting data.",
  };
}

export function formatCorporateReportingSmokeEra138ReportLines(
  summary: CorporateReportingSmokeEra138Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Sections: ${summary.sections.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
