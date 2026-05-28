import { describe, expect, it } from "vitest";

import {
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES,
} from "@/lib/navigation/nav-maturity-sweep-era17-policy";

describe("nav maturity sweep era17 policy constants", () => {
  it("lists era17 preview route prefixes", () => {
    expect(NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES).toContain(
      "/dashboard/settings/security/sso",
    );
    expect(NAV_MATURITY_SWEEP_ERA17_POLICY_ID).toBe("era17-nav-maturity-sweep-v1");
  });
});
