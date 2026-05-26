import { describe, expect, it } from "vitest";

import { isPilotHiddenHref } from "@/lib/navigation/release-navigation";

describe("release navigation", () => {
  it("hides forecast and copilot prefixes", () => {
    expect(isPilotHiddenHref("/dashboard/forecast")).toBe(true);
    expect(isPilotHiddenHref("/dashboard/copilot/settings")).toBe(true);
    expect(isPilotHiddenHref("/dashboard/today")).toBe(false);
  });
});
