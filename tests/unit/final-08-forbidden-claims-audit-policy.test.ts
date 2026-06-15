import { describe, expect, it } from "vitest";

import {
  auditFinal08ForbiddenClaims,
  FINAL_08_FORBIDDEN_CLAIMS_POLICY_ID,
  VERIFY_CLAIMS_NPM_SCRIPT,
} from "@/lib/execution/final-08-forbidden-claims-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { MARKETING_CLAIMS_GOVERNANCE_POLICY_ID } from "@/lib/governance/marketing-claims-governance-policy";

describe("final orchestrator FINAL-08 marketing claims CI gate audit", () => {
  it("locks FINAL-08 policy and task slot 202", () => {
    expect(FINAL_08_FORBIDDEN_CLAIMS_POLICY_ID).toBe("final-08-forbidden-claims-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[7]?.id).toBe("FINAL-08");
    expect(FINAL_ORCHESTRATOR_PHASES[7]?.taskSlot).toBe(202);
    expect(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID).toBe("era7-marketing-claims-governance-v1");
    expect(VERIFY_CLAIMS_NPM_SCRIPT).toBe("verify-claims");
  });

  it("passes verify-claims CI gate re-cert against repo", () => {
    const report = auditFinal08ForbiddenClaims();
    expect(report.passed).toBe(true);
    expect(report.workflowStrictGate).toBe(true);
    expect(report.final07Passed).toBe(true);
    expect(report.mkt09RoleDone).toBe(true);
  });

  it("requires governance policy, verify script, and forbidden-claims enforcement test", () => {
    const report = auditFinal08ForbiddenClaims();
    expect(report.workflowPresent).toBe(true);
    expect(report.governancePolicyPresent).toBe(true);
    expect(report.verifyScriptPresent).toBe(true);
    expect(report.npmScriptWired).toBe(true);
    expect(report.forbiddenTestPresent).toBe(true);
  });

  it("requires forbidden-claims training doc linked from CI failure message", () => {
    const report = auditFinal08ForbiddenClaims();
    expect(report.trainingDocPresent).toBe(true);
    expect(report.workflowStrictGate).toBe(true);
  });
});
