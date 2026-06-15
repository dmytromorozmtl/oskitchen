import { describe, expect, it } from "vitest";

import {
  mergeRecommendationCategorySlugs,
  rankRecommendationProducts,
  recommendationCategorySlugsForBusinessType,
} from "@/lib/marketplace/recommendations-types";

describe("marketplace recommendations types", () => {
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

  it("merges category slug groups uniquely", () => {
    expect(
      mergeRecommendationCategorySlugs(["dry-goods", "equipment"], ["dry-goods", "uniforms"]),
    ).toEqual(["dry-goods", "equipment", "uniforms"]);
  });

  it("ranks products by priority ids", () => {
    const ranked = rankRecommendationProducts(
      [
        { id: "a", name: "A" },
        { id: "b", name: "B" },
        { id: "c", name: "C" },
      ],
      ["c", "a"],
    );
    expect(ranked.map((row) => row.id)).toEqual(["c", "a", "b"]);
  });
});
