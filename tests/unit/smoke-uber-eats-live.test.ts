import { describe, expect, it } from "vitest";

import {
  buildUberEatsLiveSmokeSummary,
  listMissingUberEatsLiveSmokeEnvVars,
  readUberEatsLiveSmokeEnv,
} from "../../scripts/smoke-uber-eats-live";

describe("smoke-uber-eats-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingUberEatsLiveSmokeEnvVars({
      clientId: null,
      clientSecret: null,
      storeId: null,
      webhookSecret: null,
      stagingBaseUrl: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("E2E_STAGING_BASE_URL");
    expect(missing).toContain("UBER_EATS_CLIENT_ID");
  });

  it("accepts direct Uber Eats env path when all keys present", () => {
    const input = readUberEatsLiveSmokeEnv({
      UBER_EATS_CLIENT_ID: "client-id",
      UBER_EATS_CLIENT_SECRET: "client-secret",
      UBER_EATS_STORE_ID: "store-uuid",
      UBER_EATS_WEBHOOK_SECRET: "whsec",
      E2E_STAGING_BASE_URL: "https://staging.example",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingUberEatsLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildUberEatsLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder store UUID", () => {
    const summary = buildUberEatsLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "uber_oauth_connection",
          label: "Uber Eats OAuth token exchange",
          status: "SKIPPED",
          detail: "placeholder store",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_store");
  });
});
