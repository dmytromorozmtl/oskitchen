import { describe, expect, it } from "vitest";

import {
  POS_BROWSER_E2E_POLICY_ID,
  POS_MONEY_PATH_ALWAYS_ON_SCRIPTS,
  buildPosBrowserE2eCiSummary,
  exitCodeForPosBrowserE2eCiStatus,
  resolvePosBrowserE2eCiStatus,
} from "@/lib/ci/pos-browser-e2e-policy";

describe("POS browser E2E CI policy", () => {
  it("uses era4 tier-2b optional policy id", () => {
    expect(POS_BROWSER_E2E_POLICY_ID).toBe("era4-tier2b-optional-v1");
    expect(POS_MONEY_PATH_ALWAYS_ON_SCRIPTS).toHaveLength(3);
  });

  it("SKIPPED when auth secrets are absent", () => {
    const resolved = resolvePosBrowserE2eCiStatus({
      e2eLoginEmail: "",
      e2eLoginPassword: "",
      e2eStepOutcome: "skipped",
    });
    expect(resolved.status).toBe("SKIPPED");
    expect(resolved.secretsPresent).toBe(false);
    expect(exitCodeForPosBrowserE2eCiStatus("SKIPPED")).toBe(0);
  });

  it("PASSED when secrets exist and E2E step succeeded", () => {
    const resolved = resolvePosBrowserE2eCiStatus({
      e2eLoginEmail: "ops@example.com",
      e2eLoginPassword: "secret",
      e2eStepOutcome: "success",
    });
    expect(resolved.status).toBe("PASSED");
    expect(exitCodeForPosBrowserE2eCiStatus("PASSED")).toBe(0);
  });

  it("FAILED when secrets exist but E2E step failed", () => {
    const resolved = resolvePosBrowserE2eCiStatus({
      e2eLoginEmail: "ops@example.com",
      e2eLoginPassword: "secret",
      e2eStepOutcome: "failure",
    });
    expect(resolved.status).toBe("FAILED");
    expect(exitCodeForPosBrowserE2eCiStatus("FAILED")).toBe(1);
  });

  it("builds artifact-shaped summary", () => {
    const summary = buildPosBrowserE2eCiSummary(
      {
        e2eLoginEmail: "ops@example.com",
        e2eLoginPassword: "secret",
        e2eStepOutcome: "success",
      },
      "2026-05-27T00:00:00.000Z",
    );
    expect(summary.policyId).toBe("era4-tier2b-optional-v1");
    expect(summary.status).toBe("PASSED");
    expect(summary.recordedAt).toBe("2026-05-27T00:00:00.000Z");
    expect(summary.alwaysOnCertification).toContain("test:ci:pos-money-path:unit");
  });
});
