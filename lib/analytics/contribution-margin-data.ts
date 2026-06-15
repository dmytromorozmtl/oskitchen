import {
  DATA_VIZ_CONTRIBUTION_MARGIN_MIN_GREEN,
  DATA_VIZ_CONTRIBUTION_MARGIN_MIN_YELLOW,
  CONTRIBUTION_MARGIN_CHART_TEST_ID,
} from "@/lib/analytics/data-viz-standards-policy";
import { marginBarClassForZone } from "@/lib/analytics/profit-dashboard-margin-visualization-policy";
import { marginZone } from "@/services/analytics/profit-alerts";
import type { ProfitItemRow } from "@/services/analytics/real-time-profit-service";

export type ContributionMarginRow = {
  productId: string;
  title: string;
  revenue: number;
  units: number;
  contributionMarginPercent: number;
  contributionDollars: number;
  barWidthPercent: number;
  barClass: string;
  zone: ReturnType<typeof marginZone>;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Item-level contribution margin — revenue × margin % sorted by dollar contribution. */
export function buildContributionMarginRows(
  items: readonly ProfitItemRow[],
  options: { maxRows?: number } = {},
): ContributionMarginRow[] {
  const maxRows = options.maxRows ?? 5;
  const sliced = items.slice(0, maxRows).map((item) => {
    const contributionDollars = round2((item.revenue * item.marginPercent) / 100);
    const zone = marginZone(item.marginPercent);
    return {
      productId: item.productId,
      title: item.title,
      revenue: item.revenue,
      units: item.units,
      contributionMarginPercent: item.marginPercent,
      contributionDollars,
      barWidthPercent: 0,
      barClass: marginBarClassForZone(zone),
      zone,
    };
  });

  const maxDollars = Math.max(...sliced.map((row) => row.contributionDollars), 1);
  return sliced.map((row) => ({
    ...row,
    barWidthPercent: round2((row.contributionDollars / maxDollars) * 100),
  }));
}

export function sortContributionMarginByDollars(
  items: readonly ProfitItemRow[],
): ProfitItemRow[] {
  return [...items].sort((a, b) => {
    const aContrib = a.revenue * a.marginPercent;
    const bContrib = b.revenue * b.marginPercent;
    return bContrib - aContrib;
  });
}

export {
  CONTRIBUTION_MARGIN_CHART_TEST_ID,
  DATA_VIZ_CONTRIBUTION_MARGIN_MIN_GREEN,
  DATA_VIZ_CONTRIBUTION_MARGIN_MIN_YELLOW,
};
