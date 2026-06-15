import { describe, expect, it } from "vitest";

import {
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  ERA20_FIRST_PAID_PILOT_PACKAGE_STATUS,
} from "@/lib/commercial/era20-first-paid-pilot-package-policy";

describe("era20 first paid pilot package policy", () => {
  it("locks era20 pilot package policy id", () => {
    expect(ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID).toBe(
      "era20-first-paid-pilot-package-v1",
    );
  });

  it("does not claim p0 or customer complete", () => {
    expect(ERA20_FIRST_PAID_PILOT_PACKAGE_STATUS).toBe(
      "pilot_package_ready_awaiting_p0_and_customer",
    );
  });
});
