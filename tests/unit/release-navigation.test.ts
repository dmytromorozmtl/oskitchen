import { describe, expect, it } from "vitest";

import { isPilotHiddenHref } from "@/lib/navigation/release-navigation";
import { PILOT_TIER_NAV_HREFS } from "@/lib/navigation/navigation-release-profile-policy";

describe("release navigation", () => {
  it("hides routes outside the 20-page pilot allowlist", () => {
    expect(isPilotHiddenHref("/dashboard/forecast")).toBe(true);
    expect(isPilotHiddenHref("/dashboard/copilot/settings")).toBe(true);
    expect(isPilotHiddenHref("/dashboard/today")).toBe(false);
    expect(PILOT_TIER_NAV_HREFS).toHaveLength(20);
  });
});
