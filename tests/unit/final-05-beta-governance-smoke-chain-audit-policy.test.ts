import { describe, expect, it } from "vitest";

import {
  auditFinal05BetaGovernanceSmokeChain,
  FINAL_05_BETA_GOVERNANCE_SMOKE_CHAIN_POLICY_ID,
} from "@/lib/execution/final-05-beta-governance-smoke-chain-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT } from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";

describe("final orchestrator FINAL-05 BETA governance smoke chain audit", () => {
  it("locks FINAL-05 policy and task slot 199", () => {
    expect(FINAL_05_BETA_GOVERNANCE_SMOKE_CHAIN_POLICY_ID).toBe(
      "final-05-beta-governance-chain-v1",
    );
    expect(FINAL_ORCHESTRATOR_PHASES[4]?.id).toBe("FINAL-05");
    expect(FINAL_ORCHESTRATOR_PHASES[4]?.taskSlot).toBe(199);
    expect(BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT).toBe(17);
  });

  it("passes BETA governance smoke chain audit against repo", () => {
    const report = auditFinal05BetaGovernanceSmokeChain();
    expect(report.passed).toBe(true);
    expect(report.artifactPresent).toBe(true);
    expect(report.artifactHonestChainPass).toBe(true);
    expect(report.final04Passed).toBe(true);
  });

  it("requires chain doc, integration policy, and P0 tier-1 wiring", () => {
    const report = auditFinal05BetaGovernanceSmokeChain();
    expect(report.docPresent).toBe(true);
    expect(report.integrationPolicyPresent).toBe(true);
    expect(report.orchestratorWired).toBe(true);
  });

  it("enforces zero LIVE promotions in committed chain artifact", () => {
    const report = auditFinal05BetaGovernanceSmokeChain();
    expect(report.artifactHonestChainPass).toBe(true);
  });
});
