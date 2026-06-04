import { expect, test } from "@playwright/test";

import {
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_E2E_POLICY_ID,
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT,
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_SLI_ID,
  INTEGRATIONS_HEALTH_PATH,
  TODAY_PATH,
  betaIntegrationsGovernanceCapstoneWithinContract,
} from "@/lib/integrations/beta-integrations-governance-capstone-e2e-policy";
import {
  betaIntegrationsGovernanceCapstoneSucceeded,
  summarizeBetaIntegrationsGovernanceCapstoneResult,
} from "@/lib/integrations/beta-integrations-governance-capstone-e2e-metrics";

import { runBetaIntegrationsGovernanceCapstoneFlow } from "./helpers/beta-integrations-governance-capstone-flow";
import { skipBetaIntegrationsGovernanceCapstoneIfNotAuthed } from "./helpers/beta-integrations-governance-capstone-ready";

/**
 * BETA integrations governance capstone E2E (QA-43).
 *
 * Golden path: Today health strip footnote → Integration Health governance panels.
 *
 * @see e2e/beta-integrations-governance.spec.ts
 * @see e2e/today-beta-env-footnote.spec.ts
 */

test.describe("beta integrations governance capstone policy", () => {
  test("exports capstone golden path contract", () => {
    expect(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_E2E_POLICY_ID).toBe(
      "beta-integrations-governance-capstone-e2e-v1",
    );
    expect(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_SLI_ID).toBe(
      "integrations.beta_governance_capstone",
    );
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(INTEGRATIONS_HEALTH_PATH).toBe("/dashboard/integrations/health");
    expect(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT).toBe(18);
  });

  test("evaluates governance capstone contract", () => {
    const summary = summarizeBetaIntegrationsGovernanceCapstoneResult({
      todayHealthStripVisible: true,
      todayFootnoteVisible: true,
      footnoteBadgeSumMatchesTotal: true,
      navigatedToHealth: true,
      envReadinessRowCount: 18,
      liveDodRowCount: 18,
      expectedCount: 18,
      zeroLiveInDodPanel: true,
      g3G4HonestyInDodPanel: true,
    });
    expect(betaIntegrationsGovernanceCapstoneWithinContract(summary)).toBe(true);
    expect(betaIntegrationsGovernanceCapstoneSucceeded(summary)).toBe(true);
  });
});

test.describe("beta integrations governance capstone (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "BETA governance capstone runs in chromium-authed project only",
    );
    skipBetaIntegrationsGovernanceCapstoneIfNotAuthed();
  });

  test("Today footnote navigates to Integration Health governance panels without RSC failure", async ({
    page,
  }) => {
    const result = await runBetaIntegrationsGovernanceCapstoneFlow(page);
    if (!result) {
      test.skip(true, "BETA governance capstone unavailable — missing permissions.");
    }

    const summary = summarizeBetaIntegrationsGovernanceCapstoneResult({
      todayHealthStripVisible: true,
      todayFootnoteVisible: true,
      footnoteBadgeSumMatchesTotal: result!.footnoteBadgeSumMatchesTotal,
      navigatedToHealth: true,
      envReadinessRowCount: result!.envReadinessRowCount,
      liveDodRowCount: result!.liveDodRowCount,
      expectedCount: result!.expectedCount,
      zeroLiveInDodPanel: result!.zeroLiveInDodPanel,
      g3G4HonestyInDodPanel: result!.g3G4HonestyInDodPanel,
    });
    expect(betaIntegrationsGovernanceCapstoneWithinContract(summary)).toBe(true);
  });
});
