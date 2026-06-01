import { afterEach, describe, expect, it } from "vitest";

import {
  getCrossTenantStagingMissingEnv,
  getCrossTenantStagingSkipReason,
  isCrossTenantStagingReady,
  resolveCrossTenantStagingBaseUrl,
} from "@/e2e/helpers/cross-tenant-staging-ready";

describe("cross-tenant staging readiness", () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("reports all vault env keys missing when unset", () => {
    delete process.env.DATABASE_URL;
    delete process.env.E2E_STAGING_BASE_URL;
    delete process.env.PLAYWRIGHT_BASE_URL;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;

    expect(getCrossTenantStagingMissingEnv()).toEqual([
      "DATABASE_URL",
      "E2E_STAGING_BASE_URL",
      "E2E_LOGIN_EMAIL",
      "E2E_LOGIN_PASSWORD",
    ]);
    expect(isCrossTenantStagingReady()).toBe(false);
    expect(getCrossTenantStagingSkipReason()).toMatch(/SKIPPED/);
  });

  it("accepts PLAYWRIGHT_BASE_URL as staging base URL alias", () => {
    process.env.DATABASE_URL = "postgresql://example";
    process.env.PLAYWRIGHT_BASE_URL = "https://staging.example.com";
    process.env.E2E_LOGIN_EMAIL = "ops@example.com";
    process.env.E2E_LOGIN_PASSWORD = "secret";

    expect(resolveCrossTenantStagingBaseUrl()).toBe("https://staging.example.com");
    expect(isCrossTenantStagingReady()).toBe(true);
    expect(getCrossTenantStagingSkipReason()).toBeNull();
  });
});
