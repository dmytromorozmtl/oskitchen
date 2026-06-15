import { describe, expect, it } from "vitest";

import {
  buildKdsRealtimeE2eStagingCiSummary,
  exitCodeForKdsRealtimeE2eStagingCiStatus,
  kdsV1GateEnabledForE2e,
  resolveKdsRealtimeE2eStagingCiStatus,
  secretsPresentForKdsRealtimeE2eStaging,
} from "@/lib/ci/kds-realtime-e2e-staging-summary-policy";

describe("kds realtime e2e staging summary policy", () => {
  it("skips when auth secrets missing", () => {
    const resolved = resolveKdsRealtimeE2eStagingCiStatus({});
    expect(resolved.status).toBe("SKIPPED");
    expect(resolved.secretsPresent).toBe(false);
    expect(exitCodeForKdsRealtimeE2eStagingCiStatus("SKIPPED")).toBe(0);
  });

  it("skips when kds gate disabled in non-production", () => {
    expect(
      secretsPresentForKdsRealtimeE2eStaging({
        e2eLoginEmail: "a@b.com",
        e2eLoginPassword: "secret",
      }),
    ).toBe(true);
    expect(
      kdsV1GateEnabledForE2e({ nodeEnv: "test", enableKdsV1Certified: "false" }),
    ).toBe(false);

    const resolved = resolveKdsRealtimeE2eStagingCiStatus({
      e2eLoginEmail: "a@b.com",
      e2eLoginPassword: "secret",
      enableKdsV1Certified: "false",
      nodeEnv: "test",
    });
    expect(resolved.status).toBe("SKIPPED");
    expect(resolved.kdsGateEnabled).toBe(false);
  });

  it("passes when secrets, gate, and step success", () => {
    const summary = buildKdsRealtimeE2eStagingCiSummary({
      e2eLoginEmail: "a@b.com",
      e2eLoginPassword: "secret",
      enableKdsV1Certified: "true",
      nodeEnv: "test",
      e2eStepOutcome: "success",
    });
    expect(summary.status).toBe("PASSED");
    expect(summary.policyId).toBe("era11-kds-realtime-e2e-staging-v1");
  });

  it("fails on explicit failure outcome", () => {
    const resolved = resolveKdsRealtimeE2eStagingCiStatus({
      e2eLoginEmail: "a@b.com",
      e2eLoginPassword: "secret",
      enableKdsV1Certified: "true",
      e2eStepOutcome: "failure",
    });
    expect(resolved.status).toBe("FAILED");
    expect(exitCodeForKdsRealtimeE2eStagingCiStatus("FAILED")).toBe(1);
  });
});
