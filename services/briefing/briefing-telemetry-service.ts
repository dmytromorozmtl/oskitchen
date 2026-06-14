import { subDays } from "date-fns";

import { BRIEFING_TELEMETRY_SUMMARY_DAYS } from "@/lib/briefing/briefing-telemetry-policy";
import { prisma } from "@/lib/prisma";
import { briefingTelemetryListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type BriefingTelemetrySummary = {
  days: number;
  viewCount: number;
  clickCount: number;
  feedbackCount: number;
  uniqueClickHrefs: number;
  topSurfaces: Array<{ surface: string; count: number }>;
  topHrefs: Array<{ hrefPath: string; count: number }>;
  lastEventAt: string | null;
};

/** Aggregate briefing engagement for TTV proof and pilot success metrics. */
export async function loadBriefingTelemetrySummary(
  userId: string,
  days = BRIEFING_TELEMETRY_SUMMARY_DAYS,
): Promise<BriefingTelemetrySummary> {
  const since = subDays(new Date(), days);
  const telemetryScope = await briefingTelemetryListWhereForOwner(userId);
  const sinceFilter = { createdAt: { gte: since } };

  const [views, clicks, feedback, surfaceGroups, hrefGroups, lastEvent] = await Promise.all([
    prisma.briefingTelemetry.count({
      where: { AND: [telemetryScope, sinceFilter, { eventName: "briefing_view" }] },
    }),
    prisma.briefingTelemetry.count({
      where: { AND: [telemetryScope, sinceFilter, { eventName: "briefing_click" }] },
    }),
    prisma.briefingTelemetry.count({
      where: { AND: [telemetryScope, sinceFilter, { eventName: "ai_briefing_feedback" }] },
    }),
    prisma.briefingTelemetry.groupBy({
      by: ["surface"],
      where: { AND: [telemetryScope, sinceFilter, { eventName: "briefing_click" }] },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.briefingTelemetry.groupBy({
      by: ["hrefPath"],
      where: {
        AND: [
          telemetryScope,
          sinceFilter,
          { eventName: "briefing_click", hrefPath: { not: null } },
        ],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.briefingTelemetry.findFirst({
      where: { AND: [telemetryScope, sinceFilter] },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    days,
    viewCount: views,
    clickCount: clicks,
    feedbackCount: feedback,
    uniqueClickHrefs: hrefGroups.length,
    topSurfaces: surfaceGroups.map((row) => ({
      surface: row.surface,
      count: row._count.id,
    })),
    topHrefs: hrefGroups
      .filter((row): row is typeof row & { hrefPath: string } => Boolean(row.hrefPath))
      .map((row) => ({
        hrefPath: row.hrefPath,
        count: row._count.id,
      })),
    lastEventAt: lastEvent?.createdAt.toISOString() ?? null,
  };
}
