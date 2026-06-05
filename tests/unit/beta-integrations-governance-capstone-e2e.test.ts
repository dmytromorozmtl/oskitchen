import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_E2E_POLICY_ID,
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT,
  betaIntegrationsGovernanceCapstoneWithinContract,
} from "@/lib/integrations/beta-integrations-governance-capstone-e2e-policy";
import { betaIntegrationsGovernanceCapstoneSucceeded } from "@/lib/integrations/beta-integrations-governance-capstone-e2e-metrics";

describe("beta integrations governance capstone E2E policy (QA-43)", () => {
  it("locks capstone e2e policy id and expected panel row count", () => {
    expect(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_E2E_POLICY_ID).toBe(
      "beta-integrations-governance-capstone-e2e-v1",
    );
    expect(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT).toBe(14);
  });

  it("requires Today footnote → Health panels golden path contract", () => {
    const ok = {
      todayHealthStripVisible: true,
      todayFootnoteVisible: true,
      footnoteBadgeSumMatchesTotal: true,
      navigatedToHealth: true,
      envReadinessRowCount: 18,
      liveDodRowCount: 18,
      expectedCount: 18,
      honestLiveCountInDodPanel: true,
      g3G4HonestyInDodPanel: true,
    };
    expect(betaIntegrationsGovernanceCapstoneWithinContract(ok)).toBe(true);
    expect(betaIntegrationsGovernanceCapstoneSucceeded(ok)).toBe(true);

    const missingNav = { ...ok, navigatedToHealth: false };
    expect(betaIntegrationsGovernanceCapstoneWithinContract(missingNav)).toBe(false);
  });
});
