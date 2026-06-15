import { describe, expect, it } from "vitest";

import {
  buildDoorDashLiveSmokeSummary,
  listMissingDoorDashLiveSmokeEnvVars,
  readDoorDashLiveSmokeEnv,
} from "../../scripts/smoke-doordash-live";

describe("smoke-doordash-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingDoorDashLiveSmokeEnvVars({
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
    expect(missing).toContain("DOORDASH_API_KEY");
  });

  it("accepts direct DoorDash env path when all keys present", () => {
    const input = readDoorDashLiveSmokeEnv({
      DOORDASH_API_KEY: "dd-key",
      DOORDASH_MERCHANT_ID: "merchant-1",
      DOORDASH_WEBHOOK_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingDoorDashLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildDoorDashLiveSmokeSummary({
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
    const summary = buildDoorDashLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "doordash_api_connection",
          label: "DoorDash marketplace API connection",
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
