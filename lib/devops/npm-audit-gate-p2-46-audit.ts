import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NPM_AUDIT_GATE_P2_46_ARTIFACT,
  NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND,
  NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT,
  NPM_AUDIT_GATE_P2_46_CI_STEP_NAME,
  NPM_AUDIT_GATE_P2_46_CI_WORKFLOW,
  NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW,
  NPM_AUDIT_GATE_P2_46_POLICY_ID,
} from "@/lib/devops/npm-audit-gate-p2-46-policy";

export type NpmAuditGateP246AuditSummary = {
  policyId: typeof NPM_AUDIT_GATE_P2_46_POLICY_ID;
  auditScriptDefined: boolean;
  auditCommandCorrect: boolean;
  ciWired: boolean;
  deployGateWired: boolean;
  ciRunsAfterInstall: boolean;
  deployRunsAfterInstall: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

function readJson<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function workflowHasAuditGate(workflowSource: string): {
  wired: boolean;
  runsAfterInstall: boolean;
} {
  const wired =
    workflowSource.includes(NPM_AUDIT_GATE_P2_46_CI_STEP_NAME) &&
    workflowSource.includes(`npm run ${NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT}`);
  const installIndex = workflowSource.indexOf("npm ci");
  const auditIndex = workflowSource.indexOf(NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT);
  const runsAfterInstall =
    installIndex >= 0 && auditIndex > installIndex;
  return { wired, runsAfterInstall };
}

export function auditNpmAuditGateP246(root = process.cwd()): NpmAuditGateP246AuditSummary {
  const pkg = readJson<{ scripts?: Record<string, string> }>(root, "package.json");
  const auditScriptDefined =
    pkg?.scripts?.[NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT] === NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND;
  const auditCommandCorrect =
    pkg?.scripts?.[NPM_AUDIT_GATE_P2_46_AUDIT_SCRIPT] === NPM_AUDIT_GATE_P2_46_AUDIT_COMMAND;

  let ciWired = false;
  let deployGateWired = false;
  let ciRunsAfterInstall = false;
  let deployRunsAfterInstall = false;

  const ciPath = join(root, NPM_AUDIT_GATE_P2_46_CI_WORKFLOW);
  if (existsSync(ciPath)) {
    const ci = readFileSync(ciPath, "utf8");
    const ciAudit = workflowHasAuditGate(ci);
    ciWired = ciAudit.wired;
    ciRunsAfterInstall = ciAudit.runsAfterInstall;
  }

  const deployPath = join(root, NPM_AUDIT_GATE_P2_46_DEPLOY_WORKFLOW);
  if (existsSync(deployPath)) {
    const deploy = readFileSync(deployPath, "utf8");
    const deployAudit = workflowHasAuditGate(deploy);
    deployGateWired = deployAudit.wired;
    deployRunsAfterInstall = deployAudit.runsAfterInstall;
  }

  const artifact = readJson<{ policyId?: string; auditLevel?: string }>(
    root,
    NPM_AUDIT_GATE_P2_46_ARTIFACT,
  );
  const artifactPresent =
    artifact?.policyId === NPM_AUDIT_GATE_P2_46_POLICY_ID &&
    artifact?.auditLevel === "high";

  const passed =
    auditScriptDefined &&
    auditCommandCorrect &&
    ciWired &&
    deployGateWired &&
    ciRunsAfterInstall &&
    deployRunsAfterInstall &&
    artifactPresent;

  return {
    policyId: NPM_AUDIT_GATE_P2_46_POLICY_ID,
    auditScriptDefined,
    auditCommandCorrect,
    ciWired,
    deployGateWired,
    ciRunsAfterInstall,
    deployRunsAfterInstall,
    artifactPresent,
    passed,
  };
}

export function formatNpmAuditGateP246AuditLines(
  summary: NpmAuditGateP246AuditSummary,
): string[] {
  return [
    `npm audit CI gate (${summary.policyId})`,
    `audit:dependencies:high script: ${summary.auditScriptDefined ? "yes" : "no"}`,
    `CI workflow wired: ${summary.ciWired ? "yes" : "no"}`,
    `Deploy gate wired: ${summary.deployGateWired ? "yes" : "no"}`,
    `Runs after npm ci (CI): ${summary.ciRunsAfterInstall ? "yes" : "no"}`,
    `Runs after npm ci (deploy): ${summary.deployRunsAfterInstall ? "yes" : "no"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
