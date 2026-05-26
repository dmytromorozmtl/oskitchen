import { startOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { deliveryZoneListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listDeliveryZonesWithSlots(userId: string) {
  const zoneWhere = await deliveryZoneListWhereForOwner(userId);
  return prisma.deliveryZone.findMany({
    where: { AND: [zoneWhere, { active: true }] },
    include: {
      deliverySlots: {
        where: { active: true, slotDate: { gte: startOfDay(new Date()) } },
        orderBy: [{ slotDate: "asc" }, { windowStart: "asc" }],
        take: 50,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAvailableSlotsForCheckout(
  userId: string,
  zoneId: string,
  slotDate: Date,
) {
  const zone = await prisma.deliveryZone.findFirst({
    where: { id: zoneId, userId, active: true },
  });
  if (!zone) return [];

  const day = startOfDay(slotDate);
  const slots = await prisma.deliverySlot.findMany({
    where: { zoneId, slotDate: day, active: true },
    orderBy: { windowStart: "asc" },
  });

  const capDefault = zone.maxDeliveriesPerSlot;
  return slots
    .map((s) => ({
      id: s.id,
      windowStart: s.windowStart,
      windowEnd: s.windowEnd,
      remaining: Math.max(0, (s.maxCapacity || capDefault) - s.bookedCount),
    }))
    .filter((s) => s.remaining > 0);
}

export async function bookDeliverySlot(slotId: string, userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const slot = await prisma.deliverySlot.findFirst({
    where: { id: slotId, userId, active: true },
    include: { zone: true },
  });
  if (!slot) return { ok: false, error: "Slot not found" };

  const cap = slot.maxCapacity || slot.zone.maxDeliveriesPerSlot;
  if (slot.bookedCount >= cap) return { ok: false, error: "Slot is full" };

  await prisma.deliverySlot.update({
    where: { id: slot.id },
    data: { bookedCount: { increment: 1 } },
  });
  return { ok: true };
}

export async function upsertDeliverySlot(input: {
  userId: string;
  zoneId: string;
  slotDate: Date;
  windowStart: string;
  windowEnd: string;
  maxCapacity?: number;
}) {
  const day = startOfDay(input.slotDate);
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  return prisma.deliverySlot.upsert({
    where: {
      zoneId_slotDate_windowStart: {
        zoneId: input.zoneId,
        slotDate: day,
        windowStart: input.windowStart,
      },
    },
    create: {
      userId: input.userId,
      workspaceId,
      zoneId: input.zoneId,
      slotDate: day,
      windowStart: input.windowStart,
      windowEnd: input.windowEnd,
      maxCapacity: input.maxCapacity ?? 10,
    },
    update: {
      windowEnd: input.windowEnd,
      maxCapacity: input.maxCapacity,
      active: true,
    },
  });
}
