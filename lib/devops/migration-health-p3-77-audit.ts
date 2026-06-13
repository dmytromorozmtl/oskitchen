import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MIGRATION_HEALTH_P3_77_DOC,
  MIGRATION_HEALTH_P3_77_NPM_SCRIPTS,
  MIGRATION_HEALTH_P3_77_POLICY_ID,
  MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW,
  MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID,
  MIGRATION_HEALTH_P3_77_WIRING_PATHS,
} from "@/lib/devops/migration-health-p3-77-policy";
import { validateMigrationHealthContract } from "@/lib/devops/migration-health-p3-77-measurement";

export type MigrationHealthP3_77AuditSummary = {
  policyId: typeof MIGRATION_HEALTH_P3_77_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  prodDriftWorkflow: typeof MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditMigrationHealthP3_77(
  root = process.cwd(),
): MigrationHealthP3_77AuditSummary {
  const wiringComplete = MIGRATION_HEALTH_P3_77_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, MIGRATION_HEALTH_P3_77_DOC))) {
    const source = readFileSync(join(root, MIGRATION_HEALTH_P3_77_DOC), "utf8");
    docWired =
      source.includes(MIGRATION_HEALTH_P3_77_POLICY_ID) &&
      source.includes(MIGRATION_HEALTH_P3_77_UPSTREAM_POLICY_ID) &&
      source.includes("prod drift");
  }

  const contract = validateMigrationHealthContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = MIGRATION_HEALTH_P3_77_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: MIGRATION_HEALTH_P3_77_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    prodDriftWorkflow: MIGRATION_HEALTH_P3_77_PROD_DRIFT_WORKFLOW,
    npmScriptsWired,
    passed,
  };
}

export function formatMigrationHealthP3_77AuditLines(
  summary: MigrationHealthP3_77AuditSummary,
): string[] {
  return [
    `Migration health audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${MIGRATION_HEALTH_P3_77_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Prod drift workflow: ${summary.prodDriftWorkflow}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
