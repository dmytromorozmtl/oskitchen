import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";

export type MarketplaceBriefingAlertKind =
  | "po_approval"
  | "delivery_arriving"
  | "budget_threshold"
  | "price_drop";

export type MarketplaceBriefingAlert = {
  id: string;
  kind: MarketplaceBriefingAlertKind;
  title: string;
  detail: string;
  href: string;
  severity: "critical" | "high" | "normal";
  priority: number;
  metadata?: Record<string, string | number | null>;
};

export type MarketplaceBriefingSnapshot = {
  workspaceId: string;
  generatedAt: string;
  alerts: MarketplaceBriefingAlert[];
  counts: {
    pendingApprovals: number;
    deliveriesSoon: number;
    budgetUsedPercent: number | null;
    priceDrops: number;
  };
};

export function marketplaceBriefingAlertToRankedAction(
  alert: MarketplaceBriefingAlert,
): OwnerDailyBriefingRankedAction {
  return {
    id: `marketplace-${alert.id}`,
    title: alert.title,
    reason: alert.detail,
    severity: alert.severity === "critical" ? "critical" : alert.severity === "high" ? "high" : "normal",
    ownerRole: alert.kind === "po_approval" ? "owner" : "manager",
    href: alert.href,
    status: "open",
    unblockCondition:
      alert.kind === "po_approval"
        ? "Approve or reject pending marketplace purchase orders."
        : alert.kind === "delivery_arriving"
          ? "Confirm receiving when shipments arrive."
          : alert.kind === "budget_threshold"
            ? "Review procurement budget or pause new POs."
            : "Review catalog pricing and reorder at the lower rate.",
    priority: alert.priority,
    ctaLabel:
      alert.kind === "po_approval"
        ? "Review POs"
        : alert.kind === "delivery_arriving"
          ? "Track delivery"
          : alert.kind === "budget_threshold"
            ? "View analytics"
            : "Compare prices",
    tone: alert.severity === "critical" || alert.severity === "high" ? "urgent" : "normal",
  };
}

export function mergeMarketplaceBriefingIntoTopActions(
  existing: readonly OwnerDailyBriefingRankedAction[],
  marketplaceAlerts: readonly MarketplaceBriefingAlert[],
): OwnerDailyBriefingRankedAction[] {
  const marketplaceActions = marketplaceAlerts.map(marketplaceBriefingAlertToRankedAction);
  return [...marketplaceActions, ...existing].sort((a, b) => a.priority - b.priority);
}
