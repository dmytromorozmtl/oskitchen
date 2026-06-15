/**
 * Catering OS smoke summary — wiring audit (Era 113).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CATERING_OS_ERA113_MODULES,
  CATERING_OS_ERA113_POLICY_ID,
  CATERING_OS_ERA113_ROUTE,
  CATERING_OS_ERA113_SERVICE,
  CATERING_OS_ERA113_WIRING_PATHS,
} from "@/lib/catering/catering-os-era113-policy";

export const CATERING_OS_SMOKE_SUMMARY_VERSION = CATERING_OS_ERA113_POLICY_ID;

export type CateringOsSmokeEra113Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CateringOsSmokeEra113ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CateringOsSmokeEra113Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CateringOsSmokeEra113Summary = {
  version: typeof CATERING_OS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CateringOsSmokeEra113Overall;
  proofStatus: CateringOsSmokeEra113ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  modules: readonly string[];
  steps: CateringOsSmokeEra113Step[];
  honestyNote: string;
};

export function auditCateringOsSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of CATERING_OS_ERA113_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === CATERING_OS_ERA113_SERVICE) {
      if (!src.includes("loadCateringOsDashboard")) {
        failures.push("catering-os-service.ts missing loadCateringOsDashboard");
      }
      if (!src.includes("buildCateringOsDashboard")) {
        failures.push("catering-os-service.ts missing buildCateringOsDashboard");
      }
      if (!src.includes("loadCateringQuoteKpis")) {
        failures.push("catering-os-service.ts missing loadCateringQuoteKpis");
      }
      if (!src.includes("loadPackingTasksForDate")) {
        failures.push("catering-os-service.ts missing loadPackingTasksForDate");
      }
      if (!src.includes("loadRouteOverviewKpis")) {
        failures.push("catering-os-service.ts missing loadRouteOverviewKpis");
      }
    }

    if (rel === "lib/catering/catering-os-builders.ts") {
      if (!src.includes("buildEventsModule")) {
        failures.push("catering-os-builders.ts missing buildEventsModule");
      }
      if (!src.includes("buildClientsModule")) {
        failures.push("catering-os-builders.ts missing buildClientsModule");
      }
      if (!src.includes("buildPackingModule")) {
        failures.push("catering-os-builders.ts missing buildPackingModule");
      }
      if (!src.includes("buildRoutesModule")) {
        failures.push("catering-os-builders.ts missing buildRoutesModule");
      }
      if (!src.includes("buildCateringOsDashboard")) {
        failures.push("catering-os-builders.ts missing buildCateringOsDashboard");
      }
    }

    if (rel === "lib/catering/catering-os-policy.ts") {
      if (!src.includes("CATERING_OS_POLICY_ID")) {
        failures.push("catering-os-policy.ts missing policy id");
      }
      if (!src.includes("CATERING_OS_PATH")) {
        failures.push("catering-os-policy.ts missing route");
      }
    }

    if (rel === "app/dashboard/catering/page.tsx") {
      if (!src.includes("CateringOsPanel")) {
        failures.push("catering page missing CateringOsPanel");
      }
      if (!src.includes("loadCateringOsDashboard")) {
        failures.push("catering page missing loadCateringOsDashboard");
      }
    }

    if (rel === "components/catering/catering-os-panel.tsx") {
      if (!src.includes("catering-os-panel")) {
        failures.push("catering-os-panel.tsx missing root test id");
      }
      if (!src.includes("Catering OS")) {
        failures.push("catering-os-panel.tsx missing Catering OS title");
      }
      if (!src.includes("Events, clients, packing, and routes")) {
        failures.push("catering-os-panel.tsx missing four-module copy");
      }
      if (!src.includes("modules.map")) {
        failures.push("catering-os-panel.tsx missing module cards");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCateringOsSmokeEra113ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CateringOsSmokeEra113ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCateringOsSmokeEra113Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CateringOsSmokeEra113Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCateringOsSmokeEra113ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CateringOsSmokeEra113Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CateringOsSmokeEra113Step[] = [
    {
      id: "wiring_audit",
      label: "Events + clients + packing + routes → four modules → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 113 Catering OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: CATERING_OS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: CATERING_OS_ERA113_ROUTE,
    modules: CATERING_OS_ERA113_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with catering quotes, packing tasks, and routes.",
  };
}

export function formatCateringOsSmokeEra113ReportLines(
  summary: CateringOsSmokeEra113Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
