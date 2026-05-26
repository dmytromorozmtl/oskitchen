import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { verifyImpersonationMfa } from "@/lib/platform/impersonation-mfa";

describe("impersonation MFA", () => {
  const prevToken = process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN;
  const prevTotp = process.env.PLATFORM_IMPERSONATION_TOTP_SECRET;
  const prevNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    delete process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN;
    delete process.env.PLATFORM_IMPERSONATION_TOTP_SECRET;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    if (prevToken) process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN = prevToken;
    else delete process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN;
    if (prevTotp) process.env.PLATFORM_IMPERSONATION_TOTP_SECRET = prevTotp;
    else delete process.env.PLATFORM_IMPERSONATION_TOTP_SECRET;
    process.env.NODE_ENV = prevNodeEnv;
  });

  it("accepts step-up token when configured", () => {
    process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN = "secret-token";
    expect(verifyImpersonationMfa({ stepUpToken: "secret-token" })).toBe(true);
    expect(verifyImpersonationMfa({ stepUpToken: "wrong" })).toBe(false);
  });

  it("allows non-production fallback when no MFA backend is configured", () => {
    process.env.NODE_ENV = "test";
    expect(verifyImpersonationMfa({})).toBe(true);
  });

  it("rejects impersonation in production when no MFA backend is configured", () => {
    process.env.NODE_ENV = "production";
    expect(verifyImpersonationMfa({})).toBe(false);
  });
});
