/**
 * Chef Role UI smoke summary — wiring audit (Era 129).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CHEF_ROLE_UI_ERA129_POLICY_ID,
  CHEF_ROLE_UI_ERA129_ROUTE,
  CHEF_ROLE_UI_ERA129_SECTIONS,
  CHEF_ROLE_UI_ERA129_WIRING_PATHS,
} from "@/lib/roles/chef-role-ui-era129-policy";
import { CHEF_ROLE_UI_SERVICE } from "@/lib/roles/chef-ui-policy";

export const CHEF_ROLE_UI_SMOKE_SUMMARY_VERSION = CHEF_ROLE_UI_ERA129_POLICY_ID;

export type ChefRoleUiSmokeEra129Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ChefRoleUiSmokeEra129ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ChefRoleUiSmokeEra129Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ChefRoleUiSmokeEra129Summary = {
  version: typeof CHEF_ROLE_UI_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ChefRoleUiSmokeEra129Overall;
  proofStatus: ChefRoleUiSmokeEra129ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: ChefRoleUiSmokeEra129Step[];
  honestyNote: string;
};

export function auditChefRoleUiSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of CHEF_ROLE_UI_ERA129_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === CHEF_ROLE_UI_SERVICE) {
      if (!src.includes("loadChefRoleUiSnapshot")) {
        failures.push("chef-ui-service.ts missing loadChefRoleUiSnapshot");
      }
      if (!src.includes("loadOwnerDailyBriefing")) {
        failures.push("chef-ui-service.ts missing loadOwnerDailyBriefing");
      }
      if (!src.includes("loadProductionAnalytics")) {
        failures.push("chef-ui-service.ts missing loadProductionAnalytics");
      }
      if (!src.includes("buildChefRoleUiSnapshot")) {
        failures.push("chef-ui-service.ts missing buildChefRoleUiSnapshot");
      }
      if (!src.includes('rolePack: "kitchen"')) {
        failures.push("chef-ui-service.ts missing kitchen role pack");
      }
    }

    if (rel === "lib/roles/chef-ui-builders.ts") {
      if (!src.includes("buildChefRoleKpisFromProduction")) {
        failures.push("chef-ui-builders.ts missing buildChefRoleKpisFromProduction");
      }
      if (!src.includes("buildChefRoleUiSnapshot")) {
        failures.push("chef-ui-builders.ts missing buildChefRoleUiSnapshot");
      }
      if (!src.includes("CHEF_ROLE_SHORTCUTS")) {
        failures.push("chef-ui-builders.ts missing CHEF_ROLE_SHORTCUTS");
      }
      if (!src.includes("CHEF_ROLE_UI_LABEL")) {
        failures.push("chef-ui-builders.ts missing CHEF_ROLE_UI_LABEL");
      }
    }

    if (rel === "lib/roles/chef-ui-policy.ts") {
      if (!src.includes("CHEF_ROLE_UI_POLICY_ID")) {
        failures.push("chef-ui-policy.ts missing policy id");
      }
      if (!src.includes("CHEF_ROLE_UI_PATH")) {
        failures.push("chef-ui-policy.ts missing route path");
      }
      if (!src.includes("CHEF_ROLE_UI_PACK")) {
        failures.push("chef-ui-policy.ts missing kitchen pack id");
      }
    }

    if (rel === "app/dashboard/roles/chef/page.tsx") {
      if (!src.includes("loadChefRoleUiSnapshot")) {
        failures.push("chef role page missing loadChefRoleUiSnapshot");
      }
      if (!src.includes("ChefRolePanel")) {
        failures.push("chef role page missing ChefRolePanel");
      }
      if (!src.includes("Role-based UI for kitchen leads — line KPIs, KDS priorities, and production shortcuts")) {
        failures.push("chef role page missing role-based UI copy");
      }
      if (!src.includes("canAccessChefRoleUi")) {
        failures.push("chef role page missing chef access gate");
      }
    }

    if (rel === "components/roles/chef-role-panel.tsx") {
      if (!src.includes("chef-role-panel")) {
        failures.push("chef-role-panel.tsx missing root test id");
      }
      if (!src.includes("Next action")) {
        failures.push("chef-role-panel.tsx missing next action section");
      }
      if (!src.includes("Priority tiles")) {
        failures.push("chef-role-panel.tsx missing priority tiles section");
      }
      if (!src.includes("Chef shortcuts")) {
        failures.push("chef-role-panel.tsx missing chef shortcuts section");
      }
      if (!src.includes("Top actions")) {
        failures.push("chef-role-panel.tsx missing top actions section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveChefRoleUiSmokeEra129ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): ChefRoleUiSmokeEra129ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildChefRoleUiSmokeEra129Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): ChefRoleUiSmokeEra129Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveChefRoleUiSmokeEra129ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: ChefRoleUiSmokeEra129Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: ChefRoleUiSmokeEra129Step[] = [
    {
      id: "wiring_audit",
      label: "Line KPIs → kitchen briefing → chef shortcuts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 129 Chef Role UI cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: CHEF_ROLE_UI_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: CHEF_ROLE_UI_ERA129_ROUTE,
    sections: CHEF_ROLE_UI_ERA129_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires kitchen/production permissions and line briefing data.",
  };
}

export function formatChefRoleUiSmokeEra129ReportLines(
  summary: ChefRoleUiSmokeEra129Summary,
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
