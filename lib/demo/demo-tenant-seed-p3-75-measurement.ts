import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditDemoTenantSeedPolicy,
} from "@/lib/demo/demo-tenant-seed-policy";
import {
  DEMO_TENANT_SEED_P3_75_DEMO_IMPORT_ACTION,
  DEMO_TENANT_SEED_P3_75_TARGETS,
  DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID,
} from "@/lib/demo/demo-tenant-seed-p3-75-policy";

export type DemoTenantSeedContractValidation = {
  passed: boolean;
  upstreamAuditOk: boolean;
  demoImportWired: boolean;
  targetsLocked: boolean;
  failures: string[];
};

export function validateDemoTenantSeedContract(
  root = process.cwd(),
): DemoTenantSeedContractValidation {
  const failures: string[] = [];

  const upstream = auditDemoTenantSeedPolicy(root);
  const upstreamAuditOk =
    upstream.passed && upstream.policyId === DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID;
  if (!upstreamAuditOk) {
    failures.push("upstream demo tenant seed audit failed");
  }

  let demoImportWired = false;
  const demoActionPath = join(root, DEMO_TENANT_SEED_P3_75_DEMO_IMPORT_ACTION);
  if (!existsSync(demoActionPath)) {
    failures.push(`missing demo import action: ${DEMO_TENANT_SEED_P3_75_DEMO_IMPORT_ACTION}`);
  } else {
    const source = readFileSync(demoActionPath, "utf8");
    demoImportWired = source.includes("seedCommercialDemoWorkspace");
    if (!demoImportWired) {
      failures.push("demo import must call seedCommercialDemoWorkspace");
    }
  }

  const targetsLocked =
    DEMO_TENANT_SEED_P3_75_TARGETS.orders === 50 &&
    DEMO_TENANT_SEED_P3_75_TARGETS.vendors === 3 &&
    DEMO_TENANT_SEED_P3_75_TARGETS.inventory === 20;
  if (!targetsLocked) {
    failures.push("blueprint targets drift from 50/3/20");
  }

  return {
    passed: failures.length === 0,
    upstreamAuditOk,
    demoImportWired,
    targetsLocked,
    failures,
  };
}
