import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES,
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
} from "@/lib/kitchen/kds-staging-smoke-era10-policy";

describe("KDS staging smoke era10 policy", () => {
  it("locks era10 KDS staging smoke recert policy id", () => {
    expect(KDS_STAGING_SMOKE_ERA10_POLICY_ID).toBe("era10-kds-staging-smoke-recert-v1");
  });

  it("includes recall in integration stages", () => {
    expect(KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES).toContain("recall_to_preparing");
    expect(KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES).toContain("bump_to_ready");
  });
});
