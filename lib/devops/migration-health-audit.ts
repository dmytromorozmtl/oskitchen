import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MIGRATION_HEALTH_CI_WORKFLOW,
  MIGRATION_HEALTH_NPM_SCRIPT,
  MIGRATION_HEALTH_POLICY_ID,
  MIGRATION_HEALTH_SCRIPT,
  migrationDiffIndicatesDrift,
} from "@/lib/devops/migration-health-policy";

export type MigrationHealthWiringAudit = {
  policyId: typeof MIGRATION_HEALTH_POLICY_ID;
  scriptPresent: boolean;
  scriptHasRequireDb: boolean;
  scriptHasMigrateDiff: boolean;
  deployGateWired: boolean;
  passed: boolean;
};

export function auditMigrationHealthWiring(root = process.cwd()): MigrationHealthWiringAudit {
  const scriptPath = join(root, MIGRATION_HEALTH_SCRIPT);
  const scriptPresent = existsSync(scriptPath);

  let scriptHasRequireDb = false;
  let scriptHasMigrateDiff = false;
  if (scriptPresent) {
    const source = readFileSync(scriptPath, "utf8");
    scriptHasRequireDb = source.includes("--require-db");
    scriptHasMigrateDiff = source.includes("prisma migrate diff");
  }

  let deployGateWired = false;
  const workflowPath = join(root, MIGRATION_HEALTH_CI_WORKFLOW);
  if (existsSync(workflowPath)) {
    const workflow = readFileSync(workflowPath, "utf8");
    deployGateWired = workflow.includes(MIGRATION_HEALTH_NPM_SCRIPT);
  }

  const passed =
    scriptPresent && scriptHasRequireDb && scriptHasMigrateDiff && deployGateWired;

  return {
    policyId: MIGRATION_HEALTH_POLICY_ID,
    scriptPresent,
    scriptHasRequireDb,
    scriptHasMigrateDiff,
    deployGateWired,
    passed,
  };
}

export { migrationDiffIndicatesDrift };
