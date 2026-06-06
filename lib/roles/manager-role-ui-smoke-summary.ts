/**
 * Manager Role UI smoke summary — wiring audit (Era 128).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MANAGER_ROLE_UI_ERA128_POLICY_ID,
  MANAGER_ROLE_UI_ERA128_ROUTE,
  MANAGER_ROLE_UI_ERA128_SECTIONS,
  MANAGER_ROLE_UI_ERA128_WIRING_PATHS,
} from "@/lib/roles/manager-role-ui-era128-policy";
import { MANAGER_ROLE_UI_SERVICE } from "@/lib/roles/manager-ui-policy";

export const MANAGER_ROLE_UI_SMOKE_SUMMARY_VERSION = MANAGER_ROLE_UI_ERA128_POLICY_ID;

export type ManagerRoleUiSmokeEra128Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ManagerRoleUiSmokeEra128ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ManagerRoleUiSmokeEra128Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ManagerRoleUiSmokeEra128Summary = {
  version: typeof MANAGER_ROLE_UI_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ManagerRoleUiSmokeEra128Overall;
  proofStatus: ManagerRoleUiSmokeEra128ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: ManagerRoleUiSmokeEra128Step[];
  honestyNote: string;
};

export function auditManagerRoleUiSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MANAGER_ROLE_UI_ERA128_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MANAGER_ROLE_UI_SERVICE) {
      if (!src.includes("loadManagerRoleUiSnapshot")) {
        failures.push("manager-ui-service.ts missing loadManagerRoleUiSnapshot");
      }
      if (!src.includes("loadOwnerDailyBriefing")) {
        failures.push("manager-ui-service.ts missing loadOwnerDailyBriefing");
      }
      if (!src.includes("loadExecutiveOverview")) {
        failures.push("manager-ui-service.ts missing loadExecutiveOverview");
      }
      if (!src.includes("buildManagerRoleUiSnapshot")) {
        failures.push("manager-ui-service.ts missing buildManagerRoleUiSnapshot");
      }
      if (!src.includes('rolePack: "manager"')) {
        failures.push("manager-ui-service.ts missing manager role pack");
      }
    }

    if (rel === "lib/roles/manager-ui-builders.ts") {
      if (!src.includes("buildManagerRoleKpisFromExecutive")) {
        failures.push("manager-ui-builders.ts missing buildManagerRoleKpisFromExecutive");
      }
      if (!src.includes("buildManagerRoleUiSnapshot")) {
        failures.push("manager-ui-builders.ts missing buildManagerRoleUiSnapshot");
      }
      if (!src.includes("MANAGER_ROLE_SHORTCUTS")) {
        failures.push("manager-ui-builders.ts missing MANAGER_ROLE_SHORTCUTS");
      }
      if (!src.includes("BRIEFING_ROLE_PACK_LABEL")) {
        failures.push("manager-ui-builders.ts missing briefing role pack label");
      }
    }

    if (rel === "lib/roles/manager-ui-policy.ts") {
      if (!src.includes("MANAGER_ROLE_UI_POLICY_ID")) {
        failures.push("manager-ui-policy.ts missing policy id");
      }
      if (!src.includes("MANAGER_ROLE_UI_PATH")) {
        failures.push("manager-ui-policy.ts missing route path");
      }
      if (!src.includes("MANAGER_ROLE_UI_PACK")) {
        failures.push("manager-ui-policy.ts missing manager pack id");
      }
    }

    if (rel === "app/dashboard/roles/manager/page.tsx") {
      if (!src.includes("loadManagerRoleUiSnapshot")) {
        failures.push("manager role page missing loadManagerRoleUiSnapshot");
      }
      if (!src.includes("ManagerRolePanel")) {
        failures.push("manager role page missing ManagerRolePanel");
      }
      if (!src.includes("Role-based UI for shift managers — operational KPIs, briefing priorities, and floor shortcuts")) {
        failures.push("manager role page missing role-based UI copy");
      }
      if (!src.includes("canAccessManagerRoleUi")) {
        failures.push("manager role page missing manager access gate");
      }
    }

    if (rel === "components/roles/manager-role-panel.tsx") {
      if (!src.includes("manager-role-panel")) {
        failures.push("manager-role-panel.tsx missing root test id");
      }
      if (!src.includes("Next action")) {
        failures.push("manager-role-panel.tsx missing next action section");
      }
      if (!src.includes("Priority tiles")) {
        failures.push("manager-role-panel.tsx missing priority tiles section");
      }
      if (!src.includes("Manager shortcuts")) {
        failures.push("manager-role-panel.tsx missing manager shortcuts section");
      }
      if (!src.includes("Top actions")) {
        failures.push("manager-role-panel.tsx missing top actions section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveManagerRoleUiSmokeEra128ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): ManagerRoleUiSmokeEra128ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildManagerRoleUiSmokeEra128Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): ManagerRoleUiSmokeEra128Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveManagerRoleUiSmokeEra128ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: ManagerRoleUiSmokeEra128Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: ManagerRoleUiSmokeEra128Step[] = [
    {
      id: "wiring_audit",
      label: "Operational KPIs → shift briefing → manager shortcuts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 128 Manager Role UI cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MANAGER_ROLE_UI_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: MANAGER_ROLE_UI_ERA128_ROUTE,
    sections: MANAGER_ROLE_UI_ERA128_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires manager/operational permissions and shift briefing data.",
  };
}

export function formatManagerRoleUiSmokeEra128ReportLines(
  summary: ManagerRoleUiSmokeEra128Summary,
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
