import { describe, expect, it } from "vitest";

import {
  buildGrubhubLiveSmokeSummary,
  listMissingGrubhubLiveSmokeEnvVars,
  readGrubhubLiveSmokeEnv,
} from "../../scripts/smoke-grubhub-live";

describe("smoke-grubhub-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingGrubhubLiveSmokeEnvVars({
      apiKey: null,
      merchantId: null,
      webhookSecret: null,
      stagingBaseUrl: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("GRUBHUB_API_KEY");
  });

  it("accepts direct Grubhub env path when all keys present", () => {
    const input = readGrubhubLiveSmokeEnv({
      GRUBHUB_API_KEY: "gh-key",
      GRUBHUB_MERCHANT_ID: "merchant-1",
      GRUBHUB_WEBHOOK_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingGrubhubLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildGrubhubLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "SKIPPED",
          detail: "Missing: DATABASE_URL",
        },
      ],
      missingEnvVars: ["DATABASE_URL"],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("builds SKIPPED summary for placeholder merchant ID", () => {
    const summary = buildGrubhubLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "grubhub_api_connection",
          label: "Grubhub marketplace API connection",
          status: "SKIPPED",
          detail: "placeholder merchant",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
  });
});
