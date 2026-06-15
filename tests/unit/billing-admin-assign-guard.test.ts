import { describe, expect, it } from "vitest";

import { canAssignBillingMode } from "@/lib/billing/billing-permissions";

describe("billing admin assign plan guard", () => {
  it("blocks INTERNAL_FREE assignment capability for workspace owners", () => {
    expect(
      canAssignBillingMode({
        role: "owner",
        email: "founder@mealprep.example",
      }),
    ).toBe(false);
  });

  it("blocks operators and staff", () => {
    expect(canAssignBillingMode({ role: "operator", email: "op@example.com" })).toBe(false);
    expect(canAssignBillingMode({ role: "staff", email: "staff@example.com" })).toBe(false);
  });
});
