import { format } from "date-fns";
import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import {
  sendDeliveryReminder,
  sendPickupReminder,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { tryRecordNotification } from "@/lib/notification-log";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron invokes GET with `Authorization: Bearer CRON_SECRET` when CRON_SECRET is set.
 * POST remains supported for manual / CI triggers.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "PREPARING", "READY"] },
      pickupDate: { gte: tomorrow, lte: tomorrowEnd },
    },
    include: {
      userProfile: { include: { kitchenSettings: true } },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const order of orders) {
    const settings = order.userProfile.kitchenSettings;
    if (!settings || !order.pickupDate) continue;

    const dedupeKey = `fulfillment-${order.id}-${format(order.pickupDate, "yyyy-MM-dd")}`;
    const inserted = await tryRecordNotification({
      userId: order.userId,
      type: "CRON_REMINDER",
      dedupeKey,
      recipient: order.customerEmail,
      orderId: order.id,
      metadata: { channel: "email" },
    });
    if (!inserted) {
      skipped++;
      continue;
    }

    const when = format(order.pickupDate, "PP");

    if (
      order.fulfillmentType === "DELIVERY" &&
      settings.notifyDeliveryReminder
    ) {
      await sendDeliveryReminder({
        to: order.customerEmail,
        customerName: order.customerName,
        when,
        businessName: settings.businessName,
      });
      sent++;
    } else if (
      order.fulfillmentType === "PICKUP" &&
      settings.notifyPickupReminder
    ) {
      await sendPickupReminder({
        to: order.customerEmail,
        customerName: order.customerName,
        when,
        address: settings.pickupAddress,
        businessName: settings.businessName,
      });
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: orders.length,
    sent,
    skippedDuplicates: skipped,
  });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
