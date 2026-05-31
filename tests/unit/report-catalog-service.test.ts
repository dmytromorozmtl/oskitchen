import { describe, expect, it } from "vitest";

import {
  buildCustomReportPreview,
  listReportCatalog,
  mergeRegistryIntoCatalogSummary,
  reportCatalogCount,
  searchReportCatalog,
  getRecommendedReportsForRole,
} from "@/services/analytics/report-catalog-service";

describe("report catalog service", () => {
  it("catalogues 100+ reports", () => {
    expect(reportCatalogCount()).toBeGreaterThanOrEqual(100);
    const summary = mergeRegistryIntoCatalogSummary();
    expect(summary.catalogTotal).toBeGreaterThanOrEqual(100);
    expect(summary.categories.Sales).toBe(28);
    expect(summary.categories.Labor).toBe(20);
  });

  it("searches by query and category", () => {
    const labor = searchReportCatalog({ category: "Labor", query: "overtime" });
    expect(labor.length).toBeGreaterThan(0);
    expect(labor.every((entry) => entry.category === "Labor")).toBe(true);
  });

  it("recommends reports by role", () => {
    const owner = getRecommendedReportsForRole("owner");
    expect(owner.length).toBeGreaterThan(0);
    expect(owner.length).toBeLessThanOrEqual(12);
  });

  it("builds custom report preview", () => {
    const preview = buildCustomReportPreview({
      title: "Tuesday vs Saturday",
      metrics: ["revenue", "orders"],
      groupBy: ["day"],
      dateRange: "30d",
      locationIds: [],
      exportFormat: "pdf",
      schedule: "weekly",
    });
    expect(preview.summary).toContain("weekly email");
    expect(preview.suggestedRoute).toContain("/dashboard/reports/");
  });

  it("includes custom builder entry", () => {
    const builder = listReportCatalog().find((entry) => entry.status === "builder");
    expect(builder?.title).toContain("Custom report builder");
  });
});
