import { describe, expect, it } from "vitest";

import {
  auditCrossTenantE2eSpec,
  auditFinal16CrossTenantIsolation,
  FINAL_16_CROSS_TENANT_POLICY_ID,
} from "@/lib/execution/final-16-cross-tenant-audit-policy";
import {
  CROSS_TENANT_E2E_SPEC,
  CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT,
  CROSS_TENANT_RUNNER_SCRIPT,
} from "@/lib/execution/cross-tenant-isolation-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-16 cross-tenant isolation audit", () => {
  it("locks FINAL-16 policy and task slot 210", () => {
    expect(FINAL_16_CROSS_TENANT_POLICY_ID).toBe("final-16-cross-tenant-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[15]?.id).toBe("FINAL-16");
    expect(FINAL_ORCHESTRATOR_PHASES[15]?.taskSlot).toBe(210);
    expect(CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT).toBe(
      "artifacts/cross-tenant-isolation-staging-summary.json",
    );
    expect(CROSS_TENANT_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-cross-tenant-isolation-audit.ts",
    );
    expect(CROSS_TENANT_E2E_SPEC).toBe("e2e/cross-tenant-isolation-staging.spec.ts");
  });

  it("registers tenant A → tenant B 403 contract in E2E spec", () => {
    expect(auditCrossTenantE2eSpec()).toBe(true);
  });

  it("passes isolation audit when artifact is honest PASS or SKIPPED", () => {
    const report = auditFinal16CrossTenantIsolation();
    expect(report.contractRegistryHonest).toBe(true);
    expect(report.final15Passed).toBe(true);
    expect(report.isolationHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
