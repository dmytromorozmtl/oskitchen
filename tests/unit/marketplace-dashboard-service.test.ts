import { describe, expect, it } from "vitest";

import { recommendationCategorySlugsForBusinessType } from "@/services/marketplace/marketplace-dashboard-service";

describe("marketplace dashboard service helpers", () => {
  it("maps restaurant business type to HoReCa category slugs", () => {
    expect(recommendationCategorySlugsForBusinessType("RESTAURANT")).toEqual([
      "kitchenware-tools",
      "dry-goods",
      "packaging-disposables",
      "cleaning-sanitation",
    ]);
  });

  it("falls back for unknown business types", () => {
    expect(recommendationCategorySlugsForBusinessType(null)).toContain("packaging-disposables");
    expect(recommendationCategorySlugsForBusinessType("OTHER")).toContain("dry-goods");
  });
});
