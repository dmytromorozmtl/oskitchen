import { describe, expect, it } from "vitest";

import {
  buildSevenShiftsLiveSmokeSummary,
  listMissingSevenShiftsLiveSmokeEnvVars,
  readSevenShiftsLiveSmokeEnv,
} from "../../scripts/smoke-seven-shifts-live";

describe("smoke-seven-shifts-live", () => {
  it("lists missing env vars when prerequisites absent", () => {
    const missing = listMissingSevenShiftsLiveSmokeEnvVars({
      clientId: null,
      accessToken: null,
      companyId: null,
      connectionId: null,
      databaseUrl: null,
      encryptionKey: null,
      ownerEmail: null,
    });

    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("SEVENSHIFTS_CLIENT_ID");
  });

  it("accepts direct 7shifts env path when all keys present", () => {
    const input = readSevenShiftsLiveSmokeEnv({
      SEVENSHIFTS_CLIENT_ID: "7shifts-client",
      SEVENSHIFTS_ACCESS_TOKEN: "7shifts-token",
      SEVENSHIFTS_COMPANY_ID: "12345678",
      DATABASE_URL: "postgres://local",
    });

    expect(listMissingSevenShiftsLiveSmokeEnvVars(input)).toEqual([]);
  });

  it("builds SKIPPED summary for missing prerequisites", () => {
    const summary = buildSevenShiftsLiveSmokeSummary({
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

  it("builds SKIPPED summary for placeholder company ID", () => {
    const summary = buildSevenShiftsLiveSmokeSummary({
      steps: [
        {
          id: "env_validation",
          label: "Prerequisite env vars",
          status: "PASSED",
        },
        {
          id: "seven_shifts_oauth_connection",
          label: "7shifts OAuth API connection",
          status: "SKIPPED",
          detail: "placeholder company",
        },
      ],
      missingEnvVars: [],
    });

    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_company");
  });
});
