import { describe, expect, it } from "vitest";

import {
  buildKlaviyoLiveSmokeSummary,
  listMissingKlaviyoLiveSmokeEnvVars,
  readKlaviyoLiveSmokeEnv,
} from "../../scripts/smoke-klaviyo-live";

describe("smoke-klaviyo-live", () => {
  it("lists missing env vars when KLAVIYO_API_KEY absent", () => {
    const missing = listMissingKlaviyoLiveSmokeEnvVars({
      apiKey: null,
      segmentId: null,
    });

    expect(missing).toContain("KLAVIYO_API_KEY");
  });

  it("accepts direct Klaviyo env when API key present", () => {
    const input = readKlaviyoLiveSmokeEnv({
      KLAVIYO_API_KEY: "pk_live_abc123",
      KLAVIYO_SEGMENT_ID: "seg-123",
    });

    expect(listMissingKlaviyoLiveSmokeEnvVars(input)).toEqual([]);
    expect(input.segmentId).toBe("seg-123");
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildKlaviyoLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "SKIPPED",
          detail: "Missing: KLAVIYO_API_KEY",
        },
      ],
      missingEnvVars: ["KLAVIYO_API_KEY"],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("builds SKIPPED summary for placeholder API key", () => {
    const summary = buildKlaviyoLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "klaviyo_api_key_verify",
          label: "Klaviyo API key verification",
          status: "SKIPPED",
          detail: "placeholder key",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_api_key");
  });
});
