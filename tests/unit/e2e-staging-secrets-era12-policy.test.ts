import { describe, expect, it } from "vitest";

import {
  E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET,
  E2E_STAGING_SECRETS_ERA12_POLICY_ID,
  E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET,
} from "@/lib/ci/e2e-staging-secrets-era12-policy";

describe("e2e staging secrets era12 policy", () => {
  it("locks era12 staging secrets alignment policy id", () => {
    expect(E2E_STAGING_SECRETS_ERA12_POLICY_ID).toBe("era12-e2e-staging-secrets-align-v1");
    expect(E2E_STAGING_SECRETS_CANONICAL_PASSWORD_SECRET).toBe("E2E_LOGIN_PASSWORD");
    expect(E2E_STAGING_SECRETS_LEGACY_PASSWORD_SECRET).toBe("E2E_PASSWORD");
  });
});
