import { describe, expect, it } from "vitest";

import {
  buildOpenTableLiveSmokeSummary,
  listMissingOpenTableLiveSmokeEnvVars,
  readOpenTableLiveSmokeEnv,
} from "../../scripts/smoke-opentable-live";

describe("smoke-opentable-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingOpenTableLiveSmokeEnvVars({
      accessToken: null,
      restaurantId: null,
      webhookSecret: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("OPENTABLE_ACCESS_TOKEN");
    expect(missing).toContain("OPENTABLE_RID");
  });

  it("accepts direct OpenTable env when token and restaurant present", () => {
    const input = readOpenTableLiveSmokeEnv({
      OPENTABLE_ACCESS_TOKEN: "live_opentable_token",
      OPENTABLE_RID: "12345678",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingOpenTableLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("accepts OPENTABLE_API_KEY alias", () => {
    const input = readOpenTableLiveSmokeEnv({
      OPENTABLE_API_KEY: "live_opentable_key",
      OPENTABLE_RID: "12345678",
      DATABASE_URL: "postgres://local",
    });

    expect(input.accessToken).toBe("live_opentable_key");
    expect(listMissingOpenTableLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildOpenTableLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder access token", () => {
    const summary = buildOpenTableLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "opentable_oauth_connection",
          label: "OpenTable OAuth API connection",
          status: "SKIPPED",
          detail: "placeholder token",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_token");
  });
});
