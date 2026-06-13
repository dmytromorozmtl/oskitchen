import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEMO_TENANT_SEED_P3_75_DOC,
  DEMO_TENANT_SEED_P3_75_NPM_SCRIPTS,
  DEMO_TENANT_SEED_P3_75_POLICY_ID,
  DEMO_TENANT_SEED_P3_75_TARGETS,
  DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID,
  DEMO_TENANT_SEED_P3_75_WIRING_PATHS,
} from "@/lib/demo/demo-tenant-seed-p3-75-policy";
import { validateDemoTenantSeedContract } from "@/lib/demo/demo-tenant-seed-p3-75-measurement";

export type DemoTenantSeedP3_75AuditSummary = {
  policyId: typeof DEMO_TENANT_SEED_P3_75_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  targets: typeof DEMO_TENANT_SEED_P3_75_TARGETS;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditDemoTenantSeedP3_75(
  root = process.cwd(),
): DemoTenantSeedP3_75AuditSummary {
  const wiringComplete = DEMO_TENANT_SEED_P3_75_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, DEMO_TENANT_SEED_P3_75_DOC))) {
    const source = readFileSync(join(root, DEMO_TENANT_SEED_P3_75_DOC), "utf8");
    docWired =
      source.includes(DEMO_TENANT_SEED_P3_75_POLICY_ID) &&
      source.includes(DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID) &&
      source.includes("50 orders");
  }

  const contract = validateDemoTenantSeedContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = DEMO_TENANT_SEED_P3_75_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: DEMO_TENANT_SEED_P3_75_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    targets: DEMO_TENANT_SEED_P3_75_TARGETS,
    npmScriptsWired,
    passed,
  };
}

export function formatDemoTenantSeedP3_75AuditLines(
  summary: DemoTenantSeedP3_75AuditSummary,
): string[] {
  return [
    `Demo tenant seed audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${DEMO_TENANT_SEED_P3_75_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Targets: ${summary.targets.orders} orders · ${summary.targets.vendors} vendors · ${summary.targets.inventory} inventory`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
