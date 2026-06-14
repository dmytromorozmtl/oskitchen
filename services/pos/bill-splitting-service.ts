import { prisma } from "@/lib/prisma";
import type { BillSplitLineItem } from "@/lib/pos/bill-splitting";
import { ownerScopedAnd, posTabByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listTabItemsForSplit(tabId: string, userId: string): Promise<BillSplitLineItem[]> {
  const where = await ownerScopedAnd(userId, { id: tabId, status: "OPEN" });
  const tab = await prisma.posTab.findFirst({
    where,
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!tab) throw new Error("Tab not found");

  return tab.items.map((item) => ({
    id: item.id,
    label: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    participantId: item.paidById,
  }));
}

export async function assignTabItemParticipant(input: {
  tabId: string;
  itemId: string;
  userId: string;
  participantId: string | null;
}) {
  const tabWhere = await posTabByIdWhereForOwner(input.userId, input.tabId);
  const tab = await prisma.posTab.findFirst({
    where: { ...tabWhere, status: "OPEN" },
    select: { id: true },
  });
  if (!tab) throw new Error("Tab not found");

  const item = await prisma.posTabItem.findFirst({
    where: { id: input.itemId, tabId: tab.id },
    select: { id: true },
  });
  if (!item) throw new Error("Tab item not found");

  return prisma.posTabItem.update({
    where: { id: item.id },
    data: { paidById: input.participantId },
  });
}

export async function clearTabItemParticipants(tabId: string, userId: string) {
  const tabWhere = await posTabByIdWhereForOwner(userId, tabId);
  const tab = await prisma.posTab.findFirst({
    where: { ...tabWhere, status: "OPEN" },
    select: { id: true },
  });
  if (!tab) throw new Error("Tab not found");

  await prisma.posTabItem.updateMany({
    where: { tabId: tab.id },
    data: { paidById: null },
  });
}
