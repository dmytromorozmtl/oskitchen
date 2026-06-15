import { describe, expect, it } from "vitest";

import {
  ga4ExperimentCompareHint,
  normalizeGa4MeasurementId,
} from "@/lib/storefront/ga4-analytics-links";

describe("ga4 analytics links", () => {
  it("normalizes G- measurement ids", () => {
    expect(normalizeGa4MeasurementId("g-abc123")).toBe("G-ABC123");
    expect(normalizeGa4MeasurementId("")).toBeNull();
  });

  it("hints when GA4 id missing", () => {
    expect(ga4ExperimentCompareHint(null)).toMatch(/SEO/i);
  });
});
