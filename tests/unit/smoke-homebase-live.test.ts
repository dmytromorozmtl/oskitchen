import { describe, expect, it } from "vitest";

import {
  buildHomebaseLiveSmokeSummary,
  listMissingHomebaseLiveSmokeEnvVars,
  readHomebaseLiveSmokeEnv,
} from "../../scripts/smoke-homebase-live";

describe("smoke-homebase-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingHomebaseLiveSmokeEnvVars({
      clientId: null,
      accessToken: null,
      locationId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("HOMEBASE_CLIENT_ID");
  });

  it("accepts direct Homebase env path when all keys present", () => {
    const input = readHomebaseLiveSmokeEnv({
      HOMEBASE_CLIENT_ID: "homebase-client",
      HOMEBASE_ACCESS_TOKEN: "homebase-token",
      HOMEBASE_LOCATION_ID: "loc-12345678",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingHomebaseLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildHomebaseLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder location ID", () => {
    const summary = buildHomebaseLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "homebase_oauth_connection",
          label: "Homebase OAuth API connection",
          status: "SKIPPED",
          detail: "placeholder location",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_location");
  });
});
