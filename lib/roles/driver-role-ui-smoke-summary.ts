/**
 * Driver Role UI smoke summary — wiring audit (Era 131).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DRIVER_ROLE_UI_ERA131_POLICY_ID,
  DRIVER_ROLE_UI_ERA131_ROUTE,
  DRIVER_ROLE_UI_ERA131_SECTIONS,
  DRIVER_ROLE_UI_ERA131_WIRING_PATHS,
} from "@/lib/roles/driver-role-ui-era131-policy";
import { DRIVER_ROLE_UI_SERVICE } from "@/lib/roles/driver-ui-policy";

export const DRIVER_ROLE_UI_SMOKE_SUMMARY_VERSION = DRIVER_ROLE_UI_ERA131_POLICY_ID;

export type DriverRoleUiSmokeEra131Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DriverRoleUiSmokeEra131ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DriverRoleUiSmokeEra131Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DriverRoleUiSmokeEra131Summary = {
  version: typeof DRIVER_ROLE_UI_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DriverRoleUiSmokeEra131Overall;
  proofStatus: DriverRoleUiSmokeEra131ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: DriverRoleUiSmokeEra131Step[];
  honestyNote: string;
};

export function auditDriverRoleUiSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of DRIVER_ROLE_UI_ERA131_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === DRIVER_ROLE_UI_SERVICE) {
      if (!src.includes("loadDriverRoleUiSnapshot")) {
        failures.push("driver-ui-service.ts missing loadDriverRoleUiSnapshot");
      }
      if (!src.includes("loadRouteOverviewKpis")) {
        failures.push("driver-ui-service.ts missing loadRouteOverviewKpis");
      }
      if (!src.includes("loadPackingDeliveryAnalytics")) {
        failures.push("driver-ui-service.ts missing loadPackingDeliveryAnalytics");
      }
      if (!src.includes("buildDriverRoleUiSnapshot")) {
        failures.push("driver-ui-service.ts missing buildDriverRoleUiSnapshot");
      }
    }

    if (rel === "lib/roles/driver-ui-builders.ts") {
      if (!src.includes("buildDriverRoleKpis")) {
        failures.push("driver-ui-builders.ts missing buildDriverRoleKpis");
      }
      if (!src.includes("buildDriverRoleUiSnapshot")) {
        failures.push("driver-ui-builders.ts missing buildDriverRoleUiSnapshot");
      }
      if (!src.includes("DRIVER_ROLE_SHORTCUTS")) {
        failures.push("driver-ui-builders.ts missing DRIVER_ROLE_SHORTCUTS");
      }
      if (!src.includes("DRIVER_ROLE_UI_LABEL")) {
        failures.push("driver-ui-builders.ts missing DRIVER_ROLE_UI_LABEL");
      }
    }

    if (rel === "lib/roles/driver-ui-policy.ts") {
      if (!src.includes("DRIVER_ROLE_UI_POLICY_ID")) {
        failures.push("driver-ui-policy.ts missing policy id");
      }
      if (!src.includes("DRIVER_ROLE_UI_PATH")) {
        failures.push("driver-ui-policy.ts missing route path");
      }
      if (!src.includes("DRIVER_ROLE_UI_PACK")) {
        failures.push("driver-ui-policy.ts missing driver pack id");
      }
    }

    if (rel === "app/dashboard/roles/driver/page.tsx") {
      if (!src.includes("loadDriverRoleUiSnapshot")) {
        failures.push("driver role page missing loadDriverRoleUiSnapshot");
      }
      if (!src.includes("DriverRolePanel")) {
        failures.push("driver role page missing DriverRolePanel");
      }
      if (
        !src.includes(
          "Role-based UI for delivery drivers — route KPIs, stop priorities, and dispatch shortcuts",
        )
      ) {
        failures.push("driver role page missing role-based UI copy");
      }
      if (!src.includes("canAccessDriverRoleUi")) {
        failures.push("driver role page missing driver access gate");
      }
    }

    if (rel === "components/roles/driver-role-panel.tsx") {
      if (!src.includes("driver-role-panel")) {
        failures.push("driver-role-panel.tsx missing root test id");
      }
      if (!src.includes("Next action")) {
        failures.push("driver-role-panel.tsx missing next action section");
      }
      if (!src.includes("Priority tiles")) {
        failures.push("driver-role-panel.tsx missing priority tiles section");
      }
      if (!src.includes("Driver shortcuts")) {
        failures.push("driver-role-panel.tsx missing driver shortcuts section");
      }
      if (!src.includes("Top actions")) {
        failures.push("driver-role-panel.tsx missing top actions section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveDriverRoleUiSmokeEra131ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): DriverRoleUiSmokeEra131ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildDriverRoleUiSmokeEra131Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): DriverRoleUiSmokeEra131Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveDriverRoleUiSmokeEra131ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: DriverRoleUiSmokeEra131Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: DriverRoleUiSmokeEra131Step[] = [
    {
      id: "wiring_audit",
      label: "Route KPIs → delivery signals → dispatch shortcuts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 131 Driver Role UI cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: DRIVER_ROLE_UI_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: DRIVER_ROLE_UI_ERA131_ROUTE,
    sections: DRIVER_ROLE_UI_ERA131_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires route/delivery permissions and active dispatch data.",
  };
}

export function formatDriverRoleUiSmokeEra131ReportLines(
  summary: DriverRoleUiSmokeEra131Summary,
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
