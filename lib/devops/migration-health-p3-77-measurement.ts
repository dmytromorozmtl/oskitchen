import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditMigrationHealthWiring } from "@/lib/devops/migration-health-audit";
import {
  MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW,
  MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID,
} from "@/lib/devops/migration-health-p3-77-policy";

export type MigrationHealthContractValidation = {
  passed: boolean;
  upstreamWiringOk: boolean;
  prodDriftWorkflowWired: boolean;
  failures: string[];
};

export function validateMigrationHealthContract(
  root = process.cwd(),
): MigrationHealthContractValidation {
  const failures: string[] = [];

  const upstream = auditMigrationHealthWiring(root);
  const upstreamWiringOk =
    upstream.passed && upstream.policyId === MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID;
  if (!upstreamWiringOk) {
    failures.push("upstream migration health wiring incomplete");
  }

  let prodDriftWorkflowWired = false;
  const workflowPath = join(root, MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW);
  if (!existsSync(workflowPath)) {
    failures.push(`missing prod drift workflow: ${MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW}`);
  } else {
    const source = readFileSync(workflowPath, "utf8");
    prodDriftWorkflowWired =
      source.includes("--require-db") &&
      source.includes("DIRECT_URL") &&
      source.includes("check:migration-health");
    if (!prodDriftWorkflowWired) {
      failures.push("prod drift workflow missing require-db DIRECT_URL wiring");
    }
  }

  return {
    passed: failures.length === 0,
    upstreamWiringOk,
    prodDriftWorkflowWired,
    failures,
  };
}
