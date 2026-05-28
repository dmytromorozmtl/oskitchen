/**
 * Reports hub contextual next actions — briefing-style operator guidance.
 */

export type ReportsHubNextActionCard = {
  id: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  tone: "primary" | "neutral" | "attention";
};

export function buildReportsHubNextActionCards(input: {
  monthExports: number;
  pinnedCount: number;
  visibleReportCount: number;
  hasFinancialAccess: boolean;
  hasOperationsAccess: boolean;
}): ReportsHubNextActionCard[] {
  const cards: ReportsHubNextActionCard[] = [];

  if (input.monthExports === 0) {
    cards.push({
      id: "first_export",
      title: "Run your first export this month",
      detail:
        "Pick a template from the library, filter to this week, and export CSV for your weekly review.",
      href: "/dashboard/reports/library",
      ctaLabel: "Open report library",
      tone: "primary",
    });
  }

  if (input.pinnedCount === 0 && input.visibleReportCount > 0) {
    cards.push({
      id: "pin_weekly",
      title: "Pin reports for weekly review",
      detail:
        "Save Executive weekly summary and Sales by channel — Owner Daily Briefing links here during pilot.",
      href: "/dashboard/reports/executive_weekly_summary",
      ctaLabel: "Open executive summary",
      tone: "neutral",
    });
  }

  if (input.hasOperationsAccess) {
    cards.push({
      id: "ops_shortage",
      title: "Close inventory shortages before production",
      detail: "Inventory shortage report surfaces blockers before the next production cycle.",
      href: "/dashboard/reports/inventory_shortage_report",
      ctaLabel: "Review shortages",
      tone: "attention",
    });
  }

  if (input.hasFinancialAccess) {
    cards.push({
      id: "channel_mix",
      title: "Confirm channel mix is on plan",
      detail: "Sales by channel validates Woo/Shopify ingest after P0 channel live proof.",
      href: "/dashboard/reports/sales_by_channel",
      ctaLabel: "Sales by channel",
      tone: "neutral",
    });
  }

  return cards.slice(0, 3);
}
