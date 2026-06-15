import { describe, expect, it } from "vitest";

import {
  buildSquarePaymentsLiveSmokeSummary,
  listMissingSquarePaymentsLiveSmokeEnvVars,
  readSquarePaymentsLiveSmokeEnv,
} from "../../scripts/smoke-square-payments-live";

describe("smoke-square-payments-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingSquarePaymentsLiveSmokeEnvVars({
      clientId: null,
      accessToken: null,
      locationId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("SQUARE_PAYMENTS_ACCESS_TOKEN");
  });

  it("accepts direct Square env when access token present", () => {
    const input = readSquarePaymentsLiveSmokeEnv({
      SQUARE_PAYMENTS_ACCESS_TOKEN: "EAAA_live_token",
      SQUARE_PAYMENTS_LOCATION_ID: "LOC123",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingSquarePaymentsLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildSquarePaymentsLiveSmokeSummary({
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
    const summary = buildSquarePaymentsLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "square_oauth_connection",
          label: "Square OAuth API connection",
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
