/**
 * Cashier Role UI smoke summary — wiring audit (Era 130).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CASHIER_ROLE_UI_ERA130_POLICY_ID,
  CASHIER_ROLE_UI_ERA130_ROUTE,
  CASHIER_ROLE_UI_ERA130_SECTIONS,
  CASHIER_ROLE_UI_ERA130_WIRING_PATHS,
} from "@/lib/roles/cashier-role-ui-era130-policy";
import { CASHIER_ROLE_UI_SERVICE } from "@/lib/roles/cashier-ui-policy";

export const CASHIER_ROLE_UI_SMOKE_SUMMARY_VERSION = CASHIER_ROLE_UI_ERA130_POLICY_ID;

export type CashierRoleUiSmokeEra130Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CashierRoleUiSmokeEra130ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CashierRoleUiSmokeEra130Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CashierRoleUiSmokeEra130Summary = {
  version: typeof CASHIER_ROLE_UI_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CashierRoleUiSmokeEra130Overall;
  proofStatus: CashierRoleUiSmokeEra130ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: CashierRoleUiSmokeEra130Step[];
  honestyNote: string;
};

export function auditCashierRoleUiSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of CASHIER_ROLE_UI_ERA130_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === CASHIER_ROLE_UI_SERVICE) {
      if (!src.includes("loadCashierRoleUiSnapshot")) {
        failures.push("cashier-ui-service.ts missing loadCashierRoleUiSnapshot");
      }
      if (!src.includes("loadOwnerDailyBriefing")) {
        failures.push("cashier-ui-service.ts missing loadOwnerDailyBriefing");
      }
      if (!src.includes("loadTodayCommandCenter")) {
        failures.push("cashier-ui-service.ts missing loadTodayCommandCenter");
      }
      if (!src.includes("buildCashierRoleUiSnapshot")) {
        failures.push("cashier-ui-service.ts missing buildCashierRoleUiSnapshot");
      }
      if (!src.includes('rolePack: "cashier"')) {
        failures.push("cashier-ui-service.ts missing cashier role pack");
      }
    }

    if (rel === "lib/roles/cashier-ui-builders.ts") {
      if (!src.includes("buildCashierRoleKpisFromToday")) {
        failures.push("cashier-ui-builders.ts missing buildCashierRoleKpisFromToday");
      }
      if (!src.includes("buildCashierRoleUiSnapshot")) {
        failures.push("cashier-ui-builders.ts missing buildCashierRoleUiSnapshot");
      }
      if (!src.includes("CASHIER_ROLE_SHORTCUTS")) {
        failures.push("cashier-ui-builders.ts missing CASHIER_ROLE_SHORTCUTS");
      }
      if (!src.includes("BRIEFING_ROLE_PACK_LABEL")) {
        failures.push("cashier-ui-builders.ts missing briefing role pack label");
      }
    }

    if (rel === "lib/roles/cashier-ui-policy.ts") {
      if (!src.includes("CASHIER_ROLE_UI_POLICY_ID")) {
        failures.push("cashier-ui-policy.ts missing policy id");
      }
      if (!src.includes("CASHIER_ROLE_UI_PATH")) {
        failures.push("cashier-ui-policy.ts missing route path");
      }
      if (!src.includes("CASHIER_ROLE_UI_PACK")) {
        failures.push("cashier-ui-policy.ts missing cashier pack id");
      }
    }

    if (rel === "app/dashboard/roles/cashier/page.tsx") {
      if (!src.includes("loadCashierRoleUiSnapshot")) {
        failures.push("cashier role page missing loadCashierRoleUiSnapshot");
      }
      if (!src.includes("CashierRolePanel")) {
        failures.push("cashier role page missing CashierRolePanel");
      }
      if (
        !src.includes(
          "Role-based UI for front-of-house — register KPIs, POS priorities, and checkout shortcuts",
        )
      ) {
        failures.push("cashier role page missing role-based UI copy");
      }
      if (!src.includes("canAccessCashierRoleUi")) {
        failures.push("cashier role page missing cashier access gate");
      }
    }

    if (rel === "components/roles/cashier-role-panel.tsx") {
      if (!src.includes("cashier-role-panel")) {
        failures.push("cashier-role-panel.tsx missing root test id");
      }
      if (!src.includes("Next action")) {
        failures.push("cashier-role-panel.tsx missing next action section");
      }
      if (!src.includes("Priority tiles")) {
        failures.push("cashier-role-panel.tsx missing priority tiles section");
      }
      if (!src.includes("Cashier shortcuts")) {
        failures.push("cashier-role-panel.tsx missing cashier shortcuts section");
      }
      if (!src.includes("Top actions")) {
        failures.push("cashier-role-panel.tsx missing top actions section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCashierRoleUiSmokeEra130ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CashierRoleUiSmokeEra130ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCashierRoleUiSmokeEra130Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CashierRoleUiSmokeEra130Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCashierRoleUiSmokeEra130ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CashierRoleUiSmokeEra130Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CashierRoleUiSmokeEra130Step[] = [
    {
      id: "wiring_audit",
      label: "Register KPIs → cashier briefing → checkout shortcuts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 130 Cashier Role UI cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: CASHIER_ROLE_UI_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: CASHIER_ROLE_UI_ERA130_ROUTE,
    sections: CASHIER_ROLE_UI_ERA130_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires POS/order permissions and register briefing data.",
  };
}

export function formatCashierRoleUiSmokeEra130ReportLines(
  summary: CashierRoleUiSmokeEra130Summary,
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
