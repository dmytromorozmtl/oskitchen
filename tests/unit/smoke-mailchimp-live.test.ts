import { describe, expect, it } from "vitest";

import {
  buildMailchimpLiveSmokeSummary,
  listMissingMailchimpLiveSmokeEnvVars,
  readMailchimpLiveSmokeEnv,
} from "../../scripts/smoke-mailchimp-live";

describe("smoke-mailchimp-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingMailchimpLiveSmokeEnvVars({
      clientId: null,
      accessToken: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("MAILCHIMP_ACCESS_TOKEN");
  });

  it("accepts direct Mailchimp token path when access token present", () => {
    const input = readMailchimpLiveSmokeEnv({
      MAILCHIMP_ACCESS_TOKEN: "live-oauth-token",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingMailchimpLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildMailchimpLiveSmokeSummary({
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
    const summary = buildMailchimpLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "mailchimp_oauth_connection",
          label: "Mailchimp OAuth API connection",
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
