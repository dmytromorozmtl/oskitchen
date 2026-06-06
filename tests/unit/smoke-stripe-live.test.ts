import { describe, expect, it } from "vitest";

import {
  buildStripeLiveSmokeSummary,
  listMissingStripeLiveSmokeEnvVars,
  readStripeLiveSmokeEnv,
} from "../../scripts/smoke-stripe-live";

describe("smoke-stripe-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingStripeLiveSmokeEnvVars({
      secretKey: null,
      webhookSecret: null,
      connectionId: null,
      databaseUrl: null,
      ownerEmail: null,
    });

    expect(missing).toContain("STRIPE_SECRET_KEY");
    expect(missing).toContain("DATABASE_URL");
  });

  it("accepts env when secret key and database URL present", () => {
    const input = readStripeLiveSmokeEnv({
      STRIPE_SECRET_KEY: "sk_test_abc123",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingStripeLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildStripeLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "SKIPPED",
          detail: "Missing: STRIPE_SECRET_KEY",
        },
      ],
      missingEnvVars: ["STRIPE_SECRET_KEY"],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("builds SKIPPED summary for placeholder secret key", () => {
    const summary = buildStripeLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "stripe_api_connection",
          label: "Stripe API connection",
          status: "SKIPPED",
          detail: "placeholder key",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_secret_key");
  });
});
