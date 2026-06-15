import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  SALES_PLAYBOOK_DOC,
  SALES_PLAYBOOK_HUB_MARKERS,
  SALES_PLAYBOOK_POLICY_ID,
  SALES_PLAYBOOK_RUNNER_SCRIPT,
  SALES_PLAYBOOK_SUMMARY_ARTIFACT,
  SALES_PLAYBOOK_SUMMARY_VERSION,
  SALES_PLAYBOOK_VITEST_SPEC,
} from "@/lib/execution/sales-playbook-policy";
import {
  TRUST_PAGE_SUMMARY_ARTIFACT,
  TRUST_PAGE_SUMMARY_VERSION,
} from "@/lib/execution/trust-page-policy";

/**
 * FINAL-20 — Sales-safe playbook hub gate (task-214).
 */

export const FINAL_20_SALES_PLAYBOOK_POLICY_ID = SALES_PLAYBOOK_POLICY_ID;

export type Final20SalesPlaybookAuditReport = {
  policyId: typeof FINAL_20_SALES_PLAYBOOK_POLICY_ID;
  phaseId: "FINAL-20";
  taskSlot: number;
  playbookPresent: boolean;
  hubRegistryHonest: boolean;
  vitestSpecPresent: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  playbookHonest: boolean;
  runnerScriptPresent: boolean;
  final19Passed: boolean;
  passed: boolean;
};

function readFinal19ArtifactPassed(root: string): boolean {
  const path = join(root, TRUST_PAGE_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    trustVitestPassed?: boolean;
  };
  return (
    summary.version === TRUST_PAGE_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_trust_maturity_labels" &&
    summary.trustVitestPassed === true
  );
}

export function auditSalesPlaybookHubRegistry(root = process.cwd()): boolean {
  const path = join(root, SALES_PLAYBOOK_DOC);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return SALES_PLAYBOOK_HUB_MARKERS.every((marker) => source.includes(marker));
}

export function auditFinal20SalesPlaybook(root = process.cwd()): Final20SalesPlaybookAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[19]!;
  const playbookPresent = existsSync(join(root, SALES_PLAYBOOK_DOC));
  const hubRegistryHonest = auditSalesPlaybookHubRegistry(root);
  const vitestSpecPresent = existsSync(join(root, SALES_PLAYBOOK_VITEST_SPEC));

  const artifactPath = join(root, SALES_PLAYBOOK_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let playbookHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      playbookVitestPassed?: boolean;
      capstonePassed?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === SALES_PLAYBOOK_SUMMARY_VERSION &&
      summary.runner === SALES_PLAYBOOK_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.playbookVitestPassed === true &&
      summary.capstonePassed === true;

    playbookHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_passed_sales_playbook_hub";
  }

  const runnerScriptPresent = existsSync(join(root, SALES_PLAYBOOK_RUNNER_SCRIPT));
  const final19Passed = readFinal19ArtifactPassed(root);

  const passed =
    playbookPresent &&
    hubRegistryHonest &&
    vitestSpecPresent &&
    artifactPresent &&
    artifactSchemaValid &&
    playbookHonest &&
    runnerScriptPresent &&
    final19Passed;

  return {
    policyId: FINAL_20_SALES_PLAYBOOK_POLICY_ID,
    phaseId: "FINAL-20",
    taskSlot: phase.taskSlot,
    playbookPresent,
    hubRegistryHonest,
    vitestSpecPresent,
    artifactPresent,
    artifactSchemaValid,
    playbookHonest,
    runnerScriptPresent,
    final19Passed,
    passed,
  };
}
