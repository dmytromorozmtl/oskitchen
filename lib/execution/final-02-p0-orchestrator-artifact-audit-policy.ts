import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal01VaultGate } from "@/lib/execution/final-01-vault-gate-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-02 — P0 orchestrator staging artifact honesty gate (QA-01 artifact).
 */

export const FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID =
  "final-02-p0-orchestrator-artifact-v1" as const;

export const P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT =
  "artifacts/p0-orchestrator-staging-run-summary.json" as const;

export const P0_ORCHESTRATOR_STAGING_RUN_VERSION = "p0-orchestrator-staging-run-v1" as const;

export const P0_ORCHESTRATOR_WORKFLOW_PATH = ".github/workflows/p0-orchestrator.yml" as const;

export const P0_ORCHESTRATOR_STAGING_RUNNER_SCRIPT =
  "scripts/run-p0-orchestrator-staging.sh" as const;

export const P0_ORCHESTRATOR_REQUIRED_STEP_IDS = [
  "tier0_policy",
  "vault_gate",
  "smoke_workflows",
  "smoke_channel",
  "smoke_sso",
  "smoke_p0",
  "smoke_integrity",
] as const;

export type Final02P0OrchestratorArtifactAuditReport = {
  policyId: typeof FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID;
  phaseId: "FINAL-02";
  taskSlot: number;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  workflowPresent: boolean;
  runnerScriptPresent: boolean;
  final01Passed: boolean;
  honestOverall: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

export function auditFinal02P0OrchestratorArtifact(
  root = process.cwd(),
): Final02P0OrchestratorArtifactAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[1]!;
  const artifactPath = join(root, P0_ORCHESTRATOR_STAGING_RUN_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let honestOverall = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      task?: string;
      steps?: Array<{ id: string; status: string }>;
      workflow?: string;
      runner?: string;
      honestyNote?: string;
      p0ArtifactOverall?: string;
    };

    const stepIds = new Set(summary.steps?.map((step) => step.id) ?? []);
    const stepsComplete = P0_ORCHESTRATOR_REQUIRED_STEP_IDS.every((id) => stepIds.has(id));

    artifactSchemaValid =
      summary.version === P0_ORCHESTRATOR_STAGING_RUN_VERSION &&
      summary.task === "QA-01" &&
      stepsComplete &&
      summary.workflow === P0_ORCHESTRATOR_WORKFLOW_PATH &&
      summary.runner === P0_ORCHESTRATOR_STAGING_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20;

    honestOverall =
      summary.overall === "PASS" ||
      summary.overall === "FAIL" ||
      summary.p0ArtifactOverall === "PASSED" ||
      summary.p0ArtifactOverall === "FAILED";
  }

  const workflowPresent = existsSync(join(root, P0_ORCHESTRATOR_WORKFLOW_PATH));
  const workflowWired =
    workflowPresent &&
    readSurface(root, P0_ORCHESTRATOR_WORKFLOW_PATH).includes(
      "test:ci:p0-staging-proof-unblock-era17",
    ) &&
    readSurface(root, P0_ORCHESTRATOR_WORKFLOW_PATH).includes("smoke:live-integration-dod");

  const runnerScriptPresent = existsSync(join(root, P0_ORCHESTRATOR_STAGING_RUNNER_SCRIPT));
  const final01Passed = auditFinal01VaultGate(root).passed;

  const passed =
    artifactPresent &&
    artifactSchemaValid &&
    workflowWired &&
    runnerScriptPresent &&
    final01Passed &&
    honestOverall;

  return {
    policyId: FINAL_02_P0_ORCHESTRATOR_ARTIFACT_POLICY_ID,
    phaseId: "FINAL-02",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactSchemaValid,
    workflowPresent: workflowWired,
    runnerScriptPresent,
    final01Passed,
    honestOverall,
    passed,
  };
}
