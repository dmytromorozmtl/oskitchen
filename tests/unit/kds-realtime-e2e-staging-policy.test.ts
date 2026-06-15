import { describe, expect, it } from "vitest";

import {
  KDS_REALTIME_E2E_IN_DEFAULT_CI,
  KDS_REALTIME_E2E_PLAYWRIGHT_SPEC,
  KDS_REALTIME_E2E_STAGING_ONLY,
  KDS_REALTIME_E2E_STAGING_POLICY_ID,
  KDS_REALTIME_E2E_HONEST_SCOPE,
} from "@/lib/kitchen/kds-realtime-e2e-staging-policy";

describe("kds realtime e2e staging policy", () => {
  it("locks era8 staging-only realtime e2e policy", () => {
    expect(KDS_REALTIME_E2E_STAGING_POLICY_ID).toBe("era8-kds-realtime-e2e-staging-v1");
    expect(KDS_REALTIME_E2E_STAGING_ONLY).toBe(true);
    expect(KDS_REALTIME_E2E_IN_DEFAULT_CI).toBe(false);
    expect(KDS_REALTIME_E2E_PLAYWRIGHT_SPEC).toBe("e2e/kds-realtime-staging.spec.ts");
    expect(KDS_REALTIME_E2E_HONEST_SCOPE.playwrightSpecImplemented).toBe(true);
  });
});
