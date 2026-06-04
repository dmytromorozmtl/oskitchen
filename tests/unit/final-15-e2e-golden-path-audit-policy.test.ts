import { describe, expect, it } from "vitest";

import {
  auditDashboardRscE2eSpec,
  auditFinal15E2eGoldenPath,
  FINAL_15_E2E_GOLDEN_PATH_POLICY_ID,
} from "@/lib/execution/final-15-e2e-golden-path-audit-policy";
import {
  DASHBOARD_RSC_E2E_SPEC,
  DASHBOARD_RSC_GOLDEN_PATH_ROUTES,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT,
  DASHBOARD_RSC_RUNNER_SCRIPT,
} from "@/lib/execution/dashboard-rsc-golden-path-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-15 dashboard RSC golden path audit", () => {
  it("locks FINAL-15 policy and task slot 209", () => {
    expect(FINAL_15_E2E_GOLDEN_PATH_POLICY_ID).toBe("final-15-e2e-golden-path-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[14]?.id).toBe("FINAL-15");
    expect(FINAL_ORCHESTRATOR_PHASES[14]?.taskSlot).toBe(209);
    expect(DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT).toBe(
      "artifacts/dashboard-rsc-golden-path-summary.json",
    );
    expect(DASHBOARD_RSC_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-dashboard-rsc-golden-path-audit.ts",
    );
    expect(DASHBOARD_RSC_GOLDEN_PATH_ROUTES).toHaveLength(3);
  });

  it("registers today, marketplace, and POS terminal in E2E spec", () => {
    expect(auditDashboardRscE2eSpec()).toBe(true);
    expect(DASHBOARD_RSC_E2E_SPEC).toBe("e2e/dashboard-rsc-regression.spec.ts");
  });

  it("passes golden path audit when artifact is honest PASS or SKIPPED", () => {
    const report = auditFinal15E2eGoldenPath();
    expect(report.routesRegistryHonest).toBe(true);
    expect(report.final14Passed).toBe(true);
    expect(report.goldenPathHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
