import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";
import {
  COMMERCIAL_PILOT_RUNBOOK_DOC,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_MARKERS,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_POLICY_ID,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION,
  COMMERCIAL_PILOT_RUNBOOK_FINAL_VITEST_BUNDLE,
} from "@/lib/execution/commercial-pilot-runbook-final-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  SALES_PLAYBOOK_SUMMARY_ARTIFACT,
  SALES_PLAYBOOK_SUMMARY_VERSION,
} from "@/lib/execution/sales-playbook-policy";

/**
 * FINAL-21 — Commercial pilot runbook gate (task-215).
 */

export const FINAL_21_COMMERCIAL_PILOT_RUNBOOK_POLICY_ID =
  COMMERCIAL_PILOT_RUNBOOK_FINAL_POLICY_ID;

export type Final21CommercialPilotRunbookAuditReport = {
  policyId: typeof FINAL_21_COMMERCIAL_PILOT_RUNBOOK_POLICY_ID;
  phaseId: "FINAL-21";
  taskSlot: number;
  runbookPresent: boolean;
  runbookRegistryHonest: boolean;
  vitestBundlePresent: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  runbookHonest: boolean;
  runnerScriptPresent: boolean;
  final20Passed: boolean;
  passed: boolean;
};

function readFinal20ArtifactPassed(root: string): boolean {
  const path = join(root, SALES_PLAYBOOK_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    playbookVitestPassed?: boolean;
    capstonePassed?: boolean;
  };
  return (
    summary.version === SALES_PLAYBOOK_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_sales_playbook_hub" &&
    summary.playbookVitestPassed === true &&
    summary.capstonePassed === true
  );
}

export function auditCommercialPilotRunbookRegistry(root = process.cwd()): boolean {
  const path = join(root, COMMERCIAL_PILOT_RUNBOOK_DOC);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  if (!source.includes(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID)) return false;
  const sectionsOk = COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS.every((section) =>
    source.includes(`## ${section}`),
  );
  const markersOk = COMMERCIAL_PILOT_RUNBOOK_FINAL_MARKERS.every((marker) =>
    source.includes(marker),
  );
  return sectionsOk && markersOk;
}

export function auditFinal21CommercialPilotRunbook(
  root = process.cwd(),
): Final21CommercialPilotRunbookAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[20]!;
  const runbookPresent = existsSync(join(root, COMMERCIAL_PILOT_RUNBOOK_DOC));
  const runbookRegistryHonest = auditCommercialPilotRunbookRegistry(root);
  const vitestBundlePresent = COMMERCIAL_PILOT_RUNBOOK_FINAL_VITEST_BUNDLE.every((spec) =>
    existsSync(join(root, spec)),
  );

  const artifactPath = join(root, COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let runbookHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      runbookVitestPassed?: boolean;
      ciCertScriptsPresent?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === COMMERCIAL_PILOT_RUNBOOK_FINAL_SUMMARY_VERSION &&
      summary.runner === COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.runbookVitestPassed === true &&
      summary.ciCertScriptsPresent === true;

    runbookHonest =
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_passed_commercial_pilot_runbook";
  }

  const runnerScriptPresent = existsSync(join(root, COMMERCIAL_PILOT_RUNBOOK_FINAL_RUNNER_SCRIPT));
  const final20Passed = readFinal20ArtifactPassed(root);

  const passed =
    runbookPresent &&
    runbookRegistryHonest &&
    vitestBundlePresent &&
    artifactPresent &&
    artifactSchemaValid &&
    runbookHonest &&
    runnerScriptPresent &&
    final20Passed;

  return {
    policyId: FINAL_21_COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
    phaseId: "FINAL-21",
    taskSlot: phase.taskSlot,
    runbookPresent,
    runbookRegistryHonest,
    vitestBundlePresent,
    artifactPresent,
    artifactSchemaValid,
    runbookHonest,
    runnerScriptPresent,
    final20Passed,
    passed,
  };
}
