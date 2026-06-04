import { describe, expect, it } from "vitest";

import {
  auditFinal04LiveIntegrationDod,
  FINAL_04_LIVE_INTEGRATION_DOD_POLICY_ID,
} from "@/lib/execution/final-04-live-integration-dod-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

describe("final orchestrator FINAL-04 LIVE integration DoD audit", () => {
  it("locks FINAL-04 policy and task slot 198", () => {
    expect(FINAL_04_LIVE_INTEGRATION_DOD_POLICY_ID).toBe("final-04-live-integration-dod-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[3]?.id).toBe("FINAL-04");
    expect(FINAL_ORCHESTRATOR_PHASES[3]?.taskSlot).toBe(198);
    expect(LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT).toBe(18);
  });

  it("passes LIVE DoD smoke audit against repo", () => {
    const report = auditFinal04LiveIntegrationDod();
    expect(report.passed).toBe(true);
    expect(report.artifactPresent).toBe(true);
    expect(report.artifactHonestZeroLive).toBe(true);
    expect(report.final03Passed).toBe(true);
  });

  it("requires DoD smoke doc and P0 orchestrator tier-1 wiring", () => {
    const report = auditFinal04LiveIntegrationDod();
    expect(report.docPresent).toBe(true);
    expect(report.orchestratorWired).toBe(true);
  });

  it("enforces zero LIVE promotions in committed artifact", () => {
    const report = auditFinal04LiveIntegrationDod();
    expect(report.artifactHonestZeroLive).toBe(true);
  });
});
