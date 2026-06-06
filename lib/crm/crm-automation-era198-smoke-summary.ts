/**
 * CRM Automation summary — Round 2 wiring audit (Era 198).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CRM_AUTOMATION_ERA198_CANONICAL_SUMMARY_ARTIFACT,
  CRM_AUTOMATION_ERA198_POLICY_ID,
  CRM_AUTOMATION_ERA198_ROUTE,
  CRM_AUTOMATION_ERA198_TRIGGERS,
} from "@/lib/crm/crm-automation-era198-policy";
import { auditCrmAutomationSmokeWiring } from "@/lib/crm/crm-automation-smoke-summary";

export const CRM_AUTOMATION_ERA198_SMOKE_SUMMARY_VERSION = CRM_AUTOMATION_ERA198_POLICY_ID;

export type CrmAutomationSmokeEra198Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CrmAutomationSmokeEra198ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CrmAutomationSmokeEra198Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CrmAutomationSmokeEra198Summary = {
  version: typeof CRM_AUTOMATION_ERA198_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CrmAutomationSmokeEra198Overall;
  proofStatus: CrmAutomationSmokeEra198ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  triggers: readonly string[];
  steps: CrmAutomationSmokeEra198Step[];
  honestyNote: string;
};

export function auditCrmAutomationSmokeEra198Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditCrmAutomationSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, CRM_AUTOMATION_ERA198_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveCrmAutomationSmokeEra198ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CrmAutomationSmokeEra198ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCrmAutomationSmokeEra198Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): CrmAutomationSmokeEra198Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveCrmAutomationSmokeEra198ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CrmAutomationSmokeEra198Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CrmAutomationSmokeEra198Step[] = [
    {
      id: "wiring_audit",
      label: "Win-back → birthday → favorites reorder automation",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 198 CRM Automation cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era123)",
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
          ? "Canonical era123 smoke PASSED"
          : liveSmokeOverall
            ? `era123 artifact overall: ${liveSmokeOverall}`
            : "No era123 artifact — run npm run smoke:crm-automation-era123",
    },
  ];

  return {
    version: CRM_AUTOMATION_ERA198_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: CRM_AUTOMATION_ERA198_ROUTE,
    triggers: CRM_AUTOMATION_ERA198_TRIGGERS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires inactive customers, birthday tags, favorite items, and marketing consent.",
  };
}

export function formatCrmAutomationSmokeEra198ReportLines(
  summary: CrmAutomationSmokeEra198Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era123): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Triggers: ${summary.triggers.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
