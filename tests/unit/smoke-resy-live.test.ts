import { describe, expect, it } from "vitest";

import {
  buildResyLiveSmokeSummary,
  listMissingResyLiveSmokeEnvVars,
  readResyLiveSmokeEnv,
} from "../../scripts/smoke-resy-live";

describe("smoke-resy-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingResyLiveSmokeEnvVars({
      accessToken: null,
      venueId: null,
      webhookSecret: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("RESY_ACCESS_TOKEN");
    expect(missing).toContain("RESY_VENUE_ID");
  });

  it("accepts direct Resy env when token and venue present", () => {
    const input = readResyLiveSmokeEnv({
      RESY_ACCESS_TOKEN: "live_resy_token",
      RESY_VENUE_ID: "venue12345",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingResyLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("accepts RESY_API_KEY alias", () => {
    const input = readResyLiveSmokeEnv({
      RESY_API_KEY: "live_resy_key",
      RESY_VENUE_ID: "venue12345",
      DATABASE_URL: "postgres://local",
    });

    expect(input.accessToken).toBe("live_resy_key");
    expect(listMissingResyLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildResyLiveSmokeSummary({
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
    const summary = buildResyLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "resy_oauth_connection",
          label: "Resy OAuth API connection",
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
