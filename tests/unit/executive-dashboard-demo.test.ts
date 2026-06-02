import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  EXECUTIVE_DEMO_DISCLAIMER,
  getExecutiveDashboardDemoSnapshot,
} from "@/lib/demo/executive-dashboard-demo-data";

const PAGE_PATH = join(process.cwd(), "app/dashboard/analytics/executive-demo/page.tsx");

describe("executive dashboard demo", () => {
  const pageSource = readFileSync(PAGE_PATH, "utf8");
  const snapshot = getExecutiveDashboardDemoSnapshot();

  it("ships the analytics executive-demo page with honesty banner", () => {
    expect(pageSource).toContain("ExecutiveDashboardDemoPage");
    expect(pageSource).toContain('data-testid="executive-dashboard-demo-banner"');
    expect(pageSource).toContain("Executive dashboard demo — synthetic data");
    expect(pageSource).toContain("Open live executive dashboard");
    expect(pageSource).toContain("HealthScoreCard");
    expect(pageSource).toContain("ExecutiveKpiCard");
    expect(pageSource).toContain("InsightList");
  });

  it("provides a complete synthetic snapshot for sales walkthroughs", () => {
    expect(EXECUTIVE_DEMO_DISCLAIMER).toContain("synthetic");
    expect(snapshot.kpis.length).toBeGreaterThanOrEqual(12);
    expect(snapshot.dailyRevenue.length).toBeGreaterThanOrEqual(7);
    expect(snapshot.topProducts.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.insights.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.health.score).toBeGreaterThan(0);
    expect(snapshot.costingVarianceAlerts.hasAlerts).toBe(true);
  });

  it("labels demo insights without manage actions", () => {
    expect(pageSource).toContain("canManage={false}");
    expect(snapshot.insights.every((i) => i.id.startsWith("demo-"))).toBe(true);
  });
});
