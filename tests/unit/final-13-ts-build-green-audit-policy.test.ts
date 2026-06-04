import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/execution/final-12-design-stabilization-audit-policy", () => ({
  auditFinal12DesignStabilization: () => ({ passed: true }),
}));

import {
  auditFinal13TsBuildGreen,
  FINAL_13_TS_BUILD_GREEN_POLICY_ID,
} from "@/lib/execution/final-13-ts-build-green-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  TS_BUILD_GREEN_RUNNER_SCRIPT,
  TS_BUILD_GREEN_SUMMARY_ARTIFACT,
} from "@/lib/execution/ts-build-green-policy";

describe("final orchestrator FINAL-13 TS + build green audit", () => {
  it("locks FINAL-13 policy and task slot 207", () => {
    expect(FINAL_13_TS_BUILD_GREEN_POLICY_ID).toBe("final-13-ts-build-green-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[12]?.id).toBe("FINAL-13");
    expect(FINAL_ORCHESTRATOR_PHASES[12]?.taskSlot).toBe(207);
    expect(TS_BUILD_GREEN_SUMMARY_ARTIFACT).toBe("artifacts/ts-build-green-summary.json");
    expect(TS_BUILD_GREEN_RUNNER_SCRIPT).toBe("scripts/ops/run-ts-build-green-audit.ts");
  });

  it("passes TS + build green audit when artifact reports PASS", () => {
    const report = auditFinal13TsBuildGreen();
    expect(report.passed).toBe(true);
    expect(report.typecheckGreen).toBe(true);
    expect(report.buildGreen).toBe(true);
    expect(report.final12Passed).toBe(true);
  });

  it("requires runner script and npm script wiring", () => {
    const report = auditFinal13TsBuildGreen();
    expect(report.runnerScriptPresent).toBe(true);
    expect(report.npmScriptsWired).toBe(true);
    expect(report.artifactSchemaValid).toBe(true);
  });
});
