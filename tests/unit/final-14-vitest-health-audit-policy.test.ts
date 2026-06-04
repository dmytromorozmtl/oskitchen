import { describe, expect, it } from "vitest";

import {
  auditFinal14VitestHealth,
  FINAL_14_VITEST_HEALTH_POLICY_ID,
} from "@/lib/execution/final-14-vitest-health-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS,
  VITEST_HEALTH_RUNNER_SCRIPT,
  VITEST_HEALTH_SUMMARY_ARTIFACT,
} from "@/lib/execution/vitest-health-policy";

describe("final orchestrator FINAL-14 vitest health audit", () => {
  it("locks FINAL-14 policy and task slot 208", () => {
    expect(FINAL_14_VITEST_HEALTH_POLICY_ID).toBe("final-14-vitest-health-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[13]?.id).toBe("FINAL-14");
    expect(FINAL_ORCHESTRATOR_PHASES[13]?.taskSlot).toBe(208);
    expect(VITEST_HEALTH_SUMMARY_ARTIFACT).toBe("artifacts/vitest-health-summary.json");
    expect(VITEST_HEALTH_RUNNER_SCRIPT).toBe("scripts/ops/run-vitest-health-audit.ts");
    expect(VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS).toHaveLength(13);
  });

  it("passes vitest health audit when artifact reports PASS", () => {
    const report = auditFinal14VitestHealth();
    expect(report.passed).toBe(true);
    expect(report.testsGreen).toBe(true);
    expect(report.final13Passed).toBe(true);
  });

  it("requires runner script and npm test wiring", () => {
    const report = auditFinal14VitestHealth();
    expect(report.runnerScriptPresent).toBe(true);
    expect(report.npmScriptWired).toBe(true);
    expect(report.artifactSchemaValid).toBe(true);
  });
});
