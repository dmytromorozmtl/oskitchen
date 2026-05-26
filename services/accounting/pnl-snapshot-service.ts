import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { prisma } from "@/lib/prisma";
import { pnlSnapshotListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  getRestaurantPnLStatement,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";

const PAGE_SIZE = 50;

export type PnlSnapshotPage = {
  items: {
    id: string;
    periodKey: string;
    periodStart: string;
    periodEnd: string;
    status: string;
    refreshedAt: string;
    summary: Record<string, unknown>;
  }[];
  nextCursor: string | null;
  total: number;
};

function periodBounds(period: PnlPeriod): { start: Date; end: Date; key: string } {
  const now = new Date();
  if (period === "month") {
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
      key: `month:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    };
  }
  return { start: startOfMonth(now), end: endOfMonth(now), key: `period:${period}` };
}

/** Pre-aggregate P&L into `pnl_snapshots` for fast paginated reads. */
export async function refreshPnlSnapshot(userId: string, period: PnlPeriod = "month"): Promise<string> {
  const { summary, lines } = await getRestaurantPnLStatement(userId, period);
  const bounds = periodBounds(period);

  const row = await prisma.pnlSnapshot.upsert({
    where: { userId_periodKey: { userId, periodKey: bounds.key } },
    create: {
      userId,
      periodKey: bounds.key,
      periodStart: bounds.start,
      periodEnd: bounds.end,
      summaryJson: summary as object,
      linesJson: lines as object,
      status: "READY",
      refreshedAt: new Date(),
    },
    update: {
      periodStart: bounds.start,
      periodEnd: bounds.end,
      summaryJson: summary as object,
      linesJson: lines as object,
      status: "READY",
      refreshedAt: new Date(),
    },
  });

  return row.id;
}

export async function listPnlSnapshotsPage(
  userId: string,
  cursor?: string | null,
): Promise<PnlSnapshotPage> {
  const take = PAGE_SIZE + 1;
  const scope = await pnlSnapshotListWhereForOwner(userId);
  const rows = await prisma.pnlSnapshot.findMany({
    where: scope,
    orderBy: { refreshedAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  return {
    items: page.map((r) => ({
      id: r.id,
      periodKey: r.periodKey,
      periodStart: r.periodStart.toISOString().slice(0, 10),
      periodEnd: r.periodEnd.toISOString().slice(0, 10),
      status: r.status,
      refreshedAt: r.refreshedAt.toISOString(),
      summary: r.summaryJson as Record<string, unknown>,
    })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
    total: await prisma.pnlSnapshot.count({ where: scope }),
  };
}

/** Queue-style refresh for last N months (async batch from cron or manual). */
export async function refreshRecentPnlSnapshots(userId: string, months = 3): Promise<number> {
  let count = 0;
  for (let i = 0; i < months; i++) {
    const d = subMonths(new Date(), i);
    const key = `month:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const { summary, lines } = await getRestaurantPnLStatement(userId, "month");
    await prisma.pnlSnapshot.upsert({
      where: { userId_periodKey: { userId, periodKey: key } },
      create: {
        userId,
        periodKey: key,
        periodStart: startOfMonth(d),
        periodEnd: endOfMonth(d),
        summaryJson: summary as object,
        linesJson: lines as object,
        status: "READY",
      },
      update: {
        summaryJson: summary as object,
        linesJson: lines as object,
        status: "READY",
        refreshedAt: new Date(),
      },
    });
    count++;
  }
  return count;
}
