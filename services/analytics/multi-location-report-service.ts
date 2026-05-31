import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { defaultFilters } from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import {
  loadMultiLocationAnalytics,
  type MultiLocationAnalyticsSnapshot,
} from "@/services/analytics/multi-location-analytics";

export { buildMultiLocationPdfRows } from "@/lib/analytics/multi-location-pdf-rows";

export function formatMultiLocationWeeklyReportEmail(params: {
  snapshot: MultiLocationAnalyticsSnapshot;
  dashboardUrl: string;
}): { subject: string; text: string } {
  const { snapshot, dashboardUrl } = params;
  const lines = snapshot.locations.map(
    (row) =>
      `- ${row.locationName}: ${row.orders} orders · $${row.revenue.toFixed(2)} revenue · labor ${row.laborPct ?? "—"}% · food ${row.foodCostPct ?? "—"}%`,
  );

  return {
    subject: `[OS Kitchen] Weekly multi-location report — ${snapshot.totalOrders} orders · $${snapshot.totalRevenue.toFixed(2)}`,
    text: [
      "Weekly multi-location report",
      `Range: ${snapshot.rangeLabel}`,
      "",
      `Network totals: ${snapshot.totalOrders} orders · $${snapshot.totalRevenue.toFixed(2)} revenue`,
      `Active locations: ${snapshot.activeLocations}/${snapshot.totalLocations}`,
      "",
      "Location comparison:",
      ...lines,
      "",
      `Network averages: ${snapshot.networkAverages.orders} orders · $${snapshot.networkAverages.revenue.toFixed(2)} revenue · labor ${snapshot.networkAverages.laborPct ?? "—"}% · food ${snapshot.networkAverages.foodCostPct ?? "—"}%`,
      "",
      `Open dashboard: ${dashboardUrl}`,
    ].join("\n"),
  };
}

export async function sendMultiLocationWeeklyReportEmail(
  userId: string,
): Promise<{ sent: boolean; skipped: boolean; reason?: string; snapshot?: MultiLocationAnalyticsSnapshot }> {
  if (!isEmailConfigured()) return { sent: false, skipped: true, reason: "email_not_configured" };

  const owner = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!owner?.email) return { sent: false, skipped: true, reason: "no_recipient" };

  const filters = defaultFilters();
  filters.from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const snapshot = await loadMultiLocationAnalytics({ userId }, filters);
  if (snapshot.totalLocations < 2) {
    return { sent: false, skipped: true, reason: "single_location", snapshot };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.oskitchen.com";
  const { subject, text } = formatMultiLocationWeeklyReportEmail({
    snapshot,
    dashboardUrl: `${siteUrl}/dashboard/locations/dashboard`,
  });

  try {
    await sendRawEmail({ to: owner.email, subject, text });
  } catch (error) {
    logger.warn("multi_location_weekly_report_failed", error);
    return { sent: false, skipped: true, reason: "send_failed", snapshot };
  }

  return { sent: true, skipped: false, snapshot };
}

export async function runMultiLocationWeeklyReportBatch(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const locationCounts = await prisma.location.groupBy({
    by: ["userId"],
    _count: { _all: true },
    orderBy: { userId: "asc" },
    take: 500,
  });
  const multiLocationOwners = locationCounts.filter((row) => row._count._all >= 2);

  let sent = 0;
  let skipped = 0;
  for (const row of multiLocationOwners) {
    const result = await sendMultiLocationWeeklyReportEmail(row.userId);
    if (result.sent) sent += 1;
    else skipped += 1;
  }

  return { processed: multiLocationOwners.length, sent, skipped };
}
