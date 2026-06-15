import { describe, expect, it } from "vitest";

import {
  buildEra20PilotIcpQualificationBridgeSlice,
  derivePilotIcpQualificationGate,
  isPilotIcpEnvConfigured,
} from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";
import { ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20-policy";

describe("era20-pilot-icp-qualification-bridge", () => {
  it("locks era20 pilot ICP bridge policy id", () => {
    expect(ERA20_PILOT_ICP_QUALIFICATION_BRIDGE_POLICY_ID).toBe(
      "era20-pilot-icp-qualification-bridge-v1",
    );
  });

  it("treats empty env as not configured", () => {
    expect(isPilotIcpEnvConfigured(undefined)).toBe(false);
    expect(isPilotIcpEnvConfigured("  ")).toBe(false);
  });

  it("marks example ghost kitchen as qualified", () => {
    const slice = buildEra20PilotIcpQualificationBridgeSlice({});
    expect(slice.exampleQualification.qualified).toBe(true);
    expect(slice.envConfigured).toBe(false);
    expect(slice.gonoGoIcpGatePass).toBe(false);
  });

  it("passes GO/NO-GO ICP gate when env matches example input", () => {
    const json = JSON.stringify({
      singleOrSmallMultiUnit: true,
      ownerOperatorEngaged: true,
      needsCoreKitchenOrderPath: true,
      acceptsQualifiedBetaLabels: true,
      requiresProductionSso: false,
      requiresSoc2OrScim: false,
      requiresUnifiedInventory: false,
      requiresUnifiedRewards: false,
      requiresRushHourKdsSla: false,
      requiresMarketplaceLiveOps: false,
      requiresOfflinePosOrHardwareParity: false,
      requiresPublicApiSla: false,
      refusesQualifiedWording: false,
    });
    const gate = derivePilotIcpQualificationGate({ icpEnvRaw: json });
    expect(gate.pass).toBe(true);
    expect(gate.id).toBe("icp_qualification");
  });

  it("fails gate when env configured but prospect requires production SSO", () => {
    const json = JSON.stringify({ requiresProductionSso: true });
    const gate = derivePilotIcpQualificationGate({ icpEnvRaw: json });
    expect(gate.pass).toBe(false);
    expect(gate.reason).toContain("Disqualifiers");
  });
});
