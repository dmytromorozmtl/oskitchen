import { prisma } from "@/lib/prisma";
import {
  ownerScopedAnd,
  pickupWindowByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function getAvailablePickupWindows(storeSlug: string, userId: string) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const where = await ownerScopedAnd(userId, {
    storeSlug,
    active: true,
    dayOfWeek,
  });

  const windows = await prisma.pickupWindow.findMany({
    where,
    orderBy: { startTime: "asc" },
  });

  return windows.map((w) => ({
    id: w.id,
    startTime: w.startTime,
    endTime: w.endTime,
    maxOrders: w.maxOrders,
    currentOrders: w.currentOrders,
    available: w.currentOrders < w.maxOrders,
  }));
}

export async function reservePickupSlot(windowId: string, userId: string) {
  const where = await pickupWindowByIdWhereForOwner(userId, windowId);
  const window = await prisma.pickupWindow.findFirst({ where });
  if (!window || window.currentOrders >= window.maxOrders) {
    throw new Error("Slot not available");
  }

  return prisma.pickupWindow.update({
    where: { id: windowId },
    data: { currentOrders: { increment: 1 } },
  });
}

export async function listPickupWindowsForStore(userId: string, storeSlug: string) {
  const where = await ownerScopedAnd(userId, { storeSlug });
  return prisma.pickupWindow.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}
