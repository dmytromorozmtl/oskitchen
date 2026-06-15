import { describe, expect, it } from "vitest";

import { validateRequiredModifiers } from "@/lib/storefront/modifier-validation";

describe("validateRequiredModifiers", () => {
  it("fails when required group has no selection", () => {
    const r = validateRequiredModifiers(
      [{ id: "g1", name: "Size", required: true, minSelections: 1, maxSelections: 1, options: [{ id: "o1", name: "Large", priceAdjustment: 0 }] }],
      [],
    );
    expect(r.ok).toBe(false);
    expect(r.missingRequired).toHaveLength(1);
  });

  it("passes when required option selected", () => {
    const r = validateRequiredModifiers(
      [{ id: "g1", name: "Size", required: true, minSelections: 1, maxSelections: 1, options: [{ id: "o1", name: "Large", priceAdjustment: 0 }] }],
      ["o1"],
    );
    expect(r.ok).toBe(true);
  });
});
