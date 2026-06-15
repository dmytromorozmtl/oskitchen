/**
 * POS Cash Management summary — Round 2 wiring audit (Era 173).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_CASH_MANAGEMENT_ERA173_CANONICAL_SUMMARY_ARTIFACT,
  POS_CASH_MANAGEMENT_ERA173_CAPABILITIES,
  POS_CASH_MANAGEMENT_ERA173_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA173_ROUTE,
  POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS,
} from "@/lib/pos/pos-cash-management-era173-policy";
import { auditPosCashManagementSmokeWiring } from "@/lib/pos/pos-cash-management-smoke-summary";

export const POS_CASH_MANAGEMENT_ERA173_SMOKE_SUMMARY_VERSION =
  POS_CASH_MANAGEMENT_ERA173_POLICY_ID;

export type PosCashManagementSmokeEra173Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosCashManagementSmokeEra173ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosCashManagementSmokeEra173Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosCashManagementSmokeEra173Summary = {
  version: typeof POS_CASH_MANAGEMENT_ERA173_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosCashManagementSmokeEra173Overall;
  proofStatus: PosCashManagementSmokeEra173ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  workflowSteps: readonly string[];
  capabilities: readonly string[];
  steps: PosCashManagementSmokeEra173Step[];
  honestyNote: string;
};

export function auditPosCashManagementSmokeEra173Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosCashManagementSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_CASH_MANAGEMENT_ERA173_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosCashManagementSmokeEra173ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosCashManagementSmokeEra173ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosCashManagementSmokeEra173Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosCashManagementSmokeEra173Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosCashManagementSmokeEra173ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosCashManagementSmokeEra173Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosCashManagementSmokeEra173Step[] = [
    {
      id: "wiring_audit",
      label: "Open float → mid-shift count → close with variance → printable report",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 173 POS Cash Management cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era98)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era98 smoke PASSED"
          : liveSmokeOverall
            ? `era98 artifact overall: ${liveSmokeOverall}`
            : "No era98 artifact — run npm run smoke:pos-cash-management-era98",
    },
  ];

  return {
    version: POS_CASH_MANAGEMENT_ERA173_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: POS_CASH_MANAGEMENT_ERA173_ROUTE,
    workflowSteps: POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS,
    capabilities: POS_CASH_MANAGEMENT_ERA173_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live drawer proof requires physical cash count on register.",
  };
}

export function formatPosCashManagementSmokeEra173ReportLines(
  summary: PosCashManagementSmokeEra173Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era98): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Workflow: ${summary.workflowSteps.join(" → ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
