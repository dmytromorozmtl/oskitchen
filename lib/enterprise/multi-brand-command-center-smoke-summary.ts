/**
 * Multi-Brand Command Center smoke summary — wiring audit (Era 111).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES,
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS,
} from "@/lib/enterprise/multi-brand-command-center-era111-policy";

export const MULTI_BRAND_COMMAND_CENTER_SMOKE_SUMMARY_VERSION =
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID;

export type MultiBrandCommandCenterSmokeEra111Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MultiBrandCommandCenterSmokeEra111ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MultiBrandCommandCenterSmokeEra111Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MultiBrandCommandCenterSmokeEra111Summary = {
  version: typeof MULTI_BRAND_COMMAND_CENTER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MultiBrandCommandCenterSmokeEra111Overall;
  proofStatus: MultiBrandCommandCenterSmokeEra111ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: MultiBrandCommandCenterSmokeEra111Step[];
  honestyNote: string;
};

export function auditMultiBrandCommandCenterSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE) {
      if (!src.includes("loadEnterpriseMultiBrandDashboard")) {
        failures.push("multi-brand-service.ts missing loadEnterpriseMultiBrandDashboard");
      }
      if (!src.includes("buildEnterpriseMultiBrandDashboard")) {
        failures.push("multi-brand-service.ts missing buildEnterpriseMultiBrandDashboard");
      }
      if (!src.includes("getBrandsOverview")) {
        failures.push("multi-brand-service.ts missing getBrandsOverview");
      }
    }

    if (rel === "lib/enterprise/multi-brand-builders.ts") {
      if (!src.includes("buildEnterpriseBrandRanks")) {
        failures.push("multi-brand-builders.ts missing buildEnterpriseBrandRanks");
      }
      if (!src.includes("buildEnterpriseBrandAlerts")) {
        failures.push("multi-brand-builders.ts missing buildEnterpriseBrandAlerts");
      }
      if (!src.includes("buildEnterpriseMultiBrandDashboard")) {
        failures.push("multi-brand-builders.ts missing buildEnterpriseMultiBrandDashboard");
      }
      if (!src.includes("ENTERPRISE_BRAND_LANES")) {
        failures.push("multi-brand-builders.ts missing brand lanes A–D");
      }
    }

    if (rel === "lib/enterprise/multi-brand-policy.ts") {
      if (!src.includes("ENTERPRISE_MULTI_BRAND_POLICY_ID")) {
        failures.push("multi-brand-policy.ts missing policy id");
      }
      if (!src.includes("ENTERPRISE_BRAND_LANES")) {
        failures.push("multi-brand-policy.ts missing ENTERPRISE_BRAND_LANES");
      }
    }

    if (rel === "app/dashboard/enterprise/multi-brand/page.tsx") {
      if (!src.includes("MultiBrandEnterprisePanel")) {
        failures.push("multi-brand page missing MultiBrandEnterprisePanel");
      }
      if (!src.includes("loadEnterpriseMultiBrandDashboard")) {
        failures.push("multi-brand page missing loadEnterpriseMultiBrandDashboard");
      }
    }

    if (rel === "components/enterprise/multi-brand-enterprise-panel.tsx") {
      if (!src.includes("enterprise-multi-brand-panel")) {
        failures.push("multi-brand-enterprise-panel.tsx missing root test id");
      }
      if (!src.includes("Multi-Brand Command Center")) {
        failures.push("multi-brand-enterprise-panel.tsx missing command center title");
      }
      if (!src.includes("Revenue share by lane")) {
        failures.push("multi-brand-enterprise-panel.tsx missing revenue share section");
      }
      if (!src.includes("revenueShare")) {
        failures.push("multi-brand-enterprise-panel.tsx missing revenue per brand");
      }
      if (!src.includes("Brand lanes A–D")) {
        failures.push("multi-brand-enterprise-panel.tsx missing brand lanes copy");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveMultiBrandCommandCenterSmokeEra111ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MultiBrandCommandCenterSmokeEra111ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMultiBrandCommandCenterSmokeEra111Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): MultiBrandCommandCenterSmokeEra111Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveMultiBrandCommandCenterSmokeEra111ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MultiBrandCommandCenterSmokeEra111Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MultiBrandCommandCenterSmokeEra111Step[] = [
    {
      id: "wiring_audit",
      label: "Brand lanes A–D → revenue per brand → portfolio alerts → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 111 Multi-Brand Command Center cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MULTI_BRAND_COMMAND_CENTER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE,
    capabilities: MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with multiple brands and order history.",
  };
}

export function formatMultiBrandCommandCenterSmokeEra111ReportLines(
  summary: MultiBrandCommandCenterSmokeEra111Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
