/**
 * CRM Automation smoke summary — wiring audit (Era 123).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CRM_AUTOMATION_ERA123_POLICY_ID,
  CRM_AUTOMATION_ERA123_ROUTE,
  CRM_AUTOMATION_ERA123_TRIGGERS,
  CRM_AUTOMATION_ERA123_WIRING_PATHS,
} from "@/lib/crm/crm-automation-era123-policy";
import { CRM_AUTOMATION_SERVICE } from "@/lib/crm/automation-policy";

export const CRM_AUTOMATION_SMOKE_SUMMARY_VERSION = CRM_AUTOMATION_ERA123_POLICY_ID;

export type CrmAutomationSmokeEra123Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CrmAutomationSmokeEra123ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CrmAutomationSmokeEra123Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CrmAutomationSmokeEra123Summary = {
  version: typeof CRM_AUTOMATION_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CrmAutomationSmokeEra123Overall;
  proofStatus: CrmAutomationSmokeEra123ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  triggers: readonly string[];
  steps: CrmAutomationSmokeEra123Step[];
  honestyNote: string;
};

export function auditCrmAutomationSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of CRM_AUTOMATION_ERA123_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === CRM_AUTOMATION_SERVICE) {
      if (!src.includes("loadCrmAutomationSnapshot")) {
        failures.push("automation-service.ts missing loadCrmAutomationSnapshot");
      }
      if (!src.includes("loadWinBackCandidates")) {
        failures.push("automation-service.ts missing win-back candidate loader");
      }
      if (!src.includes("loadBirthdayCandidates")) {
        failures.push("automation-service.ts missing birthday candidate loader");
      }
      if (!src.includes("loadFavoritesCandidates")) {
        failures.push("automation-service.ts missing favorites candidate loader");
      }
      if (!src.includes("runCrmAutomationScan")) {
        failures.push("automation-service.ts missing runCrmAutomationScan");
      }
      if (!src.includes("saveCrmAutomationConfig")) {
        failures.push("automation-service.ts missing saveCrmAutomationConfig");
      }
    }

    if (rel === "lib/crm/automation-builders.ts") {
      if (!src.includes("buildCrmAutomationQueueItem")) {
        failures.push("automation-builders.ts missing buildCrmAutomationQueueItem");
      }
      if (!src.includes("buildCrmAutomationLane")) {
        failures.push("automation-builders.ts missing buildCrmAutomationLane");
      }
      if (!src.includes("buildCrmAutomationSnapshot")) {
        failures.push("automation-builders.ts missing buildCrmAutomationSnapshot");
      }
      if (!src.includes("Win-back")) {
        failures.push("automation-builders.ts missing win-back lane label");
      }
    }

    if (rel === "lib/crm/automation-policy.ts") {
      if (!src.includes("CRM_AUTOMATION_POLICY_ID")) {
        failures.push("automation-policy.ts missing policy id");
      }
      if (!src.includes("CRM_AUTOMATION_PATH")) {
        failures.push("automation-policy.ts missing route path");
      }
      if (!src.includes("CRM_AUTOMATION_WIN_BACK_DEFAULT_DAYS")) {
        failures.push("automation-policy.ts missing win-back default days");
      }
    }

    if (rel === "app/dashboard/crm/automation/page.tsx") {
      if (!src.includes("loadCrmAutomationSnapshot")) {
        failures.push("crm automation page missing loadCrmAutomationSnapshot");
      }
      if (!src.includes("CrmAutomationPanel")) {
        failures.push("crm automation page missing CrmAutomationPanel");
      }
      if (!src.includes("Automated win-back outreach, birthday rewards, and favorites reorder nudges")) {
        failures.push("crm automation page missing three-trigger copy");
      }
    }

    if (rel === "components/crm/crm-automation-panel.tsx") {
      if (!src.includes("crm-automation-panel")) {
        failures.push("crm-automation-panel.tsx missing root test id");
      }
      if (!src.includes("Win-back")) {
        failures.push("crm-automation-panel.tsx missing win-back section");
      }
      if (!src.includes("Birthdays")) {
        failures.push("crm-automation-panel.tsx missing birthday section");
      }
      if (!src.includes("Favorites")) {
        failures.push("crm-automation-panel.tsx missing favorites section");
      }
      if (!src.includes("Run scan now")) {
        failures.push("crm-automation-panel.tsx missing run scan action");
      }
    }

    if (rel === "actions/crm/automation.ts") {
      if (!src.includes("saveCrmAutomationConfigAction")) {
        failures.push("automation.ts missing saveCrmAutomationConfigAction");
      }
      if (!src.includes("runCrmAutomationScanAction")) {
        failures.push("automation.ts missing runCrmAutomationScanAction");
      }
      if (!src.includes("runCrmAutomationScan")) {
        failures.push("automation.ts missing runCrmAutomationScan service call");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveCrmAutomationSmokeEra123ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CrmAutomationSmokeEra123ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCrmAutomationSmokeEra123Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): CrmAutomationSmokeEra123Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveCrmAutomationSmokeEra123ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CrmAutomationSmokeEra123Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CrmAutomationSmokeEra123Step[] = [
    {
      id: "wiring_audit",
      label: "Win-back → birthday → favorites reorder automation",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 123 CRM Automation cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: CRM_AUTOMATION_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: CRM_AUTOMATION_ERA123_ROUTE,
    triggers: CRM_AUTOMATION_ERA123_TRIGGERS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires inactive customers, birthday tags, favorite items, and marketing consent.",
  };
}

export function formatCrmAutomationSmokeEra123ReportLines(
  summary: CrmAutomationSmokeEra123Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Triggers: ${summary.triggers.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
