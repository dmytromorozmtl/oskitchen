import { expect, test } from "@playwright/test";

import {
  BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID,
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  BETA_INTEGRATIONS_GOVERNANCE_SLI_ID,
  INTEGRATIONS_HEALTH_PATH,
  betaEnvReadinessRowTestId,
  betaIntegrationsGovernanceWithinContract,
  liveDodRowTestId,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";
import {
  betaIntegrationsGovernanceSucceeded,
  summarizeBetaIntegrationsGovernanceResult,
} from "@/lib/integrations/beta-integrations-governance-e2e-metrics";

import { runBetaIntegrationsGovernanceFlow } from "./helpers/beta-integrations-governance-flow";
import { skipBetaIntegrationsGovernanceIfNotAuthed } from "./helpers/beta-integrations-governance-ready";

/**
 * BETA integrations governance E2E (QA-37).
 *
 * Integration Health → env readiness panel + LIVE DoD gate tracker (18 BETA rows each).
 *
 * @see components/integrations/beta-integration-env-readiness-panel.tsx
 * @see components/integrations/live-integration-dod-panel.tsx
 */

test.describe("beta integrations governance policy", () => {
  test("exports governance contract for eighteen BETA integrations", () => {
    expect(BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID).toBe("beta-integrations-governance-e2e-v1");
    expect(BETA_INTEGRATIONS_GOVERNANCE_SLI_ID).toBe("integrations.beta_governance_panels");
    expect(INTEGRATIONS_HEALTH_PATH).toBe("/dashboard/integrations/health");
    expect(BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT).toBe(11);
    expect(betaEnvReadinessRowTestId("square")).toBe("beta-env-readiness-square");
    expect(liveDodRowTestId("email-orders")).toBe("live-integration-dod-email-orders");
  });

  test("evaluates governance panel contract", () => {
    const summary = summarizeBetaIntegrationsGovernanceResult({
      betaEnvPanelVisible: true,
      liveDodPanelVisible: true,
      betaEnvRowCount: 18,
      liveDodRowCount: 18,
      expectedCount: 18,
    });
    expect(betaIntegrationsGovernanceWithinContract(summary)).toBe(true);
    expect(betaIntegrationsGovernanceSucceeded(summary)).toBe(true);
  });
});

test.describe("beta integrations governance (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "BETA integrations governance runs in chromium-authed project only",
    );
    skipBetaIntegrationsGovernanceIfNotAuthed();
  });

  test("integration health shows env readiness and LIVE DoD panels without RSC failure", async ({
    page,
  }) => {
    const result = await runBetaIntegrationsGovernanceFlow(page);
    if (!result) {
      test.skip(true, "Integration health governance unavailable — missing permissions.");
    }

    const summary = summarizeBetaIntegrationsGovernanceResult({
      betaEnvPanelVisible: true,
      liveDodPanelVisible: true,
      betaEnvRowCount: result!.betaEnvRowCount,
      liveDodRowCount: result!.liveDodRowCount,
      expectedCount: result!.expectedCount,
    });
    expect(betaIntegrationsGovernanceWithinContract(summary)).toBe(true);
  });
});
