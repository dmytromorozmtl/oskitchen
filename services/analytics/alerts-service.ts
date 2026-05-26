import { Prisma, type AnalyticsAlertType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { analyticsAlertListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { defaultFilters } from "@/lib/analytics/filters";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

export type AlertResult = {
  type: AnalyticsAlertType;
  triggered: boolean;
  severity: "info" | "warning" | "critical";
  message: string;
};

/**
 * Evaluate explainable, rule-based alerts. No AI, no synthetic
 * predictions. Each rule cites the inputs it considers.
 */
export async function evaluateAnalyticsAlerts(userId: string): Promise<AlertResult[]> {
  const filters = defaultFilters();
  const overview = await loadExecutiveOverview({ userId }, filters);

  const results: AlertResult[] = [];

  // Late packing rate increasing — packingCompletionRate < 0.85
  if (overview.packingCompletionRate != null && overview.packingCompletionRate < 0.85) {
    results.push({
      type: "LATE_PACKING_RATE",
      triggered: true,
      severity: overview.packingCompletionRate < 0.7 ? "critical" : "warning",
      message: `Packing completion is ${Math.round(overview.packingCompletionRate * 100)}% — below the 85% threshold.`,
    });
  }
  // Production overload — completion < 80% with large totals
  if (overview.productionCompletionRate != null && overview.productionCompletionRate < 0.8) {
    results.push({
      type: "PRODUCTION_OVERLOAD",
      triggered: true,
      severity: overview.productionCompletionRate < 0.6 ? "critical" : "warning",
      message: `Production completion is ${Math.round(overview.productionCompletionRate * 100)}% — review prep load and station coverage.`,
    });
  }
  // Route overload — delivery completion < 80%
  if (overview.deliveryCompletionRate != null && overview.deliveryCompletionRate < 0.8) {
    results.push({
      type: "ROUTE_OVERLOAD",
      triggered: true,
      severity: overview.deliveryCompletionRate < 0.6 ? "critical" : "warning",
      message: `Delivery completion is ${Math.round(overview.deliveryCompletionRate * 100)}% — investigate failed stops and route sizing.`,
    });
  }
  // Low repeat rate — < 10% with > 50 customers
  if (overview.repeatRate != null && overview.activeCustomerCount >= 50 && overview.repeatRate < 0.1) {
    results.push({
      type: "LOW_REPEAT_RATE",
      triggered: true,
      severity: "warning",
      message: `Repeat rate is ${Math.round(overview.repeatRate * 1000) / 10}% among ${overview.activeCustomerCount} active customers — consider re-engagement.`,
    });
  }
  // Rising cancellations — > 10% cancelled in window
  const cancellationShare = overview.orderCount + overview.cancelledOrderCount > 0
    ? overview.cancelledOrderCount / (overview.orderCount + overview.cancelledOrderCount)
    : 0;
  if (cancellationShare > 0.1) {
    results.push({
      type: "RISING_CANCELLATIONS",
      triggered: true,
      severity: cancellationShare > 0.2 ? "critical" : "warning",
      message: `${Math.round(cancellationShare * 100)}% of orders in the window were cancelled — review channel quality.`,
    });
  }

  // Persist last_triggered for any enabled alert that fired.
  if (results.length > 0) {
    const scope = await analyticsAlertListWhereForOwner(userId);
    const enabled = await prisma.analyticsAlert.findMany({
      where: {
        AND: [
          scope,
          { enabled: true, type: { in: results.filter((r) => r.triggered).map((r) => r.type) } },
        ],
      },
    });
    if (enabled.length > 0) {
      const now = new Date();
      await Promise.all(
        enabled.map((a) =>
          prisma.analyticsAlert.update({
            where: { id: a.id },
            data: { lastTriggered: now },
          }),
        ),
      );
      await Promise.all(
        results.map((r) =>
          prisma.analyticsEvent.create({
            data: {
              userId,
              sourceType: "analytics_alert",
              sourceId: r.type,
              eventType: "ALERT_TRIGGERED",
              metadataJson: { severity: r.severity, message: r.message } as Prisma.InputJsonValue,
            },
          }),
        ),
      );
    }
  }

  return results;
}
