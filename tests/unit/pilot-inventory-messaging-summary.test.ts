import { describe, expect, it } from "vitest";

import {
  buildPilotInventoryMessagingSummary,
  resolvePilotInventoryMessagingProofStatus,
} from "@/lib/inventory/pilot-inventory-messaging-summary";

describe("pilot inventory messaging summary", () => {
  it("marks messaging ready without attestation email", () => {
    expect(
      resolvePilotInventoryMessagingProofStatus({ certPassed: true }),
    ).toBe("messaging_ready_awaiting_training_attestation");
  });

  it("marks proof passed with attestation email", () => {
    expect(
      resolvePilotInventoryMessagingProofStatus({
        certPassed: true,
        trainingAttestationEmail: "sales@example.com",
      }),
    ).toBe("proof_passed");
  });

  it("builds summary with deferred_locked storefront hook", () => {
    const summary = buildPilotInventoryMessagingSummary({ certPassed: true });
    expect(summary.storefrontHookStatus).toBe("deferred_locked");
    expect(summary.readinessDecision).toBe("READY");
    expect(summary.trainingModulesCount).toBe(5);
  });
});
