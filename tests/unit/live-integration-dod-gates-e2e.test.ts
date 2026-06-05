import { describe, expect, it } from "vitest";

import {
  LIVE_DOD_GATES_EXPECTED_ROW_COUNT,
  LIVE_INTEGRATION_DOD_GATES_E2E_POLICY_ID,
  liveIntegrationDodGatesWithinContract,
} from "@/lib/integrations/live-integration-dod-gates-e2e-policy";
import { liveIntegrationDodGatesSucceeded } from "@/lib/integrations/live-integration-dod-gates-e2e-metrics";

describe("live integration dod gates E2E policy (QA-39)", () => {
  it("locks LIVE DoD gates e2e policy id and expected row count", () => {
    expect(LIVE_INTEGRATION_DOD_GATES_E2E_POLICY_ID).toBe("live-integration-dod-gates-e2e-v1");
    expect(LIVE_DOD_GATES_EXPECTED_ROW_COUNT).toBe(12);
  });

  it("requires G1 passed and G3/G4 not_measured on all rows", () => {
    const ok = {
      panelVisible: true,
      rowCount: 18,
      expectedCount: 18,
      allG1ScaffoldPassed: true,
      allG3NotMeasured: true,
      allG4NotMeasured: true,
      oneLiveInSummary: true,
      g3G4HonestyInDescription: true,
    };
    expect(liveIntegrationDodGatesWithinContract(ok)).toBe(true);
    expect(liveIntegrationDodGatesSucceeded(ok)).toBe(true);

    const g3Leaked = { ...ok, allG3NotMeasured: false };
    expect(liveIntegrationDodGatesWithinContract(g3Leaked)).toBe(false);
  });
});
