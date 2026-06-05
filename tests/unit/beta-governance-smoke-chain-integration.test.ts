import { describe, expect, it } from "vitest";

import {
  BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT,
  BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
  betaGovernanceSmokeChainWithinPassContract,
  buildBetaGovernanceSmokeChainSummaries,
  betaGovernanceSmokeChainPassContract,
} from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";

describe("beta governance smoke chain integration policy (QA-45)", () => {
  it("locks capstone policy id and expected BETA count", () => {
    expect(BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID).toBe(
      "beta-governance-smoke-chain-integration-v1",
    );
    expect(BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT).toBe(9);
  });

  it("evaluates full-chain pass contract for registry + integrity + dod", () => {
    const summaries = buildBetaGovernanceSmokeChainSummaries({ certPassed: true });
    const contract = betaGovernanceSmokeChainPassContract(summaries);
    expect(betaGovernanceSmokeChainWithinPassContract(contract)).toBe(true);
    expect(contract.registryPassed).toBe(true);
    expect(contract.integrityPassed).toBe(true);
    expect(contract.dodPassed).toBe(true);
  });
});
