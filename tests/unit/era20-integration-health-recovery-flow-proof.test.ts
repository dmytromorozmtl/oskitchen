import { describe, expect, it } from "vitest";

import {
  buildIntegrationHealthRecoveryFlowHops,
  buildIntegrationHealthRecoveryFlowProofSlice,
  deriveP0ChannelProofFromSmokeRows,
} from "@/lib/commercial/era20-integration-health-recovery-flow-proof-era20";
import { ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-integration-health-recovery-flow-proof-era20-policy";

describe("era20-integration-health-recovery-flow-proof", () => {
  it("locks era20 integration health recovery flow proof policy id", () => {
    expect(ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID).toBe(
      "era20-integration-health-recovery-flow-proof-v1",
    );
  });

  it("builds five hops in order", () => {
    const hops = buildIntegrationHealthRecoveryFlowHops({ p0ChannelProofPassed: false });
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.id)).toEqual([
      "channel_health_detect",
      "smoke_artifact_honesty",
      "recovery_checklist",
      "safe_remediation",
      "live_smoke_proof",
    ]);
  });

  it("marks live smoke hop blocked when P0 channel proof missing", () => {
    const hop = buildIntegrationHealthRecoveryFlowHops({
      p0ChannelProofPassed: false,
    }).find((h) => h.id === "live_smoke_proof");
    expect(hop?.proofState).toBe("blocked_p0");
    expect(hop?.blocker).toContain("P0");
  });

  it("derives P0 channel proof from smoke artifact rows", () => {
    expect(
      deriveP0ChannelProofFromSmokeRows([
        { id: "p0-staging-proof-unblock", proofStatus: "proof_passed" },
        { id: "channel-live-smoke", proofStatus: "proof_passed" },
      ]),
    ).toBe(true);
    expect(
      deriveP0ChannelProofFromSmokeRows([
        { id: "p0-staging-proof-unblock", proofStatus: "awaiting_ops_credentials" },
        { id: "channel-live-smoke", proofStatus: "proof_skipped_missing_prerequisites" },
      ]),
    ).toBe(false);
  });

  it("links parent integration_health_recovery workflow", () => {
    const slice = buildIntegrationHealthRecoveryFlowProofSlice({
      p0ChannelProofPassed: false,
    });
    expect(slice.workflowId).toBe("integration_health_recovery");
    expect(slice.tier2PhaseId).toBe("integrations");
    expect(slice.ciBackedHopCount).toBeGreaterThanOrEqual(3);
  });
});
