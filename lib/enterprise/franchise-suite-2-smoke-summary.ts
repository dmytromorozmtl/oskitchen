/**
 * Franchise Management Suite smoke summary — wiring audit (Era 137).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FRANCHISE_SUITE_2_ERA137_CAPABILITIES,
  FRANCHISE_SUITE_2_ERA137_POLICY_ID,
  FRANCHISE_SUITE_2_ERA137_ROUTE,
  FRANCHISE_SUITE_2_ERA137_SERVICE,
  FRANCHISE_SUITE_2_ERA137_WIRING_PATHS,
} from "@/lib/enterprise/franchise-suite-2-era137-policy";

export const FRANCHISE_SUITE_2_SMOKE_SUMMARY_VERSION = FRANCHISE_SUITE_2_ERA137_POLICY_ID;

export type FranchiseSuite2SmokeEra137Overall = "PASSED" | "FAILED" | "SKIPPED";

export type FranchiseSuite2SmokeEra137ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type FranchiseSuite2SmokeEra137Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type FranchiseSuite2SmokeEra137Summary = {
  version: typeof FRANCHISE_SUITE_2_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: FranchiseSuite2SmokeEra137Overall;
  proofStatus: FranchiseSuite2SmokeEra137ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: FranchiseSuite2SmokeEra137Step[];
  honestyNote: string;
};

export function auditFranchiseSuite2SmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of FRANCHISE_SUITE_2_ERA137_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === FRANCHISE_SUITE_2_ERA137_SERVICE) {
      if (!src.includes("loadFranchiseSuiteDashboard")) {
        failures.push("franchise-service.ts missing loadFranchiseSuiteDashboard");
      }
      if (!src.includes("calculateRoyalties")) {
        failures.push("franchise-service.ts missing calculateRoyalties");
      }
      if (!src.includes("buildFranchiseUnitRows")) {
        failures.push("franchise-service.ts missing buildFranchiseUnitRows");
      }
      if (!src.includes("buildFranchiseSuiteDashboard")) {
        failures.push("franchise-service.ts missing buildFranchiseSuiteDashboard");
      }
    }

    if (rel === "lib/enterprise/franchise-suite-2-builders.ts") {
      if (!src.includes("buildFranchiseSuiteDashboardV2")) {
        failures.push("franchise-suite-2-builders.ts missing buildFranchiseSuiteDashboardV2");
      }
      if (!src.includes("buildFranchiseComplianceChecks")) {
        failures.push("franchise-suite-2-builders.ts missing buildFranchiseComplianceChecks");
      }
      if (!src.includes("buildFranchiseRoyaltyInsights")) {
        failures.push("franchise-suite-2-builders.ts missing buildFranchiseRoyaltyInsights");
      }
      if (!src.includes("buildFranchiseUnitRollout")) {
        failures.push("franchise-suite-2-builders.ts missing buildFranchiseUnitRollout");
      }
      if (!src.includes("resolveFranchiseRolloutPhase")) {
        failures.push("franchise-suite-2-builders.ts missing resolveFranchiseRolloutPhase");
      }
    }

    if (rel === "lib/enterprise/franchise-suite-2-policy.ts") {
      if (!src.includes("FRANCHISE_SUITE_2_POLICY_ID")) {
        failures.push("franchise-suite-2-policy.ts missing policy id");
      }
      if (!src.includes("FRANCHISE_SUITE_2_PATH")) {
        failures.push("franchise-suite-2-policy.ts missing route path");
      }
      if (!src.includes("FRANCHISE_ROLLOUT_PHASES")) {
        failures.push("franchise-suite-2-policy.ts missing rollout phases");
      }
      if (!src.includes("FRANCHISE_COMPLIANCE_CHECK_IDS")) {
        failures.push("franchise-suite-2-policy.ts missing compliance check ids");
      }
    }

    if (rel === "lib/enterprise/franchise-builders.ts") {
      if (!src.includes("buildFranchiseSuiteDashboardV2")) {
        failures.push("franchise-builders.ts missing v2 dashboard integration");
      }
      if (!src.includes("buildFranchiseUnitRows")) {
        failures.push("franchise-builders.ts missing buildFranchiseUnitRows");
      }
    }

    if (rel === "app/dashboard/enterprise/franchise/page.tsx") {
      if (!src.includes("loadFranchiseSuiteDashboard")) {
        failures.push("franchise page missing loadFranchiseSuiteDashboard");
      }
      if (!src.includes("FranchiseSuitePanel")) {
        failures.push("franchise page missing FranchiseSuitePanel");
      }
      if (!src.includes("Brand control, royalties, and menu enforcement for franchise networks")) {
        failures.push("franchise page missing franchise suite copy");
      }
    }

    if (rel === "components/enterprise/franchise-suite-panel.tsx") {
      if (!src.includes("franchise-suite-panel")) {
        failures.push("franchise-suite-panel.tsx missing root test id");
      }
      if (!src.includes("Rollout pipeline")) {
        failures.push("franchise-suite-panel.tsx missing rollout pipeline section");
      }
      if (!src.includes("Royalty insights")) {
        failures.push("franchise-suite-panel.tsx missing royalty insights section");
      }
      if (!src.includes("franchise-unit-")) {
        failures.push("franchise-suite-panel.tsx missing franchise unit rows");
      }
      if (!src.includes("Compliance pass rate")) {
        failures.push("franchise-suite-panel.tsx missing compliance pass rate KPI");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveFranchiseSuite2SmokeEra137ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): FranchiseSuite2SmokeEra137ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildFranchiseSuite2SmokeEra137Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): FranchiseSuite2SmokeEra137Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveFranchiseSuite2SmokeEra137ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: FranchiseSuite2SmokeEra137Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: FranchiseSuite2SmokeEra137Step[] = [
    {
      id: "wiring_audit",
      label: "Royalty tracking → compliance checklist → rollout phases",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 137 Franchise Management Suite cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: FRANCHISE_SUITE_2_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: FRANCHISE_SUITE_2_ERA137_ROUTE,
    capabilities: FRANCHISE_SUITE_2_ERA137_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires franchise relationships and revenue data in workspace.",
  };
}

export function formatFranchiseSuite2SmokeEra137ReportLines(
  summary: FranchiseSuite2SmokeEra137Summary,
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
