import { describe, expect, it } from "vitest";

import {
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_BACKLOG_ID,
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_CI_SCRIPTS,
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_HOP_IDS,
} from "@/lib/commercial/era20-integration-health-recovery-flow-proof-era20-policy";

describe("era20-integration-health-recovery-flow-proof-cert-live", () => {
  it("locks cert bundle", () => {
    expect(ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_BACKLOG_ID).toBe("KOS-E20-018");
    expect(ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_HOP_IDS).toHaveLength(5);
    expect(ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_CI_SCRIPTS).toContain(
      "test:ci:era20-integration-health-recovery-flow-proof",
    );
  });
});
