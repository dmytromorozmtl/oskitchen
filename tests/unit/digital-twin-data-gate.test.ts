import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  applyDigitalTwinConfidenceCap,
  assessDigitalTwinDataGateFromSnapshot,
  DIGITAL_TWIN_DATA_GATE_POLICY_ID,
  resolveDigitalTwinDataGateTier,
} from "@/lib/ai/digital-twin-data-gate";

const ROOT = process.cwd();

describe("digital twin data gate", () => {
  it("marks live_ready when all four signals pass", () => {
    const gate = assessDigitalTwinDataGateFromSnapshot({
      productionStationCount: 4,
      activeStaffCount: 6,
      todayShiftCount: 3,
      ordersLast30Days: 120,
      menuMixItemCount: 5,
      usesSyntheticMenuMix: false,
      usesDefaultStationConfig: false,
    });
    expect(gate.policyId).toBe(DIGITAL_TWIN_DATA_GATE_POLICY_ID);
    expect(gate.tier).toBe("live_ready");
    expect(gate.ready).toBe(true);
    expect(gate.maxConfidence).toBe(0.84);
  });

  it("caps confidence for demo_defaults tier", () => {
    const gate = assessDigitalTwinDataGateFromSnapshot({
      productionStationCount: 0,
      activeStaffCount: 0,
      todayShiftCount: 0,
      ordersLast30Days: 2,
      menuMixItemCount: 1,
      usesSyntheticMenuMix: true,
      usesDefaultStationConfig: true,
    });
    expect(gate.tier).toBe("demo_defaults");
    expect(gate.maxConfidence).toBe(0.58);
    const capped = applyDigitalTwinConfidenceCap(
      {
        bottleneckStation: "Hot line",
        bottleneckDelay: 12,
        totalTime: 60,
        stationUtilization: [],
        waitTimes: [],
        recommendations: [],
        aiAssisted: true,
        confidence: 0.84,
      },
      gate,
    );
    expect(capped.confidence).toBe(0.58);
  });

  it("resolves partial when two checks pass", () => {
    const tier = resolveDigitalTwinDataGateTier([
      { signal: "production_stations", passed: true, label: "", detail: "" },
      { signal: "menu_mix_orders", passed: true, label: "", detail: "" },
      { signal: "staff_roster", passed: false, label: "", detail: "" },
      { signal: "recent_order_volume", passed: false, label: "", detail: "" },
    ]);
    expect(tier).toBe("partial");
  });

  it("wires gate into digital twin service and dashboard", () => {
    const service = readFileSync(join(ROOT, "services/ai/digital-twin.ts"), "utf8");
    expect(service).toContain("loadDigitalTwinDataGate");
    expect(service).toContain("applyDigitalTwinConfidenceCap");
    expect(service).toContain("dataGate");

    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/digital-twin-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("DigitalTwinDataGateBanner");
  });
});
