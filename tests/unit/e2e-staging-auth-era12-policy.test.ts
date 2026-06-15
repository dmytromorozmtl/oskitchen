import { describe, expect, it } from "vitest";

import {
  E2E_STAGING_AUTH_ERA12_HONEST_SCOPE,
  E2E_STAGING_AUTH_ERA12_POLICY_ID,
} from "@/lib/ci/e2e-staging-auth-era12-policy";

describe("e2e staging auth era12 policy", () => {
  it("locks era12 staging auth wiring policy id and honest scope", () => {
    expect(E2E_STAGING_AUTH_ERA12_POLICY_ID).toBe("era12-e2e-staging-auth-wiring-v1");
    expect(E2E_STAGING_AUTH_ERA12_HONEST_SCOPE.authedDashboardSmokeOnly).toBe(true);
    expect(E2E_STAGING_AUTH_ERA12_HONEST_SCOPE.excludesPosCheckoutE2e).toBe(true);
  });
});
