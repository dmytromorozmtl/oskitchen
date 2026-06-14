import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  ownerScopedAnd,
  posTabByIdWhereForOwner,
  posTabListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function createTab(userId: string, name: string, tableId?: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.posTab.create({
    data: { userId, workspaceId, name, tableId: tableId || null },
  });
}

export async function getOpenTabs(userId: string) {
  const where = await ownerScopedAnd(userId, { status: "OPEN" });
  const tabs = await prisma.posTab.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return tabs.map((tab) => ({
    id: tab.id,
    name: tab.name,
    status: tab.status,
    subtotal: Number(tab.subtotal),
    tax: Number(tab.tax),
    tip: Number(tab.tip),
    total: Number(tab.total),
    tableId: tab.tableId,
    items: tab.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      participantId: item.paidById,
    })),
  }));
}

export async function addItemToTab(
  tabId: string,
  userId: string,
  item: { productName: string; quantity: number; unitPrice: number },
) {
  const tabWhere = await ownerScopedAnd(userId, { id: tabId, status: "OPEN" });
  const tab = await prisma.posTab.findFirst({
    where: tabWhere,
    select: { id: true },
  });
  if (!tab) throw new Error("Tab not found");

  const lineTotal = item.unitPrice * item.quantity;
  await prisma.posTabItem.create({
    data: {
      tabId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: lineTotal,
    },
  });

  const items = await prisma.posTabItem.findMany({ where: { tabId } });
  const subtotal = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  return prisma.posTab.update({
    where: { id: tabId },
    data: { subtotal },
  });
}

export async function closeTab(tabId: string, userId: string, tip: number = 0) {
  const where = await posTabByIdWhereForOwner(userId, tabId);
  const tab = await prisma.posTab.findFirst({
    where,
    include: { items: true },
  });
  if (!tab) throw new Error("Tab not found");

  const subtotal = tab.items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax + tip;

  return prisma.posTab.update({
    where: { id: tabId },
    data: { status: "CLOSED", subtotal, tax, tip, total },
  });
}

export async function deleteTab(tabId: string, userId: string) {
  const where = await posTabByIdWhereForOwner(userId, tabId);
  const tab = await prisma.posTab.findFirst({
    where,
    select: { id: true },
  });
  if (!tab) throw new Error("Tab not found");

  return prisma.posTab.delete({ where: { id: tabId } });
}
