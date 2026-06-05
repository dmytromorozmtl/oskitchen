import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID,
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  betaIntegrationsGovernanceWithinContract,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";
import { betaIntegrationsGovernanceSucceeded } from "@/lib/integrations/beta-integrations-governance-e2e-metrics";

describe("beta integrations governance E2E policy (QA-37)", () => {
  it("locks governance e2e policy id and expected BETA count", () => {
    expect(BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID).toBe("beta-integrations-governance-e2e-v1");
    expect(BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT).toBe(10);
  });

  it("requires eighteen rows in both governance panels", () => {
    const ok = {
      betaEnvPanelVisible: true,
      liveDodPanelVisible: true,
      betaEnvRowCount: 18,
      liveDodRowCount: 18,
      expectedCount: 18,
    };
    expect(betaIntegrationsGovernanceWithinContract(ok)).toBe(true);
    expect(betaIntegrationsGovernanceSucceeded(ok)).toBe(true);

    const incomplete = { ...ok, liveDodRowCount: 17 };
    expect(betaIntegrationsGovernanceWithinContract(incomplete)).toBe(false);
  });
});
