/**
 * Multi-Location Dashboard 2.0 smoke summary — wiring audit (Era 136).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MULTI_LOCATION_DASHBOARD_2_ERA136_CAPABILITIES,
  MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID,
  MULTI_LOCATION_DASHBOARD_2_ERA136_ROUTE,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SCALE_THRESHOLD,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE,
  MULTI_LOCATION_DASHBOARD_2_ERA136_WIRING_PATHS,
} from "@/lib/enterprise/multi-location-dashboard-2-era136-policy";

export const MULTI_LOCATION_DASHBOARD_2_SMOKE_SUMMARY_VERSION =
  MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID;

export type MultiLocationDashboard2SmokeEra136Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MultiLocationDashboard2SmokeEra136ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MultiLocationDashboard2SmokeEra136Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MultiLocationDashboard2SmokeEra136Summary = {
  version: typeof MULTI_LOCATION_DASHBOARD_2_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MultiLocationDashboard2SmokeEra136Overall;
  proofStatus: MultiLocationDashboard2SmokeEra136ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  scaleThreshold: number;
  capabilities: readonly string[];
  steps: MultiLocationDashboard2SmokeEra136Step[];
  honestyNote: string;
};

export function auditMultiLocationDashboard2SmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MULTI_LOCATION_DASHBOARD_2_ERA136_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE) {
      if (!src.includes("loadEnterpriseMultiLocationDashboard")) {
        failures.push("multi-location-service.ts missing loadEnterpriseMultiLocationDashboard");
      }
      if (!src.includes("parseMultiLocationDashboard2ViewState")) {
        failures.push("multi-location-service.ts missing parseMultiLocationDashboard2ViewState");
      }
      if (!src.includes("loadMultiLocationAnalytics")) {
        failures.push("multi-location-service.ts missing loadMultiLocationAnalytics");
      }
      if (!src.includes("buildEnterpriseMultiLocationDashboard")) {
        failures.push("multi-location-service.ts missing buildEnterpriseMultiLocationDashboard");
      }
    }

    if (rel === "lib/enterprise/multi-location-dashboard-2-builders.ts") {
      if (!src.includes("buildEnterpriseMultiLocationDashboardV2")) {
        failures.push("multi-location-dashboard-2-builders.ts missing buildEnterpriseMultiLocationDashboardV2");
      }
      if (!src.includes("buildLocationComparisonPair")) {
        failures.push("multi-location-dashboard-2-builders.ts missing buildLocationComparisonPair");
      }
      if (!src.includes("paginateItems")) {
        failures.push("multi-location-dashboard-2-builders.ts missing paginateItems");
      }
      if (!src.includes("filterEnterpriseLocationRanks")) {
        failures.push("multi-location-dashboard-2-builders.ts missing filterEnterpriseLocationRanks");
      }
      if (!src.includes("resolveMultiLocationScaleTier")) {
        failures.push("multi-location-dashboard-2-builders.ts missing resolveMultiLocationScaleTier");
      }
    }

    if (rel === "lib/enterprise/multi-location-dashboard-2-policy.ts") {
      if (!src.includes("MULTI_LOCATION_DASHBOARD_2_POLICY_ID")) {
        failures.push("multi-location-dashboard-2-policy.ts missing policy id");
      }
      if (!src.includes("MULTI_LOCATION_DASHBOARD_2_PATH")) {
        failures.push("multi-location-dashboard-2-policy.ts missing route path");
      }
      if (!src.includes("MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD")) {
        failures.push("multi-location-dashboard-2-policy.ts missing enterprise scale threshold");
      }
      if (!src.includes("100")) {
        failures.push("multi-location-dashboard-2-policy.ts missing 100+ scale threshold");
      }
    }

    if (rel === "app/dashboard/enterprise/multi-location/page.tsx") {
      if (!src.includes("loadEnterpriseMultiLocationDashboard")) {
        failures.push("multi-location page missing loadEnterpriseMultiLocationDashboard");
      }
      if (!src.includes("MultiLocationEnterprisePanel")) {
        failures.push("multi-location page missing MultiLocationEnterprisePanel");
      }
      if (!src.includes("parseMultiLocationDashboard2ViewState")) {
        failures.push("multi-location page missing parseMultiLocationDashboard2ViewState");
      }
      if (!src.includes("Enterprise view of all locations with comparison and drill-down")) {
        failures.push("multi-location page missing enterprise dashboard copy");
      }
    }

    if (rel === "components/enterprise/multi-location-enterprise-panel.tsx") {
      if (!src.includes("enterprise-multi-location-panel")) {
        failures.push("multi-location-enterprise-panel.tsx missing root test id");
      }
      if (!src.includes("multi-location-enterprise-scale-badge")) {
        failures.push("multi-location-enterprise-panel.tsx missing enterprise scale badge");
      }
      if (!src.includes("MultiLocationComparisonTable")) {
        failures.push("multi-location-enterprise-panel.tsx missing comparison table");
      }
      if (!src.includes("Side-by-side comparison")) {
        failures.push("multi-location-enterprise-panel.tsx missing comparison section");
      }
      if (!src.includes("compareA")) {
        failures.push("multi-location-enterprise-panel.tsx missing compareA drill-down");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveMultiLocationDashboard2SmokeEra136ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MultiLocationDashboard2SmokeEra136ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMultiLocationDashboard2SmokeEra136Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): MultiLocationDashboard2SmokeEra136Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveMultiLocationDashboard2SmokeEra136ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MultiLocationDashboard2SmokeEra136Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MultiLocationDashboard2SmokeEra136Step[] = [
    {
      id: "wiring_audit",
      label: "100+ locations → paginated ranking → drill-down → comparison",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 136 Multi-Location Dashboard 2.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MULTI_LOCATION_DASHBOARD_2_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: MULTI_LOCATION_DASHBOARD_2_ERA136_ROUTE,
    scaleThreshold: MULTI_LOCATION_DASHBOARD_2_ERA136_SCALE_THRESHOLD,
    capabilities: MULTI_LOCATION_DASHBOARD_2_ERA136_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires multi_location plan and populated location analytics.",
  };
}

export function formatMultiLocationDashboard2SmokeEra136ReportLines(
  summary: MultiLocationDashboard2SmokeEra136Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Scale threshold: ${summary.scaleThreshold}+ locations`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
