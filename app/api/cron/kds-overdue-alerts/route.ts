import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { notifyKdsOverduePush } from "@/services/notifications/order-lifecycle-push";

export const dynamic = "force-dynamic";

const OVERDUE_MINUTES = 10;

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const cutoff = new Date(Date.now() - OVERDUE_MINUTES * 60 * 1000);

    const overdue = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        status: "PREPARING",
        updatedAt: { lt: cutoff },
      },
      _count: { id: true },
    });

    let pushes = 0;
    for (const row of overdue) {
      if (row._count.id < 1) continue;
      await notifyKdsOverduePush({
        ownerUserId: row.userId,
        overdueCount: row._count.id,
      });
      pushes += 1;
    }

    logger.info("kds-overdue-alerts", { operators: pushes, groups: overdue.length });
    return NextResponse.json({ ok: true, operatorsNotified: pushes, groups: overdue.length });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
