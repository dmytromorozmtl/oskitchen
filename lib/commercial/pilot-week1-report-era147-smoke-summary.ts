/**
 * Pilot Week 1 report summary — wiring audit (Era 147).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC,
  PILOT_WEEK1_REPORT_ERA147_CAPABILITIES,
  PILOT_WEEK1_REPORT_ERA147_DOC_REQUIRED_HEADINGS,
  PILOT_WEEK1_REPORT_ERA147_EXECUTION_ARTIFACT,
  PILOT_WEEK1_REPORT_ERA147_FORBIDDEN_CLAIMS,
  PILOT_WEEK1_REPORT_ERA147_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS,
} from "@/lib/commercial/pilot-week1-report-era147-policy";

export const PILOT_WEEK1_REPORT_ERA147_SMOKE_SUMMARY_VERSION =
  PILOT_WEEK1_REPORT_ERA147_POLICY_ID;

export type PilotWeek1ReportEra147Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PilotWeek1ReportEra147ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PilotWeek1ReportEra147Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PilotWeek1ReportEra147Summary = {
  version: typeof PILOT_WEEK1_REPORT_ERA147_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PilotWeek1ReportEra147Overall;
  proofStatus: PilotWeek1ReportEra147ProofStatus;
  wiringCertPassed: boolean;
  reportDocAuditPassed: boolean;
  executionMilestone: string | null;
  capabilities: readonly string[];
  steps: PilotWeek1ReportEra147Step[];
  honestyNote: string;
};

export function auditPilotWeek1ReportDocContent(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  const path = join(root, PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC);
  if (!existsSync(path)) {
    return { ok: false, failures: [`missing ${PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC}`] };
  }

  const source = readFileSync(path, "utf8");
  for (const heading of PILOT_WEEK1_REPORT_ERA147_DOC_REQUIRED_HEADINGS) {
    if (!source.includes(heading)) {
      failures.push(`missing heading: ${heading}`);
    }
  }

  const lower = source.toLowerCase();
  for (const phrase of PILOT_WEEK1_REPORT_ERA147_FORBIDDEN_CLAIMS) {
    if (lower.includes(phrase)) {
      failures.push(`forbidden claim: ${phrase}`);
    }
  }

  if (!source.includes("CONDITIONAL PASS")) {
    failures.push("missing Week 1 verdict: CONDITIONAL PASS");
  }

  return { ok: failures.length === 0, failures };
}

export function auditPilotWeek1ReportEra147Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docAudit = auditPilotWeek1ReportDocContent(root);
  if (!docAudit.ok) {
    failures.push(...docAudit.failures);
  }

  return { ok: failures.length === 0, failures };
}

export function readPilotWeek1ExecutionMilestone(root: string = process.cwd()): string | null {
  const path = join(root, PILOT_WEEK1_REPORT_ERA147_EXECUTION_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { milestone?: string };
    return parsed.milestone ?? null;
  } catch {
    return null;
  }
}

export function resolvePilotWeek1ReportEra147ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PilotWeek1ReportEra147ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPilotWeek1ReportEra147Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PilotWeek1ReportEra147Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const docAudit = auditPilotWeek1ReportDocContent(root);
  const executionMilestone = readPilotWeek1ExecutionMilestone(root);

  const proofStatus = resolvePilotWeek1ReportEra147ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PilotWeek1ReportEra147Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PilotWeek1ReportEra147Step[] = [
    {
      id: "wiring_audit",
      label: "LOI → Week 1 report → KPI capture → execution orchestrator wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 147 Pilot Week 1 report cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "report_doc_audit",
      label: "Canonical Week 1 report doc (era74)",
      status: docAudit.ok ? "PASSED" : "FAILED",
      reason: docAudit.ok ? undefined : docAudit.failures.join("; "),
    },
    {
      id: "execution_artifact",
      label: "Pilot Week 1 execution summary (era33)",
      status:
        executionMilestone === "week1_execution_passed"
          ? "PASSED"
          : executionMilestone
            ? "SKIPPED"
            : "SKIPPED",
      reason:
        executionMilestone === "week1_execution_passed"
          ? "Week 1 execution milestone on file"
          : executionMilestone
            ? `execution milestone: ${executionMilestone} — run npm run ops:run-pilot-week1-execution -- --write`
            : "No execution artifact — run npm run ops:run-pilot-week1-execution after Week 1",
    },
  ];

  return {
    version: PILOT_WEEK1_REPORT_ERA147_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    reportDocAuditPassed: docAudit.ok,
    executionMilestone,
    capabilities: PILOT_WEEK1_REPORT_ERA147_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Week 1 checkpoint report + wiring — production metrics baseline requires npm run smoke:pilot-metrics-baseline.",
  };
}

export function formatPilotWeek1ReportEra147ReportLines(
  summary: PilotWeek1ReportEra147Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Report doc audit: ${summary.reportDocAuditPassed ? "PASSED" : "FAILED"}`,
    `Execution milestone: ${summary.executionMilestone ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
