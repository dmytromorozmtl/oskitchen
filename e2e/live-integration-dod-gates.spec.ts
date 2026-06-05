import { expect, test } from "@playwright/test";

import {
  LIVE_DOD_G1_PASSED_TITLE_FRAGMENT,
  LIVE_DOD_G3_NOT_MEASURED_TITLE_FRAGMENT,
  LIVE_DOD_G4_NOT_MEASURED_TITLE_FRAGMENT,
  LIVE_DOD_GATES_EXPECTED_ROW_COUNT,
  LIVE_INTEGRATION_DOD_GATES_E2E_POLICY_ID,
  LIVE_INTEGRATION_DOD_GATES_SLI_ID,
  liveDodRowTestId,
  liveIntegrationDodGatesWithinContract,
} from "@/lib/integrations/live-integration-dod-gates-e2e-policy";
import {
  liveIntegrationDodGatesSucceeded,
  summarizeLiveIntegrationDodGatesResult,
} from "@/lib/integrations/live-integration-dod-gates-e2e-metrics";

import { runLiveIntegrationDodGatesFlow } from "./helpers/live-integration-dod-gates-flow";
import { skipLiveIntegrationDodGatesIfNotAuthed } from "./helpers/live-integration-dod-gates-ready";

/**
 * LIVE integration DoD G1–G4 gate contract E2E (QA-39).
 *
 * Validates DEV-54 gate honesty — G1 scaffold passed, G3/G4 not_measured, zero LIVE.
 *
 * @see components/integrations/live-integration-dod-panel.tsx
 * @see lib/integrations/live-integration-dod-tracker.ts
 */

test.describe("live integration dod gates policy", () => {
  test("exports gate contract for eighteen BETA integrations", () => {
    expect(LIVE_INTEGRATION_DOD_GATES_E2E_POLICY_ID).toBe("live-integration-dod-gates-e2e-v1");
    expect(LIVE_INTEGRATION_DOD_GATES_SLI_ID).toBe("integrations.live_dod_gate_contract");
    expect(LIVE_DOD_GATES_EXPECTED_ROW_COUNT).toBe(12);
    expect(liveDodRowTestId("square")).toBe("live-integration-dod-square");
    expect(LIVE_DOD_G1_PASSED_TITLE_FRAGMENT).toContain("Registry scaffold complete");
    expect(LIVE_DOD_G3_NOT_MEASURED_TITLE_FRAGMENT).toContain("production tenant");
    expect(LIVE_DOD_G4_NOT_MEASURED_TITLE_FRAGMENT).toContain("24h production");
  });

  test("evaluates LIVE DoD gate contract", () => {
    const summary = summarizeLiveIntegrationDodGatesResult({
      panelVisible: true,
      rowCount: 16,
      expectedCount: 16,
      allG1ScaffoldPassed: true,
      allG3NotMeasured: true,
      allG4NotMeasured: true,
      oneLiveInSummary: true,
      g3G4HonestyInDescription: true,
    });
    expect(liveIntegrationDodGatesWithinContract(summary)).toBe(true);
    expect(liveIntegrationDodGatesSucceeded(summary)).toBe(true);
  });
});

test.describe("live integration dod gates (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "LIVE DoD gates E2E runs in chromium-authed project only",
    );
    skipLiveIntegrationDodGatesIfNotAuthed();
  });

  test("integration health shows honest G1/G3/G4 gates on eighteen rows without RSC failure", async ({
    page,
  }) => {
    const result = await runLiveIntegrationDodGatesFlow(page);
    if (!result) {
      test.skip(true, "LIVE DoD gates unavailable — missing permissions.");
    }

    const summary = summarizeLiveIntegrationDodGatesResult({
      panelVisible: true,
      rowCount: result!.rowCount,
      expectedCount: result!.expectedCount,
      allG1ScaffoldPassed: result!.allG1ScaffoldPassed,
      allG3NotMeasured: result!.allG3NotMeasured,
      allG4NotMeasured: result!.allG4NotMeasured,
      oneLiveInSummary: true,
      g3G4HonestyInDescription: true,
    });
    expect(liveIntegrationDodGatesWithinContract(summary)).toBe(true);
  });
});
