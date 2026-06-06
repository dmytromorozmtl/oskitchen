import { describe, expect, it } from "vitest";

import {
  buildQuickBooksLiveSmokeSummary,
  listMissingQuickBooksLiveSmokeEnvVars,
  readQuickBooksLiveSmokeEnv,
} from "../../scripts/smoke-quickbooks-live";

describe("smoke-quickbooks-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingQuickBooksLiveSmokeEnvVars({
      clientId: null,
      clientSecret: null,
      accessToken: null,
      realmId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("QUICKBOOKS_CLIENT_ID");
  });

  it("accepts direct QuickBooks env path when all keys present", () => {
    const input = readQuickBooksLiveSmokeEnv({
      QUICKBOOKS_CLIENT_ID: "qb-client",
      QUICKBOOKS_CLIENT_SECRET: "qb-secret",
      QUICKBOOKS_ACCESS_TOKEN: "qb-token",
      QUICKBOOKS_REALM_ID: "1234567890",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingQuickBooksLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildQuickBooksLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder realm ID", () => {
    const summary = buildQuickBooksLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "quickbooks_oauth_connection",
          label: "QuickBooks OAuth API connection",
          status: "SKIPPED",
          detail: "placeholder realm",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_realm");
  });
});
