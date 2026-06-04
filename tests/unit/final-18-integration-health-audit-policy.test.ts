import { describe, expect, it } from "vitest";

import {
  auditFinal18IntegrationHealthMoat,
  auditIntegrationHealthMoatSurfaces,
  FINAL_18_INTEGRATION_HEALTH_POLICY_ID,
} from "@/lib/execution/final-18-integration-health-audit-policy";
import {
  INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT,
  INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT,
  INTEGRATION_HEALTH_MOAT_VITEST_SPEC,
} from "@/lib/execution/integration-health-moat-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-18 integration health moat audit", () => {
  it("locks FINAL-18 policy and task slot 212", () => {
    expect(FINAL_18_INTEGRATION_HEALTH_POLICY_ID).toBe("final-18-integration-health-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[17]?.id).toBe("FINAL-18");
    expect(FINAL_ORCHESTRATOR_PHASES[17]?.taskSlot).toBe(212);
    expect(INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT).toBe(
      "artifacts/integration-health-moat-summary.json",
    );
    expect(INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-integration-health-moat-audit.ts",
    );
    expect(INTEGRATION_HEALTH_MOAT_VITEST_SPEC).toBe(
      "tests/unit/integration-health-moat-surfaces.test.ts",
    );
  });

  it("registers strip + landing + dashboard moat contract markers", () => {
    expect(auditIntegrationHealthMoatSurfaces()).toBe(true);
  });

  it("passes moat audit when artifact is honest PASS", () => {
    const report = auditFinal18IntegrationHealthMoat();
    expect(report.surfacesRegistryHonest).toBe(true);
    expect(report.final17Passed).toBe(true);
    expect(report.moatHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
