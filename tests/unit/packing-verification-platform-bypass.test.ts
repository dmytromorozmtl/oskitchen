import { describe, expect, it } from "vitest";

import { canSupervisorOverride } from "@/lib/packing-verification/verification-validation";

describe("packing verification platform bypass", () => {
  it("denies supervisor override when bootstrap email lacks platformBypass", () => {
    expect(
      canSupervisorOverride({
        role: "STAFF",
        platformBypass: false,
      }),
    ).toBe(false);
  });

  it("allows supervisor override when platformBypass is true", () => {
    expect(
      canSupervisorOverride({
        role: "STAFF",
        platformBypass: true,
      }),
    ).toBe(true);
  });

  it("preserves owner supervisor override without platformBypass", () => {
    expect(
      canSupervisorOverride({
        role: "OWNER",
        platformBypass: false,
      }),
    ).toBe(true);
  });

  it("denies non-owner staff without platformBypass", () => {
    expect(
      canSupervisorOverride({
        role: "STAFF",
        platformBypass: false,
      }),
    ).toBe(false);
  });
});
