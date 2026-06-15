import { describe, expect, it } from "vitest";

import {
  buildSkipLiveSmokeSummary,
  listMissingSkipLiveSmokeEnvVars,
  readSkipLiveSmokeEnv,
} from "../../scripts/smoke-skip-live";

describe("smoke-skip-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingSkipLiveSmokeEnvVars({
      clientId: null,
      clientSecret: null,
      restaurantId: null,
      webhookSecret: null,
      stagingBaseUrl: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("SKIP_CLIENT_ID");
  });

  it("accepts direct Skip env path when all keys present", () => {
    const input = readSkipLiveSmokeEnv({
      SKIP_CLIENT_ID: "skip-client",
      SKIP_CLIENT_SECRET: "skip-secret",
      SKIP_RESTAURANT_ID: "restaurant-1",
      SKIP_WEBHOOK_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingSkipLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildSkipLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder restaurant ID", () => {
    const summary = buildSkipLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "skip_api_connection",
          label: "Skip OAuth marketplace API connection",
          status: "SKIPPED",
          detail: "placeholder restaurant",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
  });
});
