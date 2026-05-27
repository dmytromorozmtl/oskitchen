import { afterEach, describe, expect, it, vi } from "vitest";

import { isKdsV1CertifiedRolloutEnabled } from "@/lib/kitchen/kds-v1-gate";

describe("isKdsV1CertifiedRolloutEnabled", () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevFlag = process.env.ENABLE_KDS_V1_CERTIFIED;

  afterEach(() => {
    vi.unstubAllEnvs();
    if (prevNodeEnv) process.env.NODE_ENV = prevNodeEnv;
    else delete process.env.NODE_ENV;
    if (prevFlag) process.env.ENABLE_KDS_V1_CERTIFIED = prevFlag;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });

  it("is enabled in production without explicit flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isKdsV1CertifiedRolloutEnabled()).toBe(true);
  });

  it("is disabled in non-production when flag is unset", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isKdsV1CertifiedRolloutEnabled()).toBe(false);
  });

  it("is enabled in non-production when ENABLE_KDS_V1_CERTIFIED=true", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ENABLE_KDS_V1_CERTIFIED", "true");
    expect(isKdsV1CertifiedRolloutEnabled()).toBe(true);
  });
});
