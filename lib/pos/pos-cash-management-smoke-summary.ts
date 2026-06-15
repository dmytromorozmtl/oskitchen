/**
 * POS Cash Management smoke summary — wiring audit (Era 98).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CASH_MANAGEMENT_ERA98_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA98_ROUTE,
  POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS,
  POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS,
} from "@/lib/pos/pos-cash-management-era98-policy";

export const POS_CASH_MANAGEMENT_SMOKE_SUMMARY_VERSION = POS_CASH_MANAGEMENT_ERA98_POLICY_ID;

export type PosCashManagementSmokeEra98Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosCashManagementSmokeEra98ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosCashManagementSmokeEra98Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosCashManagementSmokeEra98Summary = {
  version: typeof POS_CASH_MANAGEMENT_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosCashManagementSmokeEra98Overall;
  proofStatus: PosCashManagementSmokeEra98ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  workflowSteps: readonly string[];
  steps: PosCashManagementSmokeEra98Step[];
  honestyNote: string;
};

export function auditPosCashManagementSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/pos/pos-cash-management.ts") {
      if (!src.includes("POS_CASH_MANAGEMENT_STEPS")) {
        failures.push("pos-cash-management.ts missing workflow steps");
      }
      if (!src.includes("buildCashCloseReport")) {
        failures.push("pos-cash-management.ts missing buildCashCloseReport");
      }
      for (const step of POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS) {
        if (!src.includes(`"${step}"`)) {
          failures.push(`pos-cash-management.ts missing step ${step}`);
        }
      }
    }

    if (rel === "components/pos/pos-cash-management-client.tsx") {
      if (!src.includes("pos-cash-management-root")) {
        failures.push("pos-cash-management-client.tsx missing root test id");
      }
      if (!src.includes("pos-cash-open-panel")) {
        failures.push("pos-cash-management-client.tsx missing open panel");
      }
      if (!src.includes("pos-cash-count-panel")) {
        failures.push("pos-cash-management-client.tsx missing count panel");
      }
      if (!src.includes("pos-cash-close-panel")) {
        failures.push("pos-cash-management-client.tsx missing close panel");
      }
      if (!src.includes("pos-cash-report-panel")) {
        failures.push("pos-cash-management-client.tsx missing report panel");
      }
    }

    if (rel === "actions/pos/cash.ts") {
      if (!src.includes("recordCashCountAction")) {
        failures.push("actions/pos/cash.ts missing recordCashCountAction");
      }
    }

    if (rel === "services/pos/pos-cash-count-service.ts") {
      if (!src.includes("recordCashDrawerCount")) {
        failures.push("pos-cash-count-service.ts missing recordCashDrawerCount");
      }
    }

    if (rel === "app/dashboard/pos/cash/page.tsx") {
      if (!src.includes("PosCashManagementClient")) {
        failures.push("cash page missing PosCashManagementClient");
      }
    }

    if (rel === "lib/pos/pos-subnav-links.ts") {
      if (!src.includes("/dashboard/pos/cash")) {
        failures.push("pos-subnav-links.ts missing cash route");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosCashManagementSmokeEra98ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosCashManagementSmokeEra98ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosCashManagementSmokeEra98Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosCashManagementSmokeEra98Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosCashManagementSmokeEra98ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosCashManagementSmokeEra98Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosCashManagementSmokeEra98Step[] = [
    {
      id: "wiring_audit",
      label: "Open float → mid-shift count → close with variance → printable report",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 98 POS Cash Management cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_CASH_MANAGEMENT_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: POS_CASH_MANAGEMENT_ERA98_ROUTE,
    workflowSteps: POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live drawer proof requires physical cash count on register.",
  };
}

export function formatPosCashManagementSmokeEra98ReportLines(
  summary: PosCashManagementSmokeEra98Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Workflow: ${summary.workflowSteps.join(" → ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
