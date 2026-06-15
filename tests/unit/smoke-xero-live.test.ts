import { describe, expect, it } from "vitest";

import {
  buildXeroLiveSmokeSummary,
  listMissingXeroLiveSmokeEnvVars,
  readXeroLiveSmokeEnv,
} from "../../scripts/smoke-xero-live";

describe("smoke-xero-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingXeroLiveSmokeEnvVars({
      clientId: null,
      accessToken: null,
      tenantId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("XERO_CLIENT_ID");
  });

  it("accepts direct Xero env path when all keys present", () => {
    const input = readXeroLiveSmokeEnv({
      XERO_CLIENT_ID: "xero-client",
      XERO_ACCESS_TOKEN: "xero-token",
      XERO_TENANT_ID: "tenant-uuid-1234",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingXeroLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildXeroLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder tenant ID", () => {
    const summary = buildXeroLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "xero_oauth_connection",
          label: "Xero OAuth API connection",
          status: "SKIPPED",
          detail: "placeholder tenant",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_tenant");
  });
});
