/**
 * Commissary OS smoke summary — wiring audit (Era 112).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSARY_OS_ERA112_PILLARS,
  COMMISSARY_OS_ERA112_POLICY_ID,
  COMMISSARY_OS_ERA112_ROUTE,
  COMMISSARY_OS_ERA112_SERVICE,
  COMMISSARY_OS_ERA112_WIRING_PATHS,
} from "@/lib/enterprise/commissary-os-era112-policy";

export const COMMISSARY_OS_SMOKE_SUMMARY_VERSION = COMMISSARY_OS_ERA112_POLICY_ID;

export type CommissaryOsSmokeEra112Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CommissaryOsSmokeEra112ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CommissaryOsSmokeEra112Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CommissaryOsSmokeEra112Summary = {
  version: typeof COMMISSARY_OS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CommissaryOsSmokeEra112Overall;
  proofStatus: CommissaryOsSmokeEra112ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  pillars: readonly string[];
  steps: CommissaryOsSmokeEra112Step[];
  honestyNote: string;
};

export function auditCommissaryOsSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of COMMISSARY_OS_ERA112_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === COMMISSARY_OS_ERA112_SERVICE) {
      if (!src.includes("loadEnterpriseCommissaryDashboard")) {
        failures.push("commissary-service.ts missing loadEnterpriseCommissaryDashboard");
      }
      if (!src.includes("buildEnterpriseCommissaryDashboard")) {
        failures.push("commissary-service.ts missing buildEnterpriseCommissaryDashboard");
      }
      if (!src.includes("getProductionCalendar")) {
        failures.push("commissary-service.ts missing getProductionCalendar");
      }
      if (!src.includes("listTransfers")) {
        failures.push("commissary-service.ts missing listTransfers");
      }
      if (!src.includes("loadRouteOverviewKpis")) {
        failures.push("commissary-service.ts missing loadRouteOverviewKpis");
      }
    }

    if (rel === "lib/enterprise/commissary-builders.ts") {
      if (!src.includes("buildProductionPillar")) {
        failures.push("commissary-builders.ts missing buildProductionPillar");
      }
      if (!src.includes("buildPurchasingPillar")) {
        failures.push("commissary-builders.ts missing buildPurchasingPillar");
      }
      if (!src.includes("buildDeliveryPillar")) {
        failures.push("commissary-builders.ts missing buildDeliveryPillar");
      }
      if (!src.includes("buildDistributionPillar")) {
        failures.push("commissary-builders.ts missing buildDistributionPillar");
      }
      if (!src.includes("buildEnterpriseCommissaryDashboard")) {
        failures.push("commissary-builders.ts missing buildEnterpriseCommissaryDashboard");
      }
    }

    if (rel === "lib/enterprise/commissary-policy.ts") {
      if (!src.includes("ENTERPRISE_COMMISSARY_POLICY_ID")) {
        failures.push("commissary-policy.ts missing policy id");
      }
      if (!src.includes("ENTERPRISE_COMMISSARY_PATH")) {
        failures.push("commissary-policy.ts missing route");
      }
    }

    if (rel === "app/dashboard/enterprise/commissary/page.tsx") {
      if (!src.includes("CommissaryEnterprisePanel")) {
        failures.push("commissary page missing CommissaryEnterprisePanel");
      }
      if (!src.includes("loadEnterpriseCommissaryDashboard")) {
        failures.push("commissary page missing loadEnterpriseCommissaryDashboard");
      }
    }

    if (rel === "components/enterprise/commissary-enterprise-panel.tsx") {
      if (!src.includes("enterprise-commissary-panel")) {
        failures.push("commissary-enterprise-panel.tsx missing root test id");
      }
      if (!src.includes("Commissary OS")) {
        failures.push("commissary-enterprise-panel.tsx missing Commissary OS title");
      }
      if (!src.includes("purchasing, delivery, and distribution")) {
        failures.push("commissary-enterprise-panel.tsx missing four-pillar copy");
      }
      if (!src.includes("pillars.map")) {
        failures.push("commissary-enterprise-panel.tsx missing pillar cards");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCommissaryOsSmokeEra112ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CommissaryOsSmokeEra112ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCommissaryOsSmokeEra112Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CommissaryOsSmokeEra112Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCommissaryOsSmokeEra112ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CommissaryOsSmokeEra112Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CommissaryOsSmokeEra112Step[] = [
    {
      id: "wiring_audit",
      label: "Production + purchasing + delivery + distribution → four pillars → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 112 Commissary OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: COMMISSARY_OS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: COMMISSARY_OS_ERA112_ROUTE,
    pillars: COMMISSARY_OS_ERA112_PILLARS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with production plans, POs, transfers, and routes.",
  };
}

export function formatCommissaryOsSmokeEra112ReportLines(
  summary: CommissaryOsSmokeEra112Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
