import { describe, expect, it } from "vitest";

import {
  buildAutoVendorOpportunityId,
  classifyOpportunityKind,
  estimateMonthlySavings,
  normalizeSearchTokens,
} from "@/services/marketplace/auto-vendor-service";

describe("auto-vendor-service", () => {
  it("tokenizes product names for catalog search", () => {
    expect(normalizeSearchTokens("Eco Packaging Wrap 12in")).toEqual([
      "eco",
      "packaging",
      "wrap",
      "12in",
    ]);
  });

  it("estimates monthly savings from 90-day volume", () => {
    const savings = estimateMonthlySavings({
      currentUnitPrice: 115,
      alternativeUnitPrice: 100,
      quantityLast90Days: 90,
    });
    expect(savings).toBe(450);
  });

  it("builds stable opportunity ids", () => {
    const a = buildAutoVendorOpportunityId(["savings", "p1", "p2"]);
    const b = buildAutoVendorOpportunityId(["savings", "p1", "p2"]);
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });

  it("classifies savings vs price increase", () => {
    expect(classifyOpportunityKind(100, 85)).toBe("savings");
    expect(classifyOpportunityKind(85, 100)).toBe("price_increase");
  });
});
