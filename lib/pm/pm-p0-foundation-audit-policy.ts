import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PM_P0_FOUNDATION_PATTERNS_POLICY_ID,
  PM_P0_FOUNDATION_SUB_POLICIES,
} from "@/lib/pm/pm-p0-foundation-patterns";

/**
 * PM-01 — capstone audit for P0 program management foundation deliverables.
 */

export const PM_P0_FOUNDATION_AUDIT_POLICY_ID = PM_P0_FOUNDATION_PATTERNS_POLICY_ID;

export type PmP0FoundationSubAuditResult = {
  taskId: string;
  policyId: string;
  surface: string;
  passed: boolean;
};

export type PmP0FoundationAuditReport = {
  policyId: typeof PM_P0_FOUNDATION_AUDIT_POLICY_ID;
  subAudits: PmP0FoundationSubAuditResult[];
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function auditLoiTemplate(root: string): boolean {
  const source = readSurface(root, "docs/loi-design-partner-template.md");
  return (
    source.includes("design-partner-loi-v1") &&
    source.includes("Exhibit A") &&
    source.includes("pilot-gono-go-summary.json")
  );
}

function auditPilotExecutionChecklist(root: string): boolean {
  const source = readSurface(root, "docs/pilot-execution-checklist.md");
  return (
    source.includes("pilot-execution-checklist-v1") &&
    source.includes("16-step execution checklist") &&
    source.includes("loi-design-partner-template.md")
  );
}

function auditLiveIntegrationDod(root: string): boolean {
  const source = readSurface(root, "docs/live-integration-definition-of-done.md");
  return (
    source.includes("live-integration-dod-v1") &&
    source.includes("Four mandatory gates") &&
    source.includes("BETA ≠ LIVE")
  );
}

function auditStagingEnvironmentChecklist(root: string): boolean {
  const source = readSurface(root, "docs/staging-environment-checklist.md");
  return (
    source.includes("staging-environment-checklist-v1") &&
    source.includes("Vault secrets") &&
    source.includes("prisma migrate deploy")
  );
}

function auditMigrationDeploymentProcess(root: string): boolean {
  const source = readSurface(root, "docs/migration-deployment-process.md");
  return (
    source.includes("migration-deployment-process-v1") &&
    source.includes("prisma migrate deploy") &&
    source.includes("STAGING")
  );
}

const SUB_AUDIT_RUNNERS: Record<string, (root: string) => { policyId: string; passed: boolean }> =
  {
    "PM-01a": (root) => ({
      policyId: "design-partner-loi-pm01a-v1",
      passed: auditLoiTemplate(root),
    }),
    "PM-01b": (root) => ({
      policyId: "pilot-execution-checklist-pm01b-v1",
      passed: auditPilotExecutionChecklist(root),
    }),
    "PM-01c": (root) => ({
      policyId: "live-integration-dod-pm01c-v1",
      passed: auditLiveIntegrationDod(root),
    }),
    "PM-01d": (root) => ({
      policyId: "staging-environment-checklist-pm01d-v1",
      passed: auditStagingEnvironmentChecklist(root),
    }),
    "PM-01e": (root) => ({
      policyId: "migration-deployment-process-pm01e-v1",
      passed: auditMigrationDeploymentProcess(root),
    }),
  };

export function auditPmP0Foundation(root = process.cwd()): PmP0FoundationAuditReport {
  const subAudits = PM_P0_FOUNDATION_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!(root);
    return {
      taskId: entry.id,
      policyId: report.policyId,
      surface: entry.surface,
      passed: report.passed,
    };
  });

  return {
    policyId: PM_P0_FOUNDATION_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
