import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDataVizStandardsWiring } from "@/lib/analytics/data-viz-standards-audit";
import {
  buildContributionMarginRows,
  sortContributionMarginByDollars,
} from "@/lib/analytics/contribution-margin-data";
import {
  DATA_VIZ_STANDARDS_CHART_TYPES,
  DATA_VIZ_STANDARDS_CI_SCRIPTS,
  DATA_VIZ_STANDARDS_POLICY_ID,
  DATA_VIZ_STANDARDS_UNIT_TEST,
  DATA_VIZ_STANDARDS_UPSTREAM_POLICY_ID,
  WATERFALL_CHART_TEST_ID,
} from "@/lib/analytics/data-viz-standards-policy";
import {
  buildProfitWaterfallData,
  waterfallChartAriaLabel,
} from "@/lib/analytics/waterfall-chart-data";

const ROOT = process.cwd();

describe("data viz standards (Absolute Final Task 59)", () => {
  it("locks waterfall + contribution margin policy", () => {
    expect(DATA_VIZ_STANDARDS_POLICY_ID).toBe("data-viz-standards-absolute-final-v1");
    expect(DATA_VIZ_STANDARDS_UPSTREAM_POLICY_ID).toBe("profit-dashboard-margin-viz-des19-v1");
    expect(DATA_VIZ_STANDARDS_CHART_TYPES).toEqual(["waterfall", "contribution_margin"]);
    expect(WATERFALL_CHART_TEST_ID).toBe("data-viz-waterfall-chart");
  });

  it("builds profit waterfall from revenue through costs to net", () => {
    const data = buildProfitWaterfallData({
      revenue: 1000,
      foodCost: 320,
      laborCost: 280,
      deliveryCost: 45,
      profit: 355,
    });
    expect(data.map((row) => row.id)).toEqual(["revenue", "food", "labor", "delivery", "profit"]);
    expect(data[0]?.base).toBe(0);
    expect(data[0]?.value).toBe(1000);
    expect(data[1]?.base).toBe(680);
    expect(data[1]?.value).toBe(320);
    expect(data.at(-1)?.label).toBe("Net profit");
    expect(waterfallChartAriaLabel(data)).toContain("Revenue +1000");
  });

  it("builds contribution margin rows sorted by dollar contribution", () => {
    const sorted = sortContributionMarginByDollars([
      { productId: "a", title: "Salad", revenue: 100, marginPercent: 60, units: 5 },
      { productId: "b", title: "Burger", revenue: 400, marginPercent: 40, units: 10 },
    ]);
    expect(sorted[0]?.productId).toBe("b");

    const rows = buildContributionMarginRows(sorted, { maxRows: 2 });
    expect(rows[0]?.contributionDollars).toBe(160);
    expect(rows[0]?.contributionMarginPercent).toBe(40);
    expect(rows[0]?.barWidthPercent).toBe(100);
  });

  it("audits waterfall, contribution margin, and profit dashboard wiring", () => {
    const audit = auditDataVizStandardsWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    expect(existsSync(join(ROOT, "components/analytics/waterfall-chart.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "components/analytics/contribution-margin-chart.tsx"))).toBe(true);

    const dashboard = readFileSync(
      join(ROOT, "components/analytics/real-time-profit-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("WaterfallChart");
    expect(dashboard).toContain("ContributionMarginChart");
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of DATA_VIZ_STANDARDS_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(DATA_VIZ_STANDARDS_UNIT_TEST).toBe("tests/unit/data-viz-standards.test.ts");
  });
});
