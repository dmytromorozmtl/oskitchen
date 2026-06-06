import { addDays, startOfDay } from "date-fns";
import type { CateringQuoteStatus } from "@prisma/client";

import { buildCateringOsDashboard } from "@/lib/catering/catering-os-builders";
import type { CateringClientRow, CateringEventRow } from "@/lib/catering/catering-os-types";
import { CATERING_OS_EVENT_HORIZON_DAYS } from "@/lib/catering/catering-os-policy";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { cateringQuoteListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadCateringQuoteKpis } from "@/services/catering/quote-service";
import {
  loadPackingTasksForDate,
  loadPackingWavesForDate,
} from "@/services/packing/load-packing-page-data";
import { loadRouteOverviewKpis } from "@/services/routes/route-overview";

export type {
  CateringOsDashboard,
  CateringOsModuleSnapshot,
} from "@/lib/catering/catering-os-types";

function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  return Number(value);
}

function buildClientRows(
  quotes: Array<{
    customerEmail: string;
    customerName: string;
    companyName: string | null;
    total: unknown;
    eventDate: Date | null;
  }>,
): CateringClientRow[] {
  const byKey = new Map<string, CateringClientRow>();

  for (const quote of quotes) {
    const key = (quote.companyName?.trim() || quote.customerEmail).toLowerCase();
    const cur = byKey.get(key) ?? {
      key,
      displayName: quote.companyName?.trim() || quote.customerName,
      email: quote.customerEmail,
      quoteCount: 0,
      pipelineValue: 0,
      lastEventDateIso: null,
    };
    cur.quoteCount += 1;
    cur.pipelineValue += decimalToNumber(quote.total);
    if (quote.eventDate) {
      const iso = quote.eventDate.toISOString().slice(0, 10);
      if (!cur.lastEventDateIso || iso > cur.lastEventDateIso) {
        cur.lastEventDateIso = iso;
      }
    }
    byKey.set(key, cur);
  }

  return [...byKey.values()].sort((left, right) => right.pipelineValue - left.pipelineValue);
}

export async function loadCateringOsDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const today = startOfDay(new Date());
  const horizon = addDays(today, CATERING_OS_EVENT_HORIZON_DAYS);
  const quoteScope = await cateringQuoteListWhereForOwner(ownerUserId);

  const inactiveStatuses = {
    notIn: [
      "CONVERTED_TO_ORDER",
      "REJECTED",
      "DECLINED",
      "CANCELLED",
      "ARCHIVED",
      "EXPIRED",
    ] satisfies CateringQuoteStatus[],
  };

  const [kpis, routeKpis, packingTasks, packingWaves, eventQuotes, activeQuotes] = await Promise.all([
    loadCateringQuoteKpis(ownerUserId),
    loadRouteOverviewKpis(ownerUserId),
    loadPackingTasksForDate(ownerUserId, today),
    loadPackingWavesForDate(ownerUserId, today),
    prisma.cateringQuote.findMany({
      where: {
        AND: [
          quoteScope,
          { eventDate: { gte: today, lte: horizon } },
          { status: { notIn: ["CANCELLED", "REJECTED", "DECLINED", "ARCHIVED", "EXPIRED"] } },
        ],
      },
      select: {
        id: true,
        eventName: true,
        customerName: true,
        eventDate: true,
        guestCount: true,
        status: true,
        total: true,
        deliveryRequired: true,
      },
      orderBy: [{ eventDate: "asc" }],
      take: 40,
    }),
    prisma.cateringQuote.findMany({
      where: { AND: [quoteScope, { status: inactiveStatuses }] },
      select: {
        customerEmail: true,
        customerName: true,
        companyName: true,
        total: true,
        eventDate: true,
      },
      take: 200,
    }),
  ]);

  const upcomingEvents: CateringEventRow[] = eventQuotes.map((quote) => ({
    quoteId: quote.id,
    eventName: quote.eventName ?? quote.customerName,
    customerName: quote.customerName,
    eventDateIso: quote.eventDate!.toISOString().slice(0, 10),
    guestCount: quote.guestCount,
    status: quote.status,
    total: decimalToNumber(quote.total),
    deliveryRequired: quote.deliveryRequired,
  }));

  const packingPending = packingTasks.filter(
    (task) => task.status !== "PACKED" && task.status !== "VERIFIED",
  ).length;

  return buildCateringOsDashboard({
    workspaceId,
    openQuotes: kpis.open,
    acceptedQuotes: kpis.accepted,
    pipelineValue: kpis.pipelineValueCents / 100,
    followUpsDue: kpis.followUpsDue,
    upcomingEvents,
    topClients: buildClientRows(activeQuotes),
    packingTasksToday: packingTasks.length,
    packingWavesToday: packingWaves.length,
    packingPending,
    routeKpis,
    deliveryEvents: upcomingEvents.filter((row) => row.deliveryRequired).length,
  });
}

export async function loadCateringOsDashboardForUser(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return loadCateringOsDashboard(workspaceId);
}
