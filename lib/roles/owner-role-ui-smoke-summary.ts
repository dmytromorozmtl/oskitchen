/**
 * Owner Role UI smoke summary — wiring audit (Era 127).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OWNER_ROLE_UI_ERA127_POLICY_ID,
  OWNER_ROLE_UI_ERA127_ROUTE,
  OWNER_ROLE_UI_ERA127_SECTIONS,
  OWNER_ROLE_UI_ERA127_WIRING_PATHS,
} from "@/lib/roles/owner-role-ui-era127-policy";
import { OWNER_ROLE_UI_SERVICE } from "@/lib/roles/owner-ui-policy";

export const OWNER_ROLE_UI_SMOKE_SUMMARY_VERSION = OWNER_ROLE_UI_ERA127_POLICY_ID;

export type OwnerRoleUiSmokeEra127Overall = "PASSED" | "FAILED" | "SKIPPED";

export type OwnerRoleUiSmokeEra127ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type OwnerRoleUiSmokeEra127Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type OwnerRoleUiSmokeEra127Summary = {
  version: typeof OWNER_ROLE_UI_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: OwnerRoleUiSmokeEra127Overall;
  proofStatus: OwnerRoleUiSmokeEra127ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: OwnerRoleUiSmokeEra127Step[];
  honestyNote: string;
};

export function auditOwnerRoleUiSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of OWNER_ROLE_UI_ERA127_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === OWNER_ROLE_UI_SERVICE) {
      if (!src.includes("loadOwnerRoleUiSnapshot")) {
        failures.push("owner-ui-service.ts missing loadOwnerRoleUiSnapshot");
      }
      if (!src.includes("loadOwnerDailyBriefing")) {
        failures.push("owner-ui-service.ts missing loadOwnerDailyBriefing");
      }
      if (!src.includes("loadExecutiveOverview")) {
        failures.push("owner-ui-service.ts missing loadExecutiveOverview");
      }
      if (!src.includes("buildOwnerRoleUiSnapshot")) {
        failures.push("owner-ui-service.ts missing buildOwnerRoleUiSnapshot");
      }
      if (!src.includes('rolePack: "owner"')) {
        failures.push("owner-ui-service.ts missing owner role pack");
      }
    }

    if (rel === "lib/roles/owner-ui-builders.ts") {
      if (!src.includes("buildOwnerRoleKpisFromExecutive")) {
        failures.push("owner-ui-builders.ts missing buildOwnerRoleKpisFromExecutive");
      }
      if (!src.includes("buildOwnerRoleUiSnapshot")) {
        failures.push("owner-ui-builders.ts missing buildOwnerRoleUiSnapshot");
      }
      if (!src.includes("OWNER_ROLE_SHORTCUTS")) {
        failures.push("owner-ui-builders.ts missing OWNER_ROLE_SHORTCUTS");
      }
      if (!src.includes("BRIEFING_ROLE_PACK_LABEL")) {
        failures.push("owner-ui-builders.ts missing briefing role pack label");
      }
    }

    if (rel === "lib/roles/owner-ui-policy.ts") {
      if (!src.includes("OWNER_ROLE_UI_POLICY_ID")) {
        failures.push("owner-ui-policy.ts missing policy id");
      }
      if (!src.includes("OWNER_ROLE_UI_PATH")) {
        failures.push("owner-ui-policy.ts missing route path");
      }
      if (!src.includes("OWNER_ROLE_UI_PACK")) {
        failures.push("owner-ui-policy.ts missing owner pack id");
      }
    }

    if (rel === "app/dashboard/roles/owner/page.tsx") {
      if (!src.includes("loadOwnerRoleUiSnapshot")) {
        failures.push("owner role page missing loadOwnerRoleUiSnapshot");
      }
      if (!src.includes("OwnerRolePanel")) {
        failures.push("owner role page missing OwnerRolePanel");
      }
      if (!src.includes("Role-based UI for restaurant owners — leadership KPIs, briefing priorities, and strategic shortcuts")) {
        failures.push("owner role page missing role-based UI copy");
      }
      if (!src.includes("canAccessOwnerOnlySurfaces")) {
        failures.push("owner role page missing owner access gate");
      }
    }

    if (rel === "components/roles/owner-role-panel.tsx") {
      if (!src.includes("owner-role-panel")) {
        failures.push("owner-role-panel.tsx missing root test id");
      }
      if (!src.includes("Next action")) {
        failures.push("owner-role-panel.tsx missing next action section");
      }
      if (!src.includes("Priority tiles")) {
        failures.push("owner-role-panel.tsx missing priority tiles section");
      }
      if (!src.includes("Owner shortcuts")) {
        failures.push("owner-role-panel.tsx missing owner shortcuts section");
      }
      if (!src.includes("Top actions")) {
        failures.push("owner-role-panel.tsx missing top actions section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveOwnerRoleUiSmokeEra127ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): OwnerRoleUiSmokeEra127ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildOwnerRoleUiSmokeEra127Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): OwnerRoleUiSmokeEra127Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveOwnerRoleUiSmokeEra127ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: OwnerRoleUiSmokeEra127Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: OwnerRoleUiSmokeEra127Step[] = [
    {
      id: "wiring_audit",
      label: "Leadership KPIs → briefing priorities → owner shortcuts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 127 Owner Role UI cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: OWNER_ROLE_UI_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: OWNER_ROLE_UI_ERA127_ROUTE,
    sections: OWNER_ROLE_UI_ERA127_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires owner workspace role and briefing data.",
  };
}

export function formatOwnerRoleUiSmokeEra127ReportLines(
  summary: OwnerRoleUiSmokeEra127Summary,
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
