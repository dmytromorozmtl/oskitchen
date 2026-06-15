import { describe, expect, it } from "vitest";

import {
  BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT,
  BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID,
  betaGovernanceSmokeChainHonestNoLiveClaim,
  betaGovernanceSmokeChainPassContract,
  betaGovernanceSmokeChainWithinPassContract,
  buildBetaGovernanceSmokeChainSummaries,
} from "@/lib/integrations/beta-governance-smoke-chain-integration-policy";
import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

/**
 * BETA governance smoke chain capstone integration (QA-45).
 *
 * Registry → integrity → LIVE DoD smoke builders → honest full-chain PASSED/FAILED.
 *
 * @see scripts/smoke-beta-integrations-registry-era17.ts
 * @see scripts/smoke-beta-integrations-integrity-era17.ts
 * @see scripts/smoke-live-integration-dod-era17.ts
 */

describe("beta governance smoke chain capstone integration (QA-45)", () => {
  it("returns full-chain PASSED when all cert chains succeed against real repo", () => {
    const summaries = buildBetaGovernanceSmokeChainSummaries({
      certPassed: true,
      commitSha: "abc1234",
    });

    const contract = betaGovernanceSmokeChainPassContract(summaries);
    expect(betaGovernanceSmokeChainWithinPassContract(contract)).toBe(true);
    expect(betaGovernanceSmokeChainHonestNoLiveClaim(summaries)).toBe(true);
    expect(contract.expectedBetaCount).toBe(BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT);
    expect(summaries.registry.overall).toBe("PASSED");
    expect(summaries.integrity.overall).toBe("PASSED");
    expect(summaries.dod.overall).toBe("PASSED");
  });

  it("returns chain FAILED when registry cert fails", () => {
    const summaries = buildBetaGovernanceSmokeChainSummaries({
      certPassed: false,
    });

    const contract = betaGovernanceSmokeChainPassContract(summaries);
    expect(contract.registryPassed).toBe(false);
    expect(contract.chainPassed).toBe(false);
    expect(betaGovernanceSmokeChainWithinPassContract(contract)).toBe(false);
    expect(betaGovernanceSmokeChainHonestNoLiveClaim(summaries)).toBe(true);
  });

  it("returns chain FAILED when integrity env audit fails under strict mode", () => {
    const summaries = buildBetaGovernanceSmokeChainSummaries({
      certPassed: true,
      strictEnvMode: true,
      env: {},
    });

    const contract = betaGovernanceSmokeChainPassContract(summaries);
    if (summaries.integrity.overall === "FAILED") {
      expect(contract.integrityPassed).toBe(false);
      expect(contract.chainPassed).toBe(false);
    } else {
      expect(contract.integrityPassed).toBe(true);
    }
  });

  it("returns chain FAILED when LIVE DoD cert fails", () => {
    const passing = buildBetaGovernanceSmokeChainSummaries({ certPassed: true });
    const failing = buildBetaGovernanceSmokeChainSummaries({ certPassed: false });

    expect(betaGovernanceSmokeChainPassContract(passing).dodPassed).toBe(true);
    expect(betaGovernanceSmokeChainPassContract(failing).dodPassed).toBe(false);
    expect(betaGovernanceSmokeChainPassContract(failing).chainPassed).toBe(false);
  });

  it("locks capstone policy id and reports LIVE promotion count across chain", () => {
    const summaries = buildBetaGovernanceSmokeChainSummaries({ certPassed: true });
    expect(BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID).toBe(
      "beta-governance-smoke-chain-integration-v1",
    );
    expect(summaries.dod.livePromotionCount).toBe(LIVE_INTEGRATION_REGISTRY_LIVE_COUNT);
    expect(summaries.registry.placeholderCount).toBe(0);
  });
});
