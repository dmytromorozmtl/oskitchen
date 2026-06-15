import { describe, expect, it } from "vitest";

import { evaluateMaintenanceMode } from "../../scripts/ops/validate-maintenance-mode";

describe("validate-maintenance-mode", () => {
  it("evaluates without throwing", () => {
    expect(() => evaluateMaintenanceMode({})).not.toThrow();
  });

  it("reports not in maintenance mode with honest NO-GO", () => {
    const result = evaluateMaintenanceMode({});
    expect(result.maintenanceModeActive).toBe(false);
    expect(result.commercialPilotPathComplete).toBe(false);
    expect(result.maintenanceModeMilestone).toBe("era25_sustained_ops_convergence_blocked");
    expect(result.readyForWeeklyRhythmSmokes).toBe(false);
    expect(result.readyForMonthlyCadenceSmokes).toBe(false);
    expect(result.rhythms).toHaveLength(10);
  });
});
