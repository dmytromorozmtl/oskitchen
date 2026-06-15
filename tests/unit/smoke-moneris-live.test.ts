import { describe, expect, it } from "vitest";

import {
  buildMonerisLiveSmokeSummary,
  listMissingMonerisLiveSmokeEnvVars,
  readMonerisLiveSmokeEnv,
} from "../../scripts/smoke-moneris-live";

describe("smoke-moneris-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingMonerisLiveSmokeEnvVars({
      accessToken: null,
      apiToken: null,
      storeId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("MONERIS_ACCESS_TOKEN");
    expect(missing).toContain("MONERIS_API_TOKEN");
  });

  it("accepts direct Moneris env when access token and store present", () => {
    const input = readMonerisLiveSmokeEnv({
      MONERIS_ACCESS_TOKEN: "live_moneris_token",
      MONERIS_STORE_ID: "store123",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingMonerisLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("accepts API token path without OAuth access token", () => {
    const input = readMonerisLiveSmokeEnv({
      MONERIS_API_TOKEN: "api_token_xyz",
      MONERIS_STORE_ID: "store123",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingMonerisLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildMonerisLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder credentials", () => {
    const summary = buildMonerisLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "gateway_connection_wiring",
          label: "Moneris gateway connection verify",
          status: "SKIPPED",
          detail: "placeholder credentials",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_credentials");
  });
});
